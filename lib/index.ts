/**
 * Created by user on 2019/4/30.
 */

import path = require('upath2');
import { Console2 } from 'debug-color2';
import { createFnChalkByConsole } from 'debug-color2/lib/util';
import { readPackageJson } from '@ts-type/package-dts';
import { Arguments } from 'yargs';
import { findRoot } from '@yarn-tool/find-root';
import { yargsProcessExit } from '@yarn-tool/yargs-util';
import { relative } from 'upath2';

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

export { yargsProcessExit }

export default exports as typeof import('./index');
