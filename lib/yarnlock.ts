/**
 * Created by user on 2019/5/17.
 */

import lockfile = require('@yarnpkg/lockfile');
import fs = require('fs-extra');
import { ITSValueOfArray, ITSArrayListMaybeReadonly } from 'ts-type';

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

				a.deps[n[0]] = a.deps[n[0]] || [];

				a.deps[n[0]][n[1]] = yarnlock[k];

				return a;
			}, {
				names: ks,
				deps: {},
			} as {
				names: T,
				deps: Record<ITSValueOfArray<T & ['*']>, IYarnLockfileParseObjectRow>
			})
			;
	}



	return null;
}

export function removeResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
	resolutions?: IDependencies<T>
}, yarnlock_old: IYarnLockfileParseObject<T>)
{
	let result = filterResolutions(pkg, yarnlock_old);

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

let pkg = fs.readJSONSync('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/package.json') as typeof import('../../../package.json');

let y = readYarnLockfile('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/yarn.lock')

console.dir(removeResolutions(pkg, y), {
	depth: null,
});
