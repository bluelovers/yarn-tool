/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { detectPackageManager } from '../../lib/pm';
import { console } from '../../lib/index';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	aliases: ['upnp'],
	describe: `Temporarily copies a package (with an optional @range suffix) outside of the global cache for debugging purposes`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		if (!pmIsYarn)
		{
			console.error(`此命令 '${command}' 不支援 ${npmClients}。 / This command '${command}' not support for ${npmClients}`);
			return;
		}

		lazySpawnArgvSlice({
			command,
			bin: 'yarn',
			cmd: command,
			argv,
		})
	},

});

export = cmdModule
