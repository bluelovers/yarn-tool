/**
 * Created by user on 2019/4/30.
 */
import { Console2 } from 'debug-color2';
export declare const console: Console2;
export declare const consoleDebug: Console2;
export declare function findRoot(options: {
    cwd: string;
    skipCheckWorkspace?: string;
}): {
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
declare const _default: typeof import(".");
export default _default;
