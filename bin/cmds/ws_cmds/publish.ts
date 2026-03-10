/**
 * yarn-tool workspaces publish 命令模組
 * yarn-tool workspaces publish command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { findRoot, yargsProcessExit } from '../../../lib/index';

/**
 * 創建 workspaces publish 命令模組
 * Create workspaces publish command module
 */
const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	aliases: [
		'push',
	],
	describe: `publish packages in workspaces.`,

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
			// @ts-ignore
			command: [key, ...cmdModule.aliases],
			bin: 'lerna',
			cmd: [
				key,
			],
			// @ts-ignore
			argv: {
				cwd: rootData.ws,
			},
		})
	},

});

/**
 * 導出 workspaces publish 命令模組
 * Export workspaces publish command module
 */
export = cmdModule
