/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../../lib/spawn';
import { setupToYargs as setupInitToYargs } from 'npm-init2/lib/yargs-setting';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	describe: `create a npm package or update package.json file`,

	builder(yargs)
	{
		let ret = checkModileExists({
			name: 'npm-init2',
			requireName: 'npm-init2/lib/yargs-setting',
			processExit: true,
		});

		return (require(ret) as typeof import('npm-init2/lib/yargs-setting'))
			.setupToYargs(yargs)
			.strict(false)
	},

	handler(argv)
	{
		let ret = checkModileExists({
			name: 'npm-init2',
			requireName: 'npm-init2',
			processExit: true,
		});

		let cmd_list = processArgvSlice('init').argv;

		crossSpawnOther('node', [

			ret,

			//'--',

			...cmd_list,
		], argv);

	},

});

export = cmdModule
