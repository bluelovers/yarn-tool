/**
 * 子進程執行工具模組
 * Child process execution utilities
 *
 * @author user
 * @created 2019/5/18
 */
import { SpawnSyncOptions } from 'cross-spawn-extra';
import { Arguments } from 'yargs';
/**
 * 安全解析模組路徑
 * Safely resolve module path
 * @param name 模組名稱
 * @returns 模組路徑或 null
 */
export declare function requireResolve(name: string): string;
/**
 * 檢查模組是否存在，若不存在則提示安裝
 * Check if module exists, prompt installation if not
 * @param argv 檢查配置對象
 * @returns 模組路徑或 null
 */
export declare function checkModileExists(argv: {
    name: string;
    msg?: string;
    requireName?: string;
    installCmd?: string;
    processExit?: boolean | number;
}): string;
/**
 * 處理子進程執行結果
 * Handle child process execution result
 * @param cp 子進程執行結果
 * @returns 原始結果或拋出錯誤
 */
export declare function _crossSpawnOther<T>(cp: T): T;
/**
 * 同步執行子進程命令
 * Synchronously execute child process command
 * @param bin 可執行文件路徑
 * @param cmd_list 命令參數列表
 * @param argv 參數對象
 * @param crossSpawnOptions 子進程選項
 * @returns 子進程執行結果
 */
export declare function crossSpawnOther(bin: string, cmd_list: string[], argv: Partial<Arguments> & {
    cwd: string;
}, crossSpawnOptions?: SpawnSyncOptions): import("cross-spawn-extra").SpawnSyncReturns<Buffer<ArrayBufferLike>>;
/**
 * 異步執行子進程命令
 * Asynchronously execute child process command
 * @param bin 可執行文件路徑
 * @param cmd_list 命令參數列表
 * @param argv 參數對象
 * @returns 子進程執行結果的 Promise
 */
export declare function crossSpawnOtherAsync(bin: string, cmd_list: string[], argv: any): import("bluebird")<import("cross-spawn-extra").SpawnASyncReturns<Buffer<ArrayBufferLike>>>;
/**
 * 處理命令行參數切片
 * Process command line argument slicing
 * @param keys_input 鍵名或鍵名列表
 * @param argv_input 原始參數數組
 * @param startindex 開始索引
 * @returns 處理後的參數信息對象
 */
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
