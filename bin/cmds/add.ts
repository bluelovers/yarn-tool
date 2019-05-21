/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path = require('upath2');
import { console, consoleDebug, findRoot, printRootData } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { infoFromDedupeCache, wrapDedupe } from '../../lib/cli/dedupe';
import yargs = require('yargs');
import { existsDependencies, flagsYarnAdd, listToTypes, setupYarnAddToYargs } from '../../lib/cli/add';
import crossSpawn = require('cross-spawn-extra');

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
