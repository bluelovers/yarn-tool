"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../index");
const index_2 = require("../../../lib/index");
const setupYarnAddToYargs_1 = require("@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Installs a package in workspaces.`,
    builder(yargs) {
        return setupYarnAddToYargs_1.setupYarnAddToYargs(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        })
            .strict(false);
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        let rootData = index_2.findRoot({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return index_2.yargsProcessExit(`workspace not exists`);
        }
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'node',
            cmd: [
                require.resolve(index_1.YT_BIN),
                'add',
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
//# sourceMappingURL=add.js.map