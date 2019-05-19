/**
 * Created by user on 2019/5/17.
 */

import lockfile = require('@yarnpkg/lockfile');
import fs = require('fs-extra');
import { ITSArrayListMaybeReadonly, ITSValueOfArray } from 'ts-type';
import { DiffService } from 'yarn-lock-diff/lib/diff-service';
import { FormatterService } from 'yarn-lock-diff/lib/formatter';
import { findRoot, fsYarnLock } from './index';
import * as deepDiff from 'deep-diff';
import { colorizeDiff, createDependencyTable } from './table';
import { consoleDebug, console } from './index';
import { DiffArray } from 'deep-diff';
import { Chalk } from 'chalk';

const { _formatVersion } = FormatterService;

export interface IYarnLockfileParseFull<T extends ITSArrayListMaybeReadonly<string> = string[]>
{
	type: string;
	object: IYarnLockfileParseObject<T>
}

export type IYarnLockfileParseObject<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<string, IYarnLockfileParseObjectRow<T>>

export interface IYarnLockfileParseObjectRow<T extends ITSArrayListMaybeReadonly<string> = string[]>
{
	version: string;
	resolved: string;
	integrity: string;
	dependencies?: IDependencies<T>;
}

export type IDependencies<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<ITSValueOfArray<T>, string>;

export function parseFull(text: string | Buffer): IYarnLockfileParseFull
{
	return lockfile.parse(text.toString())
}

export function parse(text: string | Buffer)
{
	return parseFull(text).object
}

export function stringify(json: object): string
{
	return lockfile.stringify(json)
}

export function readYarnLockfile(file: string)
{
	let data = fs.readFileSync(file)

	return parse(data)
}

export function stripDepsName(name: string): [string, string]
{
	let m = name.match(/^(.+)@(.+)$/);

	if (!m)
	{
		throw new TypeError(`name is not dependencies, ${name}`)
	}

	let r = m.slice(1) as [string, string];

	//console.dir(r);
	//process.exit()

	return r
}

export function filterResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
	resolutions?: IDependencies<T>
}, yarnlock: IYarnLockfileParseObject<T>)
{
	if (pkg.resolutions)
	{
		let ks = Object.keys(yarnlock)
			.filter(k =>
			{
				let n = stripDepsName(k)[0];
				return pkg.resolutions[n] != null
			});

		return ks
			.reduce(function (a, k)
			{
				let n = stripDepsName(k);

				a.deps[n[0]] = a.deps[n[1]] || [];

				a.deps[n[0]][n[1]] = yarnlock[k];

				return a;
			}, {
				names: ks,
				deps: {},
			} as {
				names: T,
				deps: Record<ITSValueOfArray<T>, Record<string | '*', IYarnLockfileParseObjectRow>>
			})
			;
	}

	return null;
}

/**
 *
 * @example ```
 let pkg = readPackageJson('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/package.json');

 let y = readYarnLockfile('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/yarn.lock')

 console.dir(removeResolutions(pkg, y), {
	depth: null,
});
 ```
 */
export function removeResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
	resolutions?: IDependencies<T>
}, yarnlock_old: IYarnLockfileParseObject<T>)
{
	let result = filterResolutions(pkg, yarnlock_old);

	return removeResolutionsCore(result, yarnlock_old);
}

export function removeResolutionsCore<T extends ITSArrayListMaybeReadonly<string>>(result: ReturnType<typeof filterResolutions>,
	yarnlock_old: IYarnLockfileParseObject<T>,
)
{
	let yarnlock_new: IYarnLockfileParseObject<T> = result.names
		// @ts-ignore
		.reduce(function (a: IYarnLockfileParseObject<T>, b)
		{
			delete a[b];

			return a;
		}, {
			...yarnlock_old,
		});

	let yarnlock_changed = !!result.names.length;

	return {
		/**
		 * 執行前的 yarn.lock
		 */
		yarnlock_old,
		/**
		 * 執行後的 yarn.lock
		 */
		yarnlock_new,
		/**
		 * yarn.lock 是否有變動
		 */
		yarnlock_changed,

		result,
	}
}

export function yarnLockDiff(yarnlock_old: string, yarnlock_new: string): string
{
	let { chalk } = console;
	let _ok = false;

	const table = createDependencyTable();

	table.options.colAligns = ['left', 'center', 'center', 'center'];
	table.options.head = [
		chalk.bold.reset('package name'),
		chalk.bold.reset('old version(s)'),
		'',
		chalk.bold.reset('new version(s)'),
	];

	DiffService.buildDiff([yarnlock_old], [yarnlock_new])
		.map(function (diff)
		{
			let formatedDiff: {
				[k: string]: [string, string, string, string];
			} = {};

			const NONE = chalk.red('-');
			const ARROW = chalk.gray('→');

			diff
				.map(packageDiff =>
				{
					const path: string = packageDiff.path.find(() => true);

					_ok = true;

					let _arr: [string, string, string, string];

					switch (packageDiff.kind)
					{
						case 'A':

							let diffArray = _diffArray(packageDiff, chalk);

							_arr = [path, chalk.gray(diffArray[0]), ARROW, chalk.gray(diffArray[1])];

							break;
						case 'D':

							_arr = [chalk.red(path), chalk.red(_formatVersion(packageDiff.lhs)), ARROW, NONE];

							break;
						case 'E':

							let lhs0 = _formatVersion(packageDiff.lhs);
							let rhs0 = _formatVersion(packageDiff.rhs);

							let lhs = chalk.yellow(lhs0);
							let rhs = chalk.yellow(colorizeDiff(lhs0, rhs0));

							_arr = [chalk.yellow(path), lhs, ARROW, rhs];

							break;
						case 'N':

							_arr = [chalk.green(path), NONE, ARROW, chalk.green(_formatVersion(packageDiff.rhs))];

							break;
					}

					_arr && (formatedDiff[path] = _arr);

				})
			;

			table.push(...Object.values(formatedDiff))
		})
	;

	return _ok ? table.toString() : '';
}

export function _diffArray(array: deepDiff.DiffArray<{}, {}>, chalk: Chalk)
{
	const item = array.item;
	switch (item.kind)
	{
		case "N":
			return [`[...]`, `[..., ${chalk.green(_formatVersion(item.rhs))}]`];
		case "D":
			return [`[..., ${chalk.red(_formatVersion(item.lhs))}]`, `[...]`];
		case "E":
			return [
				`[...], ${chalk.yellow(_formatVersion(item.lhs))}]`,
				`[..., ${chalk.yellow(_formatVersion(item.lhs))}]`,
			];
		default:
			return [`[...]`, `[...]`];
	}
}

/*
export function yarnLockDiff2(yarnlock_old: string, yarnlock_new: string): string
{
	let r2: string[] = [];

	let r = DiffService.buildDiff([yarnlock_old], [yarnlock_new])
		.map(FormatterService.buildDiffTable)
		.map(r => r2.push(r))
	;

	return r2[0];
}
 */

/*
let ret = fsYarnLock(findRoot({
	cwd: process.cwd(),
}).root);

let ob = parse(ret.yarnlock_old);

let ret2 = removeResolutions({
	resolutions: {
		'semver': '',
		'pkg-dir': '',
		'is-npm': '',
	},
}, ob);

let s = yarnLockDiff(stringify(ob), stringify(ret2.yarnlock_new));

console.log(s);
*/
