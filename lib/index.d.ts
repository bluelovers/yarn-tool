/**
 * Created by user on 2019/4/30.
 */
import { Console2 } from 'debug-color2';
import { Arguments } from 'yargs';
import { IUnpackMyYargsArgv } from './cmd_dir';
import { findRoot } from '@yarn-tool/find-root';
export declare const console: Console2;
export declare const consoleDebug: Console2;
export { findRoot };
export declare function pathNormalize(input: string): string;
export declare function pathEqual(a: string, b: string): boolean;
export declare function filterYargsArguments<T extends Arguments>(argv: T, list: string[] | ((key: keyof T, value: T[keyof T]) => boolean)): Partial<T>;
export declare function lazyFlags(keys: string[], argv: {
    [k: string]: boolean;
}): string[];
export declare const chalkByConsole: <R, C extends Console2 = Console2>(cb: (chalk: C["chalk"], _console: C) => R, _console?: C) => R;
export declare function printRootData(rootData: ReturnType<typeof findRoot>, argv: Arguments<IUnpackMyYargsArgv>): void;
export declare function yargsProcessExit(msg: string | Error, code?: number): void;
declare const _default: typeof import("./index");
export default _default;
