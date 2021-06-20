"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const cross_spawn_extra_1 = __importDefault(require("cross-spawn-extra"));
const index_2 = require("../../index");
const setupYarnAddToYargs_1 = require("@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs");
const flagsYarnAdd_1 = require("@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd");
const assertExecInstall_1 = require("@yarn-tool/pkg-deps-util/lib/cli/assertExecInstall");
const installDeps_1 = require("@yarn-tool/pkg-deps-util/lib/installDeps");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const table_1 = require("@yarn-tool/table");
const debug_color2_1 = require("debug-color2");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs a package`,
    builder(yargs) {
        return setupYarnAddToYargs_1.setupYarnAddToYargs(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        })
            .strict(false);
    },
    handler(argv) {
        let args = argv._.slice();
        if (args[0] === 'add') {
            args.shift();
        }
        if (argv.name) {
            // @ts-ignore
            args.unshift(argv.name);
        }
        //console.dir(argv);
        if (!args.length) {
            //			yargs.showHelp();
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
        }
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            before(yarg, argv, cache) {
                index_1.printRootData(cache.rootData, argv);
            },
            main(yarg, argv, cache) {
                let retBreak;
                // @ts-ignore
                let flags = flagsYarnAdd_1.flagsYarnAdd(argv).filter(v => v != null);
                const oldArgs = args.slice();
                if (args.length) {
                    let data = installDeps_1.filterInstallDeps(args, argv);
                    if (data.pkg) {
                        let chalk = debug_color2_1.chalkByConsoleMaybe(index_1.console);
                        index_1.consoleDebug.debug(`direct add deps from workspaces`);
                        let table = table_1.createDependencyTable();
                        data.exists.forEach(name => table.push([name, '', chalk.gray('exists')]));
                        data.added.forEach(([name, semver]) => table.push([name, semver, chalk.green('added')]));
                        index_1.console.log(table.toString());
                        fs_extra_1.writeJSONSync(path_1.join(data.rootData.pkg, 'package.json'), data.pkg, {
                            spaces: 2
                        });
                        args = data.packageNames;
                        if (!args.length && !argv.types) {
                            retBreak = true;
                        }
                    }
                }
                if (!oldArgs.length || args.length) {
                    let cmd_argv = [
                        'add',
                        ...args,
                        ...flags,
                    ].filter(v => v != null);
                    index_1.consoleDebug.debug(cmd_argv);
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
                if (argv.types) {
                    let cp = cross_spawn_extra_1.default.sync('node', [
                        require.resolve(index_2.YT_BIN),
                        'types',
                        ...oldArgs,
                        ...flags,
                    ], {
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
                return retBreak;
            },
            after(yarg, argv, cache) {
                if (!cache.rootData.isWorkspace && cache.rootData.hasWorkspace) {
                    let cp = cross_spawn_extra_1.default.sync('yarn', [], {
                        cwd: cache.rootData.ws,
                        stdio: 'inherit',
                    });
                    if (cp.error) {
                        throw cp.error;
                    }
                    else {
                        assertExecInstall_1.assertExecInstall(cp);
                    }
                }
            },
            end(yarg, argv, cache) {
                //console.dir(infoFromDedupeCache(cache));
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=add.js.map