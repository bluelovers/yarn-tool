"use strict";
/**
 * Package.json 操作工具模組
 * Package.json manipulation utilities
 *
 * @author user
 * @created 2019/5/17
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageJson = void 0;
exports.parsePackageJson = parsePackageJson;
exports.writePackageJson = writePackageJson;
exports.writeJSONSync = writeJSONSync;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs-extra"));
const package_dts_1 = require("@ts-type/package-dts");
Object.defineProperty(exports, "readPackageJson", { enumerable: true, get: function () { return package_dts_1.readPackageJson; } });
const fs_json_1 = require("@bluelovers/fs-json");
/**
 * 解析 package.json 文本內容
 * Parse package.json text content
 * @param text package.json 文本
 * @returns 解析後的 package.json 對象
 */
function parsePackageJson(text) {
    return JSON.parse(text);
}
/**
 * 寫入 package.json 文件
 * Write package.json file
 * @param file 文件路徑
 * @param data package.json 數據
 * @param options 寫入選項
 * @returns 寫入結果
 */
function writePackageJson(file, data, options = {}) {
    let { spaces = 2 } = options;
    return (0, fs_json_1.writeJSONSync)(file, data, {
        ...options,
        spaces
    });
}
/**
 * 寫入 JSON 文件
 * Write JSON file
 * @param file 文件路徑
 * @param data JSON 數據
 * @param options 寫入選項
 * @returns 寫入結果
 */
function writeJSONSync(file, data, options = {}) {
    let { spaces = 2 } = options;
    return fs.writeJSONSync(file, data, {
        ...options,
        spaces
    });
}
//# sourceMappingURL=pkg.js.map