/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import path = require('upath2');
import { console, chalkByConsole, consoleDebug, findRoot, yargsProcessExit } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';

import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { setupToYargs } from '@yarn-tool/version-recommended/lib/argv';
import { nextVersionRecommendedByPackageFindUp } from '@yarn-tool/version-recommended/index';
import { join } from 'upath2';
import { colorizeDiff } from '@yarn-tool/semver-diff/lib/colorize';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	//aliases: [],
	describe: `bump version of packages`,

	builder(yargs)
	{
		return setupToYargs(yargs)
			.option('cwd', {
				normalize: true,
				default: process.cwd(),
			})
			.option('interactive', {
				alias: ['i'],
				desc: 'show interactive prompts',
				boolean: true,
			})
			.option('dry-run', {
				desc: 'dry run',
				boolean: true,
			})
			.strict(false)
	},

	handler(argv)
	{
		let rootData = findRoot(argv)

		if (rootData.isWorkspace && argv.skipCheckWorkspace)
		{
			yargsProcessExit(`not allow bump version of workspace`);
			process.exit(1);
		}

		let { pkg, bump, oldVersion, newVersion } = nextVersionRecommendedByPackageFindUp(argv)

		let name = chalkByConsole((chalk, console) =>
		{
			return chalk.green(pkg.name)
		}, console);

		console.log(`[${name}]`, chalkByConsole((chalk, console) =>
		{
			return chalk.green(bump)
		}, console), oldVersion, `=>`, colorizeDiff(oldVersion, newVersion, {
			console,
		}));

		if (!argv['dry-run'] && oldVersion !== newVersion)
		{
			let file = join(rootData.pkg, `package.json`);

			console.debug(`[${name}]`, `update`, file);

			writePackageJson(file, {
				...pkg,
				version: newVersion,
			})
		}
	},

});

export = cmdModule
