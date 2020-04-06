"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    describe: `create a npm package or update package.json file`,
    builder(yargs) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2/lib/yargs-setting',
            processExit: true,
        });
        return require(ret)
            .setupToYargs(yargs)
            .strict(false);
    },
    handler(argv) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2',
            processExit: true,
        });
        let cmd_list = spawn_1.processArgvSlice('init').argv;
        spawn_1.crossSpawnOther('node', [
            ret,
            //'--',
            ...cmd_list,
        ], argv);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=init.js.map