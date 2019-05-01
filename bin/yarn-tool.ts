#!/usr/bin/env node

import yargs = require('yargs');
import updateNotifier = require('update-notifier');
import pkg = require('../package.json');
import { console, consoleDebug, findRoot, fsYarnLock, yarnLockDiff } from '../lib/index';
import path = require('path');
import fs = require('fs-extra');
import crossSpawn = require('cross-spawn-extra');
import { Dedupe } from '../lib/cli/dedupe';
import { flagsYarnAdd } from '../lib/cli/add';

updateNotifier({ pkg }).notify();

let cli = yargs
	.option('cwd', {
		desc: `current working directory or package directory`,
		normalize: true,
		default: process.cwd(),
	})
	.option('skipCheckWorkspace', {
		desc: `this options is for search yarn.lock, pkg root, workspace root, not same as --ignore-workspace-root-check`,
		boolean: true,
	})
	.help(true)
	.showHelpOnFail(true)
	.strict()
;

interface ICachedCommond
{
	[cmd: string]: {
		builder: <U>(yarg: yargs.Argv<any>) => yargs.Argv<U>
		handler: <T>(args: yargs.Arguments<T>) => void
	}
}

const cached_commond: ICachedCommond = {};

cli = cli
//.usage('$0 <dedupe> [cwd]')
	.command('dedupe [cwd]', `Data deduplication for yarn.lock`, ...create_commond(cli, 'dedupe', (argv) =>
	{
		let root = findRoot(argv);
		let hasWorkspace = root.ws != null;

		let yarnlock_cache = fsYarnLock(root.root);

		let { yarnlock_file, yarnlock_exists, yarnlock_old } = yarnlock_cache;

		consoleDebug.info(`Deduplication yarn.lock`);
		consoleDebug.gray.info(`${yarnlock_file}`);

		if (!yarnlock_exists)
		{
			consoleDebug.error(`yarn.lock not exists`);

			return;
		}

		let ret = Dedupe(yarnlock_old);

		let msg = yarnLockDiff(ret.yarnlock_old, ret.yarnlock_new);

		if (msg)
		{
			fs.writeFileSync(yarnlock_file, ret.yarnlock_new);

			console.log(msg);
		}
		else
		{
			consoleDebug.warn(`yarn.lock no need data deduplication`);
		}
	}))
	.command('add [name]', ``, (yargs) =>
	{
		return yargs
			.option('dev', {
				alias: 'D',
				desc: `install packages to devDependencies.`,
				boolean: true,
			})
			.option('peer', {
				alias: 'P',
				desc: `install packages to peerDependencies.`,
				boolean: true,
			})
			.option('optional', {
				alias: 'O',
				desc: `install packages to optionalDependencies.`,
				boolean: true,
			})
			.option('exact', {
				alias: 'E',
				desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
				boolean: true,
			})
			.option('tilde', {
				alias: 'T',
				desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
				boolean: true,
			})
			.option('audit', {
				desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
				boolean: true,
			})
			.option(`name`, {
				type: 'string',
				demandOption: true,
			})
			.option('dedupe', {
				alias: ['d'],
				desc: `Data deduplication for yarn.lock`,
				boolean: true,
				default: true,
			})
			.option('ignore-workspace-root-check', {
				alias: ['W'],
				desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
				boolean: true,
			})
			;
	}, (argv) =>
	{

		let args = argv._.slice();

		if (args[0] === 'add')
		{
			args.shift();
		}

		if (argv.name)
		{
			args.unshift(argv.name);
		}

		//console.dir(argv);

		if (!args.length)
		{
//			yargs.showHelp();

			consoleDebug.error(`Missing list of packages to add to your project.`);

			return process.exit(1);
		}

		const { cwd } = argv;

		let cmd_argv = [
			'add',

			...args,

			...flagsYarnAdd(argv),

		].filter(v => v != null);

		consoleDebug.debug(cmd_argv);

		let { dedupe } = argv;

		const root = findRoot(argv).root;

		let yarnlock_cache = fsYarnLock(root);

		if (!yarnlock_cache || !yarnlock_cache.yarnlock_exists)
		{
			dedupe = false;
		}
		else if (dedupe)
		{
			let ret = Dedupe(yarnlock_cache.yarnlock_old);

			if (ret.yarnlock_changed)
			{
				fs.writeFileSync(yarnlock_cache.yarnlock_file, ret.yarnlock_new);

				consoleDebug.info(`Deduplication yarn.lock`);
				consoleDebug.gray.info(`${yarnlock_cache.yarnlock_file}`);

				let msg = yarnLockDiff(yarnlock_cache.yarnlock_old, ret.yarnlock_new);

				if (msg)
				{
					console.log(msg);
				}

				yarnlock_cache.yarnlock_old = ret.yarnlock_new;
			}
		}

		let cp = crossSpawn.sync('yarn', cmd_argv, {
			cwd,
			stdio: 'inherit',
		});

		if (cp.error)
		{
			throw cp.error
		}

		if (0 && dedupe)
		{
			let yarnlock_cache2 = fsYarnLock(root);

			if (yarnlock_cache2 && yarnlock_cache2.yarnlock_exists)
			{
				let msg = yarnLockDiff(yarnlock_cache.yarnlock_old, yarnlock_cache2.yarnlock_old);

				if (msg)
				{
					console.log(msg);
				}
			}
		}

	})
	.command('install', `this will do [dedupe , install , dedupe , install]`, dummy, function (argv)
	{
		const { cwd } = argv;
		const root = findRoot(argv).root;
		let yarnlock_cache = fsYarnLock(root);

		if (yarnlock_cache.yarnlock_exists)
		{
			let ret1 = Dedupe(yarnlock_cache.yarnlock_old);

			if (ret1.yarnlock_changed)
			{
				fs.writeFileSync(yarnlock_cache.yarnlock_file, ret1.yarnlock_new);
			}

			let cp = crossSpawn.sync('yarn', [], {
				cwd,
				stdio: 'inherit',
			});

			let ret2 = Dedupe(fs.readFileSync(yarnlock_cache.yarnlock_file, 'utf8'));

			if (ret2.yarnlock_changed)
			{
				fs.writeFileSync(yarnlock_cache.yarnlock_file, ret2.yarnlock_new);

				consoleDebug.debug(`yarn.lock changed, do install again`);

				let cp = crossSpawn.sync('yarn', [], {
					cwd,
					stdio: 'inherit',
				});
			}

			let msg = yarnLockDiff(yarnlock_cache.yarnlock_old, fs.readFileSync(yarnlock_cache.yarnlock_file, 'utf8'));

			if (msg)
			{
				console.log(msg);
			}
		}
		else
		{
			consoleDebug.error(`yarn.lock not exists`);

			let cp = crossSpawn.sync('yarn', [], {
				cwd,
				stdio: 'inherit',
			});
		}
	})
	.command('help', 'Show help', (yarg) => {

		yargs.showHelp('log');

		return yargs;
	})
	.demandCommand()
;

cli.argv;

function dummy<T>(yarg: yargs.Argv<T>)
{
	return yarg
}

function create_commond<T, U extends T>(yarg: yargs.Argv<T>,
	commond: string,
	handler: (args: yargs.Arguments<U>) => void,
	builder?: (yarg: yargs.Argv<T>) => yargs.Argv<U>,
)
{
	// @ts-ignore
	builder = builder || dummy;

	cached_commond[commond] = {
		// @ts-ignore
		builder,
		// @ts-ignore
		handler,
	};

	return [builder, handler] as const
}

function call_commond<T, U>(yarg: yargs.Argv<T>, commond: string, argv?: yargs.Arguments<U>)
{
	return cached_commond[commond].handler(argv == null ? yarg.argv : argv)
}
