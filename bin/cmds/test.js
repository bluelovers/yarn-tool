"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const pm_1 = require("../../lib/pm");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `運行套件定義的測試腳本 / Runs the test script defined by the package.`,
    builder(yargs) {
        return yargs;
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: npmClients,
            cmd: key,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=test.js.map