/**
 * Yargs 命令模組工具
 * Yargs command module utilities
 *
 * @author user
 * @created 2019/5/17
 */

import yargs from 'yargs';
import { IUnpackMyYargsArgv } from './cmd_dir';

/**
 * 緩存的命令模組對象
 * Cached command module object
 */
const cached_command: ICachedCommond = {};

export { IUnpackMyYargsArgv }

/**
 * 從 Yargs Argv 類型中提取實際參數類型
 * Extract actual argument type from Yargs Argv type
 */
export type IUnpackYargsArgv<T extends yargs.Argv> = T extends yargs.Argv<infer U> ? U : never;

/**
 * 緩存命令接口
 * Cached command interface
 */
export interface ICachedCommond
{
	[cmd: string]: yargs.CommandModule
}

/**
 * 預設的命令構建器，不做任何修改
 * Default command builder that does nothing
 * @param yarg Yargs 實例
 * @returns 原始的 Yargs 實例
 */
export function dummy_builder<T extends {}>(yarg: yargs.Argv<T>)
{
	return yarg
}

/**
 * 預設的命令處理器，直接返回參數
 * Default command handler that returns arguments directly
 * @param args 命令參數
 * @returns 原始參數
 */
export function dummy_handler<T extends {}>(args: yargs.Arguments<T>): any
{
	return args
}

/**
 * 創建命令模組
 * Create a command module
 * @param yarg Yargs 實例
 * @param command 命令名稱
 * @param handler 命令處理器
 * @param builder 命令構建器
 * @returns 命令構建器和處理器的元組
 */
export function create_command<T, U extends T>(yarg: yargs.Argv<T>,
	command: string,
	handler: (args: yargs.Arguments<U>) => void,
	builder?: (yarg: yargs.Argv<T>) => yargs.Argv<U>,
)
{
	// @ts-ignore
	builder = builder || dummy_builder;

	cached_command[command] = {
		// @ts-ignore
		builder,
		// @ts-ignore
		handler,
	};

	return [builder, handler] as const
}

/**
 * 調用已緩存的命令
 * Call a cached command
 * @param yarg Yargs 實例
 * @param commond 命令名稱
 * @param argv 可選的參數對象
 * @returns 命令執行結果
 */
export function call_commond<T, U>(yarg: yargs.Argv<T>, commond: string, argv?: yargs.Arguments<U>)
{
	// @ts-ignore
	return cached_command[commond].handler(argv ?? yarg.argv)
}

/**
 * 命令構建器類型
 * Command builder type
 */
export type ICommandBuilder<T extends {}, U extends {}> = (args: yargs.Argv<T>) => yargs.Argv<IUnpackMyYargsArgv & U>;

/**
 * 命令模組接口
 * Command module interface
 */
export type ICommandModule<T extends {}, U extends {} = IUnpackMyYargsArgv> =
{
	command?: ReadonlyArray<string> | string;
	aliases?: ReadonlyArray<string> | string;
	describe?: string | false;

	builder?: ICommandBuilder<T, U>,
	handler(args: yargs.Arguments<IUnpackMyYargsArgv & U>): any,
}

/**
 * 創建命令模組（增強版）
 * Create a command module (enhanced version)
 * @param conf 命令配置對象
 * @returns Yargs 命令模組
 */
export function create_command2<U extends {}>(conf: ICommandModule<IUnpackMyYargsArgv, U> & {
	//yarg?: yargs.Argv<T>,
	desc?: ICommandModule<IUnpackMyYargsArgv, U>["describe"],
}): yargs.CommandModule<IUnpackMyYargsArgv, U>
{
	// @ts-ignore
	let { handler = dummy_handler, builder = dummy_builder, desc } = conf;
	let { describe = desc } = conf;

	let opts: yargs.CommandModule<IUnpackMyYargsArgv, U> = {
		// @ts-ignore
		...(conf as yargs.CommandModule<IUnpackMyYargsArgv, U>),
		// @ts-ignore
		builder,
		// @ts-ignore
		handler,
		describe,
	};

	let command: readonly string[] | string;

	if (Array.isArray(command))
	{
		let cmd = command[0];

		// @ts-ignore
		cached_command[cmd] = opts;

		command.slice(1).forEach(c => cached_command[c] = cached_command[cmd])
	}
	else
	{
		// @ts-ignore
		cached_command[command as string] = opts;
	}

	_delete(opts as any);

	function _delete(opts: typeof conf)
	{
		// @ts-ignore
		delete opts.yarg;
		delete opts.desc;
	}

	return opts;
}
