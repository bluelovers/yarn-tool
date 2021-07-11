"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const yargs_setting_1 = require("create-yarn-workspaces/yargs-setting");
const spawn_1 = require("../../../lib/spawn");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `create yarn workspaces`,
    builder(yargs) {
        return (0, yargs_setting_1.setupWorkspacesInitToYargs)(yargs)
            .strict(false);
    },
    handler(argv) {
        let ret = (0, spawn_1.checkModileExists)({
            name: 'create-yarn-workspaces',
            requireName: 'create-yarn-workspaces/bin/yarn-ws-init',
        });
        if (!ret) {
            process.exit(1);
        }
        let cmd_list = (0, spawn_1.processArgvSlice)('init').argv;
        (0, spawn_1.crossSpawnOther)('node', [
            ret,
            //'--',
            ...cmd_list,
        ], argv);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=init.js.map