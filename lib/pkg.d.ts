/**
 * Package.json 操作工具模組
 * Package.json manipulation utilities
 *
 * @author user
 * @created 2019/5/17
 */
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { IWriteOptions } from '@bluelovers/fs-json';
/**
 * 導出 readPackageJson 函數
 * Export readPackageJson function
 */
export { readPackageJson };
/**
 * 解析 package.json 文本內容
 * Parse package.json text content
 * @param text package.json 文本
 * @returns 解析後的 package.json 對象
 */
export declare function parsePackageJson(text: string): IPackageJson;
/**
 * 寫入 package.json 文件
 * Write package.json file
 * @param file 文件路徑
 * @param data package.json 數據
 * @param options 寫入選項
 * @returns 寫入結果
 */
export declare function writePackageJson(file: string, data: any, options?: IWriteOptions): void;
/**
 * 寫入 JSON 文件
 * Write JSON file
 * @param file 文件路徑
 * @param data JSON 數據
 * @param options 寫入選項
 * @returns 寫入結果
 */
export declare function writeJSONSync(file: string, data: any, options?: IWriteOptions): void;
