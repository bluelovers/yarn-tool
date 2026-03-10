"use strict";
/**
 * yarn-tool 主模組入口文件
 * Main module entry file for yarn-tool
 *
 * @author user
 * @created 2019/4/30
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.YT_BIN = exports.YT_ROOT = void 0;
const upath2_1 = require("upath2");
/**
 * yarn-tool 項目的根目錄路徑
 * Root directory path of the yarn-tool project
 */
exports.YT_ROOT = (0, upath2_1.normalize)(__dirname);
/**
 * yarn-tool 可執行文件的路徑
 * Path to the yarn-tool executable file
 */
exports.YT_BIN = (0, upath2_1.join)(exports.YT_ROOT, 'bin/yarn-tool');
/**
 * 預設導出根目錄路徑
 * Default export of the root directory path
 */
exports.default = exports.YT_ROOT;
//# sourceMappingURL=index.js.map