/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import path = require('upath2');
import { chalkByConsole, console, consoleDebug, findRoot, fsYarnLock } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { exportYarnLock, parse as parseYarnLock } from '../../lib/yarnlock';
import { SemVer, rcompare } from 'semver';

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
			.example(`$0 ${COMMAND_KEY} --duplicate`, `show duplicate list by yarn.lock`)
			.example(`$0 ${COMMAND_KEY} --duplicate false`, `show packages list by yarn.lock`)
	},

	handler(argv)
	{
		const key = COMMAND_KEY;

		let rootData = findRoot(argv, true);

		let yl = fsYarnLock(rootData.root);

		let yarnlock_old_obj = parseYarnLock(yl.yarnlock_old);

		let fy = exportYarnLock(yarnlock_old_obj);

		let ks = Object.keys(fy.installed);

		let max = 0;
		let len = 0;

		let ks2 = ks
			.reduce((a, name) => {

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
			console.cyan.info(`\nFound duplicate in ${chalk.yellow(ks2.length)} packages, ${chalk.yellow(len)}/${chalk.yellow(len+ks2.length)} installed version, highest is ${max}, in total ${ks.length} packages`);
		}
		else
		{
			// @ts-ignore
			console.cyan.info(`\nTotal ${chalk.yellow(ks.length)} packages, with ${chalk.yellow(len)}/${chalk.yellow(len+ks2.length)} installed version`);
		}

		if (len > 0)
		{
			const terminalLink = require('terminal-link');
			const link = terminalLink('see here', 'https://yarnpkg.com/docs/selective-version-resolutions/', {
				fallback(text, url)
				{
					return text + ' ' + url;
				}
			});

			console.cyan.info(`You can try add they to ${console.chalk.yellow('resolutions')} in package.json, for force package dedupe, ${link}`);
		}
	},

});

export = cmdModule
