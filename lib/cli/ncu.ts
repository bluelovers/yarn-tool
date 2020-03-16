/**
 * Created by user on 2019/4/30.
 */

import { run as _npmCheckUpdates } from 'npm-check-updates';
import { IWrapDedupeCache } from './dedupe';
import IPackageJson from '@ts-type/package-dts/package-json';
//import versionUtil = require('npm-check-updates/lib/version-util');
//import chalk = require('chalk');
import { console, findRoot } from '../index';
import { toDependencyTable } from '../table';
import { Argv } from 'yargs';
import { IUnpackYargsArgv } from '../cli';
import PackageManagersNpm = require('npm-check-updates/lib/package-managers/npm');
import {
	queryVersions as _queryVersions,
	getVersionTarget as _getVersionTarget,
	isUpgradeable as _isUpgradeable,
	upgradeDependencyDeclaration,
} from 'npm-check-updates/lib/versionmanager';
import {
	ITSUnpackedPromiseLike,
} from 'ts-type';

const versionUtil = require('npm-check-updates/lib/version-util');
import Bluebird = require('bluebird');
import {
	filterResolutions,
	IYarnLockfileParseObject,
	parse as parseYarnLock,
	parse,
	readYarnLockfile,
	stripDepsName,
	IYarnLockfileParseObjectRow,
} from '../yarnlock';
import path = require('upath2');
import semver = require('semver');
import _ = require('lodash');
import semverutils = require('semver-utils');
import packageJson = require('package-json');
import { inspect } from 'util';

export type IVersionValue = 'latest' | '*' | string | EnumVersionValue | EnumVersionValue2;

export interface IVersionCacheMapKey
{
	name: string,
	versionTarget: EnumVersionValue,
	version_old: IVersionValue,
}

export enum EnumVersionValue
{
	'major' = 'major',
	'minor' = 'minor',
	'latest' = 'latest',
	'greatest' = 'greatest',
	'newest' = 'newest'
}

export enum EnumPackageManagersNpmMethod
{
	'major' = 'greatestMajor',
	'minor' = 'greatestMinor',
	'latest' = 'latest',
	'greatest' = 'greatest',
	'newest' = 'newest'
}

export const enum EnumVersionValue2
{
	any = '*'
}

export type IDependency = IPackageMap;

export interface IPackageMap
{
	[name: string]: IVersionValue
}

export interface IVersionCacheMapValue extends IVersionCacheMapKey
{
	version_new: IVersionValue,
}

export const versionCacheMap = new Map<string, IVersionCacheMapValue>();

export const remoteCacheMap = new Map<string, ITSUnpackedPromiseLike<ReturnType<typeof packageJson>>>();

export type IOptions = IUnpackYargsArgv<ReturnType<typeof setupNcuToYargs>> & {
	json_old: IPackageJson;
	cwd?: string;
	packageData?: string;
	packageManager?: 'npm' | 'bower';

	json_new?: IPackageJson;
	json_changed?: boolean;

	list_updated?: Record<string, string>;

	loglevel?: 'silent' | 'verbose';

	semverLevel?: EnumVersionValue.major | EnumVersionValue.minor,

	versionTarget?: EnumVersionValue,

	current?: IDependency;

	noSafe?: boolean;
}

export function getVersionTarget(options: Partial<IOptions> | string | IOptions['versionTarget']): IOptions['versionTarget']
{
	if (typeof options === 'string')
	{
		// @ts-ignore
		return options
	}
	else if (options.versionTarget)
	{
		return options.versionTarget
	}

	return _getVersionTarget(options)
}

export function objVersionCache({
	name,
	versionTarget,
	version_old,
}: IVersionCacheMapKey): IVersionCacheMapKey
{
	return {
		name,
		versionTarget,
		version_old,
	};
}

export function objVersionCacheValue({
	name,
	versionTarget,
	version_old,
	version_new,
}: IVersionCacheMapValue): IVersionCacheMapValue
{
	return {
		name,
		versionTarget,
		version_old,
		version_new,
	};
}

export function strVersionCache(key: IVersionCacheMapKey)
{
	return JSON.stringify(objVersionCache(key));
}

export function hasQueryedVersionCache(key: IVersionCacheMapKey)
{
	return versionCacheMap.has(strVersionCache(key))
}

