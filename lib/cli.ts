/**
 * Created by user on 2019/5/17.
 */

import yargs = require('yargs');
import { Arguments, Argv, CommandBuilder, Omit } from 'yargs';

const cached_command: ICachedCommond = {};

export const cli = yargs
	.option('cwd', {
		desc: `current working directory or package directory`,
		normalize: true,
		default: process.cwd(),
	})
	.option('skipCheckWorkspace', {
		desc: `this options is for search yarn.lock, pkg root, workspace root, not same as --ignore-workspace-root-check`,
		boolean: true,
	})
	.option('yt-debug-mode', {
		boolean: true,
	})
	.command({
		command: 'help',
		describe: 'Show help',
		aliases: ['h'],
		builder(yarg)
		{
			yarg.showHelp('log');
			return yarg;
		},
		handler: dummy_handler,
	})
	.command({
		command: 'version',
		describe: 'Show version',
		builder(yarg)
		{
			return yarg;
		},
		async handler()
		{
			return import('../package.json')
				.then(v => console.log(v.version))
				;
		},
	})
	.recommendCommands()
;

export type IMyYargsArgv = typeof cli;

export type IUnpackMyYargsArgv = {
	cwd: string;
	skipCheckWorkspace: boolean;
};

export function getYargs(): yargs.Argv<IUnpackMyYargsArgv>
{
	// @ts-ignore
	return cli;
}

export default cli

export type IUnpackYargsArgv<T extends yargs.Argv> = T extends yargs.Argv<infer U> ? U : never;

export interface ICachedCommond
{
	[cmd: string]: yargs.CommandModule
}

export function dummy_builder<T extends {}>(yarg: yargs.Argv<T>)
{
	return yarg
}

export function dummy_handler<T extends {}>(args: yargs.Arguments<T>): any
{
	return args
}

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

export function call_commond<T, U>(yarg: yargs.Argv<T>, commond: string, argv?: yargs.Arguments<U>)
{
	return cached_command[commond].handler(argv == null ? yarg.argv : argv)
}

export type ICommandBuilder<T extends {}, U extends {}> = (args: yargs.Argv<T>) => yargs.Argv<IUnpackMyYargsArgv & U>;

export type ICommandModule<T extends {}, U extends {} = IUnpackMyYargsArgv> =
{
	command?: ReadonlyArray<string> | string;
	aliases?: ReadonlyArray<string> | string;
	describe?: string | false;

	builder?: ICommandBuilder<T, U>,
	handler(args: yargs.Arguments<IUnpackMyYargsArgv & U>): any,
}

export function create_command2<U extends {}>(conf: ICommandModule<IUnpackMyYargsArgv, U> & {
	//yarg?: yargs.Argv<T>,
	desc?: ICommandModule<IUnpackMyYargsArgv, U>["describe"],
}): yargs.CommandModule<IUnpackMyYargsArgv, U>
{
	// @ts-ignore
	let { handler = dummy_handler, builder = dummy_builder, desc } = conf;
	let { describe = desc } = conf;

	let opts: yargs.CommandModule<IUnpackMyYargsArgv, U> = {
		...(conf as yargs.CommandModule<IUnpackMyYargsArgv, U>),
		// @ts-ignore
		builder,
		handler,
		describe,
	};

	let command: readonly string[] | string;

	if (Array.isArray(command))
	{
		let cmd = command[0];

		cached_command[cmd] = opts;

		command.slice(1).forEach(c => cached_command[c] = cached_command[cmd])
	}
	else
	{
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
