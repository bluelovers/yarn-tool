/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `運行套件定義的測試腳本 / Runs the test script defined by the package.`,

	builder(yargs)
	{
		return yargs
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		lazySpawnArgvSlice({
			command: key,
			bin: npmClients,
			cmd: key,
			argv,
		})
	},

});

export = cmdModule