export function keyObjectToPackageMap(obj: IVersionCacheMapKey[] | IVersionCacheMapValue[],
	useVarsionNew?: boolean,
): IPackageMap
{
	// @ts-ignore
	return obj.reduce(function (a: any, data)
	{
		if (useVarsionNew)
		{
			if (typeof data.version_new !== 'string')
			{
				return a;

				throw new TypeError(`not a IVersionCacheMapValue object, ${inspect(data)}`)
			}

			a[data.name] = data.version_new;
		}
		else
		{
			a[data.name] = data.version_old;
		}

		return a;
		// @ts-ignore
	}, {})
}

export function packageMapToKeyObject(packageMap: IPackageMap, versionTarget: IVersionCacheMapKey["versionTarget"])
{
	return Object
		.entries(packageMap)
		.map(([name, version_old]) =>
		{
			return objVersionCache({
				name, version_old, versionTarget,
			})
		})
		;
}

export function queryPackageManagersNpm(name: string,
	version: IVersionValue = '0',
	versionTarget: EnumVersionValue = EnumVersionValue.latest,
): Bluebird<IVersionValue>
{
	let method = EnumPackageManagersNpmMethod[versionTarget];

	if (version == null)
	{
		version = '0';

		switch (versionTarget)
		{
			case EnumVersionValue.latest:
			case EnumVersionValue.greatest:
			case EnumVersionValue.newest:
				break;
			case EnumVersionValue.major:
			case EnumVersionValue.minor:
				method = EnumPackageManagersNpmMethod.latest;
				break;
		}
	}

	return Bluebird
		.resolve<IVersionValue>(PackageManagersNpm[method](name, version, {}))
		.then(async (value) =>
		{
			if (value == null)
			{
				let r = await requestVersion(name);

				if (version in r['dist-tags'])
				{
					return r['dist-tags'][version]
				}
			}

			return value
		})

}

export function setVersionCacheMap(data: IVersionCacheMapValue)
{
	return versionCacheMap.set(strVersionCache(data), objVersionCacheValue(data));
}

export function queryRemoteVersions(packageMap: IPackageMap | string[], options: Partial<IOptions> = {})
{
	return Bluebird.resolve()
		.then(async function ()
		{
			options = npmCheckUpdatesOptions(options);

			//console.dir(options);

			options.loglevel = 'silent';

			let versionTarget = options.versionTarget = getVersionTarget(options) || EnumVersionValue.latest;

			if (Array.isArray(packageMap))
			{
				packageMap = packageMap.reduce(function (a, b)
				{
					a[b] = versionTarget;

					return a
				}, {} as IPackageMap);
			}

			let packageMapArray = packageMapToKeyObject(packageMap, versionTarget);

			let packageMapArrayFilted = await Bluebird.resolve(packageMapArray)
				.filter(async (d) =>
				{
					let bool = !hasQueryedVersionCache(d);

					if (bool && isBadVersion(d.version_old))
					{
						if (versionTarget === EnumVersionValue.minor)
						{
							let version_new = await queryPackageManagersNpm(d.name);

							d.version_old = version_new.split('.')[0] + '.0.0';

							setVersionCacheMap({
								...d,
								version_new,
							});

							bool = false;
						}
					}

					return bool
				})
			;

			let packageMap2 = keyObjectToPackageMap(packageMapArrayFilted);

			return Bluebird
				.resolve<IPackageMap>(_queryVersions(packageMap2, options))
				.tap(ret =>
				{
					return Bluebird.resolve(Object.entries(packageMap2))
						.each(async ([name, version_old]) =>
						{
							let version_new = ret[name];

							if (version_old.includes('~'))
							{
								if (!options.noSafe || version_new == null)
								{
									version_new = await fetchVersion(name, {
										filter(version)
										{
											return semver.satisfies(version, version_old)
										},
									}, options)
										.then(ret => ret.pop())
								}
							}

							if (version_new == null && isBadVersion(version_old))
							{
								version_new = await queryPackageManagersNpm(name, null, versionTarget);
							}

							if (version_new == null)
							{
								version_new = await queryPackageManagersNpm(name, version_old, versionTarget);
							}

							setVersionCacheMap({
								name,
								versionTarget,
								version_old,
								version_new,
							});
						})
						;
				})
				.then(() =>
				{
					return packageMapArray
						.map(data => versionCacheMap.get(strVersionCache(data)))
				})
				;
		})
		;
}

