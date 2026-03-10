/**
 * yarn-tool npm lockfile 修復工具模組
 * yarn-tool npm lockfile fix utility module
 *
 * @author user
 * @created 2020/3/31
 */
/**
 * NPM lockfile 資料結構介面
 * NPM lockfile data structure interface
 */
export interface INpmLock {
    /** 套件名稱 / Package name */
    "name": string;
    /** 套件版本 / Package version */
    "version": string;
    /** lockfile 版本號 / lockfile version */
    "lockfileVersion": number;
    /** 是否需要解析依賴 / Whether dependencies need to be resolved */
    "requires": boolean;
    /** 套件依賴列表 / Package dependencies list */
    "dependencies": {
        [name: string]: INpmLockEntry;
    };
}
/**
 * NPM lockfile 單一依賴條目介面
 * NPM lockfile single dependency entry interface
 */
export interface INpmLockEntry {
    /** 套件版本 / Package version */
    "version": string;
    /** 直接依賴列表 / Direct dependencies list */
    "requires"?: {
        [name: string]: string;
    };
    /** 嵌套依賴列表 / Nested dependencies list */
    dependencies?: {
        [name: string]: INpmLockEntry;
    };
}
/**
 * 修復 NPM lockfile 資料結構
 * Fix NPM lockfile data structure
 *
 * @param npmLock - NPM lockfile 物件或依賴條目
 * @returns 修復後的 lockfile 物件
 */
export declare function fixNpmLock(npmLock: INpmLock | INpmLockEntry): INpmLock | INpmLockEntry;
/**
 * 對依賴物件進行排序
 * Sort dependencies object
 *
 * @param record - 要排序的記錄物件
 * @returns 排序後的鍵名陣列
 */
export declare function sortDeps<T>(record: Record<string, T>): string[];
/**
 * 預設匯出修復函數
 * Default export fix function
 */
export default fixNpmLock;
