"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    aliases: ['rm'],
    describe: `Running yarn remove foo will remove the package named foo from your direct dependencies updating your package.json and yarn.lock files in the process.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        (0, dedupe_1.wrapDedupe)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            main(yarg, argv, cache) {
                (0, cmd_dir_1.lazySpawnArgvSlice)({
                    command,
                    bin: 'yarn',
                    cmd: command,
                    argv,
                });
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
//# sourceMappingURL=remove.js.map