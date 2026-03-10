/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';
import { EnumPackageManager } from '@yarn-tool/detect-package-manager';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `顯示當前安裝的 Yarn、Node.js 及其依賴項的版本信息 / Displays version information of the currently installed Yarn, Node.js, and its dependencies.`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		lazySpawnArgvSlice({
			command: key,
			bin: npmClients,
			cmd: pmIsYarn ? key : 'version',
			argv,
		})
	},

});

export = cmdModule
