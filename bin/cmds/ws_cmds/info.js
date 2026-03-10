"use strict";
/**
 * yarn-tool workspaces info 命令模組
 * yarn-tool workspaces info command module
 *
 * @author user
 * @created 2019/5/19
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const pm_1 = require("../../../lib/pm");
const index_1 = require("../../../lib/index");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
/**
 * 創建 workspaces info 命令模組
 * Create workspaces info command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    //aliases: [],
    describe: `顯示工作區域信息 / Show information about your workspaces.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        if (!pmIsYarn) {
            index_1.console.warn(`此命令 'ws ${command}' 不支援 ${npmClients}。 / This command 'ws ${command}' not support for ${npmClients}`);
        }
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