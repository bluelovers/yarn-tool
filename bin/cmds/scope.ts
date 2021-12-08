import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import WorkspacesScope from '@yarn-tool/ws-scope';
import { console } from '../../lib/index';
import { basename, join } from 'upath2';
import { ensureDirSync } from 'fs-extra';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename) + ' <cmd>',

	aliases: ['scope', 'scoped'],
	describe: `update workspaces scope setting`,

	builder(yargs)
	{
		return yargs
			.command({
				command: 'add',
				describe: `add scope`,
				handler(argv)
				{

					// @ts-ignore
					const wss = new WorkspacesScope(argv.cwd);

					if (!argv._)
					{
						yargs.exit(1, new Error(`yarn-tool scope add [rule]`))
						return;
					}

					argv._.forEach(scope =>
					{

						if (scope === basename(scope as string))
						{
							if (!scope.startsWith('@'))
							{
									scope = `@${scope}`
							}

							scope = `packages/${scope}/*`
							ensureDirSync(join(wss.rootData.ws, `packages/${scope}`));
						}

						wss.add(scope as string)
					});

					if (wss.changed)
					{
						wss.save();
						console.success(`workspace scope updated`)
					}
					else
					{
						console.warn(`workspace scope not changed`)
					}
				},
			})
			.command({
				command: 'remove',
				describe: `remove scope`,
				handler(argv)
				{

					// @ts-ignore
					const wss = new WorkspacesScope(argv.cwd);

					if (!argv._)
					{
						yargs.exit(1, new Error(`yarn-tool scope remove [rule]`))
						return;
					}

					argv._.forEach(scope => {

						if (scope === basename(scope as string))
						{
							if (!scope.startsWith('@'))
							{
									scope = `@${scope}`
							}

							scope = `packages/${scope}/*`
						}

						wss.remove(scope as string)
					});

					if (wss.changed)
					{
						wss.save();
						console.success(`workspace scope updated`)
					}
					else
					{
						console.warn(`workspace scope not changed`)
					}
				},
			})
			.strict()
			.demandCommand()
			;
	},

});

export = cmdModule
