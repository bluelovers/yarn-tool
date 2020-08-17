/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path from 'upath2';
import { console, consoleDebug, findRoot, printRootData } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';

import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { infoFromDedupeCache, wrapDedupe } from '../../lib/cli/dedupe';
import yargs from 'yargs';
import crossSpawn from 'cross-spawn-extra';
import { YT_BIN } from '../../index';
import { setupYarnAddToYargs } from '@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs';
import { flagsYarnAdd } from '@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [name]',
	//aliases: [],
	describe: `Installs a package`,

	builder(yargs)
	{
		return setupYarnAddToYargs(yargs)
			.option('types', {
				alias: ['type'],
				desc: `try auto install @types/* too`,
				boolean: true,
			})
			.strict(false)
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

		wrapDedupe(require('yargs'), argv, {

			consoleDebug,

			before(yarg, argv, cache)
			{
				printRootData(cache.rootData, argv);
			},

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
					let cp = crossSpawn.sync('node', [
						require.resolve(YT_BIN),

						'types',

						...args,

						...flags,
					], {
						cwd: argv.cwd,
						stdio: 'inherit',
					})
				}
			},

			after(yarg, argv, cache)
			{

				if (!cache.rootData.isWorkspace && cache.rootData.hasWorkspace)
				{
					crossSpawn.sync('yarn', [], {
						cwd: cache.rootData.ws,
						stdio: 'inherit',
					});
				}

			},

			end(yarg, argv, cache)
			{
				//console.dir(infoFromDedupeCache(cache));

				if (cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}
			},
		});
	},

});

export = cmdModule
