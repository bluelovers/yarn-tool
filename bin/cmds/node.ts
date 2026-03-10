/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `運行 node，並設置好鉤子 / Run node with the hook already setup.`,

	builder(yargs)
	{
		return yargs
			.help(false)
			.version(false)
			.strict(false)
	},

	handler(argv)
	{
		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		lazySpawnArgvSlice({
			command,
			bin: npmClients,
			cmd: command,
			argv,
		})
	},

});

export = cmdModule
