/**
 * lib/index.ts 工具函數測試
 * lib/index.ts utility function tests
 *
 * @author user
 * @created 2026/3/10
 */

/// <reference types="jest" />
/// <reference types="node" />

import {
	pathNormalize,
	pathEqual,
	filterYargsArguments,
	lazyFlags,
} from '../../lib/index';
import { PathTestFactory, YargsArgvFactory } from '../lib';

describe('lib/index', () =>
{

	describe('filterYargsArguments', () =>
	{
		it('should filter by key list', () =>
		{
			const argv = YargsArgvFactory.fullArgv();
			const result = filterYargsArguments(argv as any, ['cwd', 'npmClients']);

			expect(result).toHaveProperty('cwd', '/project');
			expect(result).toHaveProperty('npmClients', 'pnpm');
			expect(result).not.toHaveProperty('skipCheckWorkspace');
			expect(result).not.toHaveProperty('ytDebugMode');
		});

		it('should filter by predicate function', () =>
		{
			const argv = YargsArgvFactory.fullArgv();
			const result = filterYargsArguments(argv as any, (key, value) =>
			{
				return typeof value === 'boolean' && value === true;
			});

			expect(result).toHaveProperty('skipCheckWorkspace', true);
			expect(result).toHaveProperty('ytDebugMode', true);
			expect(result).not.toHaveProperty('force', false);
		});

		it('should handle empty key list', () =>
		{
			const argv = YargsArgvFactory.fullArgv();
			const result = filterYargsArguments(argv as any, []);

			expect(Object.keys(result).length).toBe(0);
		});

		it('should handle empty argv', () =>
		{
			const result = filterYargsArguments({} as any, ['cwd']);
			expect(Object.keys(result).length).toBe(0);
		});
	});

	describe('lazyFlags', () =>
	{
		it('should generate flags for true boolean values', () =>
		{
			const argv = {
				verbose: true,
				force: false,
				skipCheckWorkspace: true,
				debug: true,
			};

			const keys = ['verbose', 'force', 'skipCheckWorkspace', 'debug'];
			const result = lazyFlags(keys, argv);

			expect(result).toContain('--verbose');
			expect(result).not.toContain('--force');
			expect(result).toContain('--skipCheckWorkspace');
			expect(result).toContain('--debug');
		});

		it('should return empty array when no true values', () =>
		{
			const argv = {
				verbose: false,
				force: false,
			};

			const result = lazyFlags(['verbose', 'force'], argv);
			expect(result).toEqual([]);
		});

		it('should handle empty keys array', () =>
		{
			const argv = { verbose: true };
			const result = lazyFlags([], argv);
			expect(result).toEqual([]);
		});

		it('should preserve order of true keys', () =>
		{
			const argv = {
				aaa: false,
				bbb: true,
				ccc: true,
				ddd: false,
			};

			const result = lazyFlags(['aaa', 'bbb', 'ccc', 'ddd'], argv);
			expect(result).toEqual(['--bbb', '--ccc']);
		});
	});
});
