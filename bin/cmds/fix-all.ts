import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { npmAutoFixAll } from '@yarn-tool/fix-all';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),

	describe: `auto check/fix workspaces/package`,

	builder(yargs)
	{
		return yargs
			.option('overwriteHostedGitInfo', {
				boolean: true,
				alias: ['O', 'overwrite'],
			})
			.option('branch', {
				string: true,
			})
	},

	handler(args)
	{
		npmAutoFixAll(args.cwd, {

			branch: args.branch,
			overwriteHostedGitInfo: args.overwriteHostedGitInfo,

		})
	},

});

export = cmdModule
