/**
 * yarn-tool workspaces info 命令模組
 * yarn-tool workspaces info command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';

/**
 * 創建 workspaces info 命令模組
 * Create workspaces info command module
 */
const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `顯示工作區域信息 / Show information about your workspaces.`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		lazySpawnArgvSlice({
			command: key,
			bin: 'yarn',
			cmd: [
				'workspaces',
				'info',
			],
			argv,
		})
	},

});

/**
 * 導出 workspaces info 命令模組
 * Export workspaces info command module
 */
export = cmdModule
