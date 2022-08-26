/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug } from '../../lib/index';
import { infoFromDedupeCache } from '@yarn-tool/yarnlock/lib/wrapDedupe/infoFromDedupeCache';
import { wrapDedupe } from '@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [cwd]',
	//aliases: [],
	describe: `package deduplication for yarn.lock`,
	aliases: ['d'],

	builder(yargs)
	{
		return yargs
	},

	handler(argv, ...a)
	{
		wrapDedupe(require('yargs'), argv, {

			consoleDebug,

			main(yarg, argv, cache)
			{

			},
			end(yarg, argv, cache)
			{
				console.dir(infoFromDedupeCache(cache));

				if (cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}
			},
		});
	},

});

export = cmdModule
