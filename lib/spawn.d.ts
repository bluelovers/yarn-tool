/**
 * Created by user on 2019/5/18.
 */
import crossSpawn = require('cross-spawn-extra');
import { Arguments } from 'yargs';
import { SpawnSyncOptions } from 'cross-spawn-extra/type';
export declare function requireResolve(name: string): string;
export declare function checkModileExists(argv: {
    name: string;
    msg?: string;
    requireName?: string;
    installCmd?: string;
    processExit?: boolean | number;
}): string;
export declare function _crossSpawnOther<T>(cp: T): T;
export declare function crossSpawnOther(bin: string, cmd_list: string[], argv: Partial<Arguments> & {
    cwd: string;
}, crossSpawnOptions?: SpawnSyncOptions): crossSpawn.SpawnSyncReturns<Buffer>;
export declare function crossSpawnOtherAsync(bin: string, cmd_list: string[], argv: any): import("bluebird")<crossSpawn.SpawnASyncReturns<Buffer>>;
export declare function processArgvSlice(keys_input: string | string[], argv_input?: string[], startindex?: number): {
    idx_rebase: number;
    idx: number;
    argv_input: string[];
    argv_before: string[];
    argv_after: string[];
    argv: string[];
    keys_input: string[];
    key: string;
};
