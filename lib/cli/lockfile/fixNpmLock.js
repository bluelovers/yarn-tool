"use strict";
/**
 * yarn-tool npm lockfile 修復工具模組
 * yarn-tool npm lockfile fix utility module
 *
 * @author user
 * @created 2020/3/31
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixNpmLock = fixNpmLock;
exports.sortDeps = sortDeps;
const string_natural_compare_1 = require("@bluelovers/string-natural-compare");
/**
 * 修復 NPM lockfile 資料結構
 * Fix NPM lockfile data structure
 *
 * @param npmLock - NPM lockfile 物件或依賴條目
 * @returns 修復後的 lockfile 物件
 */
function fixNpmLock(npmLock) {
    // 修復 dependencies 物件
    if (npmLock.dependencies && typeof npmLock.dependencies === 'object') {
        let keys = sortDeps(npmLock.dependencies);
        for (let key of keys) {
            // 避免處理名為 'dependencies' 的套件
            if (key === 'dependencies') {
                delete npmLock.dependencies[key];
                continue;
            }
            let entry = npmLock.dependencies[key];
            // 遞迴修復嵌套依賴
            fixNpmLock(entry);
        }
    }
    // 修復 requires 物件
    if (npmLock.requires && typeof npmLock.requires === 'object') {
        sortDeps(npmLock.requires);
    }
    // 移除可能導致問題的欄位
    // @ts-ignore
    //delete npmLock.resolved;
    // @ts-ignore
    //delete npmLock.integrity;
    return npmLock;
}
/**
 * 對依賴物件進行排序
 * Sort dependencies object
 *
 * @param record - 要排序的記錄物件
 * @returns 排序後的鍵名陣列
 */
function sortDeps(record) {
    let keys = Object.keys(record)
        .sort((a, b) => {
        // @ 符號開頭的套件排在前面
        let at1 = a.startsWith('@') ? 1 : 0;
        let at2 = b.startsWith('@') ? 1 : 0;
        let c = (at2 - at1);
        // 如果一個有 @ 一個沒有，有 @ 的排前面
        // 否則使用自然排序比較
        return c || (0, string_natural_compare_1.naturalCompare)(a, b);
    });
    // 重新排列物件屬性順序
    for (let key of keys) {
        let old = record[key];
        delete record[key];
        record[key] = old;
    }
    return keys;
}
/**
 * 預設匯出修復函數
 * Default export fix function
 */
exports.default = fixNpmLock;
//# sourceMappingURL=fixNpmLock.js.map