export function isBadVersion(version: IVersionValue)
{
	let bool = false;
	switch (version)
	{
		case EnumVersionValue.minor:
		case EnumVersionValue.major:
		case EnumVersionValue.newest:
		case EnumVersionValue.latest:
		case EnumVersionValue.greatest:
		case EnumVersionValue2.any:
			bool = true;
			break;
		default:

			if (version == null)
			{
				bool = true;
			}

			break;
	}

	return bool;
}

export function npmCheckUpdatesOptions(ncuOptions: Partial<IOptions> | IOptions): IOptions
{
	ncuOptions = {
		...ncuOptions,
	};

	delete ncuOptions.upgrade;
	// @ts-ignore
	delete ncuOptions.global;

	ncuOptions.packageManager = 'npm';

	if (ncuOptions.json_old)
	{
		ncuOptions.packageData = JSON.stringify(ncuOptions.json_old);
	}

	// @ts-ignore
	ncuOptions.jsonUpgraded = true;

	return ncuOptions as IOptions
}

export async function npmCheckUpdates<C extends IWrapDedupeCache>(cache: Partial<C>, ncuOptions: IOptions)
{
	//ncuOptions.silent = false;

	//ncuOptions.json = false;
	//ncuOptions.cli = true;

	//ncuOptions.args = [];

	//ncuOptions.loglevel = 'verbose';

	ncuOptions = npmCheckUpdatesOptions(ncuOptions);

	ncuOptions.cwd = cache.cwd;

	ncuOptions.json_new = JSON.parse(ncuOptions.packageData);

	ncuOptions.list_updated = await _npmCheckUpdates(ncuOptions) as Record<string, string>;

	let ks = Object.keys(ncuOptions.list_updated);

	ncuOptions.json_changed = !!ks.length;

	let current: IDependency = {};

	if (ks.length)
	{
		ks.forEach(name =>
		{

			(<(keyof IPackageJson)[]>[
				'dependencies',
				'devDependencies',
				'peerDependencies',
				'optionalDependencies',
			]).forEach(key =>
			{

				let data = ncuOptions.json_new[key];

				if (data)
				{
					let value = data[name];

					if (value && value != EnumVersionValue2.any && value != EnumVersionValue.latest)
					{
						current[name] = value;

						data[name] = ncuOptions.list_updated[name];
					}
				}

			})

		});

	}

	ncuOptions.current = current;

	let table = toDependencyTable({
		from: ncuOptions.current,
		to: ncuOptions.list_updated,
	}).toString();

	table && console.log(`\n${table}\n`);

	return ncuOptions;
}

export function setupNcuToYargs<T extends any>(yargs: Argv<T>)
{
	return yargs
		.option('dep', {
			desc: `check only a specific section(s) of dependencies: prod|dev|peer|optional|bundle (comma-delimited)`,
			string: true,
		})
		.option('minimal', {
			alias: ['m'],
			desc: `do not upgrade newer versions that are already satisfied by the version range according to semver`,
			boolean: true,
		})
		.option('newest', {
			alias: ['n'],
			desc: `find the newest versions available instead of the latest stable versions`,
			boolean: true,
		})
		.option('packageManager', {
			alias: ['p'],
			desc: `npm (default) or bower`,
			default: 'npm',
			string: true,
		})
		.option('registry', {
			alias: ['r'],
			desc: `specify third-party npm registry`,
			string: true,
		})
		.option('silent', {
			alias: ['s'],
			desc: `don't output anything (--loglevel silent)`,
			boolean: true,
		})
		.option('greatest', {
			alias: ['g'],
			desc: `find the highest versions available instead of the latest stable versions`,
			boolean: true,
		})
		.option('upgrade', {
			alias: ['u'],
			desc: `overwrite package file`,
			boolean: true,
		})
		.option('semverLevel', {
			desc: `find the highest version within "major" or "minor"`,
			string: true,
		})
		.option('removeRange', {
			desc: `remove version ranges from the final package version`,
			boolean: true,
		})
		.option('dedupe', {
			desc: `remove upgrade module from resolutions`,
			boolean: true,
			default: true,
		})
		;
}

