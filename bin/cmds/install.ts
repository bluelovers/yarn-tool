/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path = require('path');
import { console, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import setupYarnInstallToYargs from '../../lib/cli/install';
import { infoFromDedupeCache, wrapDedupe } from '../../lib/cli/dedupe';
import crossSpawn = require('cross-spawn-extra');

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [cwd]',
	aliases: ['i'],
	describe: `do dedupe with yarn install`,

	builder(yargs)
	{
		return setupYarnInstallToYargs(yargs)
	},

	handler(argv)
	{
		const { cwd } = argv;

		let _once = true;

		wrapDedupe(require('yargs'), argv, {

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

});

export = cmdModule
