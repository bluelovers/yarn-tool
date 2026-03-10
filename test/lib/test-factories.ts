/**
 * 測試資料工廠模組
 * Test data factory module
 *
 * @author user
 * @created 2026/3/10
 */

/**
 * 路徑測試資料工廠
 * Path test data factory
 */
export class PathTestFactory
{
	/**
	 * 產生標準化路徑測試資料
	 * Generate normalized path test data
	 */
	static normalizedPaths(): string[]
	{
		return [
			'./foo/bar',
			'./foo/bar/',
			'foo/bar',
			'foo/bar/',
			'/foo/bar',
			'/foo/bar/',
			'../foo/bar',
			'./foo/../bar',
		];
	}

	/**
	 * 產生相等路徑測試資料
	 * Generate equal path test data
	 */
	static equalPathPairs(): Array<[string, string]>
	{
		return [
			['./foo/bar', 'foo/bar'],
			['/foo/bar/', '/foo/bar'],
			['./foo/../bar', './foo/bar'],
			['foo//bar', 'foo/bar'],
		];
	}

	/**
	 * 產生不相等路徑測試資料
	 * Generate non-equal path test data
	 */
	static nonEqualPathPairs(): Array<[string, string]>
	{
		return [
			['./foo/bar', './foo/baz'],
			['/foo/bar', '/bar/foo'],
			['a/b/c', 'a/b/d'],
		];
	}
}

/**
 * Yargs 參數測試資料工廠
 * Yargs arguments test data factory
 */
export class YargsArgvFactory
{
	/**
	 * 產生基本 yargs 參數
	 * Generate basic yargs arguments
	 */
	static basicArgv(): Record<string, unknown>
	{
		return {
			cwd: '/project',
			_: ['install'],
			$0: 'yt',
		};
	}

	/**
	 * 產生完整 yargs 參數
	 * Generate full yargs arguments
	 */
	static fullArgv(): Record<string, unknown>
	{
		return {
			cwd: '/project',
			skipCheckWorkspace: true,
			ytDebugMode: true,
			npmClients: 'pnpm',
			verbose: true,
			force: false,
			_: ['install'],
			$0: 'yt',
		};
	}

	/**
	 * 產生布林鍵列表
	 * Generate boolean key list
	 */
	static booleanKeys(): string[]
	{
		return ['verbose', 'force', 'skipCheckWorkspace', 'ytDebugMode'];
	}
}

/**
 * 命令列參數切片測試資料工廠
 * Command line argument slice test data factory
 */
export class ArgvSliceFactory
{
	/**
	 * 產生單一鍵名的測試資料
	 * Generate single key test data
	 */
	static singleKey(): Array<{
		keys_input: string;
		argv_input: string[];
		startindex: number;
		expected: {
			key: string | null;
			argv: string[] | null;
		};
	}>
	{
		return [
			{
				keys_input: 'install',
				argv_input: ['node', 'yt', 'install', '--force'],
				startindex: 2,
				expected: {
					key: 'install',
					argv: ['--force'],
				},
			},
			{
				keys_input: 'add',
				argv_input: ['node', 'yt', 'add', 'lodash'],
				startindex: 2,
				expected: {
					key: 'add',
					argv: ['lodash'],
				},
			},
			{
				keys_input: 'remove',
				argv_input: ['node', 'yt'],
				startindex: 2,
				expected: {
					key: null,
					argv: null,
				},
			},
		];
	}

	/**
	 * 產生多鍵名的測試資料
	 * Generate multiple keys test data
	 */
	static multipleKeys(): Array<{
		keys_input: string[];
		argv_input: string[];
		startindex: number;
		expected: {
			key: string | null;
			argv: string[] | null;
		};
	}>
	{
		return [
			{
				keys_input: ['add', 'install'],
				argv_input: ['node', 'yt', 'install', '-g'],
				startindex: 2,
				expected: {
					key: 'install',
					argv: ['-g'],
				},
			},
			{
				keys_input: ['add', 'remove'],
				argv_input: ['node', 'yt', 'add', 'lodash', '--dev'],
				startindex: 2,
				expected: {
					key: 'add',
					argv: ['lodash', '--dev'],
				},
			},
		];
	}
}

/**
 * CLI 命令測試資料工廠
 * CLI command test data factory
 */
export class CliCommandFactory
{
	/**
	 * 產生測試用的命令處理器
	 * Generate test command handler
	 */
	static createTestHandler(returnValue?: unknown)
	{
		return function handler(args: any): any
		{
			return returnValue ?? args;
		};
	}

	/**
	 * 產生測試用的命令構建器
	 * Generate test command builder
	 */
	static createTestBuilder()
	{
		return function builder(yarg: any): any
		{
			return yarg;
		};
	}
}
