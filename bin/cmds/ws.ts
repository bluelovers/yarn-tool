/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, commandDirStrip, createCommandModuleExports, commandDirJoin } from '../../lib/cmd_dir';
import path = require('upath2');
import { consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { sortPackageJson } from 'sort-package-json';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../../lib/spawn';
import { Arguments, Argv } from 'yargs';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' <cmd>',

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
						.strict(false)

				},
				handler(argv)
				{
					lazyLerna('run', 'run', argv)
				},
			})
			.command({
				command: 'exec',
				describe: `Execute an arbitrary command in each package`,
				builder(yargs)
				{
					return yargs
						.strict(false)
				},
				handler(argv)
				{
					lazyLerna('exec', 'exec', argv)
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

function lazyLerna(command: string, cmd: string, argv: Arguments<any>)
{
	let ret = checkModileExists({
		name: 'lerna',
	});

	if (!ret)
	{
		process.exit(1);
	}

	let cmd_list = processArgvSlice(command).argv;

	return crossSpawnOther('lerna', [

		cmd,

		...cmd_list,
	], argv);
}
