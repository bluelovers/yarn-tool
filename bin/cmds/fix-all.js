"use strict";
const cmd_dir_1 = require("../../lib/cmd_dir");
const fix_all_1 = require("@yarn-tool/fix-all");
const yargs_setting_1 = require("@yarn-tool/fix-all/lib/util/yargs-setting");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    describe: `auto check/fix workspaces/package`,
    // @ts-ignore
    builder(yargs) {
        return (0, yargs_setting_1.setupToYargs)(yargs);
    },
    handler(args) {
        return (0, fix_all_1.npmAutoFixAll)(args.cwd, {
            branch: args.branch,
            overwriteHostedGitInfo: args.overwriteHostedGitInfo,
            // @ts-ignore
            resetStaticFiles: args.resetStaticFiles,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=fix-all.js.map