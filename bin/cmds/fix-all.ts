import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { npmAutoFixAll } from '@yarn-tool/fix-all';
import { setupToYargs } from '@yarn-tool/fix-all/lib/util/yargs-setting';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),

	describe: `auto check/fix workspaces/package`,

	// @ts-ignore
	builder(yargs)
	{
		return setupToYargs(yargs)
	},

	handler(args)
	{
		return npmAutoFixAll(args.cwd, {

			branch: args.branch,
			overwriteHostedGitInfo: args.overwriteHostedGitInfo,
			// @ts-ignore
			resetStaticFiles: args.resetStaticFiles,

		})
	},

});

export = cmdModule
