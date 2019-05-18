#!/usr/bin/env node

import yargs = require('yargs');
import updateNotifier = require('update-notifier');
import pkg = require('../package.json');
import path = require('path');
import fs = require('fs-extra');
import crossSpawn = require('cross-spawn-extra');
import { console, consoleDebug, findRoot, fsYarnLock, yarnLockDiff } from '../lib/index';
import { Dedupe, infoFromDedupeCache, wrapDedupe } from '../lib/cli/dedupe';
import { existsDependencies, flagsYarnAdd, listToTypes, setupYarnAddToYargs } from '../lib/cli/add';
import setupYarnInstallToYargs from '../lib/cli/install';
import semver = require('semver');
import setupInitToYargs from 'npm-init2/lib/yargs-setting';

import {
	create_command,
	create_command2,
	dummy_builder,
	getYargs,
	IUnpackMyYargsArgv,
	IUnpackYargsArgv,
} from '../lib/cli';
import { readPackageJson, writeJSONSync } from '../lib/pkg';
import IPackageJson from '@ts-type/package-dts/package-json';
import setupNcuToYargs, { npmCheckUpdates } from '../lib/cli/ncu';
import {
	filterResolutions,
	IDependencies,
	IYarnLockfileParseObjectRow,
	parse as parseYarnLock,
	stringify as stringifyYarnLock,
	removeResolutionsCore, stripDepsName,
} from '../lib/yarnlock';
import { ITSIteratorLazy, ITSValueOfArray } from 'ts-type';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../lib/spawn';

updateNotifier({ pkg }).notify();

