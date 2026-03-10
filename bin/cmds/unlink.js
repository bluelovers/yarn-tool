"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const pm_1 = require("../../lib/pm");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `移除使用 yarn link 建立的符號鏈接 / Remove a symlinked package created with yarn link`,
    builder(yargs) {
        return yargs
            .example(`$0 unlink [...package]`, ``)
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: (0, pm_1.detectPackageManager)(argv).npmClients,
            cmd: key,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=unlink.js.map