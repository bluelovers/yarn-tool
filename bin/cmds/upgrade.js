"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const wrapDedupe_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe");
const spawn_1 = require("../../lib/spawn");
const pm_1 = require("../../lib/pm");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    aliases: ['upgrade', 'up'],
    describe: `升級套件 / Upgrade packages`,
    builder(yargs) {
        return yargs
            .option('latest', {
            desc: '升級到最新版本，忽略 package.json 中的版本範圍 / Upgrade to latest version, ignoring version range in package.json. The version specified by the latest tag will be used (potentially upgrading the packages across major versions).',
            boolean: true,
        })
            .option('caret', {
            desc: '使用 caret (^) 語意化版本 / Use caret (^) semver',
            boolean: true,
        })
            .option('tilde', {
            desc: '使用 tilde (~) 語意化版本 / Use tilde (~) semver',
            boolean: true,
        })
            .option('exact', {
            desc: '使用精確版本 (無語意化前綴) / Use exact version (no semver prefix)',
            boolean: true,
        })
            .option('pattern', {
            desc: '套件名稱匹配模式 / Package name match pattern',
            string: true,
        });
    },
    handler(argv) {
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        (0, wrapDedupe_1.wrapDedupe)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            before() {
                const key = (0, cmd_dir_1.basenameStrip)(__filename);
                pmIsYarn && (0, spawn_1.crossSpawnOther)('yarn', [], argv);
                (0, cmd_dir_1.lazySpawnArgvSlice)({
                    command: ['upgrade', 'up', key],
                    bin: npmClients,
                    cmd: key,
                    argv,
                });
            },
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                if (pmIsYarn && cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=upgrade.js.map