import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';

const command = basenameStrip(__filename);

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
			command: [command, ...cmdModule.aliases],
			bin: 'lerna',
			cmd: [
				command,
			],
			argv,
		})
	},

});

export = cmdModule
