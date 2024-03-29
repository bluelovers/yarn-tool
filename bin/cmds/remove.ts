/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { console, consoleDebug } from '../../lib/index';
import { wrapDedupe } from '@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	aliases: ['rm'],
	describe: `Running yarn remove foo will remove the package named foo from your direct dependencies updating your package.json and yarn.lock files in the process.`,

	builder(yargs)
	{
		return yargs
			.strict(false)
		;
	},

	handler(argv)
	{
		wrapDedupe(require('yargs'), argv, {

			consoleDebug,

			main(yarg, argv, cache)
			{
				lazySpawnArgvSlice({
					command,
					bin: 'yarn',
					cmd: command,
					argv,
				})
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
