/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import { crossSpawnOther, processArgvSlice } from '../../lib/spawn';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	aliases: ['push'],
	describe: `發布 npm 套件 / publish a npm package`,

	builder(yargs)
	{
		return yargs
			.option('tag', {
				desc: `使用指定的標籤註冊已發布的套件，以便 \`npm install @\` 安裝此版本。默認情況下，\`npm publish\` 更新並且 \`npm install\` 安裝 \`latest\` 標籤。 / Registers the published package with the given tag, such that \`npm install @\` will install this version. By default, \`npm publish\` updates and \`npm install\` installs the \`latest\` tag.`,

				string: true,
			})
			.option('access', {
				desc: `告訴註冊表此套件應該發布為公共還是受限。僅適用於默認為受限的範圍套件。如果您沒有付費帳戶，則必須使用 --access public 發布範圍套件。 / Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.`,
				string: true,
			})
			.option('otp', {
				desc: `如果您在 auth-and-writes 模式下啟用了雙因素身份驗證，則可以從身份驗證器提供此代碼。如果您沒有包含此代碼並且您正在從 TTY 運行，則會提示您。 / If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.`,
				string: true,
			})
			.option('dry-run', {
				desc: `從 npm@6 開始，執行發布會執行的所有操作，但不實際發布到註冊表。報告會報告已發布的詳細信息。 / As of npm@6, does everything publish would do except actually publishing to the registry. Reports the details of what would have been published.`,
				boolean: true,
			})
			;
	},

	handler(argv)
	{
		let cmd_list = processArgvSlice(['publish', 'push']).argv;

		crossSpawnOther('npm', [

			'publish',

			...cmd_list,
		], argv);
	}

});

export = cmdModule