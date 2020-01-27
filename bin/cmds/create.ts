/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `Creates new projects from any create-* starter kits.`,

	builder(yargs)
	{
		return yargs
			.example(`$0 create <starter-kit-package> [<args>]`, ``)
			.strict(false)
		;
	},

	handler(argv)
	{
		lazySpawnArgvSlice({
			command,
			bin: 'yarn',
			cmd: [
				command,
			],
			argv,
		})
	},

});

export = cmdModule
