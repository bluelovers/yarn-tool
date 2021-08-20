/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../../lib/cmd_dir';
import { wsPkgListable } from 'ws-pkg-list/lib/listable';
import { chalkByConsole, consoleDebug, findRoot } from '../../../lib/index';
import sortPackageJson from 'sort-package-json3';
import { readPackageJson } from '@ts-type/package-dts';
import { readFileSync, writeFileSync } from 'fs';
import { relative } from 'upath2';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `sort each package.json file in workspaces`,

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

		const listable = wsPkgListable(rootData.root);

		listable.forEach(entry => {
			let old = readFileSync(entry.manifestLocation).toString();

			const json = sortPackageJson(JSON.parse(old));
			const json_new = JSON.stringify(json, null, 2);

			let changed: boolean = old !== json_new;

			if (changed)
			{
				writeFileSync(entry.manifestLocation, json_new)
			}

			!argv.silent && chalkByConsole((chalk, console) => {

				let p = chalk.cyan(relative(rootData.root, entry.manifestLocation));

				console.log(`[${chalk.cyan(json.name)}]`, `${p} is sorted!`);

			}, consoleDebug);
		})
	},

});

export = cmdModule
