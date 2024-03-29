/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { console, consoleDebug, findRoot, yargsProcessExit } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { exportYarnLock } from '../../lib/yarnlock';
import { rcompare } from 'semver';
import { Arguments, CommandModule } from 'yargs';
import { Dedupe } from '../../lib/cli/dedupe';
import { npmToYarnCore, yarnToNpmCore } from 'synp2/lib';
import { fixNpmLock } from '../../lib/cli/lockfile/fixNpmLock';
import { fsYarnLockSafe } from '@yarn-tool/yarnlock-fs/lib/read';
import { yarnLockParse } from '@yarn-tool/yarnlock-parse';
import path = require('upath2');
import fs = require('fs-extra');

const COMMAND_KEY = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `show yarn.lock info`,

	builder(yargs)
	{
		return yargs
			.option('duplicate', {
				alias: ['D'],
				desc: `show duplicate list by yarn.lock`,
				boolean: true,
				//default: true,
			})
			.option('npm', {
				desc: `Convert yarn.lock to package-lock.json`,
				boolean: true,
			})
			.option('shrinkwrap', {
				desc: `Convert yarn.lock to npm-shrinkwrap.json`,
				boolean: true,
			})
			.option('yarn', {
				desc: `Convert package-lock.json to yarn.lock if yarn.lock not exists`,
				boolean: true,
			})
			.option('overwrite', {
				alias: ['O'],
				desc: `overwrite file if exists`,
				boolean: true,
			})
			.conflicts('npm', ['yarn', 'duplicate'])
			.example(`$0 ${COMMAND_KEY} --duplicate`, `show duplicate list by yarn.lock`)
			.example(`$0 ${COMMAND_KEY} --duplicate false`, `show packages list by yarn.lock`)
	},

	handler(argv)
	{
		const key = COMMAND_KEY;

		//let rootData = findRoot(argv, true);

		//let yl = fsYarnLockSafe(rootData.root);

		if (argv.yarn || argv.npm || argv.shrinkwrap)
		{
			let rootData = findRoot(argv, true);
			let yl = fsYarnLockSafe(rootData.root);

			let file_package_lock_json = path.join(rootData.pkg, 'package-lock.json');

			let file_package_lock_json_exists = fs.existsSync(file_package_lock_json);

			if (argv.npm || argv.shrinkwrap)
			{
				if (!yl.yarnlock_exists)
				{
					yargsProcessExit(new Error(`yarn.lock not exists`))
				}

				if (argv.npm)
				{
					if (!argv.overwrite && file_package_lock_json_exists)
					{
						yargsProcessExit(new Error(`package-lock.json is exists, use --overwrite for overwrite file`))
					}
					else if (file_package_lock_json_exists)
					{
						consoleDebug.warn(`package-lock.json is exists, will got overwrite`);
					}
				}

				let file_shrinkwrap_json = path.join(rootData.pkg, 'npm-shrinkwrap.json');
				let file_shrinkwrap_json_exists = fs.existsSync(file_shrinkwrap_json);

				if (argv.shrinkwrap)
				{
					if (!argv.overwrite && file_shrinkwrap_json_exists)
					{
						yargsProcessExit(new Error(`npm-shrinkwrap.json is exists, use --overwrite for overwrite file`))
					}
					else if (file_shrinkwrap_json_exists)
					{
						consoleDebug.warn(`npm-shrinkwrap.json is exists, will got overwrite`);
					}
				}

				let { name, version } = readPackageJson(path.join(rootData.pkg, 'package.json'));

				let s = yarnToNpm(yl.yarnlock_old, name, version, rootData.pkg);

				if (rootData.hasWorkspace && !rootData.isWorkspace)
				{
					let s2 = yarnToNpm(yl.yarnlock_old, name, version, rootData.ws);

					s.dependencies = {
						...s.dependencies,
						...s2.dependencies,
						...s.dependencies,
					}
				}

				const lock = fixNpmLock(s);

				if (argv.npm)
				{
					fs.writeJSONSync(file_package_lock_json, lock, {
						spaces: 2,
					});
					consoleDebug.info(`package-lock.json updated`);
				}

				if (argv.shrinkwrap)
				{
					fs.writeJSONSync(file_shrinkwrap_json, lock, {
						spaces: 2,
					});
					consoleDebug.info(`npm-shrinkwrap.json updated`);
				}

			}
			else if (argv.yarn)
			{
				let yarnlock_file_pkg = path.join(rootData.pkg, 'yarn.lock');

				if (fs.existsSync(yarnlock_file_pkg))
				{
					if (!argv.overwrite)
					{
						yargsProcessExit(new Error(`yarn.lock is exists, use --overwrite for overwrite file`))
					}

					consoleDebug.warn(`yarn.lock is exists, will got overwrite`);
				}

				if (!file_package_lock_json_exists)
				{
					if (yl.yarnlock_exists && rootData.hasWorkspace && !rootData.isWorkspace)
					{
						consoleDebug.warn(`package-lock.json not exists, but yarn.lock exists in workspaces`);

						let s = Dedupe(yl.yarnlock_old).yarnlock_new;

						fs.writeFileSync(yarnlock_file_pkg, s);

						consoleDebug.info(`yarn.lock copied`);

						return;
					}

					yargsProcessExit(new Error(`package-lock.json not exists`))
				}

				let s = npmToYarn(fs.readFileSync(file_package_lock_json).toString(), rootData.root);

				s = Dedupe(s).yarnlock_new;

				fs.writeFileSync(yarnlock_file_pkg, s)

				consoleDebug.info(`yarn.lock updated`);
			}
		}
		else if (argv.duplicate || !argv.duplicate)
		{
			_showYarnLockList(argv)
		}

	},

});

