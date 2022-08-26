/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `Creates a compressed gzip archive of package dependencies.`,

	builder(yargs)
	{
		return yargs
			.option('dry-run', {
				boolean: true,
			})
			.option('filename', {
				string: true,
			})
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		lazySpawnArgvSlice({
			command: key,
			bin: 'npm',
			cmd: key,
			argv,
		})
	},

});

export = cmdModule
