/**
 * Jest 測試環境設定
 * Jest test environment setup
 *
 * @author user
 * @created 2026/3/10
 */

// 設定測試環境變數
process.env.NODE_ENV = 'test';

// 抑制 console 輸出（在需要時可移除）
// global.console = {
// 	...console,
// 	log: jest.fn(),
// 	debug: jest.fn(),
// 	info: jest.fn(),
// 	warn: jest.fn(),
// 	error: jest.fn(),
// };
