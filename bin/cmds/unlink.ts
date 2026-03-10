/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `移除使用 yarn link 建立的符號鏈接 / Remove a symlinked package created with yarn link`,

	builder(yargs)
	{
		return yargs
			.example(`$0 unlink [...package]`, ``)
			.strict(false)
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		lazySpawnArgvSlice({
			command: key,
			bin: detectPackageManager(argv).npmClients,
			cmd: key,
			argv,
		})
	},

});

export = cmdModule
