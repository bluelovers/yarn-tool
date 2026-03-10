/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `取得二進制腳本的路徑 / Get the path to a binary script.`,

	builder(yargs)
	{
		return yargs
			.option('verbose', {
				alias: ['v'],
				desc: `顯示詳細資訊 / Show verbose output`,
			})
			.example(`yt bin`, `List all the available binaries`)
			.example(`yt bin eslint`, `Print the path to a specific binary`)
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
