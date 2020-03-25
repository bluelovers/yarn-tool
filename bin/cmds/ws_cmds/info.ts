/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `Show information about your workspaces.`,

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

export = cmdModule
