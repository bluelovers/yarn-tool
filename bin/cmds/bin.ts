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
	describe: `Get the path to a binary script.`,

	builder(yargs)
	{
		return yargs
			.option('verbose', {
				alias: ['v'],
			})
			.example(`yt bin`, `List all the available binaries`)
			.example(`yt bin eslint`, `Print the path to a specific binary`)
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
