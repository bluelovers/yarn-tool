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
import { infoFromDedupeCache, wrapDedupe } from '../../lib/cli/dedupe';
import yargs = require('yargs');

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [cwd]',
	//aliases: [],
	describe: `Data deduplication for yarn.lock`,
	aliases: ['d'],

	builder(yargs)
	{
		return yargs
	},

	handler(argv, ...a)
	{
		wrapDedupe(require('yargs'), argv, {
			main(yarg, argv, cache)
			{

			},
			end(yarg, argv, cache)
			{
				if (cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}

				console.dir(infoFromDedupeCache(cache));
			},
		});
	},

});

export = cmdModule
