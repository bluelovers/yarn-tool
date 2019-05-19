/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path = require('upath2');
import { console, consoleDebug, findRoot, fsYarnLock, printRootData } from '../../lib/index';
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { writeJSONSync, writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import setupNcuToYargs, { npmCheckUpdates } from '../../lib/cli/ncu';
import {
	filterResolutions,
	IDependencies,
	IYarnLockfileParseObjectRow,
	parse as parseYarnLock, removeResolutionsCore, stringify as stringifyYarnLock,
	stripDepsName,
} from '../../lib/yarnlock';
import fs = require('fs-extra');
import semver = require('semver');

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	aliases: ['update'],
	describe: `Find newer versions of dependencies than what your package.json or bower.json allows`,

	builder(yargs)
	{
		return setupNcuToYargs(yargs)
	},

	async handler(argv)
	{
		const { cwd } = argv;

		let rootData = findRoot({
			...argv,
			cwd,
		}, true);

		//console.dir(rootData);

		let pkg_file_root = path.join(rootData.root, 'package.json');

		let pkg_file = path.join(rootData.pkg, 'package.json');
		let pkg_data = readPackageJson(pkg_file);

		let resolutions = pkg_data.resolutions;

		let pkg_file_ws: string;
		let pkg_data_ws: IPackageJson;

		let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;

		if (doWorkspace)
		{
			pkg_file_ws = path.join(rootData.ws, 'package.json');
			pkg_data_ws = readPackageJson(pkg_file_ws);

			resolutions = pkg_data_ws.resolutions;
		}

		printRootData(rootData, argv);

		let pkgNcu = await npmCheckUpdates({
			cwd,
			rootData,
			// @ts-ignore
		}, {
			...argv,
			json_old: pkg_data,
		});

		if (pkgNcu.json_changed && argv.upgrade)
		{
			writeJSONSync(pkg_file, pkgNcu.json_new)
			consoleDebug.info(`package.json updated`);
		}

		if (argv.dedupe && Object.keys(resolutions).length)
		{

			let ls = Object.entries(pkgNcu.json_new.dependencies || {})
				.concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))

				.reduce(function (a, [name, ver_new])
				{
					let ver_old = resolutions[name];

					if (ver_old)
					{
						// @ts-ignore
						a[name] = ver_new;
					}

					return a;
				}, {} as IDependencies)
			;

			let yl = fsYarnLock(rootData.root);

			let yarnlock_old_obj = parseYarnLock(yl.yarnlock_old);

			let result = filterResolutions({
				resolutions: ls
			}, yarnlock_old_obj);

			let r2 = result.names
				.filter(name => {

					let n = stripDepsName(name);

					let da = result.deps[n[0]];

					if (!da)
					{
						return false;
					}

					if (da['*'] || ls[n[0]] == '*')
					{
						return true;
					}

					return Object.values(da).some(dr => {

						if (ls[name] == null)
						{
							return true;
						}

						let bool = semver.lt(dr.version, ls[name]);

						return bool
					});
				})
				.reduce((a, name) => {

					let n = stripDepsName(name);

					a.names.push(name);
					a.deps[n[0]] = result.deps[n[0]];

					return a;
				}, {
					names: [] as string[],
					deps: {} as Record<string, Record<string | '*', IYarnLockfileParseObjectRow>>,
				})
			;

			let ret = removeResolutionsCore(r2, yarnlock_old_obj);

			if (ret.yarnlock_changed)
			{
				if (!argv.upgrade)
				{
					consoleDebug.magenta.info(`your dependencies version high than resolutions`);
					consoleDebug.log(`you can do `, console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
				}
				else
				{
					fs.writeFileSync(yl.yarnlock_file, stringifyYarnLock(ret.yarnlock_new));

					consoleDebug.magenta.info(`Deduplication yarn.lock`);
					consoleDebug.log(`you can do `, console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
				}
			}
		}

	},

});

export = cmdModule
