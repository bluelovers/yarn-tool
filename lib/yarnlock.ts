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
import { IVersionValue } from './cli/ncu';
import semver = require('semver');

const { _formatVersion } = FormatterService;

export interface IYarnLockfileParseFull<T extends ITSArrayListMaybeReadonly<string> = string[]>
{
	type: string;
	object: IYarnLockfileParseObject<T>
}

export type IYarnLockfileParseObject<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<string, IYarnLockfileParseObjectRow<T>>

/**
 * yarn.lock 資料
 */
export interface IYarnLockfileParseObjectRow<T extends ITSArrayListMaybeReadonly<string> = string[]>
{
	version: string;
	/**
	 * 安裝來源網址
	 */
	resolved: string;
	/**
	 * hash key
	 */
	integrity: string;
	/**
	 * 依賴列表
	 */
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

export function stringify(json: IYarnLockfileParseObject): string
{
	return lockfile.stringify(json)
}

export function readYarnLockfile(file: string)
{
	let data = fs.readFileSync(file)

	return parse(data)
}

export function writeYarnLockfile(file: string, data: IYarnLockfileParseObject)
{
	return fs.writeFileSync(file, stringify(data))
}

export function stripDepsName<T = string>(name: string): [T, IVersionValue]
{
	let m = name.match(/^(@?.+?)@(.+)$/);

	if (!m)
	{
		throw new TypeError(`name is not dependencies, ${name}`)
	}

	let r = m.slice(1);

	//console.dir(r);
	//process.exit()

	return r as any
}

export interface IFilterResolutions<T extends ITSArrayListMaybeReadonly<string>>
{
	/**
	 * yarn.lock key 列表
	 */
	names: T,
	/**
	 * 過濾後的 yarn lock deps
	 */
	deps: {
		/**
		 * 模組名稱
		 */
		[P in (keyof ITSValueOfArray<T> | string)]: {
			/**
			 * 版本資料
			 */
			[P in IVersionValue]: IYarnLockfileParseObjectRow<T>;
		}
	},
	/**
	 * 實際安裝的版本編號
	 */
	installed?: {
		/**
		 * 實際安裝的版本編號
		 */
		[P in ITSValueOfArray<T>]: IVersionValue[];
	},
	/**
	 * 每個模組最大的安裝版本
	 */
	max?: {
		/**
		 * 每個模組最大的安裝版本
		 */
		[P in ITSValueOfArray<T>]: {
			key: ITSValueOfArray<T>,
			value: IYarnLockfileParseObjectRow<T>
		}
	},
}

export function filterResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
	resolutions?: IDependencies<T>
}, yarnlock: IYarnLockfileParseObject<T>): IFilterResolutions<T>
{
	if (pkg.resolutions)
	{
		return exportYarnLock(yarnlock, (key, index, array_keys, yarnlock1) => {
			let name = stripDepsName(key)[0];
			return pkg.resolutions[name] != null
		})
	}

	return null;
}

export interface IRemoveResolutions<T extends ITSArrayListMaybeReadonly<string>>
{
	/**
	 * 執行前的 yarn.lock
	 */
	yarnlock_old: IYarnLockfileParseObject<T>;
	/**
	 * 執行後的 yarn.lock
	 */
	yarnlock_new: IYarnLockfileParseObject<T>;
	/**
	 * yarn.lock 是否有變動
	 */
	yarnlock_changed: boolean;
	result: IFilterResolutions<T>;
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
}, yarnlock_old: IYarnLockfileParseObject<T>): IRemoveResolutions<T>
{
	let result = filterResolutions(pkg, yarnlock_old);

	return removeResolutionsCore<T>(result, yarnlock_old);
}

export function removeResolutionsCore<T extends ITSArrayListMaybeReadonly<string>>(result: IFilterResolutions<T>,
	yarnlock_old: IYarnLockfileParseObject<T>,
): IRemoveResolutions<T>
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

export function filterDuplicateYarnLock<T extends ITSArrayListMaybeReadonly<string>>(yarnlock: IYarnLockfileParseObject<T>)
{
	let fy = exportYarnLock(yarnlock);

	let ks = Object.keys(fy.installed)
		.filter(function (value)
		{
			return fy.installed[value].length > 1
		})
	;

	return exportYarnLock(yarnlock, (key, index, array_keys, yarnlock1) => {
		let n = stripDepsName<ITSValueOfArray<T>>(key)[0];

		return ks.includes(n)
	});
}

export function exportYarnLock<T extends ITSArrayListMaybeReadonly<string>>(yarnlock: IYarnLockfileParseObject<T>, filter?: (key: keyof IYarnLockfileParseObject<T>, index: number, array_keys: (keyof IYarnLockfileParseObject<T>)[], yarnlock: IYarnLockfileParseObject<T>) => boolean): IFilterResolutions<T>
{
	let ks = Object.keys(yarnlock);

	if (filter)
	{
		ks = ks
			.filter((value, index, array) => {
				return filter(value, index, array, yarnlock)
		})
	}

	return ks
		.reduce(function (a, k)
		{
			let n = stripDepsName<ITSValueOfArray<T>>(k);

			let name = n[0];
			let key = n[1];

			let data = yarnlock[k];

			// @ts-ignore
			(a.deps[name] = a.deps[name] || {})[key] = data;

			a.installed[name] = a.installed[n[0]] || [];

			if (!a.installed[name].includes(data.version))
			{
				a.installed[name].push(data.version);

				if (a.max[name] != null)
				{
					if (semver.lt(a.max[name].value.version, data.version))
					{
						a.max[name] = {
							key: k,
							value: data,
						};
					}
				}
				else
				{
					a.max[name] = {
						key: k,
						value: data,
					};
				}
			}

			return a;
		}, {
			names: ks,
			deps: {},
			installed: {},
			max: {},
		} as IFilterResolutions<T>)
		;
}
