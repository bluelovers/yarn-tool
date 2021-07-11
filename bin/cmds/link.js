"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `Symlink a package folder during development.`,
    builder(yargs) {
        return yargs
            .example(`$0 link`, `in package you want to link`)
            .example(`$0 link [package]`, `Use yarn link [package] to link another package that you’d like to test into your current project. To follow the above example, in the react-relay project, you’d run yarn link react to use your local version of react that you previously linked.`)
            .strict(false);
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: 'yarn',
            cmd: key,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=link.js.map