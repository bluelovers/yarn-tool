/**
 * Created by user on 2019/4/30.
 */
import { Console2 } from 'debug-color2';
import { Arguments } from 'yargs';
import { IUnpackMyYargsArgv } from './cmd_dir';
export declare const console: Console2;
export declare const consoleDebug: Console2;
export declare function pathNormalize(input: string): string;
export declare function pathEqual(a: string, b: string): boolean;
export declare function findRoot(options: {
    cwd: string;
    skipCheckWorkspace?: boolean | string;
    throwError?: boolean;
}, throwError?: boolean): {
    pkg: string;
    ws: string;
    hasWorkspace: boolean;
    isWorkspace: boolean;
    root: string;
};
export declare function fsYarnLock(root: string): {
    yarnlock_file: string;
    yarnlock_exists: boolean;
    yarnlock_old: string;
};
export declare function filterYargsArguments<T extends Arguments>(argv: T, list: string[] | ((key: keyof T, value: T[keyof T]) => boolean)): Partial<T>;
export declare function lazyFlags(keys: string[], argv: {
    [k: string]: boolean;
}): string[];
export declare const chalkByConsole: <R, C extends Console2 = Console2>(cb: (chalk: C["chalk"], _console: C) => R, _console?: C) => R;
export declare function printRootData(rootData: ReturnType<typeof findRoot>, argv: Arguments<IUnpackMyYargsArgv>): void;
export declare function yargsProcessExit(msg: string | Error, code?: number): void;
declare const _default: typeof import(".");
export default _default;