export function checkResolutionsUpdate(resolutions: IPackageMap,
	yarnlock_old_obj: IYarnLockfileParseObject | string,
	options: Partial<IOptions>,
)
{
	return Bluebird.resolve()
		.then(async function ()
		{
			if (typeof yarnlock_old_obj === 'string')
			{
				yarnlock_old_obj = parseYarnLock(yarnlock_old_obj);
			}

			let result = filterResolutions({
				resolutions,
			}, yarnlock_old_obj);

			let deps = await queryRemoteVersions(resolutions, options);

			//console.dir(deps);

			let deps2 = keyObjectToPackageMap(deps, true);

			let deps3 = Object.values(deps)
				.reduce(function (a, b)
				{
					a[b.name] = b;

					return a;
				}, {} as Record<string, IVersionCacheMapValue>)
			;

			let yarnlock_new_obj: IYarnLockfileParseObject = {
				...yarnlock_old_obj,
			};

			let update_list: string[] = [];
			let yarnlock_changed = false;

			Object.entries(result.max)
				.forEach(function ([name, data])
				{
					let _key2 = name + '@' + deps3[name].version_old;

					/**
					 * 檢查 版本範圍是否符合 與 版本是否不相同
					 */
//					console.dir({
//						data,
//						deps: deps2[name],
//					});
					if (data.value.version != null && deps2[name] != null && semver.lt(data.value.version, deps2[name]) && yarnlock_new_obj[_key2] && yarnlock_new_obj[_key2].version != data.value.version)
					{
						Object.keys(result.deps[name])
							.forEach(version =>
							{
								let key = name + '@' + version;

								delete yarnlock_new_obj[key]
							})
						;

						yarnlock_changed = true;

						update_list.push(name);
					}
					else
					{
						if (result.installed[name].length > 1)
						{
							Object.keys(result.deps[name])
								.forEach(version =>
								{

									let key = name + '@' + version;

									yarnlock_new_obj[key] = data.value;
								})
							;

							yarnlock_changed = true;
						}
					}

				})
			;

			return {
				yarnlock_old_obj,
				yarnlock_new_obj,
				update_list,
				yarnlock_changed,
				deps,
				deps2,
				deps3,
			}
		})
		;
}

/*
(async () =>
{
	let rootData = findRoot({
		cwd: process.cwd()
	});

	let pkg = require('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/package.json');

	let yarnlock_old_obj = await readYarnLockfile(path.join(rootData.root, 'yarn.lock'));

	let ks = Object.keys(yarnlock_old_obj).filter(k => k.includes('string-width'))

	let ret = await checkResolutionsUpdate(pkg.resolutions, yarnlock_old_obj)

	console.dir(ret);

})();
 */

export function isUpgradeable(current: IVersionValue, latest: IVersionValue): boolean
{
	return _isUpgradeable(current, latest)
}

export function updateSemver(current: IVersionValue,
	latest: IVersionValue,
	options: Partial<IOptions> = {},
): IVersionValue
{
	return upgradeDependencyDeclaration(current, latest, options);
}

export function requestVersion(packageName: string)
{
	return Bluebird
		.resolve(remoteCacheMap.get(packageName))
		.then(function (result)
		{
			if (result == null)
			{
				return packageJson(packageName, { allVersions: true })
			}

			return result
		})
		.tap(function (result)
		{
			return remoteCacheMap.set(packageName, result);
		})
}

export function fetchVersion(packageName: string, options: {
	field?: string | 'time' | 'versions' | 'dist-tags.latest',
	filter?(version: IVersionValue): boolean,
	currentVersion?: IVersionValue,
} = {}, ncuOptions?: Partial<IOptions>)
{
	let { field = 'versions' } = options;

	return requestVersion(packageName)
	//.resolve(packageJson(packageName, { allVersions: true }))
		.then<IVersionValue[]>(function (result)
		{
			if (field.startsWith('dist-tags.'))
			{
				const split = field.split('.');
				if (result[split[0]])
				{
					return result[split[0]][split[1]];
				}
			}
			else if (field === 'versions')
			{
				return Object.keys(result[field]);
			}
			else if (field)
			{
				return result[field];
			}
		})
		.then(result =>
		{

			if (options.filter)
			{
				return result.filter(options.filter)
			}

			//console.dir(result);

			return result;
		})
		;
}

export default setupNcuToYargs

