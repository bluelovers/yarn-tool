/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import { console, consoleDebug } from '../../lib/index';
import { wrapDedupe } from '@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe';
import { crossSpawnOther } from '../../lib/spawn';
import { detectPackageManager } from '../../lib/pm';
import { EnumPackageManager } from '@yarn-tool/detect-package-manager';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	aliases: ['upgrade', 'up'],
	describe: `升級套件 / Upgrade packages`,

	builder(yargs)
	{
		return yargs
			.option('latest', {
				desc: '升級到最新版本，忽略 package.json 中的版本範圍 / Upgrade to latest version, ignoring version range in package.json. The version specified by the latest tag will be used (potentially upgrading the packages across major versions).',
				boolean: true,
			})
			.option('caret', {
				desc: '使用 caret (^) 語意化版本 / Use caret (^) semver',
				boolean: true,
			})
			.option('tilde', {
				desc: '使用 tilde (~) 語意化版本 / Use tilde (~) semver',
				boolean: true,
			})
			.option('exact', {
				desc: '使用精確版本 (無語意化前綴) / Use exact version (no semver prefix)',
				boolean: true,
			})
			.option('pattern', {
				desc: '套件名稱匹配模式 / Package name match pattern',
				string: true,
			})
		;
	},

	handler(argv)
	{
		const { npmClients, pmIsYarn } = detectPackageManager(argv);

		wrapDedupe(require('yargs'), argv, {

			consoleDebug,

			before()
			{
				const key = basenameStrip(__filename);

				pmIsYarn && crossSpawnOther('yarn', [], argv);

				lazySpawnArgvSlice({
					command: ['upgrade', 'up', key],
					bin: npmClients,
					cmd: key,
					argv,
				})
			},

			main(yarg, argv, cache)
			{

			},

			end(yarg, argv, cache)
			{
				if (pmIsYarn && cache.yarnlock_msg)
				{
					console.log(`\n${cache.yarnlock_msg}\n`);
				}
			},

		});

	},

});

export = cmdModule
