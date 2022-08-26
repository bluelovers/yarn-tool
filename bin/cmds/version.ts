/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { chalkByConsole, console, yargsProcessExit } from '../../lib/index';
import { writePackageJson } from '../../lib/pkg';
import { setupToYargs } from '@yarn-tool/version-recommended/lib/argv';
import { releaseTypes } from '@yarn-tool/version-recommended/lib/types';
import { nextVersionRecommendedByPackageFindUp } from '@yarn-tool/version-recommended';
import { join } from 'upath2';
import { colorizeDiff } from '@yarn-tool/semver-diff/lib/colorize';
import inquirer from 'inquirer';
import { findRoot } from '@yarn-tool/find-root';
import { readPackageJson } from '@ts-type/package-dts';

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

	async handler(argv)
	{
		let rootData = findRoot(argv)

		if (rootData.isWorkspace && argv.skipCheckWorkspace)
		{
			yargsProcessExit(`not allow bump version on root of workspace`);
			process.exit(1);
		}

		if (argv.interactive)
		{
			let rootData = findRoot(argv);
			let pkg = readPackageJson(join(rootData.pkg, 'package.json'));

			// @ts-ignore
			console.info(`Current version`, pkg.version)

			let ret = await inquirer
				.prompt([
					{
						type: 'list',
						loop: true,
						name: 'bump',
						message: "What's type of bump version?",
						choices: releaseTypes,
					},
				])
			;

			if (ret?.bump?.length > 0)
			{
				argv.bump = ret.bump;
			}
		}

		let { pkg, bump, oldVersion, newVersion } = nextVersionRecommendedByPackageFindUp(argv)

		let name = chalkByConsole((chalk, console) =>
		{
			// @ts-ignore
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
