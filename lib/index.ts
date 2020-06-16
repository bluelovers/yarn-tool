/**
 * Created by user on 2019/4/30.
 */

import path = require('upath2');
import fs = require('fs-extra');
import { Console2 } from 'debug-color2';
import { createFnChalkByConsole } from 'debug-color2/lib/util';
import { readPackageJson } from '@ts-type/package-dts';
import { Arguments } from 'yargs';
import { IUnpackMyYargsArgv } from './cmd_dir';
import { findRoot } from '@yarn-tool/find-root';

export const console = new Console2();

export const consoleDebug = new Console2(null, {
	label: true,
	time: true,
});

export { findRoot }

export function pathNormalize(input: string)
{
	return path.normalize(input)
}

export function pathEqual(a: string, b: string)
{
	return path.normalize(a) === path.normalize(b)
}

export function fsYarnLock(root: string)
{
	let yarnlock_file = path.join(root, 'yarn.lock');

	let yarnlock_exists = fs.existsSync(yarnlock_file);

	let yarnlock_old = yarnlock_exists && fs.readFileSync(yarnlock_file, 'utf8') || null;

	return {
		yarnlock_file,
		yarnlock_exists,
		yarnlock_old,
	}
}

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

export const chalkByConsole = createFnChalkByConsole(console);

export function printRootData(rootData: ReturnType<typeof findRoot>, argv: Arguments<IUnpackMyYargsArgv>)
{
	let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;

	let pkg_file = path.join(rootData.pkg, 'package.json');
	let pkg_data = readPackageJson(pkg_file);

	consoleDebug.info(`${pkg_data.name}@${pkg_data.version}`, path.relative(doWorkspace ? rootData.ws : argv.cwd, rootData.pkg));
}

export function yargsProcessExit(msg: string | Error, code: number = 1)
{
	if (!(msg instanceof Error))
	{
		msg = new Error(msg);

		// @ts-ignore
		msg.code = code
	}

	console.error(msg.message);
	require('yargs').exit(code, msg);
	process.exit(code)
}

export default exports as typeof import('./index');
