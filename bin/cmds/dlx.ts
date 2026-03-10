/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `在臨時環境中運行套件。需要 yarn 版本 >= 2 / Run a package in a temporary environment. require yarn version >= 2`,

	builder(yargs)
	{
		return yargs
			.option('package', {
				alias: ['p'],
				desc: `指定要運行的套件名稱 / Specify the package name to run`,
				string: true,
			})
			.option('quiet', {
				alias: ['q'],
				desc: `安靜模式，不輸出訊息 / Quiet mode, no output`,
				boolean: true,
			})
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
