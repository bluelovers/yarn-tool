"use strict";
const cmd_dir_1 = require("../../../lib/cmd_dir");
/**
 * 命令名稱
 * Command name
 */
const command = (0, cmd_dir_1.basenameStrip)(__filename);
/**
 * 創建 workspaces list 命令模組
 * Create workspaces list command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    aliases: [
        'ls',
    ],
    describe: `List local packages`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            // @ts-ignore
            command: [command, ...cmdModule.aliases],
            bin: 'lerna',
            cmd: [
                command,
            ],
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=list.js.map