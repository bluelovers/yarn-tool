"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const argv_1 = require("@yarn-tool/ncu-ws/lib/argv");
const ncu_ws_1 = require("@yarn-tool/ncu-ws");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' [-u]',
    aliases: ['update'],
    describe: `Find newer versions of dependencies than what your package.json allows`,
    builder(yargs) {
        return (0, argv_1.setupNcuToYargs2)(yargs);
    },
    async handler(argv) {
        return (0, ncu_ws_1._handleNcuArgvAuto)(argv, {
            console: index_1.console,
            consoleDebug: index_1.consoleDebug,
            printRootData: index_1.printRootData,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=ncu.js.map