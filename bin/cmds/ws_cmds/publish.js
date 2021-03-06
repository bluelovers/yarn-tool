"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../lib/index");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    aliases: [
        'push',
    ],
    describe: `publish packages in workspaces.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        let rootData = (0, index_1.findRoot)({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return (0, index_1.yargsProcessExit)(`workspace not exists`);
        }
        (0, cmd_dir_1.lazySpawnArgvSlice)({
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