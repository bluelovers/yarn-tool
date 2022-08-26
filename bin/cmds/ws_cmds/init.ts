/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../../lib/cmd_dir';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../../../lib/spawn';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `create yarn workspaces`,

	builder(yargs)
	{
		return setupWorkspacesInitToYargs(yargs)
			.strict(false)
	},

	handler(argv)
	{
		let ret = checkModileExists({
			name: 'create-yarn-workspaces',
			requireName: 'create-yarn-workspaces/bin/yarn-ws-init',
		});

		if (!ret)
		{
			process.exit(1);
		}

		let cmd_list = processArgvSlice('init').argv;

		crossSpawnOther('node', [

			ret,

			//'--',

			...cmd_list,
		], argv);
	},

});

export = cmdModule
