/**
 * yarn-tool workspaces init 命令模組
 * yarn-tool workspaces init command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports } from '../../../lib/cmd_dir';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../../../lib/spawn';

/**
 * 創建 workspaces init 命令模組
 * Create workspaces init command module
 */
const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `create yarn workspaces`,

	builder(yargs)
	{
		return setupWorkspacesInitToYargs(yargs)
			.strict(false)
	},

	handler(argv)
	{
		let ret = checkModileExists({
			name: 'create-yarn-workspaces',
			requireName: 'create-yarn-workspaces/bin/yarn-ws-init',
		});

		if (!ret)
		{
			process.exit(1);
		}

		let cmd_list = processArgvSlice('init').argv;

		crossSpawnOther('node', [

			ret,

			//'--',

			...cmd_list,
		], argv);
	},

});

/**
 * 導出 workspaces init 命令模組
 * Export workspaces init command module
 */
export = cmdModule
