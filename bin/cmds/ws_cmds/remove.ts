/**
 * yarn-tool workspaces remove 命令模組
 * yarn-tool workspaces remove command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { findRoot, yargsProcessExit } from '../../../lib/index';

/**
 * 創建 workspaces remove 命令模組
 * Create workspaces remove command module
 */
const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `在工作區域中移除套件 / Remove a package in workspaces.`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		let rootData = findRoot({
			...argv,
		}, true);

		if (!rootData.hasWorkspace)
		{
			return yargsProcessExit(`workspace not exists`)
		}

		lazySpawnArgvSlice({
			command: key,
			bin: 'yarn',
			cmd: [
				key,
				'-W',
			],
			// @ts-ignore
			argv: {
				cwd: rootData.ws,
			},
		})
	},

});

/**
 * 導出 workspaces remove 命令模組
 * Export workspaces remove command module
 */
export = cmdModule
