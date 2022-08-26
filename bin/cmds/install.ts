/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug } from '../../lib/index';
import setupYarnInstallToYargs from '../../lib/cli/install';
import { infoFromDedupeCache } from '@yarn-tool/yarnlock/lib/wrapDedupe/infoFromDedupeCache';
import { wrapDedupe } from '@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe';
import crossSpawn from 'cross-spawn-extra';
import { truncateSync } from 'fs-extra';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [cwd]',
	aliases: ['i'],
	describe: `do dedupe with yarn install`,

	builder(yargs)
	{
		return setupYarnInstallToYargs(yargs)
			.option('reset-lockfile', {
				alias: ['L'],
				desc: `ignore and reset yarn.lock lockfile.`,
				boolean: true,
			})
		;
	},

	handler(argv)
	{
		const { cwd } = argv;

		let _once = true;

		wrapDedupe(require('yargs'), argv, {

			consoleDebug,

			before(yarg, argv, cache)
			{
				let info = infoFromDedupeCache(cache);

				if (!info.yarnlock_old_exists || !cache.yarnlock_old?.length || argv.resetLockfile)
				{
					if (argv.resetLockfile && (info.yarnlock_old_exists || cache.yarnlock_old?.length))
					{
						consoleDebug.red.info(`'--reset-lockfile' mode is enabled, reset current lockfile.\n${info.yarnlock_file}`);
						truncateSync(info.yarnlock_file);
					}

					crossSpawn.sync('yarn', [], {
						cwd,
						stdio: 'inherit',
					});

					_once = false;
				}

				//console.log(1, cache.yarnlock_msg, cache.yarnlock_changed);
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

				//console.log(2, cache.yarnlock_msg, cache.yarnlock_changed);

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

				//console.log(3, cache.yarnlock_msg, cache.yarnlock_changed);
			},

			end(yarg, argv, cache)
			{

				if (cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}

				//console.log(4, cache.yarnlock_msg, cache.yarnlock_changed);

				//console.dir(infoFromDedupeCache(cache));
			},

		});

		return;
	},

});

export = cmdModule
