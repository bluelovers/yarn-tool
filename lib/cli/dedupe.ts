/**
 * Created by user on 2019/4/30.
 */

import yargs = require('yargs');
import { fixDuplicates } from 'yarn-deduplicate';
import { console, consoleDebug, findRoot, fsYarnLock, yarnLockDiff } from '../index';
import fs = require('fs-extra');
import { Console2 } from 'debug-color2';
import path = require('path');

export function Dedupe(yarnlock_old: string)
{
	let yarnlock_new: string = fixDuplicates(yarnlock_old);

	return {
		/**
		 * 執行前的 yarn.lock
		 */
		yarnlock_old,
		/**
		 * 執行後的 yarn.lock
		 */
		yarnlock_new,
		/**
		 * yarn.lock 是否有變動
		 */
		yarnlock_changed: yarnlock_old !== yarnlock_new,
	}
}

export interface IWrapDedupeCache
{
	/**
	 * 如果不存在則等於 argv.cwd
	 */
	readonly cwd?: string,

	readonly rootData?: ReturnType<typeof findRoot>,

	/**
	 * 目前的 yarn.lock 狀態(隨步驟更動狀態)
	 */
	yarnlock_cache?: ReturnType<typeof fsYarnLock>

	/**
	 * 執行前的 yarn.lock
	 */
	readonly yarnlock_old?: string,
	/**
	 * yarn.lock 是否有變動
	 */
	yarnlock_changed?: boolean,

	/**
	 * 最後一次的 yarn.lock diff 訊息
	 */
	yarnlock_msg?: string,

	/**
	 * 每個步驟的狀態 true 代表中斷所有步驟
	 * null 代表此步驟不存在
	 * void/undefined 代表此步驟未執行
	 */
	readonly ret: {
		readonly init: boolean | void | null,
		readonly before: boolean | void | null,
		readonly main: boolean | void | null,
		readonly after: boolean | void | null,
	},

	readonly consoleDebug?: Console2,
	readonly console?: Console2,

	[k: string]: unknown
}

export function wrapDedupe<T extends {
	cwd?: string,
	[k: string]: unknown,
}, U extends T | {
	cwd: string,
	[k: string]: unknown,
}, C extends IWrapDedupeCache>(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, options: {

	/**
	 * 如果初始化沒有發生錯誤 此步驟必定執行
	 */
	init?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void,

	/**
	 * 於 第一次 Dedupe 前的步驟
	 */
	before?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void,

	/**
	 * 此步驟為必要選項
	 */
	main(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void,

	/**
	 * 於 第二次 Dedupe 後的步驟
	 */
	after?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void,

	/**
	 * 於 第二次 Dedupe 後的步驟
	 */
	after?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void,

	/**
	 * 如果結束前沒有發生錯誤 此步驟必定執行
	 */
	end?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void,

	/**
	 * 步驟間共享的緩存資訊並且會影響部分行為
	 */
	cache?: Partial<C>
})
{
	// @ts-ignore
	let cache: C = options.cache || {};

	// @ts-ignore
	cache.cwd = cache.cwd || argv.cwd;



	if (!cache.cwd)
	{
		throw new TypeError(`cache.cwd is '${cache.cwd}'`)
	}

	// @ts-ignore
	cache.cwd = path.resolve(cache.cwd);

	// @ts-ignore
	cache.ret = {};

	cache.yarnlock_msg = undefined;

	// @ts-ignore
	cache.console = cache.console || console;
	// @ts-ignore
	cache.consoleDebug = cache.consoleDebug || consoleDebug;

	let { init, before, main, after, end } = options;

	// @ts-ignore
	cache.rootData = cache.rootData || findRoot({
		...argv,
		cwd: cache.cwd,
	}, true);

	// @ts-ignore
	cache.yarnlock_cache = cache.yarnlock_cache || fsYarnLock(cache.rootData.root);

	LABEL1: {

		// @ts-ignore
		cache.yarnlock_old = cache.yarnlock_cache.yarnlock_old;

		// @ts-ignore
		cache.ret.init = init ? !!init(yarg, argv, cache) : null;

		if (cache.ret.init)
		{
			break LABEL1;
		}

		// @ts-ignore
		cache.ret.before = before ? !!before(yarg, argv, cache) : null;
		if (cache.ret.before)
		{
			break LABEL1;
		}

		if (cache.yarnlock_cache.yarnlock_exists)
		{
			let ret1 = Dedupe(cache.yarnlock_cache.yarnlock_old);

			if (ret1.yarnlock_changed)
			{
				fs.writeFileSync(cache.yarnlock_cache.yarnlock_file, ret1.yarnlock_new);

				let msg = yarnLockDiff(ret1.yarnlock_old, ret1.yarnlock_new);

				if (msg)
				{
					cache.yarnlock_msg = msg;
				}

				cache.yarnlock_changed = true;

				cache.yarnlock_cache.yarnlock_old = ret1.yarnlock_new;

				consoleDebug.info(`Deduplication yarn.lock`);
				consoleDebug.gray.info(`${cache.yarnlock_cache.yarnlock_file}`);
			}
		}

		// @ts-ignore
		cache.ret.main = !!main(yarg, argv, cache);
		if (cache.ret.main)
		{
			break LABEL1;
		}

		cache.yarnlock_cache = fsYarnLock(cache.rootData.root);

		if (cache.yarnlock_cache.yarnlock_exists)
		{
			let ret1 = Dedupe(cache.yarnlock_cache.yarnlock_old);

			if (ret1.yarnlock_changed)
			{
				fs.writeFileSync(cache.yarnlock_cache.yarnlock_file, ret1.yarnlock_new);

				let msg = yarnLockDiff(ret1.yarnlock_old, ret1.yarnlock_new);

				if (msg)
				{
					cache.yarnlock_msg = msg;
				}

				cache.yarnlock_changed = true;

				cache.yarnlock_cache.yarnlock_old = ret1.yarnlock_new;

				consoleDebug.info(`Deduplication yarn.lock`);
				consoleDebug.gray.info(`${cache.yarnlock_cache.yarnlock_file}`);
			}
		}

		if (cache.yarnlock_changed)
		{
			if (!cache.yarnlock_cache.yarnlock_exists || !cache.yarnlock_old || cache.yarnlock_old == cache.yarnlock_cache.yarnlock_old)
			{
				cache.yarnlock_changed = false;
			}
		}

		// @ts-ignore
		cache.ret.after = after ? !!after(yarg, argv, cache) : null;
		if (cache.ret.after)
		{
			break LABEL1;
		}

		if (cache.yarnlock_changed)
		{
			let msg = yarnLockDiff(cache.yarnlock_old, cache.yarnlock_cache.yarnlock_old);

			if (msg)
			{
				cache.yarnlock_msg = msg;
			}
		}
	}

	// @ts-ignore
	cache.ret.end = end ? !!end(yarg, argv, cache) : null;

	return {
		cwd: cache.cwd,
		rootData: cache.rootData,
		yarg,
		argv,
		cache,
	}
}

export default Dedupe;

/*
wrapDedupe(null, null, {
	cache: {
		cwd: '.',
	},
	main(yarg, argv, cache)
	{
		console.log(yarg, argv, cache);

		return true;
	}
});
*/
