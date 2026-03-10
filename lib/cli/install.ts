import { Argv } from 'yargs';

/**
 * 設置 Yarn 安裝命令的 Yargs 選項
 * Setup Yargs options for Yarn install command
 *
 * @param yargs Yargs 實例
 * @returns 配置了選項的 Yargs 實例
 */
export function setupYarnInstallToYargs<T extends any>(yargs: Argv<T>)
{
	return yargs
		.option('check-files', {
			alias: ['C'],
			desc: `驗證已安裝的 node_modules 文件是否沒有被刪除。 / Verifies that already installed files in node_modules did not get removed.`,
			boolean: true,
		})
		.option('flat', {
			desc: `安裝所有依賴項，但每個套件只允許一個版本。首次運行時，系統會提示您為依賴於多個版本範圍的每個套件選擇單一版本。這些將添加到 package.json 的 resolutions 字段下。 / Install all the dependencies, but only allow one version for each package. On the first run this will prompt you to choose a single version for each package that is depended on at multiple version ranges. These will be added to your package.json under a resolutions field.`,
			boolean: true,
		})
		.option('force', {
			alias: ['F'],
			desc: `重新獲取所有套件，即使是之前已安裝的套件。 / This refetches all packages, even ones that were previously installed.`,
			boolean: true,
		})
		.option('har', {
			desc: `輸出安裝過程中執行的所有網絡請求的 HTTP 歸檔。HAR 文件常用於調查網絡性能，可以使用 Google 的 HAR Analyzer 或 HAR Viewer 等工具進行分析。 / Outputs an HTTP archive from all the network requests performed during the installation. HAR files are commonly used to investigate network performance, and can be analyzed with tools such as Google’s HAR Analyzer or HAR Viewer.`,
			boolean: true,
		})
		.option('ignore-scripts', {
			desc: `不執行項目 package.json 及其依賴項中定義的任何腳本。 / Do not execute any scripts defined in the project package.json and its dependencies.`,
			boolean: true,
		})
		.option('modules-folder', {
			desc: `指定 node_modules 目錄的備用位置，而不是默認的 ./node_modules。 / Specifies an alternate location for the node_modules directory, instead of the default ./node_modules.`,
			normalize: true,
		})
		.option('no-lockfile', {
			desc: `不讀取或生成 yarn.lock 鎖定文件。 / Don’t read or generate a yarn.lock lockfile.`,
			boolean: true,
		})
		.option('production', {
			desc: `如果 NODE_ENV 環境變量設置為 production，Yarn 不會安裝 devDependencies 中列出的任何套件。使用此標誌指示 Yarn 忽略 NODE_ENV 並從此標誌而不是此標誌獲取其 production-or-not 狀態。 / Yarn will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production. Use this flag to instruct Yarn to ignore NODE_ENV and take its production-or-not status from this flag instead.`,
			alias: ['prod'],
			boolean: true,
		})
		.option('pure-lockfile', {
			desc: `不生成 yarn.lock 鎖定文件。 / Don’t generate a yarn.lock lockfile.`,
			boolean: true,
		})
		.option('focus', {
			desc: `在套件的 node_modules 文件夾下淺層安裝其兄弟工作區依賴項。這允許您在不構建它依賴的其他工作區的情況下運行該工作區。 / Shallowly installs a package’s sibling workspace dependencies underneath its node_modules folder. This allows you to run that workspace without building the other workspaces it depends on.`,
			boolean: true,
		})
		.option('frozen-lockfile', {
			desc: `不生成 yarn.lock 鎖定文件，如果需要更新則失敗。 / Don’t generate a yarn.lock lockfile and fail if an update is needed.`,
			boolean: true,
		})
		.option('silent', {
			desc: `運行 yarn install 時不打印安裝日誌。 / Run yarn install without printing installation log.`,
			boolean: true,
		})
		.option('ignore-engines', {
			desc: `忽略引擎檢查。 / Ignore engines check.`,
			boolean: true,
		})
		.option('ignore-optional', {
			desc: `不安裝可選依賴項。 / Don’t install optional dependencies..`,
			boolean: true,
		})
		.option('offline', {
			desc: `在離線模式下運行 yarn install。 / Run yarn install in offline mode.`,
			boolean: true,
		})
		.option('non-interactive', {
			desc: `禁用交互式提示，例如當存在無效版本的依賴項時。 / Disable interactive prompts, like when there’s an invalid version of a dependency.`,
			boolean: true,
		})
		.option('update-checksums', {
			desc: `如果 yarn.lock 鎖定文件中的校驗和與其套件的校驗和不匹配，則更新 yarn.lock 鎖定文件中的校驗和。 / Update checksums in the yarn.lock lockfile if there’s a mismatch between them and their package’s checksum.`,
			boolean: true,
		})
		.option('audit', {
			desc: `檢查已安裝套件是否存在已知安全問題。找到的問題計數將添加到輸出中。使用 yarn audit 命令獲取更多詳細信息。與 npm 不同，npm 會在每次安裝時自動運行審計，yarn 只會在請求時執行此操作。 (此功能在功能被證明穩定後可能會在後續更新中更改。) / Checks for known security issues with the installed packages. A count of found issues will be added to the output. Use the yarn audit command for additional details. Unlike npm, which automatically runs an audit on every install, yarn will only do so when requested. (This may change in a later update as the feature is proven to be stable.)`,
			boolean: true,
		})
		.option('no-bin-links', {
			desc: `防止 yarn 為套件可能包含的任何二進制文件創建符號鏈接。 / Prevent yarn from creating symlinks for any binaries the package might contain.`,
			boolean: true,
		})
		.option('link-duplicates', {
			desc: `在 node_modules 中為重複的模塊創建硬鏈接。 / Create hardlinks to the repeated modules in node_modules.`,
			boolean: true,
		})
}

/**
 * 預設導出 Yarn 安裝命令配置函數
 * Default export of Yarn install command configuration function
 */
export default setupYarnInstallToYargs