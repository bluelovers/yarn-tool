"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const pm_1 = require("../../lib/pm");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    //aliases: [],
    describe: `運行 node，並設置好鉤子 / Run node with the hook already setup.`,
    builder(yargs) {
        return yargs
            .help(false)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command,
            bin: npmClients,
            cmd: command,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=node.js.map