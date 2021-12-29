"use strict";
const cmd_dir_1 = require("../../lib/cmd_dir");
const fix_all_1 = require("@yarn-tool/fix-all");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    describe: `auto check/fix workspaces/package`,
    builder(yargs) {
        return yargs
            .option('overwriteHostedGitInfo', {
            boolean: true,
        })
            .option('branch', {
            string: true,
        });
    },
    handler(args) {
        (0, fix_all_1.npmAutoFixAll)(args.cwd, {
            branch: args.branch,
            overwriteHostedGitInfo: args.overwriteHostedGitInfo,
        });
    }
});
module.exports = cmdModule;
//# sourceMappingURL=fix-all.js.map