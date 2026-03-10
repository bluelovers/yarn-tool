#!/usr/bin/env node
"use strict";
/**
 * yarn-tool 主執行文件
 * Main execution file for yarn-tool
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const upath2_1 = require("upath2");
const update_notifier_1 = require("@yarn-tool/update-notifier");
const osLocaleSync_1 = require("../lib/osLocaleSync");
/**
 * 如果是 .js 文件且未使用 ts-node 執行，則安裝 source-map-support
 * Install source-map-support if running as .js file without ts-node
 */
if ((0, upath2_1.extname)(__filename) === '.js' && !process.argv.filter(v => {
    if (typeof v === 'string') {
        return v.includes('ts-node') || v.includes('source-map-support') || v.includes('tsx');
    }
}).length) {
    require('source-map-support').install({
        hookRequire: true
    });
}
/**
 * 檢查更新通知
 * Check for update notifications
 */
(0, update_notifier_1.updateNotifier)((0, upath2_1.join)(__dirname, '..'));
/**
 * 創建 Yargs CLI 實例
 * Create Yargs CLI instance
 */
let cli = yargs_1.default
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
    .alias('v', 'version')
    .alias('h', 'help')
    .help('help')
    .recommendCommands()
    .locale((0, osLocaleSync_1.osLocaleSync)())
    .commandDir((0, upath2_1.join)(__dirname, 'cmds'))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand()
    .scriptName('yt');
/**
 * 解析命令行參數
 * Parse command line arguments
 */
cli.argv;
//# sourceMappingURL=yarn-tool.js.map