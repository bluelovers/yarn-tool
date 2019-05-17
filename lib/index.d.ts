/**
 * Created by user on 2019/4/30.
 */
import { Console2 } from 'debug-color2';
export declare const console: Console2;
export declare const consoleDebug: Console2;
export declare function findRoot(options: {
    cwd: string;
    skipCheckWorkspace?: boolean | string;
    throwError?: boolean;
}, throwError?: boolean): {
    pkg: string;
    ws: string;
    root: string;
};
export declare function yarnLockDiff(yarnlock_old: string, yarnlock_new: string): string;
export declare function fsYarnLock(root: string): {
    yarnlock_file: string;
    yarnlock_exists: boolean;
    yarnlock_old: string;
};
export declare function lazyFlags(keys: string[], argv: {
    [k: string]: boolean;
}): string[];
export declare const chalkByConsole: <R, C extends Console2 = Console2>(cb: (chalk: C["chalk"], _console: C) => R, _console?: C) => R;
declare const _default: typeof import(".");
export default _default;
