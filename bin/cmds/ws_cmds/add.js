"use strict";
/**
 * yarn-tool workspaces add 命令模組
 * yarn-tool workspaces add command module
 *
 * @author user
 * @created 2019/5/19
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../index");
const index_2 = require("../../../lib/index");
const setupYarnAddToYargs_1 = require("@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs");
/**
 * 創建 workspaces add 命令模組
 * Create workspaces add command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `在工作區域中安裝套件 / Installs a package in workspaces.`,
    builder(yargs) {
        return (0, setupYarnAddToYargs_1.setupYarnAddToYargs)(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        })
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        let rootData = (0, index_2.findRoot)({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return (0, index_2.yargsProcessExit)(`workspace not exists`);
        }
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: 'lerna',
            cmd: [
                '--concurrency',
                '1',
                'add',
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
        argv.types && (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: 'node',
            cmd: [
                require.resolve(index_1.YT_BIN),
                'types',
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