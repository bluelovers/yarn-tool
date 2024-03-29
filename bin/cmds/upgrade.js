"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const wrapDedupe_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe");
const spawn_1 = require("../../lib/spawn");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    aliases: ['upgrade', 'up'],
    describe: `Symlink a package folder during development.`,
    builder(yargs) {
        return yargs
            .option('latest', {
            desc: 'The upgrade --latest command upgrades packages the same as the upgrade command, but ignores the version range specified in package.json. Instead, the version specified by the latest tag will be used (potentially upgrading the packages across major versions).',
            boolean: true,
        })
            .option('caret', {
            boolean: true,
        })
            .option('tilde', {
            boolean: true,
        })
            .option('exact', {
            boolean: true,
        })
            .option('pattern', {
            string: true,
        });
    },
    handler(argv) {
        (0, wrapDedupe_1.wrapDedupe)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            before() {
                const key = (0, cmd_dir_1.basenameStrip)(__filename);
                (0, spawn_1.crossSpawnOther)('yarn', [], argv);
                (0, cmd_dir_1.lazySpawnArgvSlice)({
                    command: ['upgrade', 'up', key],
                    bin: 'yarn',
                    cmd: key,
                    argv,
                });
            },
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=upgrade.js.map