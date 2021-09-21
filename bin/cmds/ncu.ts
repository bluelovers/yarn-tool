/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path = require('upath2');
import {
	chalkByConsole,
	console,
	consoleDebug,
	findRoot,
	printRootData,
	yargsProcessExit,
} from '../../lib/index';
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { writeJSONSync, writePackageJson } from '../../lib/pkg';

import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import setupNcuToYargs, {
	checkResolutionsUpdate,
	isBadVersion,
	isUpgradeable,
	npmCheckUpdates, npmCheckUpdatesOptions, setupNcuToYargs2, updateSemver,
} from '../../lib/cli/ncu';
import {
	filterResolutions,
	IDependencies,
	IYarnLockfileParseObjectRow,
	parse as parseYarnLock, removeResolutionsCore, stringify as stringifyYarnLock,
	stripDepsName, writeYarnLockFile, yarnLockDiff,
} from '../../lib/yarnlock';
import fs = require('fs-extra');
import semver = require('semver');
import Bluebird = require('bluebird');
import { toDependencyTable } from '../../lib/table';
import { fsYarnLock } from '../../lib/fsYarnLock';
import { updateYarnLockTag, printReport } from '@yarn-tool/yarnlock-ncu/index';
import { writeFileSync } from 'fs';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [-u]',
	aliases: ['update'],
	describe: `Find newer versions of dependencies than what your package.json allows`,

	builder(yargs)
	{
		return setupNcuToYargs2(yargs)
	},

	async handler(argv)
	{
		const { cwd } = argv;

		let rootData = findRoot({
			...argv,
			cwd,
		}, true);

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

		if (argv.resolutions)
		{
			if (!resolutions || !Object.keys(resolutions).length)
			{
				return yargsProcessExit(`resolutions is not exists in package.json`)
			}

			let yl = fsYarnLock(rootData.root);

			if (!yl.yarnlock_old)
			{
				// 防止 yarn.lock 不存在
				return;
			}

			let ret = await checkResolutionsUpdate(resolutions, yl.yarnlock_old, argv);

			//console.log(ret);

			if (ret.yarnlock_changed)
			{
				writeYarnLockFile(yl.yarnlock_file, ret.yarnlock_new_obj);

				chalkByConsole((chalk, console) =>
				{
					let p = chalk.cyan(path.relative(argv.cwd, yl.yarnlock_file));

					console.log(`${p} is updated!`);

				}, console);

				let msg = yarnLockDiff(stringifyYarnLock(ret.yarnlock_old_obj), stringifyYarnLock(ret.yarnlock_new_obj));

				if (msg)
				{
					console.log(`\n${msg}\n`);
				}
			}

			let ls2 = Object.values(ret.deps)
				.filter(data => {

					let { name, version_old, version_new } = data;

					return isUpgradeable(version_old, version_new)
				})
			;

			let ncuOptions = npmCheckUpdatesOptions(argv);

			let fromto = ls2
				.reduce((a, data) =>
				{
					let { name, version_old, version_new } = data;

					let new_semver = updateSemver(version_old, version_new, ncuOptions);

					a.from[name] = version_old;
					a.to[name] = new_semver;

					resolutions[name] = new_semver;

					return a;
				}, {
					from: {},
					to: {},
				} as Parameters<typeof toDependencyTable>[0])
			;

			let msg = toDependencyTable(fromto);

			console.log(`\n${msg}\n`);

			if (argv.upgrade)
			{
				if (doWorkspace)
				{
					pkg_data_ws.resolutions = resolutions;

					writePackageJson(pkg_file_ws, pkg_data_ws);

					chalkByConsole((chalk, console) =>
					{
						let p = chalk.cyan(path.relative(argv.cwd, pkg_file_ws));

						console.log(`${p} is updated!`);

					}, console);
				}
				else
				{
					pkg_data.resolutions = resolutions;

					writePackageJson(pkg_file, pkg_data);

					chalkByConsole((chalk, console) =>
					{

						let p = chalk.cyan(path.relative(rootData.ws || rootData.pkg, pkg_file));

						console.log(`${p} is updated!`);

					}, console);
				}


			}

			return;
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
			writeJSONSync(pkg_file, pkgNcu.json_new);
			consoleDebug.info(`package.json updated`);
		}

		if (argv.dedupe && resolutions && Object.keys(resolutions).length)
		{

			let ls = Object.entries(pkgNcu.json_new.dependencies || {})
				.concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))

				.reduce(function (a, [name, ver_new])
				{
					let ver_old = resolutions[name];

					if (ver_old)
					{
						if (ver_new === 'latest')
						{
							ver_new = '*';
						}

						// @ts-ignore
						a[name] = ver_new;
					}

					return a;
				}, {} as IDependencies)
			;

			let yl = fsYarnLock(rootData.root);

			if (!yl.yarnlock_old)
			{
				// 防止 yarn.lock 不存在
				return;
			}

			let ret = await checkResolutionsUpdate(resolutions, yl.yarnlock_old, argv);

			if (ret.yarnlock_changed)
			{
				let msg = yarnLockDiff(stringifyYarnLock(ret.yarnlock_old_obj), stringifyYarnLock(ret.yarnlock_new_obj));

				if (msg)
				{
					console.log(`\n${msg}\n`);
				}
			}

			if (pkgNcu.json_changed && !argv.upgrade)
			{
				ret.yarnlock_changed && consoleDebug.magenta.info(`your dependencies version high than resolutions`);
				consoleDebug.log(`you can do `, console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
			}

			if (ret.yarnlock_changed && argv.upgrade)
			{
				writeYarnLockFile(yl.yarnlock_file, ret.yarnlock_new_obj);

				consoleDebug.magenta.info(`Deduplication yarn.lock`);
				consoleDebug.log(`you can do `, console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
			}

		}

		let yl = fsYarnLock(rootData.root);

		if (yl.yarnlock_exists)
		{
			let ret = await updateYarnLockTag(yl.yarnlock_old);

			if (ret.yarnlock_changed)
			{
				consoleDebug.magenta.info(`higher versions exists on registry`);

				let s = printReport(ret.report);
				s?.length > 0 && console.log(s);

				if (argv.upgrade)
				{
					writeFileSync(yl.yarnlock_file, ret.yarnlock_new);
					consoleDebug.magenta.info(`yarn.lock updated`);
					consoleDebug.log(`you can do `, console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
				}
				else
				{
					consoleDebug.log(`you can do `, console.bold.cyan.chalk(`yt ncu -u`), ` , for update yarn.lock`);
				}
			}
		}

	},

});

export = cmdModule
