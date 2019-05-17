/**
 * Created by user on 2019/5/17.
 */

import yargs = require('yargs');
import { Argv } from 'yargs';

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
	.help(true)
	.showHelpOnFail(true)
	.strict()
	/*
	.command('help', 'Show help', (yarg) =>
	{
		yarg.showHelp('log');
		return yarg;
	})
	*/
	.command(create_command2({
		command: 'help',
		describe: 'Show help',
		builder(yarg)
		{
			yarg.showHelp('log');
			return yarg;
		},
	}))
;

export type IMyYargsArgv = typeof cli;

export function getYargs<T =  IUnpackYargsArgv<IMyYargsArgv>>(): yargs.Argv<T>
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

function dummy_builder<T>(yarg: yargs.Argv<T>)
{
	return yarg
}

function dummy_handler<T>(args: yargs.Arguments<T>): any
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

export type ICommandModule<T, U> = Omit<yargs.CommandModule<T, U>, 'handler' | 'builder'> & ({
	handler?: yargs.CommandModule<T, U>["handler"],
	builder(args: Argv<T>): Argv<U>,
} | {
	handler: yargs.CommandModule<T, U>["handler"],
	builder?: yargs.CommandModule<T, U>["builder"],
});

export function create_command2<T, U extends T = T>(conf: ICommandModule<T, U | T> & {
	yarg?: yargs.Argv<T>,
	desc?: yargs.CommandModule<T, U>["describe"],
}): yargs.CommandModule<T, U>
{
	let { handler = dummy_handler, builder = dummy_builder, desc } = conf;
	let { describe = desc } = conf;

	let opts: yargs.CommandModule<T, U> = {
		...(conf as yargs.CommandModule<T, U>),
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
		delete opts.yarg;
		delete opts.desc;
	}

	return opts;
}
