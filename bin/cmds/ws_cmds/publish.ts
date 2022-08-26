/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { findRoot, yargsProcessExit } from '../../../lib/index';

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

export = cmdModule
