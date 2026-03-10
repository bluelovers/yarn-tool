"use strict";
/**
 * yarn-tool workspaces info 命令模組
 * yarn-tool workspaces info command module
 *
 * @author user
 * @created 2019/5/19
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
/**
 * 創建 workspaces info 命令模組
 * Create workspaces info command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `顯示工作區域信息 / Show information about your workspaces.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: 'yarn',
            cmd: [
                'workspaces',
                'info',
            ],
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=info.js.map