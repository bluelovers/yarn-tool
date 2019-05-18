/**
 * Created by user on 2019/4/30.
 */

import { run as _npmCheckUpdates } from 'npm-check-updates';
import { IWrapDedupeCache } from './dedupe';
import IPackageJson from '@ts-type/package-dts/package-json';
//import versionUtil = require('npm-check-updates/lib/version-util');
//import chalk = require('chalk');
import { console } from '../index';
import { toDependencyTable } from '../table';
import { Argv } from 'yargs';
import { IUnpackYargsArgv } from '../cli';

export type IOptions = IUnpackYargsArgv<ReturnType<typeof setupNcuToYargs>> &  {
	json_old: IPackageJson;
	cwd?: string;
	packageData?: string;
	packageManager?: 'npm' | 'bower';

	json_new?: IPackageJson;
	json_changed?: boolean;

	list_updated?: Record<string, string>;

	loglevel?: 'silent' | 'verbose';

	current?: IDependency;
}

export async function npmCheckUpdates<C extends IWrapDedupeCache>(cache: Partial<C>, ncuOptions: IOptions)
{
	//ncuOptions.silent = false;

	//ncuOptions.json = false;
	//ncuOptions.cli = true;

	//ncuOptions.args = [];

	//ncuOptions.loglevel = 'verbose';

	delete ncuOptions.upgrade;

	ncuOptions.packageData = JSON.stringify(ncuOptions.json_old);

	ncuOptions.cwd = cache.cwd;
	ncuOptions.jsonUpgraded = true;

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

					if (value && value != '*')
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

	table && console.log(table);

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

export type IDependency = Record<string, string>;

export default setupNcuToYargs
