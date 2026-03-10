/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `從任何 create-* 啟動器套件創建新項目 / Creates new projects from any create-* starter kits.`,

	builder(yargs)
	{
		return yargs
			.example(`$0 create <starter-kit-package> [<args>]`, ``)
			.strict(false)
			;
	},

	handler(argv)
	{
		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		lazySpawnArgvSlice({
			command,
			bin: npmClients,
			cmd: [
				command,
			],
			argv,
		})
	},

});

export = cmdModule
