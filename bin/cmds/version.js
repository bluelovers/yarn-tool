"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const pkg_1 = require("../../lib/pkg");
const argv_1 = require("@yarn-tool/version-recommended/lib/argv");
const index_2 = require("@yarn-tool/version-recommended/index");
const upath2_1 = require("upath2");
const colorize_1 = require("@yarn-tool/semver-diff/lib/colorize");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `bump version of packages`,
    builder(yargs) {
        return argv_1.setupToYargs(yargs)
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
    handler(argv) {
        let rootData = index_1.findRoot(argv);
        if (rootData.isWorkspace && argv.skipCheckWorkspace) {
            index_1.yargsProcessExit(`not allow bump version of workspace`);
            process.exit(1);
        }
        let { pkg, bump, oldVersion, newVersion } = index_2.nextVersionRecommendedByPackageFindUp(argv);
        let name = index_1.chalkByConsole((chalk, console) => {
            return chalk.green(pkg.name);
        }, index_1.console);
        index_1.console.log(`[${name}]`, index_1.chalkByConsole((chalk, console) => {
            return chalk.green(bump);
        }, index_1.console), oldVersion, `=>`, colorize_1.colorizeDiff(oldVersion, newVersion, {
            console: index_1.console,
        }));
        if (!argv['dry-run'] && oldVersion !== newVersion) {
            let file = upath2_1.join(rootData.pkg, `package.json`);
            index_1.console.debug(`[${name}]`, `update`, file);
            pkg_1.writePackageJson(file, {
                ...pkg,
                version: newVersion,
            });
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=version.js.map