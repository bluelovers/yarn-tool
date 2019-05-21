/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import path = require('upath2');
import { chalkByConsole, console, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { wrapDedupe } from '../../lib/cli/dedupe';
import { crossSpawnOther } from '../../lib/spawn';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	aliases: ['upgrade', 'up'],
	describe: `Symlink a package folder during development.`,

	builder(yargs)
	{
		return yargs
			.option('latest', {
				desc: 'The upgrade --latest command upgrades packages the same as the upgrade command, but ignores the version range specified in package.json. Instead, the version specified by the latest tag will be used (potentially upgrading the packages across major versions).',
				boolean: true,
			})
			.option('caret', {
				boolean: true,
			})
			.option('tilde', {
				boolean: true,
			})
			.option('exact', {
				boolean: true,
			})
			.option('pattern', {
				string: true,
			})
		;
	},

	handler(argv)
	{

		wrapDedupe(require('yargs'), argv, {

			before()
			{
				const key = basenameStrip(__filename);

				crossSpawnOther('yarn', [], argv);

				lazySpawnArgvSlice({
					command: ['upgrade', 'up', key],
					bin: 'yarn',
					cmd: key,
					argv,
				})
			},

			main(yarg, argv, cache)
			{

			},

			end(yarg, argv, cache)
			{
				if (cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}
			},

		});

	},

});

export = cmdModule