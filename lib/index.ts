/**
 * yarn-tool 核心功能模組
 * Core functionality module for yarn-tool
 *
 * @author user
 * @created 2019/4/30
 */

import path, { relative } from 'upath2';
import { Console2 } from 'debug-color2';
import { createFnChalkByConsole } from 'debug-color2/lib/util';
import { readPackageJson } from '@ts-type/package-dts';
import { Arguments } from 'yargs';
import { findRoot } from '@yarn-tool/find-root';
import { yargsProcessExit } from '@yarn-tool/yargs-util';

/**
 * 主要的控制台輸出實例
 * Main console output instance
 */
export const console = new Console2();

/**
 * 調試用控制台輸出實例，包含標籤和時間戳
 * Debug console output instance with label and timestamp
 */
export const consoleDebug = new Console2(null, {
	label: true,
	time: true,
});

/**
 * 導出 findRoot 函數，用於尋找項目根目錄
 * Export findRoot function for finding project root directory
 */
export { findRoot }

/**
 * 路徑標準化函數
 * Path normalization function
 * @param input 輸入路徑
 * @returns 標準化後的路徑
 */
export function pathNormalize(input: string)
{
	return path.normalize(input)
}

/**
 * 比較兩個路徑是否相等（標準化後比較）
 * Compare if two paths are equal (after normalization)
 * @param a 第一個路徑
 * @param b 第二個路徑
 * @returns 路徑是否相等
 */
export function pathEqual(a: string, b: string)
{
	return path.normalize(a) === path.normalize(b)
}

/**
 * 過濾 Yargs 參數，只保留指定的鍵或符合條件的鍵值對
 * Filter Yargs arguments, keeping only specified keys or key-value pairs that meet conditions
 * @param argv Yargs 參數對象
 * @param list 鍵名列表或過濾函數
 * @returns 過濾後的參數對象
 */
export function filterYargsArguments<T extends Arguments>(argv: T, list: string[] | ((key: keyof T, value: T[keyof T]) => boolean)): Partial<T>
{
	let ls = Object.entries(argv);

	if (Array.isArray(list))
	{
		ls = ls
			.filter(([key, value]) => {
				return list.includes(key)
			})
		;
	}
	else
	{
		ls = ls
			.filter(([key, value]) => {
				return list(key, value as any)
			})
		;
	}

	return ls.reduce((a, [key, value]) => {

		// @ts-ignore
		a[key] = value;

		return a
	}, {} as Partial<T>)
}

/**
 * 根據布林值參數生成標誌陣列
 * Generate flag array based on boolean arguments
 * @param keys 標誌鍵名列表
 * @param argv 參數對象
 * @returns 標誌陣列
 */
export function lazyFlags(keys: string[], argv: {
	[k: string]: boolean,
}): string[]
{
	return keys.reduce((a, key) => {
		if (argv[key])
		{
			a.push('--' + key);
		}
		return a;
	}, [] as string[])
}

/**
 * 基於控制台實例創建的 Chalk 實例
 * Chalk instance created based on console instance
 */
export const chalkByConsole = createFnChalkByConsole(console);

/**
 * 列印根目錄數據信息
 * Print root directory data information
 * @param rootData 根目錄數據
 * @param argv 參數對象
 */
export function printRootData(rootData: ReturnType<typeof findRoot>, argv: {
	cwd: string,
})
{
	let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;

	let pkg_file = path.join(rootData.pkg, 'package.json');
	let pkg_data = readPackageJson(pkg_file);

	chalkByConsole((chalk, console) =>
	{
		console.info([
			chalk.white(`Package:`),
			`${pkg_data.name}@${pkg_data.version}`,
			chalk.red(relative(doWorkspace ? rootData.ws : argv.cwd, rootData.pkg)),
		].join(' '));

	}, consoleDebug);
}

/**
 * 導出 yargsProcessExit 函數，用於處理 Yargs 錯誤退出
 * Export yargsProcessExit function for handling Yargs error exit
 */
export { yargsProcessExit }
