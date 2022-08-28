/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { console, consoleDebug, filterYargsArguments } from '../../lib/index';
import { crossSpawnOther } from '../../lib/spawn';
import { crlf, LF } from 'crlf-normalize';
import { array_unique_overwrite } from 'array-hyper-unique';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	aliases: [],
	describe: `List installed packages.`,

	builder(yargs)
	{
		return yargs
			.option('depth', {
				number: true,
			})
			.option('pattern', {
				string: true,
			})
			.option('duplicate', {
				alias: ['D'],
				number: true,
			})
			.example(`$0 list --pattern gulp`, ``)
			.example(`$0 list --pattern "gulp|grunt"`, ``)
			.example(`$0 list --pattern "gulp|grunt" --depth=1`, ``)
			.strict(false)
	},

	handler(argv)
	{
		const key = command;

		if ('duplicate' in argv && argv.duplicate == null)
		{
			argv.duplicate = true;
		}

		let fc = filterYargsArguments(argv, [
			'depth',
			'pattern',
		]);

		const unparse = require('yargs-unparser');
		const parse = require('yargs-parser');

		let fca: string[] = unparse(fc);

		if (argv.duplicate)
		{
			delete argv.duplicate;
			delete argv.D;

			let cp = crossSpawnOther('yarn', [
				key,
				//...fca,
				//...argv._,
			], argv, {
				stdio: null,
				stripAnsi: true,
			});

			let list = parseList(cp.stdout.toString());
			let list2 = findDuplicated(list);

			//console.dir(list);
			//console.dir(list2);

			if (0)
			{
				for (let name of list2)
				{
					delete fc['pattern'];

					let fca2: string[] = unparse(fc);

					let cp2 = crossSpawnOther('yarn', [
						key,
						name,
						...fca2,
					], argv);
				}
			}
			else if (1)
			{
				consoleDebug.info(`duplicate installed packages list`);
				consoleDebug.red.info(`this features current has bug, some package only install one version, but still show up`, "\n");

				for (let name of list2)
				{


					let vs = [];

					list.forEach(data =>
					{
						if (data.name == name && data.version != null && !vs.includes(data.version))
						{
							//console.log('├─', data.version);

							vs.push(data.version.replace(/^\^/, ''))
						}
					});

					//vs = vs.sort(semver.rcompare);

					if (vs.length == 1)
					{
						continue;
					}

					console.log(name);

					let arr = vs.slice(0, -1);

					if (arr.length)
					{
						console.log('├─', arr.join('\n├─ '));
					}

					console.log('└─', vs[vs.length - 1]);
				}
			}
			else
			{
				fc['pattern'] = list2.join('|');

				let fca2: string[] = unparse(fc);

				let cp2 = crossSpawnOther('yarn', [
					key,
					...fca2,
				], argv);
			}
		}
		else
		{
			/*
			crossSpawnOther('yarn', [
				key,
				...fca,
			], argv)
			 */
			lazySpawnArgvSlice({
				command,
				bin: 'yarn',
				cmd: [
					command,
				],
				argv,
			})
		}
	},

});

export = cmdModule

function parseList(stdout: string)
{
	return crlf(stdout)
		.split(LF)
		.filter(line =>
		{
			line = line.trim();
			return line && !/^\s*[a-z]/i.test(line)
		})
		.map(line =>
		{
			return parseName(line)
		})
		;
}

function parseName(line: string)
{
	let m = line.match(/^([^@a-z]+)(@?.+)$/i);

	let line_prefix = m[1];
	let fullname = m[2];

	let level = 0;

	m[1].replace(/  /g, function (s)
	{
		level++;

		return s;
	});

	let m2 = fullname.match(/^(@?[^@]+)@(.+)$/);

	let name = m2[1];
	let version = m2[2];

	let m3 = version.match(/^([^a-z0-9]*)([^\s]+)(.*?)/i);

	if (version.includes('||')|| version === '*' || m && m3[1] && !m3[3])
	{
		version = m3[2];
		version = null;
	}

	if (level > 1)
	{
		version = null;
	}

	return {
		name,
		version,
		level,

		line,
		line_prefix,
		fullname,
	}
}

function findDuplicated(list: ReturnType<typeof parseName>[])
{
	let arr = list
		.filter(d => {
			return d.version != null && d.version != '*'
		})
		.map(d => d.name)
	;

	//console.log(arr);

	return array_unique_overwrite(arr
		.filter((value, index, array) =>
		{
			if (value === '*' || value == null)
			{
				return false;
			}

			let bool = indexOfVersion(value, index, array)

			if (bool != null)
			{
				if (list[bool].version === list[index].version)
				{
					return false;
				}

				//console.log(list[bool], list[index]);
			}

			return bool != null;
		}))
		.sort()
}

function indexOfVersion(version: string, index: number, array: string[])
{
	let i = array.indexOf(version);

	if (i != -1 && i != index)
	{
		return i
	}

	return null;
}
