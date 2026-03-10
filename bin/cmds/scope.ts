import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { WorkspacesScope } from '@yarn-tool/ws-scope';
import { console } from '../../lib/index';
import { basename, join } from 'upath2';
import { ensureDirSync } from 'fs-extra';
import { ArgumentsCamelCase, Argv } from 'yargs';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' <cmd>',

	aliases: ['scope', 'scoped'],
	describe: `更新工作區範圍設定 / Update workspaces scope setting`,

	builder(yargs)
	{
		return yargs
			.command({
				command: 'add ...[rule]',
				describe: `新增範圍 / Add scope`,
				handler(argv)
				{
					return _method('add', yargs, argv)
				},
			})
			.command({
				command: 'remove ...[rule]',
				describe: `移除範圍 / Remove scope`,
				handler(argv)
				{
					return _method('remove', yargs, argv)
				},
			})
		.command({
				command: 'sync',
				describe: `同步範圍 / Sync scope`,
				handler(argv)
				{
					// @ts-ignore
					const wss = new WorkspacesScope(argv.cwd);

					wss.syncValue();
					wss.save();

					console.success(`工作區範圍同步完成 / workspace scope sync completed`)
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
		wss.syncValue();
		wss.save();
		console.success(`工作區範圍已更新 / workspace scope updated`)
	}
	else
	{
		console.warn(`工作區範圍未變更 / workspace scope not changed`)
	}
}
