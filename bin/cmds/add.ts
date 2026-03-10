/**
 * yarn-tool add 命令模組
 * yarn-tool add command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug, printRootData } from '../../lib/index';
import { writePackageJSON } from '@yarn-tool/write-package-json';
import { wrapDedupeAsync } from '@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupeAsync';
import crossSpawn from 'cross-spawn-extra';
import { YT_BIN } from '../../index';
import { setupYarnAddToYargs } from '@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs';
import { flagsYarnAdd } from '@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd';
import { assertExecInstall } from '@yarn-tool/pkg-deps-util/lib/cli/assertExecInstall';
import { filterInstallDeps } from '@yarn-tool/pkg-deps-util/lib/installDeps';
import { join } from 'path';
import { createDependencyTable } from '@yarn-tool/table';
import { chalkByConsoleMaybe } from 'debug-color2';
import { installDepsFromYarnLock } from '@yarn-tool/pkg-deps-util/lib/installDepsFromYarnLock';
import { detectPackageManager } from '../../lib/pm';

/**
 * 創建 add 命令模組
 * Create add command module
 */
const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [name]',
	//aliases: [],
	describe: `安裝套件 / Installs a package`,

	builder(yargs)
	{
		return setupYarnAddToYargs(yargs)
			.option('types', {
				alias: ['type'],
				desc: `嘗試自動安裝 @types/* 套件 / Try auto install @types/* too`,
				boolean: true,
			})
			.strict(false)
	},

	async handler(argv)
	{
		const { npmClients, pmIsYarn } = detectPackageManager(argv);

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

			consoleDebug.error(`缺少要添加到項目的套件列表。 / Missing list of packages to add to your project.`);

			return process.exit(1);
		}

		await wrapDedupeAsync(require('yargs'), argv, {

			consoleDebug,

			before(yarg, argv, cache)
			{
				printRootData(cache.rootData, argv);
			},

			async main(yarg, argv, cache)
			{
				let retBreak: boolean;

				// @ts-ignore
				let flags = flagsYarnAdd(argv).filter(v => v != null);

				if (!pmIsYarn)
				{
					flags = flags.filter(v => ![
						'--dev',
						'--peer',
						'--optional',
						'--prod',
						'--exact',
					].includes(v));

					if (argv.exact)
					{
						flags.unshift('-E');
					}

					if (argv.peer)
					{
						flags.unshift('--save-peer');
					}

					if (argv.prod)
					{
						flags.unshift('-P');
					}

					if (argv.optional)
					{
						flags.unshift('-O');
					}

					if (argv.dev)
					{
						flags.unshift('-D');
					}
				}

				const oldArgs = args.slice();

				if (args.length)
				{
					let data = filterInstallDeps(args, argv);

					if (data.updated)
					{
						let chalk = chalkByConsoleMaybe(console);

						consoleDebug.debug(`direct add deps from workspaces`);

						let table = createDependencyTable();

						data.exists.forEach(name => table.push([name, '', chalk.gray('exists')]));
						data.added.forEach(([name, semver]) => table.push([name, semver, chalk.green('added')]));

						console.log(table.toString())

						await writePackageJSON(join(data.rootData.pkg, 'package.json'), data.pkg, {
							spaces: 2
						})

						args = data.packageNames;

						if (!args.length && !argv.types)
						{
							retBreak = true;
						}
					}

					if (pmIsYarn && cache.yarnlock_old?.length)
					{
						let data = await installDepsFromYarnLock(args, argv);

						if (data?.updated)
						{
							let chalk = chalkByConsoleMaybe(console);

							consoleDebug.debug(`direct add deps from yarn.lock`);

							let table = createDependencyTable();

							data.exists.forEach(name => table.push([name, '', chalk.gray('exists')]));
							data.added.forEach(([name, semver]) => table.push([name, semver, chalk.green('added')]));

							console.log(table.toString())

							await writePackageJSON(join(data.rootData.pkg, 'package.json'), data.pkg, {
								spaces: 2
							})

							args = data.others;

							if (!args.length && !argv.types)
							{
								retBreak = true;
							}
						}
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

					let cp = crossSpawn.sync(npmClients, cmd_argv, {
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

						'--npmClients',
						npmClients,

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

				return retBreak;
			},

			after(yarg, argv, cache)
			{

				if (pmIsYarn && !cache.rootData.isWorkspace && cache.rootData.hasWorkspace)
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

				if (pmIsYarn && cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}
			},
		});
	},

});

/**
 * 導出 add 命令模組
 * Export add command module
 */
export = cmdModule
