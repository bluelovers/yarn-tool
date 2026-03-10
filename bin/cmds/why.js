"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const pm_1 = require("../../lib/pm");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `顯示為什麼安裝套件的信息 / Show information about why a package is installed.`,
    builder(yargs) {
        return yargs
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
//# sourceMappingURL=why.js.map