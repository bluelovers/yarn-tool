"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `Runs a defined package script.`,
    builder(yargs) {
        return yargs
            .help(false)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: 'yarn',
            cmd: [
                key,
            ],
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=run.js.map