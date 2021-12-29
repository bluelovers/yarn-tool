"use strict";
const tslib_1 = require("tslib");
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const pkg_1 = require("../../lib/pkg");
const wrapDedupeAsync_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupeAsync");
const cross_spawn_extra_1 = tslib_1.__importDefault(require("cross-spawn-extra"));
const index_2 = require("../../index");
const setupYarnAddToYargs_1 = require("@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs");
const flagsYarnAdd_1 = require("@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd");
const assertExecInstall_1 = require("@yarn-tool/pkg-deps-util/lib/cli/assertExecInstall");
const installDeps_1 = require("@yarn-tool/pkg-deps-util/lib/installDeps");
const path_1 = require("path");
const table_1 = require("@yarn-tool/table");
const debug_color2_1 = require("debug-color2");
const installDepsFromYarnLock_1 = require("@yarn-tool/pkg-deps-util/lib/installDepsFromYarnLock");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs a package`,
    builder(yargs) {
        return (0, setupYarnAddToYargs_1.setupYarnAddToYargs)(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        })
            .strict(false);
    },
    async handler(argv) {
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
        await (0, wrapDedupeAsync_1.wrapDedupeAsync)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            before(yarg, argv, cache) {
                (0, index_1.printRootData)(cache.rootData, argv);
            },
            async main(yarg, argv, cache) {
                var _a;
                let retBreak;
                // @ts-ignore
                let flags = (0, flagsYarnAdd_1.flagsYarnAdd)(argv).filter(v => v != null);
                const oldArgs = args.slice();
                if (args.length) {
                    let data = (0, installDeps_1.filterInstallDeps)(args, argv);
                    if (data.updated) {
                        let chalk = (0, debug_color2_1.chalkByConsoleMaybe)(index_1.console);
                        index_1.consoleDebug.debug(`direct add deps from workspaces`);
                        let table = (0, table_1.createDependencyTable)();
                        data.exists.forEach(name => table.push([name, '', chalk.gray('exists')]));
                        data.added.forEach(([name, semver]) => table.push([name, semver, chalk.green('added')]));
                        index_1.console.log(table.toString());
                        (0, pkg_1.writePackageJson)((0, path_1.join)(data.rootData.pkg, 'package.json'), data.pkg, {
                            spaces: 2
                        });
                        args = data.packageNames;
                        if (!args.length && !argv.types) {
                            retBreak = true;
                        }
                    }
                    if ((_a = cache.yarnlock_old) === null || _a === void 0 ? void 0 : _a.length) {
                        let data = await (0, installDepsFromYarnLock_1.installDepsFromYarnLock)(args, argv);
                        if (data === null || data === void 0 ? void 0 : data.updated) {
                            let chalk = (0, debug_color2_1.chalkByConsoleMaybe)(index_1.console);
                            index_1.consoleDebug.debug(`direct add deps from yarn.lock`);
                            let table = (0, table_1.createDependencyTable)();
                            data.exists.forEach(name => table.push([name, '', chalk.gray('exists')]));
                            data.added.forEach(([name, semver]) => table.push([name, semver, chalk.green('added')]));
                            index_1.console.log(table.toString());
                            (0, pkg_1.writePackageJson)((0, path_1.join)(data.rootData.pkg, 'package.json'), data.pkg, {
                                spaces: 2
                            });
                            args = data.others;
                            if (!args.length && !argv.types) {
                                retBreak = true;
                            }
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
                        (0, assertExecInstall_1.assertExecInstall)(cp);
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
                        (0, assertExecInstall_1.assertExecInstall)(cp);
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
                        (0, assertExecInstall_1.assertExecInstall)(cp);
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