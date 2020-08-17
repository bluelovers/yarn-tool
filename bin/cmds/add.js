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
                // @ts-ignore
                let flags = flagsYarnAdd_1.flagsYarnAdd(argv).filter(v => v != null);
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
                if (argv.types) {
                    let cp = cross_spawn_extra_1.default.sync('node', [
                        require.resolve(index_2.YT_BIN),
                        'types',
                        ...args,
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