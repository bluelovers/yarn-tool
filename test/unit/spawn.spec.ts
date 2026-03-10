/**
 * lib/spawn.ts 工具函數測試
 * lib/spawn.ts utility function tests
 *
 * @author user
 * @created 2026/3/10
 */

/// <reference types="jest" />
/// <reference types="node" />

import path from 'upath2';
import {
	_crossSpawnOther,
	processArgvSlice,
} from '../../lib/spawn';
import { ArgvSliceFactory } from '../lib';
import { realpathSync } from 'node:fs';
import { join, normalize } from 'upath2';
import { __ROOT } from '../../__root';

describe('lib/spawn', () =>
{

	describe('_crossSpawnOther', () =>
	{
		it('should return result when no error', () =>
		{
			const result = { status: 0 };
			expect(_crossSpawnOther(result)).toBe(result);
		});

		it('should throw error when error property exists', () =>
		{
			const error = new Error('Spawn error');
			const result = { error };

			expect(() => _crossSpawnOther(result)).toThrow(error);
		});

		it('should exit with code 1 when signal property exists', () =>
		{
			const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() =>
			{
				throw new Error('process.exit called');
			});

			const result = { signal: 'SIGTERM' };

			expect(() => _crossSpawnOther(result)).toThrow('process.exit called');
			expect(exitSpy).toHaveBeenCalledWith(1);

			exitSpy.mockRestore();
		});
	});

	describe('processArgvSlice', () =>
	{
		it('should handle single key input', () =>
		{
			const testCases = ArgvSliceFactory.singleKey();

			for (const tc of testCases)
			{
				const result = processArgvSlice(tc.keys_input, tc.argv_input, tc.startindex);

				expect(result.key).toBe(tc.expected.key);
				expect(result.argv).toEqual(tc.expected.argv);
			}
		});

		it('should handle multiple keys input', () =>
		{
			const testCases = ArgvSliceFactory.multipleKeys();

			for (const tc of testCases)
			{
				const result = processArgvSlice(tc.keys_input, tc.argv_input, tc.startindex);

				expect(result.key).toBe(tc.expected.key);
				expect(result.argv).toEqual(tc.expected.argv);
			}
		});

		it('should handle default startindex', () =>
		{
			const result = processArgvSlice('install', ['node', 'yt', 'install', 'arg']);

			expect(result.key).toBe('install');
			expect(result.argv).toEqual(['arg']);
		});

		it('should return correct idx_rebase', () =>
		{
			const result = processArgvSlice('install', ['node', 'yt', 'install', 'arg'], 2);

			expect(result.idx_rebase).toBe(2);
		});

		it('should handle empty argv_input', () =>
		{
			const result = processArgvSlice('install', [], 2);

			expect(result.key).toBeNull();
			expect(result.argv).toBeNull();
		});
	});
});
