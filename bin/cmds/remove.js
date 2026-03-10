"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const wrapDedupe_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe");
const pm_1 = require("../../lib/pm");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    aliases: ['rm'],
    describe: `運行 yarn remove foo 將從直接依賴中刪除名為 foo 的套件，並更新 package.json 和 yarn.lock 文件 / Running yarn remove foo will remove the package named foo from your direct dependencies updating your package.json and yarn.lock files in the process.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        (0, wrapDedupe_1.wrapDedupe)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            main(yarg, argv, cache) {
                (0, cmd_dir_1.lazySpawnArgvSlice)({
                    command,
                    bin: npmClients,
                    cmd: command,
                    argv,
                });
            },
            end(yarg, argv, cache) {
                //console.dir(infoFromDedupeCache(cache));
                if (pmIsYarn && cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=remove.js.map