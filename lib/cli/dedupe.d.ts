/**
 * Created by user on 2019/4/30.
 */
import yargs = require('yargs');
import { findRoot, fsYarnLock } from '../index';
import { Console2 } from 'debug-color2';
export declare function Dedupe(yarnlock_old: string): {
    /**
     * 執行前的 yarn.lock
     */
    yarnlock_old: string;
    /**
     * 執行後的 yarn.lock
     */
    yarnlock_new: string;
    /**
     * yarn.lock 是否有變動
     */
    yarnlock_changed: boolean;
};
export interface IWrapDedupeCache {
    /**
     * 如果不存在則等於 argv.cwd
     */
    readonly cwd?: string;
    readonly rootData?: ReturnType<typeof findRoot>;
    /**
     * 目前的 yarn.lock 狀態(隨步驟更動狀態)
     */
    yarnlock_cache?: ReturnType<typeof fsYarnLock>;
    /**
     * 執行前的 yarn.lock
     */
    readonly yarnlock_old?: string;
    /**
     * 執行前的 yarn.lock 是否存在
     */
    readonly yarnlock_old_exists?: string;
    /**
     * yarn.lock 是否有變動
     */
    yarnlock_changed?: boolean;
    /**
     * 最後一次的 yarn.lock diff 訊息
     */
    yarnlock_msg?: string;
    /**
     * 每個步驟的狀態 true 代表中斷所有步驟
     * null 代表此步驟不存在
     * void/undefined 代表此步驟未執行
     */
    readonly ret: {
        readonly init: boolean | void | null;
        readonly before: boolean | void | null;
        readonly main: boolean | void | null;
        readonly after: boolean | void | null;
    };
    readonly consoleDebug?: Console2;
    readonly console?: Console2;
    [k: string]: unknown;
}
export declare function wrapDedupe<T extends {
    cwd?: string;
    [k: string]: unknown;
}, U extends T | {
    cwd: string;
    [k: string]: unknown;
}, C extends IWrapDedupeCache>(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, options: {
    /**
     * 如果初始化沒有發生錯誤 此步驟必定執行
     */
    init?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void;
    /**
     * 於 第一次 Dedupe 前的步驟
     */
    before?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void;
    /**
     * 此步驟為必要選項
     */
    main(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void;
    /**
     * 於 第二次 Dedupe 後的步驟
     */
    after?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void;
    /**
     * 於 第二次 Dedupe 後的步驟
     */
    after?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void;
    /**
     * 如果結束前沒有發生錯誤 此步驟必定執行
     */
    end?(yarg: yargs.Argv<T>, argv: yargs.Arguments<U>, cache: C): boolean | void;
    /**
     * 步驟間共享的緩存資訊並且會影響部分行為
     */
    cache?: Partial<C>;
}): {
    cwd: string;
    rootData: {
        pkg: string;
        ws: string;
        root: string;
    };
    yarg: yargs.Argv<T>;
    argv: yargs.Arguments<U>;
    cache: C;
};
export declare function infoFromDedupeCache<C extends IWrapDedupeCache>(cache: C): {
    yarnlock_file: string;
    yarnlock_old_exists: string;
    yarnlock_exists: boolean;
    yarnlock_changed: boolean;
    pkg: string;
    ws: string;
    root: string;
};
export default Dedupe;
