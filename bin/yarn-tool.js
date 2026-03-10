#!/usr/bin/env node
"use strict";
/**
 * yarn-tool 主執行文件
 * Main execution file for yarn-tool
 */
Object.defineProperty(exports, "__esModule", { value: true });
const upath2_1 = require("upath2");
const update_notifier_1 = require("@yarn-tool/update-notifier");
const argv_1 = require("../lib/argv");
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
let cli = (0, argv_1.cliArgv)();
/**
 * 解析命令行參數
 * Parse command line arguments
 */
cli.argv;
//# sourceMappingURL=yarn-tool.js.map