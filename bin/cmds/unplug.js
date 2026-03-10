"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const pm_1 = require("../../lib/pm");
const index_1 = require("../../lib/index");
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    aliases: ['upnp'],
    describe: `Temporarily copies a package (with an optional @range suffix) outside of the global cache for debugging purposes`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const { npmClients, pmIsYarn } = (0, pm_1.detectPackageManager)(argv);
        if (!pmIsYarn) {
            index_1.console.error(`此命令 '${command}' 不支援 ${npmClients}。 / This command '${command}' not support for ${npmClients}`);
            return;
        }
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command,
            bin: 'yarn',
            cmd: command,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=unplug.js.map