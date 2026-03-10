"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const pm_1 = require("../../lib/pm");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `顯示當前安裝的 Yarn、Node.js 及其依賴項的版本信息 / Displays version information of the currently installed Yarn, Node.js, and its dependencies.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: npmClients,
            cmd: pmIsYarn ? key : 'version',
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=versions.js.map