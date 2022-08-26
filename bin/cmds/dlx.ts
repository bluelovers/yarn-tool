/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `Run a package in a temporary environment. require yarn version >= 2`,

	builder(yargs)
	{
		return yargs
			.option('package', {
				alias: ['p'],
				string: true,
			})
			.option('quiet', {
				alias: ['q'],
				boolean: true,
			})
			.help(false)
			.version(false)
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
