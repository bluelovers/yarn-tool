"use strict";
const cmd_dir_1 = require("../../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
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
        cmd_dir_1.lazySpawnArgvSlice({
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