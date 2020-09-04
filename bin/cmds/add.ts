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
import { assertExecInstall } from '@yarn-tool/pkg-deps-util/lib/cli/assertExecInstall';
import { filterInstallDeps } from '@yarn-tool/pkg-deps-util/lib/installDeps';
import { writeJSONSync } from 'fs-extra';
import { join } from 'path';
import { createDependencyTable } from '@yarn-tool/table';
import { chalkByConsoleMaybe } from 'debug-color2';

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

				const oldArgs = args.slice();

				if (args.length)
				{
					let data = filterInstallDeps(args, argv);

					if (data.pkg)
					{
						let chalk = chalkByConsoleMaybe(console);

						consoleDebug.debug(`direct add deps from workspaces`);

						let table = createDependencyTable();

						data.exists.forEach(name => table.push([name, '', chalk.gray('exists')]));
						data.added.forEach(([name, semver]) => table.push([name, semver, chalk.green('added')]));

						writeJSONSync(join(data.rootData.pkg, 'package.json'), data.pkg, {
							spaces: 2
						})

						args = data.packageNames;
					}
				}

				if (!oldArgs.length || args.length)
				{
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
					else
					{
						assertExecInstall(cp);
					}
				}

				if (argv.types)
				{
					let cp = crossSpawn.sync('node', [
						require.resolve(YT_BIN),

						'types',

						...oldArgs,

						...flags,
					], {
						cwd: argv.cwd,
						stdio: 'inherit',
					})

					if (cp.error)
					{
						throw cp.error
					}
					else
					{
						assertExecInstall(cp);
					}
				}
			},

			after(yarg, argv, cache)
			{

				if (!cache.rootData.isWorkspace && cache.rootData.hasWorkspace)
				{
					let cp = crossSpawn.sync('yarn', [], {
						cwd: cache.rootData.ws,
						stdio: 'inherit',
					});

					if (cp.error)
					{
						throw cp.error
					}
					else
					{
						assertExecInstall(cp);
					}
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
