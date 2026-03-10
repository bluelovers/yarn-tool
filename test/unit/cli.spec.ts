/**
 * lib/cli.ts 工具函數測試
 * lib/cli.ts utility function tests
 *
 * @author user
 * @created 2026/3/10
 */

/// <reference types="jest" />
/// <reference types="node" />

import yargs from 'yargs';
import {
	dummy_builder,
	dummy_handler,
	create_command,
	create_command2,
} from '../../lib/cli';
import { CliCommandFactory } from '../lib';

describe('lib/cli', () =>
{
	describe('dummy_builder', () =>
	{
		it('should return original yargs instance', () =>
		{
			const yarg = yargs();
			const result = dummy_builder(yarg);
			expect(result).toBe(yarg);
		});

		it('should work with type parameter', () =>
		{
			const yarg = yargs();
			const result = dummy_builder<{ foo: string }>(yarg as any);
			expect(result).toBe(yarg);
		});
	});

	describe('dummy_handler', () =>
	{
		it('should return arguments as-is', () =>
		{
			const args = { cwd: '/project', _: [] };
			const result = dummy_handler(args as any);
			expect(result).toBe(args);
		});
	});

	describe('create_command', () =>
	{
		it('should create command with handler and builder', () =>
		{
			const handler = CliCommandFactory.createTestHandler({ success: true });
			const builder = CliCommandFactory.createTestBuilder();

			const [resultBuilder, resultHandler] = create_command(
				yargs(),
				'test',
				handler,
				builder,
			);

			expect(resultBuilder).toBe(builder);
			expect(resultHandler).toBe(handler);
		});

		it('should use dummy_builder when builder is not provided', () =>
		{
			const handler = jest.fn();

			const [resultBuilder] = create_command(
				yargs(),
				'test',
				handler,
			);

			expect(resultBuilder).toBe(dummy_builder);
		});
	});

	describe('create_command2', () =>
	{
		it('should create command module with all options', () =>
		{
			const handler = jest.fn();
			const builder = jest.fn((yarg) => yarg);

			const result = create_command2({
				command: 'test',
				describe: 'Test command',
				builder,
				handler,
			});

			expect(result).toHaveProperty('command', 'test');
			expect(result).toHaveProperty('describe', 'Test command');
			expect(result.builder).toBe(builder);
			expect(result.handler).toBe(handler);
		});

		it('should handle command as array', () =>
		{
			const handler = jest.fn();

			const result = create_command2({
				command: ['test', 't'],
				handler,
			});

			expect(result).toHaveProperty('command');
		});

		it('should handle aliases', () =>
		{
			const handler = jest.fn();

			const result = create_command2({
				command: 'test',
				aliases: ['t', 'ts'],
				handler,
			});

			expect(result).toHaveProperty('aliases', ['t', 'ts']);
		});

		it('should use default describe when not provided', () =>
		{
			const handler = jest.fn();

			const result = create_command2({
				command: 'test',
				handler,
			});

			expect(result).toHaveProperty('describe');
		});

		it('should use desc as describe alias', () =>
		{
			const handler = jest.fn();

			const result = create_command2({
				command: 'test',
				desc: 'Description via desc',
				handler,
			});

			expect(result.describe).toBe('Description via desc');
		});

		it('should prioritize describe over desc', () =>
		{
			const handler = jest.fn();

			const result = create_command2({
				command: 'test',
				describe: 'Describe',
				desc: 'Desc',
				handler,
			});

			expect(result.describe).toBe('Describe');
		});
	});
});
