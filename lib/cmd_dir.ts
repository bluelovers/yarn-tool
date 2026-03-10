import { Arguments, Argv, CommandModule, Options } from 'yargs';
import { basename, extname, join } from 'upath2';
import { crossSpawnOther, processArgvSlice } from './spawn';
import { SpawnSyncOptions } from 'cross-spawn-extra';

/**
 * Yargs 參數解包接口
 * Yargs argument unpacking interface
 */
export interface IUnpackMyYargsArgv
{
	cwd: string;
	skipCheckWorkspace?: boolean;
	ytDebugMode?: boolean;
}

/**
 * 部分 Yargs 參數解包類型
 * Partial Yargs argument unpacking type
 */
export type IUnpackMyYargsArgvPartial = Partial<IUnpackMyYargsArgv>;

/**
 * 從 Yargs Argv 類型中提取實際參數類型
 * Extract actual argument type from Yargs Argv type
 */
export type IUnpackYargsArgv<T extends Argv, D = any> = T extends Argv<infer U> ? U : D;

/**
 * 命令構建器函數類型
 * Command builder function type
 */
export type ICommandBuilderFn<T = object, U = object> = (args: Argv<T>) => Argv<U>;

/**
 * 命令構建器對象接口
 * Command builder object interface
 */
export interface ICommandBuilderObject<T = object, U = object>
{
	[key: string]: Options
}

/**
 * 命令模組省略類型
 * Command module omit type
 */
export type ICommandModuleOmit<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends {} = IUnpackMyYargsArgvPartial> = Omit<CommandModule, 'handler' | 'builder'>;

/**
 * 命令模組導出類型
 * Command module export type
 */
export type ICommandModuleExports<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv> =
	ICommandModuleOmit
	& ({
	builder(args: Argv<T>): Argv<U>;
	handler(args: Arguments<U>): any;
} | {
	builder: ICommandBuilderObject;
	handler(args: Arguments<U>): any;
} | {
	handler(args: Arguments<T>): any;
} | {
	builder(args: Argv<T>): Argv<U>;
})

/**
 * 創建命令模組導出對象
 * Create command module export object
 * @param module 命令模組配置
 * @returns 命令模組
 */
export function createCommandModuleExports<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv>(module: ICommandModuleExports<T, U>): CommandModule<T, U>
{
	// @ts-ignore
	if (module.builder == null && module.handler == null)
	{
		// @ts-ignore
		throw new TypeError(`'builder' or 'handler' must exists, but got\nbuilder: ${module.builder}\nhandler: ${module.handler}`)
	}

	// @ts-ignore
	let { builder = _dummyBuilder, handler = _dummyHandler } = module;

	return {
		...module,
		builder,
		handler,
	} as CommandModule<T, U>
}

/**
 * 預設命令構建器
 * Default command builder
 * @param yarg Yargs 實例
 * @returns 原始 Yargs 實例
 */
export function _dummyBuilder<T extends {}>(yarg: Argv<T>)
{
	return yarg
}

/**
 * 預設命令處理器
 * Default command handler
 * @param args 命令參數
 * @returns 原始參數
 */
export function _dummyHandler<T extends {}>(args: Arguments<T>): any
{
	return args
}

/**
 * 去除文件擴展名的文件名
 * Filename without extension
 * @param name 文件名
 * @returns 去除擴展名的文件名
 */
export function basenameStrip(name: string)
{
	return basename(name, extname(name))
}

/**
 * 命令目錄名稱處理
 * Command directory name processing
 * @param name 目錄名稱
 * @param suffix 後綴
 * @returns 處理後的目錄名稱
 */
export function commandDirStrip(name: string, suffix = '_cmds')
{
	return basenameStrip(name) + suffix
}

/**
 * 命令目錄路徑組合
 * Command directory path joining
 * @param root 根目錄
 * @param name 目錄名稱
 * @param suffix 後綴
 * @returns 組合後的路徑
 */
export function commandDirJoin(root: string, name: string, suffix = '_cmds')
{
	return join(root, commandDirStrip(name, suffix))
}

/**
 * 懶加載子進程參數切片
 * Lazy load child process argument slicing
 * @param options 選項配置
 * @returns 子進程執行結果
 */
export function lazySpawnArgvSlice(options: {
	bin: string,
	command: string | string[],
	cmd?: string | string[],
	argv: {
		cwd: string
	},
	crossSpawnOptions?: SpawnSyncOptions
})
{
	let cmd_list = processArgvSlice(options.command).argv;

	return crossSpawnOther(options.bin, [

		...(Array.isArray(options.cmd) ? options.cmd : [options.cmd]),

		...cmd_list,
	], options.argv, options.crossSpawnOptions);
}
