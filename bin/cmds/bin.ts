/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `Get the path to a binary script.`,

	builder(yargs)
	{
		return yargs
			.option('verbose', {
				alias: ['v'],
			})
			.example(`yt bin`, `List all the available binaries`)
			.example(`yt bin eslint`, `Print the path to a specific binary`)
			.strict(false)
	},

	handler(argv)
	{
		lazySpawnArgvSlice({
			command,
			bin: 'yarn',
			cmd: command,
			argv,
		})
	},

});

export = cmdModule
