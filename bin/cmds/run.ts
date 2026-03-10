/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `運行定義的套件腳本 / Runs a defined package script.`,

	builder(yargs)
	{
		return yargs
			.help(false)
			.version(false)
			.strict(false)
		;
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		lazySpawnArgvSlice({
			command: key,
			bin: npmClients,
			cmd: [
				key,
			],
			argv,
		})
	},

});

export = cmdModule
