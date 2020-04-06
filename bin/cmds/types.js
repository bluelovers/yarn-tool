"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const add_1 = require("../../lib/cli/add");
const crossSpawn = require("cross-spawn-extra");
const types_1 = require("../../lib/cli/types");
const array_hyper_unique_1 = require("array-hyper-unique");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs @types/* of packages if not exists in package.json`,
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs, {
            allowEmptyName: true,
        })
            .option('auto', {
            desc: `auto install from package.json`,
            boolean: true,
        })
            .option('all', {
            desc: `dependencies, devDependencies from package.json`,
            boolean: true,
        })
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
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg = package_dts_1.readPackageJson(pkg_file);
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
        let flags = add_1.flagsYarnAdd(argv).filter(v => v != null);
        let flags2 = flags.slice();
        if (!argv.optional && !argv.peer && !argv.dev) {
            flags2.push('-D');
        }
        let list = [];
        let warns = [];
        for (let packageName of args) {
            let m = add_1.parseArgvPkgName(packageName);
            if (!m) {
                index_1.console.warn(`[error]`, packageName);
                continue;
            }
            let { version, name, namespace } = m;
            if (namespace) {
                name = namespace.replace('@', '') + '__' + name;
            }
            packageName = name = `@types/${name}`;
            if (add_1.existsDependencies(name, pkg)) {
                //console.warn(`[skip]`, `${name} already exists in package.json`);
                warns.push([`[skip]`, `${name} already exists in package.json`]);
                continue;
            }
            const target = await types_1.fetchPackageJsonInfo(packageName);
            if (target == null) {
                warns.push([`[warn]`, `${name} not exists`]);
                continue;
            }
            if (target.deprecated) {
                //console.warn(`[skip]`, target.deprecated);
                warns.push([`[ignore]`, target.name, '：', target.deprecated]);
                continue;
            }
            list.push(target.name + `@^${target.version}`);
        }
        if (list.length) {
            let cmd_argv = [
                'add',
                ...list,
                ...flags2,
            ].filter(v => v != null);
            let cp = crossSpawn.sync('yarn', cmd_argv, {
                cwd: argv.cwd,
                stdio: 'inherit',
            });
            if (cp.error) {
                throw cp.error;
            }
        }
        else {
            printWarns();
            index_1.console.warn(`[warn]`, `no any new types install`);
        }
        printWarns();
        function printWarns() {
            warns.forEach(([label, ...arr]) => index_1.console.info(index_1.console.red.chalk(label), ...arr));
            warns = [];
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=types.js.map