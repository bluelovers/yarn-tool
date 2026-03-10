"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    //aliases: [],
    describe: `取得二進制腳本的路徑 / Get the path to a binary script.`,
    builder(yargs) {
        return yargs
            .option('verbose', {
            alias: ['v'],
            desc: `顯示詳細資訊 / Show verbose output`,
        })
            .example(`yt bin`, `List all the available binaries`)
            .example(`yt bin eslint`, `Print the path to a specific binary`)
            .strict(false);
    },
    handler(argv) {
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command,
            bin: 'yarn',
            cmd: command,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=bin.js.map