"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    //aliases: [],
    describe: `Run a package in a temporary environment. require yarn version >= 2`,
    builder(yargs) {
        return yargs
            .option('package', {
            alias: ['p'],
            string: true,
        })
            .option('quiet', {
            alias: ['q'],
            boolean: true,
        })
            .help(false)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        cmd_dir_1.lazySpawnArgvSlice({
            command,
            bin: 'yarn',
            cmd: command,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=dlx.js.map