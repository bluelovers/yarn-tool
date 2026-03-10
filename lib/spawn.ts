/**
 * 子進程執行工具模組
 * Child process execution utilities
 *
 * @author user
 * @created 2019/5/18
 */

import crossSpawn, { SpawnSyncOptions } from 'cross-spawn-extra';
import { Arguments } from 'yargs';
import { console, consoleDebug } from './index';
import { normalize } from 'upath2';
import { requireResolveExtra } from '@yarn-tool/require-resolve';

/**
 * 檢查模組是否存在，若不存在則提示安裝
 * Check if module exists, prompt installation if not
 * @param argv 檢查配置對象
 * @returns 模組路徑或 null
 */
export function checkModileExists(argv: {
	name: string,
	msg?: string,
	requireName?: string,
	installCmd?: string
	processExit?: boolean | number,
})
{
	let ret = requireResolveExtra(argv.requireName || argv.name, {
		includeGlobal: true,
		includeCurrentDirectory: true,
	}).result;

	if (!ret)
	{
		console.magenta.log(`module '${argv.name}' not exists`);
		console.log(`please use follow cmd for install`);
		console.cyan.log(`\n\t${argv.installCmd || 'npm install -g'} ${argv.name}\n`);

		if (argv.msg)
		{
			console.log(`${argv.msg}\n`);
		}

		if (argv.processExit)
		{
			process.exit((argv.processExit as number) | 0);
		}

		return null;
	}

	return ret;
}

/**
 * 處理子進程執行結果
 * Handle child process execution result
 * @param cp 子進程執行結果
 * @returns 原始結果或拋出錯誤
 */
export function _crossSpawnOther<T>(cp: T)
{
	// @ts-ignore
	if (cp.error)
	{
		// @ts-ignore
		throw cp.error
	}

	// @ts-ignore
	if (cp.signal)
	{
		// @ts-ignore
		consoleDebug.error(`cp.signal`, cp.signal);
		process.exit(1)
	}

	return cp;
}

/**
 * 同步執行子進程命令
 * Synchronously execute child process command
 * @param bin 可執行文件路徑
 * @param cmd_list 命令參數列表
 * @param argv 參數對象
 * @param crossSpawnOptions 子進程選項
 * @returns 子進程執行結果
 */
export function crossSpawnOther(bin: string,
	cmd_list: string[],
	argv: Partial<Arguments> & {
		cwd: string
	},
	crossSpawnOptions?: SpawnSyncOptions
)
{
	//consoleDebug.debug(bin, cmd_list);

	let cp = crossSpawn.sync(bin, cmd_list.filter(v => v != null), {
		stdio: 'inherit',
		cwd: argv.cwd,
		...crossSpawnOptions,
	});

	return _crossSpawnOther(cp);
}

/**
 * 異步執行子進程命令
 * Asynchronously execute child process command
 * @param bin 可執行文件路徑
 * @param cmd_list 命令參數列表
 * @param argv 參數對象
 * @returns 子進程執行結果的 Promise
 */
export function crossSpawnOtherAsync(bin: string, cmd_list: string[], argv)
{
	//consoleDebug.debug(bin, cmd_list);

	return crossSpawn.async(bin, cmd_list.filter(v => v != null), {
		stdio: 'inherit',
		cwd: argv.cwd,
	})
		.tap(_crossSpawnOther)
}

/**
 * 處理命令行參數切片
 * Process command line argument slicing
 * @param keys_input 鍵名或鍵名列表
 * @param argv_input 原始參數數組
 * @param startindex 開始索引
 * @returns 處理後的參數信息對象
 */
export function processArgvSlice(keys_input: string | string[], argv_input = process.argv, startindex: number = 2)
{
	if (typeof keys_input === 'string')
	{
		keys_input = [keys_input];
	}

	let argv_before = argv_input.slice(0, startindex);
	let argv_after = argv_input.slice(startindex);

	let idx = keys_input.reduce(function (a, b)
	{
		let i = argv_after.indexOf(b);

		if (a === -1)
		{
			return i;
		}
		else if (i !== -1)
		{
			return Math.min(i, a)
		}

		return a
	}, -1);


	let argv = (idx > -1) ? argv_after.slice(idx + 1) : null;
	let key = (idx > -1) ? argv_after[idx] : null;

	let idx_rebase = (idx > -1) ? idx + startindex : -1;

	return {
		idx_rebase,
		idx,
		argv_input,
		argv_before,
		argv_after,
		argv,
		keys_input,
		key,
	};
}
