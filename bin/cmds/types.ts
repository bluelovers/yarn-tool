/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { array_unique } from 'array-hyper-unique';
import { flagsYarnAdd } from '@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd';
import { checkInstallTargetTypes } from '@yarn-tool/pkg-deps-util/lib/installTypes';
import path from 'upath2';
import crossSpawn from 'cross-spawn-extra';
import { EnumInstallTypesErrorCode } from '@yarn-tool/pkg-deps-util/lib/const';
import { setupYarnAddToYargs } from '@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddToYargs';
import { setupYarnAddTypesToYargs } from '@yarn-tool/pkg-deps-util/lib/cli/setupYarnAddTypesToYargs';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [name]',
	//aliases: [],
	describe: `Installs @types/* of packages if not exists in package.json`,

	builder(yargs)
	{
		return setupYarnAddTypesToYargs(yargs)
			.strict(false)
	},

	async handler(argv)
	{
		let args = argv._.slice();

		if (args[0] === 'types')
		{
			args.shift();
		}

		if (argv.name)
		{
			// @ts-ignore
			args.unshift(argv.name);
		}

		let rootData = findRoot({
			...argv,
		});

		let pkg_file = path.join(rootData.pkg, 'package.json');

		let pkg = readPackageJson(pkg_file);

		if (argv.AA)
		{
			argv.auto = true;
			argv.all = true;
		}

		if (argv.auto)
		{
			let names: string[] = [];

			if ((argv.dev || argv.all) && pkg.devDependencies)
			{
				names.push(...Object.keys(pkg.devDependencies || []));
			}

			if (argv.peer || argv.optional)
			{
				if (argv.peer && pkg.peerDependencies)
				{
					names.push(...Object.keys(pkg.peerDependencies || []));
				}

				if (argv.optional && pkg.optionalDependencies)
				{
					names.push(...Object.keys(pkg.optionalDependencies || []));
				}
			}
			else if (!argv.dev && pkg.dependencies)
			{
				names.push(...Object.keys(pkg.dependencies || []));
			}

			if (argv.all && pkg.dependencies)
			{
				names.push(...Object.keys(pkg.dependencies || []));
			}

			if (names.length)
			{
				args.push(...names);
			}

			argv.optional = argv.peer = argv.dev = false;
		}

		if (!args.length)
		{
			consoleDebug.error(`Missing list of packages to add to your project.`);

			return process.exit(1);
		}
		else
		{
			args = args.reduce((a, b) =>
			{

				b = b.replace(/^@types\//, '');

				a.push(b);

				return a;
			}, [] as string[]);

			args = array_unique(args);

			if (!args.length)
			{
				consoleDebug.warn(`no package list for install types`);

				return process.exit();
			}
		}

		let flags = flagsYarnAdd(argv).filter(v => v != null);
		let flags2 = flags.slice();

		if (!argv.optional && !argv.peer && !argv.dev)
		{
			flags2.push('-D');
		}

		let list: string[] = [];
		let warns: [string, ...any[]][] = [];
		let success: [string, ...any[]][] = [];

		for (let packageName of args)
		{

			let check = await checkInstallTargetTypes(packageName, {
				checkExists: true,
				pkg,
			});

			switch (check.error)
			{
				case EnumInstallTypesErrorCode.DEPRECATED:
					warns.push([`[ignore]`, check.target, '：', check.msg]);
					break;
				case EnumInstallTypesErrorCode.NOT_EXISTS:
					warns.push([`[warn]`, console.red.chalk(check.msg)]);
					break;
				case EnumInstallTypesErrorCode.SKIP:
					warns.push([`[skip]`, check.msg]);
					break;
				case EnumInstallTypesErrorCode.SUCCESS:
					success.push([`[success]`, `add ${console.green.chalk(check.target)} to dependency`]);
					list.push(check.target);
					break;
				default:
					warns.push([`[error]`, check]);
					break;
			}

		}

		if (list.length)
		{
			let cmd_argv = [
				'add',
				...list,
				...flags2,
			].filter(v => v != null);

			let cp = crossSpawn.sync('yarn', cmd_argv, {
				cwd: argv.cwd,
				stdio: 'inherit',
			});

			if (cp.error)
			{
				throw cp.error
			}
		}
		else
		{
			//printWarns();

			//console.warn(`[warn]`, `no any new types install`);

			warns.push([`[warn]`, console.red.chalk(`no any new types install`)]);
		}

		printWarns();

		success.forEach(([label, ...arr]) => console.info(console.green.chalk(label), ...arr));

		function printWarns()
		{
			warns.forEach(([label, ...arr]) => console.info(console.red.chalk(label), ...arr));
			warns = [];
		}
	},

});

export = cmdModule
