"use strict";
const tslib_1 = require("tslib");
const cmd_dir_1 = require("../../lib/cmd_dir");
const ws_scope_1 = (0, tslib_1.__importDefault)(require("@yarn-tool/ws-scope"));
const index_1 = require("../../lib/index");
const upath2_1 = require("upath2");
const fs_extra_1 = require("fs-extra");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' <cmd>',
    aliases: ['scope', 'scoped'],
    describe: `update workspaces scope setting`,
    builder(yargs) {
        return yargs
            .command({
            command: 'add',
            describe: `add scope`,
            handler(argv) {
                // @ts-ignore
                const wss = new ws_scope_1.default(argv.cwd);
                if (!argv._) {
                    yargs.exit(1, new Error(`yarn-tool scope add [rule]`));
                    return;
                }
                argv._.forEach(scope => {
                    if (scope === (0, upath2_1.basename)(scope)) {
                        scope = `packages/${scope}/*`;
                        (0, fs_extra_1.ensureDirSync)((0, upath2_1.join)(wss.rootData.ws, `packages/${scope}`));
                    }
                    wss.add(scope);
                });
                if (wss.changed) {
                    wss.save();
                    index_1.console.success(`workspace scope updated`);
                }
                else {
                    index_1.console.warn(`workspace scope not changed`);
                }
            },
        })
            .command({
            command: 'remove',
            describe: `remove scope`,
            handler(argv) {
                // @ts-ignore
                const wss = new ws_scope_1.default(argv.cwd);
                if (!argv._) {
                    yargs.exit(1, new Error(`yarn-tool scope remove [rule]`));
                    return;
                }
                argv._.forEach(scope => {
                    if (scope === (0, upath2_1.basename)(scope)) {
                        scope = `packages/${scope}/*`;
                    }
                    wss.remove(scope);
                });
                if (wss.changed) {
                    wss.save();
                    index_1.console.success(`workspace scope updated`);
                }
                else {
                    index_1.console.warn(`workspace scope not changed`);
                }
            },
        })
            .strict()
            .demandCommand();
    },
});
module.exports = cmdModule;
//# sourceMappingURL=scope.js.map