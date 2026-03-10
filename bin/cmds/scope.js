"use strict";
const cmd_dir_1 = require("../../lib/cmd_dir");
const ws_scope_1 = require("@yarn-tool/ws-scope");
const index_1 = require("../../lib/index");
const upath2_1 = require("upath2");
const fs_extra_1 = require("fs-extra");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' <cmd>',
    aliases: ['scope', 'scoped'],
    describe: `更新工作區範圍設定 / Update workspaces scope setting`,
    builder(yargs) {
        return yargs
            .command({
            command: 'add ...[rule]',
            describe: `新增範圍 / Add scope`,
            handler(argv) {
                return _method('add', yargs, argv);
            },
        })
            .command({
            command: 'remove ...[rule]',
            describe: `移除範圍 / Remove scope`,
            handler(argv) {
                return _method('remove', yargs, argv);
            },
        })
            .command({
            command: 'sync',
            describe: `同步範圍 / Sync scope`,
            handler(argv) {
                // @ts-ignore
                const wss = new ws_scope_1.WorkspacesScope(argv.cwd);
                wss.syncValue();
                wss.save();
                index_1.console.success(`工作區範圍同步完成 / workspace scope sync completed`);
            },
        });
    },
});
function _method(cmd, yargs, argv) {
    // @ts-ignore
    let list = [argv.rule].concat(argv._.slice(2)).filter(v => v.length);
    index_1.console.dir({
        argv,
        list,
    });
    if (!list.length) {
        yargs.exit(1, new Error(`yarn-tool scope ${cmd} [rule]`));
        return;
    }
    // @ts-ignore
    const wss = new ws_scope_1.WorkspacesScope(argv.cwd);
    list.forEach(scope => {
        let _path = (0, upath2_1.join)(wss.rootData.ws, `packages/${scope}`);
        if (scope === (0, upath2_1.basename)(scope)) {
            if (!scope.startsWith('@')) {
                scope = `@${scope}`;
            }
            scope = `packages/${scope}/*`;
            _path = (0, upath2_1.join)(wss.rootData.ws, scope);
        }
        _path = _path.replace(/[\/\\]\*$/, '');
        if (cmd === 'add') {
            (0, fs_extra_1.ensureDirSync)(_path);
        }
        wss[cmd](scope);
    });
    if (wss.changed) {
        wss.syncValue();
        wss.save();
        index_1.console.success(`工作區範圍已更新 / workspace scope updated`);
    }
    else {
        index_1.console.warn(`工作區範圍未變更 / workspace scope not changed`);
    }
}
module.exports = cmdModule;
//# sourceMappingURL=scope.js.map