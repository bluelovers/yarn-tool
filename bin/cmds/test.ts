/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `Runs the test script defined by the package.`,

	builder(yargs)
	{
		return yargs
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		lazySpawnArgvSlice({
			command: key,
			bin: 'yarn',
			cmd: key,
			argv,
		})
	},

});

export = cmdModule
