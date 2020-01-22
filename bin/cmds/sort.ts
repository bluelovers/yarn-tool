/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path = require('upath2');
import { chalkByConsole, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';

import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `sort package.json file`,

	builder(yargs)
	{
		return yargs
			.option('silent', {
				alias: ['S'],
				boolean: true,
			})

	},

	handler(argv)
	{
		let rootData = findRoot({
			...argv,
			cwd: argv.cwd,
		}, true);

		let json_file = path.join(rootData.pkg, 'package.json');

		let json = readPackageJson(json_file);

		// @ts-ignore
		(require('sort-package-json') as typeof import('sort-package-json')).sortPackageJson(json);

		writePackageJson(json_file, json);

		!argv.silent && chalkByConsole((chalk, console) => {

			let p = chalk.cyan(path.relative(argv.cwd, json_file));

			console.log(`${p} is sorted!`);

		}, consoleDebug);

	},

});

export = cmdModule
