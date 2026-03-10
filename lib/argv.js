"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliArgv = cliArgv;
const tslib_1 = require("tslib");
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const upath2_1 = require("upath2");
const __root_1 = require("../__root");
function cliArgv() {
    return yargs_1.default
        .option('cwd', {
        desc: `目前工作目錄或套件目錄 / Current working directory or package directory`,
        normalize: true,
        default: process.cwd(),
    })
        .option('skipCheckWorkspace', {
        alias: ['W'],
        desc: `搜尋 yarn.lock、套件根目錄、工作區根目錄時使用 (不同於 --ignore-workspace-root-check) / Use for searching yarn.lock, pkg root, workspace root (not same as --ignore-workspace-root-check)`,
        boolean: true,
    })
        .option('yt-debug-mode', {
        desc: `啟用除錯模式 / Enable debug mode`,
        boolean: true,
    })
        .option('npmClients', {
        desc: `指定使用的套件管理器 只允許 pnpm 或 yarn`,
        string: true,
    })
        .alias('v', 'version')
        .alias('h', 'help')
        .help('help')
        .recommendCommands()
        // .locale(osLocaleSync())
        .commandDir((0, upath2_1.join)(__root_1.__ROOT, 'bin', 'cmds'))
        .help(true)
        .showHelpOnFail(true)
        .strict()
        .demandCommand()
        .scriptName('yt');
}
//# sourceMappingURL=argv.js.map