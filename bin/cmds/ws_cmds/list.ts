import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';

/**
 * 命令名稱
 * Command name
 */
const command = basenameStrip(__filename);

/**
 * 創建 workspaces list 命令模組
 * Create workspaces list command module
 */
const cmdModule = createCommandModuleExports({

	command,
	aliases: [
		'ls',
	],
	describe: `List local packages`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		lazySpawnArgvSlice({
			// @ts-ignore
			command: [command, ...cmdModule.aliases],
			bin: 'lerna',
			cmd: [
				command,
			],
			argv,
		})
	},

});

/**
 * 導出 workspaces list 命令模組
 * Export workspaces list command module
 */
export = cmdModule
