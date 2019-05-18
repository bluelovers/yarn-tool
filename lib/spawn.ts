/**
 * Created by user on 2019/5/18.
 */

import crossSpawn = require('cross-spawn-extra');
import * as yargs from 'yargs';
import { IUnpackMyYargsArgv } from './cli';
import { consoleDebug, console } from './index';
import Bluebird = require('bluebird');

export function requireResolve(name: string)
{
	try
	{
		let ret = require.resolve(name);

		if (ret)
		{
			return ret
		}
	}
	catch (e)
	{

	}

	return null;
}

export function checkModileExists(argv: {
	name: string,
	msg?: string,
	requireName?: string,
	installCmd?: string
})
{
	let ret = requireResolve(argv.requireName || argv.name);

	if (!ret)
	{
		console.magenta.log(`module '${argv.name}' not exists`);
		console.log(`please use follow cmd for install`);
		console.cyan.log(`\n\t${argv.installCmd || 'npm install -g'} ${argv.name}\n`);

		if (argv.msg)
		{
			console.log(`${argv.msg}\n`);
		}

		return null;
	}

	return ret;
}

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

export function crossSpawnOther(bin: string, cmd_list: string[], argv)
{
	let cp = crossSpawn.sync('npm', cmd_list.filter(v => v != null), {
		stdio: 'inherit',
		cwd: argv.cwd,
	});

	return _crossSpawnOther(cp);
}

export function crossSpawnOtherAsync(bin: string, cmd_list: string[], argv)
{
	return crossSpawn.async('npm', cmd_list.filter(v => v != null), {
		stdio: 'inherit',
		cwd: argv.cwd,
	})
		.tap(_crossSpawnOther)
}

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
