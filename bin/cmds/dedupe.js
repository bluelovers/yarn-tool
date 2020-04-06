"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [cwd]',
    //aliases: [],
    describe: `package deduplication for yarn.lock`,
    aliases: ['d'],
    builder(yargs) {
        return yargs;
    },
    handler(argv, ...a) {
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=dedupe.js.map