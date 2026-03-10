/**
 * 測試共用 Mock 輔助模組
 * Shared mock helper module for testing
 *
 * @author user
 * @created 2026/3/10
 */

/**
 * 模擬模組不存在的錯誤
 * Simulate module not found error
 */
export class MockModuleNotFoundError extends Error
{
	constructor(moduleName: string)
	{
		super(`Cannot find module '${moduleName}'`);
		this.name = 'MockModuleNotFoundError';
	}
}

/**
 * 模擬 cross-spawn 的結果物件
 * Simulate cross-spawn result object
 */
export interface IMockSpawnResult<T = Buffer | string>
{
	error?: Error | null;
	signal?: string | null;
	status?: number | null;
	stdout?: T;
	stderr?: T;
}

/**
 * 建立模擬的 spawn 成功結果
 * Create mock spawn success result
 */
export function mockSpawnSuccess<T = Buffer | string>(overrides?: Partial<IMockSpawnResult<T>>): IMockSpawnResult<T>
{
	return {
		error: null,
		signal: null,
		status: 0,
		stdout: Buffer.from(''),
		stderr: Buffer.from(''),
		...overrides,
	};
}

/**
 * 建立模擬的 spawn 錯誤結果
 * Create mock spawn error result
 */
export function mockSpawnError<T = Buffer | string>(error: Error, overrides?: Partial<IMockSpawnResult<T>>): IMockSpawnResult<T>
{
	return {
		error,
		signal: null,
		status: null,
		stdout: null,
		stderr: null,
		...overrides,
	};
}

/**
 * 建立模擬的 spawn 信號終止結果
 * Create mock spawn signal termination result
 */
export function mockSpawnSignal<T = Buffer | string>(signal: string, overrides?: Partial<IMockSpawnResult<T>>): IMockSpawnResult<T>
{
	return {
		error: null,
		signal,
		status: null,
		stdout: Buffer.from(''),
		stderr: Buffer.from(''),
		...overrides,
	};
}

/**
 * 模擬 yargs 參數物件
 * Mock yargs arguments object
 */
export interface IMockYargsArgv
{
	cwd: string;
	skipCheckWorkspace?: boolean;
	ytDebugMode?: boolean;
	npmClients?: string;
	_: string[];
	$0: string;
	[key: string]: unknown;
}

/**
 * 建立預設的模擬 yargs 參數
 * Create default mock yargs arguments
 */
export function createMockArgv(overrides?: Partial<IMockYargsArgv>): IMockYargsArgv
{
	return {
		cwd: process.cwd(),
		skipCheckWorkspace: false,
		ytDebugMode: false,
		npmClients: undefined,
		_: [],
		$0: 'yt',
		...overrides,
	};
}

/**
 * 模擬 console 輸出 capture
 * Mock console output capture
 */
export function createConsoleCapture()
{
	const logs: string[] = [];
	const originalConsole = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error,
	};

	return {
		capture<T extends (...args: any[]) => void>(fn: T): T
		{
			return ((...args: any[]) =>
			{
				logs.push(args.map(a => String(a)).join(' '));
				// @ts-ignore
				originalConsole[fn.name || 'log'](...args);
			}) as T;
		},
		getLogs: () => logs,
		restore: () =>
		{
			// restore not needed for this simple capture
		},
	};
}

/**
 * 模擬 findRoot 的回傳值
 * Mock findRoot return value
 */
export interface IMockRootData
{
	root: string;
	pkg: string;
	ws: string | null;
	isWorkspace: boolean;
	hasWorkspace: boolean;
}

/**
 * 建立模擬的 findRoot 回傳值
 * Create mock findRoot return value
 */
export function createMockRootData(overrides?: Partial<IMockRootData>): IMockRootData
{
	return {
		root: '/project',
		pkg: '/project',
		ws: null,
		isWorkspace: false,
		hasWorkspace: false,
		...overrides,
	};
}
