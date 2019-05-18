/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, commandDirStrip, createCommandModuleExports, commandDirJoin } from '../../lib/cmd_dir';
import path = require('path');
import { consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../../lib/spawn';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),

	aliases: ['ws', 'workspaces', 'workspace'],
	describe: `yarn workspaces`,

	builder(yargs)
	{
		return yargs
			.commandDir(commandDirJoin(__dirname, __filename))
			.command({
				command: 'run',
				describe: `run script by lerna`,
				builder(yargs)
				{
					return yargs
				},
				handler(argv)
				{
					let ret = checkModileExists({
						name: 'lerna',
					});

					if (!ret)
					{
						process.exit(1);
					}

					let cmd_list = processArgvSlice('run').argv;

					crossSpawnOther('lerna', [

						'run',

						...cmd_list,
					], argv);
				},
			})
			.strict()
			.demandCommand()
			;
	},

	handler(argv)
	{

	},

});

export = cmdModule
