/**
 * yarn-tool ncu 命令模組
 * yarn-tool ncu command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug, printRootData } from '../../lib/index';
import { setupNcuToYargs2 } from '@yarn-tool/ncu-ws/lib/argv';
import { _handleNcuArgvAuto } from '@yarn-tool/ncu-ws';

/**
 * 創建 ncu 命令模組
 * Create ncu command module
 */
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

/**
 * 導出 ncu 命令模組
 * Export ncu command module
 */
export = cmdModule