let cli = getYargs()
	.command(create_command2<IUnpackMyYargsArgv>({
		command: 'dedupe [cwd]',
		describe: `Data deduplication for yarn.lock`,
		aliases: ['d'],
		handler(argv)
		{
			wrapDedupe(yargs, argv, {
				main(yarg, argv, cache)
				{

				},
				end(yarg, argv, cache)
				{
					if (cache.yarnlock_msg)
					{
						console.log(cache.yarnlock_msg);
					}

					console.dir(infoFromDedupeCache(cache));
				},
			});
		},
	}))
	.command(create_command2({
		command: 'add [name]',
		builder(yargs)
		{
			return setupYarnAddToYargs(yargs)
				.option('types', {
					alias: ['type'],
					desc: `try auto install @types/*`,
					boolean: true,
				})
		},
		handler(argv)
		{
			let args = argv._.slice();

			if (args[0] === 'add')
			{
				args.shift();
			}

			if (argv.name)
			{
				// @ts-ignore
				args.unshift(argv.name);
			}

			//console.dir(argv);

			if (!args.length)
			{
//			yargs.showHelp();

				consoleDebug.error(`Missing list of packages to add to your project.`);

				return process.exit(1);
			}

			wrapDedupe(yargs, argv, {

				main(yarg, argv, cache)
				{
					// @ts-ignore
					let flags = flagsYarnAdd(argv).filter(v => v != null);

					let cmd_argv = [
						'add',

						...args,

						...flags,

					].filter(v => v != null);

					consoleDebug.debug(cmd_argv);

					let cp = crossSpawn.sync('yarn', cmd_argv, {
						cwd: argv.cwd,
						stdio: 'inherit',
					});

					if (cp.error)
					{
						throw cp.error
					}

					if (argv.types)
					{
						let { rootData } = cache;

						let pkg_file = path.join(rootData.pkg, 'package.json');

						let pkg = readPackageJson(pkg_file);

						let args_types = listToTypes(args);

						if (args_types.length)
						{
							let flags2 = flags.slice();

							if (!argv.optional && !argv.peer && !argv.dev)
							{
								flags2.push('-D');
							}

							args_types
								.forEach(name =>
								{

									if (existsDependencies(name, pkg))
									{
										return;
									}

									let cmd_argv = [
										'add',

										name,

										...flags2,

									].filter(v => v != null);

									consoleDebug.debug(cmd_argv);

									let cp = crossSpawn.sync('yarn', cmd_argv, {
										cwd: argv.cwd,
										//stdio: 'inherit',
									});
								})
							;
						}
					}
				},

				end(yarg, argv, cache)
				{
					if (cache.yarnlock_msg)
					{
						console.log(cache.yarnlock_msg);
					}

					console.dir(infoFromDedupeCache(cache));
				},
			});
		},
	}))
	.command(create_command2({
		command: 'install [cwd]',
		describe: `do dedupe when yarn install`,
		aliases: ['i'],
		builder: setupYarnInstallToYargs,
		handler(argv)
		{
			const { cwd } = argv;

			let _once = true;

			wrapDedupe(yargs, argv, {

				before(yarg, argv, cache)
				{
					let info = infoFromDedupeCache(cache);

					if (!info.yarnlock_old_exists)
					{
						crossSpawn.sync('yarn', [], {
							cwd,
							stdio: 'inherit',
						});

						_once = false;
					}
				},

				main(yarg, argv, cache)
				{
					let info = infoFromDedupeCache(cache);

					if (info.yarnlock_changed)
					{
						consoleDebug.debug(`yarn.lock changed, do install again`);
					}

					if (_once || info.yarnlock_changed)
					{
						crossSpawn.sync('yarn', [], {
							cwd,
							stdio: 'inherit',
						});

						_once = true;
					}

				},

				after(yarg, argv, cache)
				{
					let info = infoFromDedupeCache(cache);

					if (_once && info.yarnlock_changed)
					{
						consoleDebug.debug(`yarn.lock changed, do install again`);

						crossSpawn.sync('yarn', [], {
							cwd,
							stdio: 'inherit',
						});

						_once = false;
					}
				},

				end(yarg, argv, cache)
				{
					if (cache.yarnlock_old_exists && cache.yarnlock_msg)
					{
						console.log(cache.yarnlock_msg);
					}

					console.dir(infoFromDedupeCache(cache));
				},

			});

			return;
		},
	}))
	.command(create_command2({
		command: 'ncu',
		aliases: ['update', 'upgrade', 'up'],
		builder: setupNcuToYargs,
		async handler(argv)
		{
			const { cwd } = argv;

			let rootData = findRoot({
				...argv,
				cwd,
			}, true);

			console.dir(rootData);

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

				let ls = Object.entries(pkgNcu.json_new.dependencies)
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
						consoleDebug.log(`you can do`, console.cyan.chalk(`yt ncu -u`));
					}
					else
					{
						fs.writeFileSync(yl.yarnlock_file, stringifyYarnLock(ret.yarnlock_new));

						consoleDebug.magenta.info(`Deduplication yarn.lock`);
						consoleDebug.log(`you can do`, console.cyan.chalk(`yt install`));
						consoleDebug.log(`for upgrade dependencies now`);
					}
				}
			}

		},
	}))
	.command({
		command: 'publish',
		aliases: ['push'],
		builder(yargs)
		{
			return yargs
				.option('tag', {
					desc: `Registers the published package with the given tag, such that \`npm install @\` will install this version. By default, \`npm publish\` updates and \`npm install\` installs the \`latest\` tag.`,

					string: true,
				})
				.option('access', {
					desc: `Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.`,
					string: true,
				})
				.option('otp', {
					desc: `If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.`,
					string: true,
				})
				.option('dry-run', {
					desc: `As of npm@6, does everything publish would do except actually publishing to the registry. Reports the details of what would have been published.`,
					boolean: true,
				})
			;
		},
		handler(argv)
		{
			let cmd_list = processArgvSlice(['publish', 'push']).argv;

			crossSpawnOther('npm', [

				'publish',

				...cmd_list,
			], argv);
		}
	})
	.command(create_command2<IUnpackMyYargsArgv>({
		command: 'init',
		describe: `create a package.json file`,
		builder: setupInitToYargs,
		async handler(argv)
		{
			let ret = checkModileExists({
				name: 'npm-init2',
				requireName: 'npm-init2/bin/npm-init2',
			});

			if (!ret)
			{
				process.exit(1);
			}

			let cmd_list = processArgvSlice('init').argv;

			crossSpawnOther('node', [

				ret,

				...cmd_list,
			], argv);

		},
	}))
	.command(create_command2<IUnpackMyYargsArgv>({
		command: 'workspaces',
		aliases: ['ws', 'workspaces'],
		describe: `create yarn workspaces`,
		// @ts-ignore
		builder(yargs)
		{
			return yargs
				.command({
					command: 'init',
					describe: `create yarn workspaces`,
					builder(yargs)
					{
						return setupWorkspacesInitToYargs(yargs)
					},
					async handler(argv)
					{
						let ret = checkModileExists({
							name: 'create-yarn-workspaces',
							requireName: 'create-yarn-workspaces/bin/yarn-ws-init',
						});

						if (!ret)
						{
							process.exit(1);
						}

						let cmd_list = processArgvSlice('init').argv;

						crossSpawnOther('node', [

							ret,

							...cmd_list,
						], argv);
					},
				})
				.strict()
				.demandCommand()
			;
		},
		async handler(argv)
		{

		},
	}))
	.help(true)
	.showHelpOnFail(true)
	.strict()
	.demandCommand()
;

cli.argv;

