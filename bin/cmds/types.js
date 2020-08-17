"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const array_hyper_unique_1 = require("array-hyper-unique");
const flagsYarnAdd_1 = require("@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd");
const installTypes_1 = require("@yarn-tool/pkg-deps-util/lib/installTypes");
const upath2_1 = __importDefault(require("upath2"));
const cross_spawn_extra_1 = __importDefault(require("cross-spawn-extra"));
const setupYarnAddTypesToYargs_1 = require("@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddTypesToYargs");
const assertExecInstall_1 = require("@yarn-tool/pkg-deps-util/lib/cli/assertExecInstall");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs @types/* of packages if not exists in package.json`,
    builder(yargs) {
        return setupYarnAddTypesToYargs_1.setupYarnAddTypesToYargs(yargs)
            .strict(false);
    },
    async handler(argv) {
        let args = argv._.slice();
        if (args[0] === 'types') {
            args.shift();
        }
        if (argv.name) {
            // @ts-ignore
            args.unshift(argv.name);
        }
        let rootData = index_1.findRoot({
            ...argv,
        });
        let pkg_file = upath2_1.default.join(rootData.pkg, 'package.json');
        let pkg = package_dts_1.readPackageJson(pkg_file);
        if (argv.AA) {
            argv.auto = true;
            argv.all = true;
        }
        if (argv.auto) {
            let names = [];
            if ((argv.dev || argv.all) && pkg.devDependencies) {
                names.push(...Object.keys(pkg.devDependencies || []));
            }
            if (argv.peer || argv.optional) {
                if (argv.peer && pkg.peerDependencies) {
                    names.push(...Object.keys(pkg.peerDependencies || []));
                }
                if (argv.optional && pkg.optionalDependencies) {
                    names.push(...Object.keys(pkg.optionalDependencies || []));
                }
            }
            else if (!argv.dev && pkg.dependencies) {
                names.push(...Object.keys(pkg.dependencies || []));
            }
            if (argv.all && pkg.dependencies) {
                names.push(...Object.keys(pkg.dependencies || []));
            }
            if (names.length) {
                args.push(...names);
            }
            argv.optional = argv.peer = argv.dev = false;
        }
        if (!args.length) {
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
        }
        else {
            args = args.reduce((a, b) => {
                b = b.replace(/^@types\//, '');
                a.push(b);
                return a;
            }, []);
            args = array_hyper_unique_1.array_unique(args);
            if (!args.length) {
                index_1.consoleDebug.warn(`no package list for install types`);
                return process.exit();
            }
        }
        let flags = flagsYarnAdd_1.flagsYarnAdd(argv).filter(v => v != null);
        let flags2 = flags.slice();
        if (!argv.optional && !argv.peer && !argv.dev) {
            flags2.push('-D');
        }
        let list = [];
        let warns = [];
        let success = [];
        for (let packageName of args) {
            let check = await installTypes_1.checkInstallTargetTypes(packageName, {
                checkExists: true,
                pkg,
            });
            switch (check.error) {
                case 2 /* DEPRECATED */:
                    warns.push([`[ignore]`, check.target, '：', check.msg]);
                    break;
                case 1 /* NOT_EXISTS */:
                    warns.push([`[warn]`, index_1.console.red.chalk(check.msg)]);
                    break;
                case 3 /* SKIP */:
                    warns.push([`[skip]`, check.msg]);
                    break;
                case 0 /* SUCCESS */:
                    success.push([`[success]`, `add ${index_1.console.green.chalk(check.target)} to dependency`]);
                    list.push(check.target);
                    break;
                default:
                    warns.push([`[error]`, check]);
                    break;
            }
        }
        if (list.length) {
            let cmd_argv = [
                'add',
                ...list,
                ...flags2,
            ].filter(v => v != null);
            let cp = cross_spawn_extra_1.default.sync('yarn', cmd_argv, {
                cwd: argv.cwd,
                stdio: 'inherit',
            });
            if (cp.error) {
                throw cp.error;
            }
            else {
                assertExecInstall_1.assertExecInstall(cp);
            }
        }
        else {
            //printWarns();
            //console.warn(`[warn]`, `no any new types install`);
            warns.push([`[warn]`, index_1.console.red.chalk(`no any new types install`)]);
        }
        printWarns();
        success.forEach(([label, ...arr]) => index_1.console.info(index_1.console.green.chalk(label), ...arr));
        function printWarns() {
            warns.forEach(([label, ...arr]) => index_1.console.info(index_1.console.red.chalk(label), ...arr));
            warns = [];
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=types.js.map