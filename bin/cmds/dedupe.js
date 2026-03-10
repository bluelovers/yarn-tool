"use strict";
/**
 * yarn-tool dedupe 命令模組
 * yarn-tool dedupe command module
 *
 * @author user
 * @created 2019/5/19
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const infoFromDedupeCache_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/infoFromDedupeCache");
const wrapDedupe_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe");
/**
 * 創建 dedupe 命令模組
 * Create dedupe command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' [cwd]',
    //aliases: [],
    describe: `yarn.lock 的套件重複數據刪除 / package deduplication for yarn.lock`,
    aliases: ['d'],
    builder(yargs) {
        return yargs;
    },
    handler(argv, ...a) {
        (0, wrapDedupe_1.wrapDedupe)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                index_1.console.dir((0, infoFromDedupeCache_1.infoFromDedupeCache)(cache));
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=dedupe.js.map