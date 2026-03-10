#!/usr/bin/env node

/**
 * yarn-tool 主執行文件
 * Main execution file for yarn-tool
 */

import yargs from 'yargs';
import { extname, join } from 'upath2';
import { updateNotifier } from '@yarn-tool/update-notifier';
import { osLocaleSync } from '../lib/osLocaleSync';

/**
 * 如果是 .js 文件且未使用 ts-node 執行，則安裝 source-map-support
 * Install source-map-support if running as .js file without ts-node
 */
if (extname(__filename) === '.js' && !process.argv.filter(v => {
	if (typeof v === 'string')
	{
		return v.includes('ts-node') || v.includes('source-map-support') || v.includes('tsx')
	}
}).length)
{
	require('source-map-support').install({
		hookRequire: true
	});
}

/**
 * 檢查更新通知
 * Check for update notifications
 */
updateNotifier(join(__dirname, '..'));

/**
 * 創建 Yargs CLI 實例
 * Create Yargs CLI instance
 */
let cli = yargs
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
	.locale(osLocaleSync())
	.commandDir(join(__dirname, 'cmds'))
	.help(true)
	.showHelpOnFail(true)
	.strict()
	.demandCommand()
	.scriptName('yt')
;

/**
 * 解析命令行參數
 * Parse command line arguments
 */
cli.argv;
