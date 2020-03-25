/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { setupYarnAddToYargs } from '../../../lib/cli/add';
import { YT_BIN } from '../../../index';
import { findRoot, yargsProcessExit } from '../../../lib/index';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `Installs a package in workspaces.`,

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
			bin: 'node',
			cmd: [
				require.resolve(YT_BIN),
				'add',
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
