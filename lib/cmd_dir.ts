import { Arguments, Argv, CommandModule, Options } from 'yargs';
import { basename, extname, join } from 'upath2';
import { crossSpawnOther, processArgvSlice } from './spawn';
import { SpawnSyncOptions } from 'cross-spawn-extra/type';

export interface IUnpackMyYargsArgv
{
	cwd: string;
	skipCheckWorkspace?: boolean;
	ytDebugMode?: boolean;
}

export type IUnpackMyYargsArgvPartial = Partial<IUnpackMyYargsArgv>;

export type IUnpackYargsArgv<T extends Argv, D = any> = T extends Argv<infer U> ? U : D;

export type ICommandBuilderFn<T = object, U = object> = (args: Argv<T>) => Argv<U>;

export interface ICommandBuilderObject<T = object, U = object>
{
	[key: string]: Options
}

export type ICommandModuleOmit<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends {} = IUnpackMyYargsArgvPartial> = Omit<CommandModule, 'handler' | 'builder'>;

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
});

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

export function _dummyBuilder<T extends {}>(yarg: Argv<T>)
{
	return yarg
}

export function _dummyHandler<T extends {}>(args: Arguments<T>): any
{
	return args
}

export function basenameStrip(name: string)
{
	return basename(name, extname(name))
}

export function commandDirStrip(name: string, suffix = '_cmds')
{
	return basenameStrip(name) + suffix
}

export function commandDirJoin(root: string, name: string, suffix = '_cmds')
{
	return join(root, commandDirStrip(name, suffix))
}

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
