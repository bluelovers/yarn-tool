/**
 * yarn-tool 核心功能模組
 * Core functionality module for yarn-tool
 *
 * @author user
 * @created 2019/4/30
 */
import { Console2 } from 'debug-color2';
import { Arguments } from 'yargs';
import { findRoot } from '@yarn-tool/find-root';
import { yargsProcessExit } from '@yarn-tool/yargs-util';
/**
 * 主要的控制台輸出實例
 * Main console output instance
 */
export declare const console: Console2;
/**
 * 調試用控制台輸出實例，包含標籤和時間戳
 * Debug console output instance with label and timestamp
 */
export declare const consoleDebug: Console2;
/**
 * 導出 findRoot 函數，用於尋找項目根目錄
 * Export findRoot function for finding project root directory
 */
export { findRoot };
/**
 * 路徑標準化函數
 * Path normalization function
 * @param input 輸入路徑
 * @returns 標準化後的路徑
 */
export declare function pathNormalize(input: string): string;
/**
 * 比較兩個路徑是否相等（標準化後比較）
 * Compare if two paths are equal (after normalization)
 * @param a 第一個路徑
 * @param b 第二個路徑
 * @returns 路徑是否相等
 */
export declare function pathEqual(a: string, b: string): boolean;
/**
 * 過濾 Yargs 參數，只保留指定的鍵或符合條件的鍵值對
 * Filter Yargs arguments, keeping only specified keys or key-value pairs that meet conditions
 * @param argv Yargs 參數對象
 * @param list 鍵名列表或過濾函數
 * @returns 過濾後的參數對象
 */
export declare function filterYargsArguments<T extends Arguments>(argv: T, list: string[] | ((key: keyof T, value: T[keyof T]) => boolean)): Partial<T>;
/**
 * 根據布林值參數生成標誌陣列
 * Generate flag array based on boolean arguments
 * @param keys 標誌鍵名列表
 * @param argv 參數對象
 * @returns 標誌陣列
 */
export declare function lazyFlags(keys: string[], argv: {
    [k: string]: boolean;
}): string[];
/**
 * 基於控制台實例創建的 Chalk 實例
 * Chalk instance created based on console instance
 */
export declare const chalkByConsole: <R, C extends Console2 = Console2>(cb: (chalk: C["chalk"], _console: C) => R, _console?: C) => R;
/**
 * 列印根目錄數據信息
 * Print root directory data information
 * @param rootData 根目錄數據
 * @param argv 參數對象
 */
export declare function printRootData(rootData: ReturnType<typeof findRoot>, argv: {
    cwd: string;
}): void;
/**
 * 導出 yargsProcessExit 函數，用於處理 Yargs 錯誤退出
 * Export yargsProcessExit function for handling Yargs error exit
 */
export { yargsProcessExit };
