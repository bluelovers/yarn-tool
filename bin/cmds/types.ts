/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { console, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { existsDependencies, parseArgvPkgName, setupYarnAddToYargs } from '../../lib/cli/add';
import { fetchPackageJsonInfo } from '../../lib/cli/types';
import { array_unique } from 'array-hyper-unique';
import { flagsYarnAdd } from '@yarn-tool/pkg-deps-util/lib/cli/flagsYarnAdd';
import { checkInstallTargetTypes, EnumInstallTypesErrorCode } from '@yarn-tool/pkg-deps-util/lib/installTypes';
import path from 'upath2';
import crossSpawn from 'cross-spawn-extra';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' [name]',
	//aliases: [],
	describe: `Installs @types/* of packages if not exists in package.json`,

	builder(yargs)
	{
		return setupYarnAddToYargs(yargs, {
			allowEmptyName: true,
		})
			.option('auto', {
				desc: `auto install from package.json`,
				boolean: true,
			})
			.option('all', {
				desc: `dependencies, devDependencies from package.json`,
				boolean: true,
			})
			.option('AA', {
				desc: `--auto --all`,
				boolean: true,
			})
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
		let warns: any[] = [];

		for (let packageName of args)
		{
			let check = await checkInstallTargetTypes(packageName, {
				checkExists: true,
				pkg,
			});

			if (check.error)
			{
				switch (check.error)
				{
					case EnumInstallTypesErrorCode.DEPRECATED:
						warns.push([`[ignore]`, check.name, '：', check.msg]);
						break;
					case EnumInstallTypesErrorCode.NOT_EXISTS:
						warns.push([`[warn]`, console.red.chalk(check.msg)]);
						break;
					case EnumInstallTypesErrorCode.SKIP:
						warns.push([`[skip]`, check.msg]);
						break;
				}
			}
			else
			{
				list.push(check.target);
			}

			/*
			let m = parseArgvPkgName(packageName);

			if (!m)
			{
				console.warn(`[error]`, packageName);
				continue;
			}

			let { version, name, namespace } = m;
			if (namespace)
			{
				name = namespace.replace('@', '') + '__' + name;
			}

			packageName = name = `@types/${name}`;

			if (existsDependencies(name, pkg))
			{
				//console.warn(`[skip]`, `${name} already exists in package.json`);

				warns.push([`[skip]`, `${name} already exists in package.json`]);

				continue;
			}

			const target = await fetchPackageJsonInfo(packageName);

			if (target == null)
			{
				warns.push([`[warn]`, `${name} not exists`]);

				continue;
			}

			if (target.deprecated)
			{
				//console.warn(`[skip]`, target.deprecated);

				warns.push([`[ignore]`, target.name, '：', target.deprecated]);

				continue;
			}

			list.push(target.name + `@^${target.version}`);
			 */
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

		function printWarns()
		{
			warns.forEach(([label, ...arr]) => console.info(console.red.chalk(label), ...arr));
			warns = [];
		}
	},

});

export = cmdModule
