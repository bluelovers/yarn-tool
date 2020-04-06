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
	describe: `List local packages that have changed since the last tagged release`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		lazySpawnArgvSlice({
			command,
			bin: 'lerna',
			cmd: command,
			argv,
		})
	},

});

export = cmdModule
