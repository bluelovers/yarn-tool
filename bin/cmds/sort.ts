/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { join, relative } from 'upath2';
import { chalkByConsole, consoleDebug } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJSON, writePackageJSONSync } from '@yarn-tool/write-package-json';
import sortPackageJson from 'sort-package-json3';
import findRoot from '@yarn-tool/find-root';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `排序 package.json 文件 / sort package.json file`,

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

		let json_file = join(rootData.pkg, 'package.json');

		let json = readPackageJson(json_file);

		// @ts-ignore
		json = sortPackageJson(json);

		writePackageJSONSync(json_file, json);

		!argv.silent && chalkByConsole((chalk, console) => {

			let p = chalk.cyan(relative(argv.cwd, json_file));

			console.log(`[${chalk.cyan(json.name)}]`, `${p} is sorted!`);

		}, consoleDebug);

	},

});

export = cmdModule
