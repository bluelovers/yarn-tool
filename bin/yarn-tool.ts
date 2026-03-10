#!/usr/bin/env node

/**
 * yarn-tool 主執行文件
 * Main execution file for yarn-tool
 */

import yargs from 'yargs';
import { extname, join } from 'upath2';
import { updateNotifier } from '@yarn-tool/update-notifier';
import { osLocaleSync } from '../lib/osLocaleSync';
import { cliArgv } from '../lib/argv';

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
let cli = cliArgv();

/**
 * 解析命令行參數
 * Parse command line arguments
 */
cli.argv;
