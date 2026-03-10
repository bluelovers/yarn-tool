"use strict";
/**
 * yarn-tool workspaces publish 命令模組
 * yarn-tool workspaces publish command module
 *
 * @author user
 * @created 2019/5/19
 */
const tslib_1 = require("tslib");
const find_root_1 = tslib_1.__importDefault(require("@yarn-tool/find-root"));
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../lib/index");
/**
 * 創建 workspaces publish 命令模組
 * Create workspaces publish command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    aliases: [
        'push',
    ],
    describe: `在工作區域中發布套件 / publish packages in workspaces.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        let rootData = (0, find_root_1.default)({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return (0, index_1.yargsProcessExit)(`workspace not exists`);
        }
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            // @ts-ignore
            command: [key, ...cmdModule.aliases],
            bin: 'lerna',
            cmd: [
                key,
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=publish.js.map