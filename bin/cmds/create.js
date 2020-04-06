"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    //aliases: [],
    describe: `Creates new projects from any create-* starter kits.`,
    builder(yargs) {
        return yargs
            .example(`$0 create <starter-kit-package> [<args>]`, ``)
            .strict(false);
    },
    handler(argv) {
        cmd_dir_1.lazySpawnArgvSlice({
            command,
            bin: 'yarn',
            cmd: [
                command,
            ],
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=create.js.map