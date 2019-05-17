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

import { create_command, getYargs } from '../lib/cli';

updateNotifier({ pkg }).notify();

let cli = getYargs();

cli = cli
//.usage('$0 <dedupe> [cwd]')
	.command('dedupe [cwd]', `Data deduplication for yarn.lock`, ...create_command(cli, 'dedupe', (argv) =>
	{
		let root = findRoot(argv, true);
		let hasWorkspace = root.ws != null;

		let yarnlock_cache = fsYarnLock(root.root);

		let { yarnlock_file, yarnlock_exists, yarnlock_old } = yarnlock_cache;

		consoleDebug.info(`Deduplication yarn.lock`);
		consoleDebug.gray.info(`${yarnlock_file}`);

		if (!yarnlock_exists)
		{
			consoleDebug.error(`yarn.lock not exists`);

			return;
		}

		let ret = Dedupe(yarnlock_old);

		let msg = yarnLockDiff(ret.yarnlock_old, ret.yarnlock_new);

		if (msg)
		{
			fs.writeFileSync(yarnlock_file, ret.yarnlock_new);

			console.log(msg);
		}
		else
		{
			consoleDebug.warn(`yarn.lock no need data deduplication`);
		}
	}))
	.command('add [name]', ``, (yargs) =>
	{
		return setupYarnAddToYargs(yargs)
			.option('types', {
				desc: `try auto install @types/*`,
				boolean: true,
			})
			;
	}, (argv) =>
	{

		let args = argv._.slice();

		if (args[0] === 'add')
		{
			args.shift();
		}

		if (argv.name)
		{
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

					let pkg = fs.readJSONSync(pkg_file);

					let args_types = listToTypes(args);

					if (args_types.length)
					{
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

									...flags,

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

	})
	.command('install [cwd]', `do dedupe when yarn install`, (yargs) =>
	{
		return setupYarnInstallToYargs(yargs);
	}, function (argv)
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
				if (cache.yarnlock_msg)
				{
					console.log(cache.yarnlock_msg);
				}

				console.dir(infoFromDedupeCache(cache));
			},

		});

		return;
	})
	.demandCommand()
;

cli.argv;

