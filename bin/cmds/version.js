"use strict";
const tslib_1 = require("tslib");
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const pkg_1 = require("../../lib/pkg");
const argv_1 = require("@yarn-tool/version-recommended/lib/argv");
const types_1 = require("@yarn-tool/version-recommended/lib/types");
const version_recommended_1 = require("@yarn-tool/version-recommended");
const upath2_1 = require("upath2");
const colorize_1 = require("@yarn-tool/semver-diff/lib/colorize");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const find_root_1 = require("@yarn-tool/find-root");
const package_dts_1 = require("@ts-type/package-dts");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `bump version of packages`,
    builder(yargs) {
        return (0, argv_1.setupToYargs)(yargs)
            .option('cwd', {
            normalize: true,
            default: process.cwd(),
        })
            .option('interactive', {
            alias: ['i'],
            desc: 'show interactive prompts',
            boolean: true,
        })
            .option('dry-run', {
            desc: 'dry run',
            boolean: true,
        })
            .strict(false);
    },
    async handler(argv) {
        var _a;
        let rootData = (0, find_root_1.findRoot)(argv);
        if (rootData.isWorkspace && argv.skipCheckWorkspace) {
            (0, index_1.yargsProcessExit)(`not allow bump version on root of workspace`);
            process.exit(1);
        }
        if (argv.interactive) {
            let rootData = (0, find_root_1.findRoot)(argv);
            let pkg = (0, package_dts_1.readPackageJson)((0, upath2_1.join)(rootData.pkg, 'package.json'));
            // @ts-ignore
            index_1.console.info(`Current version`, pkg.version);
            let ret = await inquirer_1.default
                .prompt([
                {
                    type: 'list',
                    loop: true,
                    name: 'bump',
                    message: "What's type of bump version?",
                    choices: types_1.releaseTypes,
                },
            ]);
            if (((_a = ret === null || ret === void 0 ? void 0 : ret.bump) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                argv.bump = ret.bump;
            }
        }
        let { pkg, bump, oldVersion, newVersion } = (0, version_recommended_1.nextVersionRecommendedByPackageFindUp)(argv);
        let name = (0, index_1.chalkByConsole)((chalk, console) => {
            // @ts-ignore
            return chalk.green(pkg.name);
        }, index_1.console);
        index_1.console.log(`[${name}]`, (0, index_1.chalkByConsole)((chalk, console) => {
            return chalk.green(bump);
        }, index_1.console), oldVersion, `=>`, (0, colorize_1.colorizeDiff)(oldVersion, newVersion, {
            console: index_1.console,
        }));
        if (!argv['dry-run'] && oldVersion !== newVersion) {
            let file = (0, upath2_1.join)(rootData.pkg, `package.json`);
            index_1.console.debug(`[${name}]`, `update`, file);
            (0, pkg_1.writePackageJson)(file, {
                ...pkg,
                version: newVersion,
            });
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=version.js.map