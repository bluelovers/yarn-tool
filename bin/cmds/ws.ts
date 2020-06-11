/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, commandDirStrip, createCommandModuleExports, commandDirJoin } from '../../lib/cmd_dir';
import path = require('upath2');
import { consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';

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
						.option('stream', {
							desc: `Stream output with lines prefixed by package.`,
						})
						.option('parallel', {
							desc: `Run script with unlimited concurrency, streaming prefixed output.`,
						})
						.option('no-prefix', {
							desc: `Do not prefix streaming output.`,
						})
						.help(false)
						.version(false)
						.strict(false)
				},
				handler(argv)
				{
					lazyLerna('run', 'run', argv, {
						beforeSpawn(data) {

							if (data.argv.stream == null && data.argv.parallel == null)
							{
								data.cmd_list.unshift(`--stream`);
							}

						}
					})
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

function lazyLerna<A extends Arguments<any>>(command: string, cmd: string, argv: A, opts: {
	beforeSpawn?(data: {
		cmd: string,
		cmd_list: string[],
		argv: A & {
			cwd: string
		},
	}),
} = {})
{
	let ret = checkModileExists({
		name: 'lerna',
	});

	if (!ret)
	{
		process.exit(1);
	}

	let cmd_list = processArgvSlice(command).argv;

	if (opts && opts.beforeSpawn)
	{
		let data = {
			cmd,
			cmd_list,
			argv: argv as any,
		};

		opts.beforeSpawn(data);

		({
			cmd,
			cmd_list,
			argv,
		} = data);
	}

	return crossSpawnOther('lerna', [

		cmd,

		...cmd_list,
	], argv as Arguments<any>, {
		env: {
			...process.env,
			NO_UPDATE_NOTIFIER: 1,
		}
	});
}
