/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import path = require('upath2');
import { chalkByConsole, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `Run node with the hook already setup.`,

	builder(yargs)
	{
		return yargs
			.help(false)
			.version(false)
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