export = cmdModule

type IUnpackCmdMod<T extends CommandModule, D = IUnpackMyYargsArgv> = T extends CommandModule<any, infer U> ? U
	: T extends CommandModule<infer U, any> ? U
		: D
	;

// @ts-ignore
function _is(argv: Arguments<IUnpackCmdMod<typeof cmdModule>>): argv is Arguments<IUnpackCmdMod<typeof cmdModule>>
{
	return true;
}

// @ts-ignore
function _fix(argv: Arguments<IUnpackCmdMod<typeof cmdModule>>)
{
	return argv;
}

// @ts-ignore
function _showYarnLockList(argv: Arguments<IUnpackCmdMod<typeof cmdModule>>): argv is Arguments<IUnpackCmdMod<typeof cmdModule>>
{
	let rootData = findRoot(argv, true);

	let yl = fsYarnLockSafe(rootData.root);

	let yarnlock_old_obj = yarnLockParse(yl.yarnlock_old).data;

	let fy = exportYarnLock(yarnlock_old_obj);

	let ks = Object.keys(fy.installed);

	let max = 0;
	let len = 0;

	let ks2 = ks
		.reduce((a, name) =>
		{

			let arr = fy.installed[name];

			if (!argv.duplicate || arr.length > 1)
			{
				console.log(name);

				try
				{
					arr = arr.sort(rcompare).reverse();
				}
				catch (e)
				{

				}

				let arr2 = arr.slice(0, -1);

				if (arr2.length)
				{
					console.log('├─', arr2.join('\n├─ '));

					len += arr2.length;
				}

				console.log('└─', arr[arr.length - 1]);

				max = Math.max(max, arr.length);

				a.push(name)
			}

			return a;
		}, [] as string[])
	;

	let chalk = console.chalk;

	if (argv.duplicate)
	{
		// @ts-ignore
		console.cyan.info(`\nFound duplicate in ${chalk.yellow(ks2.length)} packages, ${chalk.yellow(len)}/${chalk.yellow(len + ks2.length)} installed version, highest is ${max}, in total ${ks.length} packages`);
	}
	else
	{
		// @ts-ignore
		console.cyan.info(`\nTotal ${chalk.yellow(ks.length)} packages, with ${chalk.yellow(len)}/${chalk.yellow(len + ks2.length)} installed version`);
	}

	if (len > 0)
	{
		const terminalLink = require('terminal-link');
		const link = terminalLink('see here', 'https://yarnpkg.com/docs/selective-version-resolutions/', {
			fallback(text, url)
			{
				return text + ' ' + url;
			},
		});

		console.cyan.info(`You can try add they to ${console.chalk.yellow('resolutions')} in package.json, for force package dedupe, ${link}`);
	}

	return true
}

function npmToYarn(packageLockFileString, packageDir): string
{
	return npmToYarnCore(packageLockFileString, packageDir);
}

function yarnToNpm(yarnlock, name, version, packageDir): {
	name: string;
	version: string;
	lockfileVersion: number;
	requires: boolean;
	dependencies: {
		[name: string]: {
			version: string;
			resolved: string;
			integrity: string;
			requires: {
				[name: string]: string;
			};
			dependencies?: {
				[name: string]: {
					version: string;
					resolved: string;
					integrity: string;
					requires: {
						[name: string]: string;
					};
				};
			};
		};
	};
}
{
	return JSON.parse(yarnToNpmCore(yarnlock, name, version, packageDir))
}
