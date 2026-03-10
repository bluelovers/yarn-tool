/**
 * yarn-tool workspaces add 命令模組
 * yarn-tool workspaces add command module
 *
 * @author user
 * @created 2019/5/19
 */

import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { YT_BIN } from '../../../index';
import { yargsProcessExit } from '../../../lib/index';
import { setupYarnAddToYargs } from '@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs';
import { findRoot } from '@yarn-tool/find-root';

/**
 * 創建 workspaces add 命令模組
 * Create workspaces add command module
 */
const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `在工作區域中安裝套件 / Installs a package in workspaces.`,

	builder(yargs)
	{
		return setupYarnAddToYargs(yargs)
			.option('types', {
				alias: ['type'],
				desc: `try auto install @types/* too`,
				boolean: true,
			})
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
			bin: 'lerna',
			cmd: [
				'--concurrency',
				'1',
				'add',
			],
			// @ts-ignore
			argv: {
				cwd: rootData.ws,
			},
		});

		argv.types && lazySpawnArgvSlice({
			command: key,
			bin: 'node',
			cmd: [
				require.resolve(YT_BIN),
				'types',
				'-W',
			],
			// @ts-ignore
			argv: {
				cwd: rootData.ws,
			},
		});

	},

});

/**
 * 導出 workspaces add 命令模組
 * Export workspaces add command module
 */
export = cmdModule
