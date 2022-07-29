/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug, printRootData } from '../../lib/index';
import { setupNcuToYargs2 } from '@yarn-tool/ncu-ws/lib/argv';
import { _handleNcuArgvAuto } from '@yarn-tool/ncu-ws';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [-u]',
	aliases: ['update'],
	describe: `Find newer versions of dependencies than what your package.json allows`,

	builder(yargs)
	{
		return setupNcuToYargs2(yargs)
	},

	async handler(argv)
	{
		return _handleNcuArgvAuto(argv, {
			console,
			consoleDebug,
			printRootData,
		})
	},

});

export = cmdModule
