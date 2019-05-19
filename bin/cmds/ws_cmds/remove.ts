/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { setupYarnAddToYargs } from '../../../lib/cli/add';
import { YT_BIN } from '../../../index';
import { findRoot, yarnProcessExit } from '../../../lib/index';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `Remove a package in workspaces.`,

	builder(yargs)
	{
		return yargs
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		let rootData = findRoot({
			...argv,
		}, true);

		if (!rootData.hasWorkspace)
		{
			return yarnProcessExit(`workspace not exists`)
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

export = cmdModule
