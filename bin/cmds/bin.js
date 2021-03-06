"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    //aliases: [],
    describe: `Get the path to a binary script.`,
    builder(yargs) {
        return yargs
            .option('verbose', {
            alias: ['v'],
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