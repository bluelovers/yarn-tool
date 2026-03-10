/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `比較所有套件或自上次發布以來的單個套件 / Diff all packages or a single package since the last release`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		lazySpawnArgvSlice({
			command,
			bin: 'lerna',
			cmd: command,
			argv,
		})
	},

});

export = cmdModule
