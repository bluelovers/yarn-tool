"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../lib/index");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `Remove a package in workspaces.`,
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
            command: key,
            bin: 'yarn',
            cmd: [
                key,
                '-W',
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=remove.js.map