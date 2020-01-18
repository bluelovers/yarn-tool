/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import path = require('upath2');
import { chalkByConsole, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `Show information about why a package is installed.`,

	builder(yargs)
	{
		return yargs
			.strict(false)
	},

	handler(argv)
	{
		const key = basenameStrip(__filename);

		lazySpawnArgvSlice({
			command: key,
			bin: 'yarn',
			cmd: key,
			argv,
		})
	},

});

export = cmdModule
