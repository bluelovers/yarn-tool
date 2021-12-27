import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import WorkspacesScope from '@yarn-tool/ws-scope';
import { console } from '../../lib/index';
import { basename, join } from 'upath2';
import { ensureDirSync } from 'fs-extra';
import { ArgumentsCamelCase, Argv } from 'yargs';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' <cmd>',

	aliases: ['scope', 'scoped'],
	describe: `update workspaces scope setting`,

	builder(yargs)
	{
		return yargs
			.command({
				command: 'add ...[rule]',
				describe: `add scope`,
				handler(argv)
				{
					return _method('add', yargs, argv)
				},
			})
			.command({
				command: 'remove ...[rule]',
				describe: `remove scope`,
				handler(argv)
				{
					return _method('remove', yargs, argv)
				},
			})
		.command({
				command: 'sync',
				describe: `sync scope`,
				handler(argv)
				{
					// @ts-ignore
					const wss = new WorkspacesScope(argv.cwd);

					// @ts-ignore
					wss.sync();
					wss.save();

					console.success(`workspace scope sync completed`)
				},
			})
			;
	},

});

export = cmdModule

function _method(cmd: 'add' | 'remove', yargs: Argv, argv: ArgumentsCamelCase)
{
	// @ts-ignore
	let list: string[] = [argv.rule].concat(argv._.slice(2)).filter(v => v.length);

	console.dir({
		argv,
		list,
	});

	if (!list.length)
	{
		yargs.exit(1, new Error(`yarn-tool scope ${cmd} [rule]`))
		return;
	}

	// @ts-ignore
	const wss = new WorkspacesScope(argv.cwd);

	list.forEach(scope =>
	{

		let _path = join(wss.rootData.ws, `packages/${scope}`);

		if (scope === basename(scope as string))
		{
			if (!scope.startsWith('@'))
			{
				scope = `@${scope}`
			}

			scope = `packages/${scope}/*`

			_path = join(wss.rootData.ws, scope);
		}

		_path = _path.replace(/[\/\\]\*$/, '');

		if (cmd === 'add')
		{
			ensureDirSync(_path);
		}

		wss[cmd](scope as string)
	});

	if (wss.changed)
	{
		// @ts-ignore
		wss.sync();
		wss.save();
		console.success(`workspace scope updated`)
	}
	else
	{
		console.warn(`workspace scope not changed`)
	}
}
