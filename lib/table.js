"use strict";
/**
 * 表格顯示工具模組
 * Table display utilities
 *
 * @author user
 * @created 2019/5/18
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorizeDiff = void 0;
const tslib_1 = require("tslib");
/**
 * 導出 @yarn-tool/table 的所有功能
 * Export all functionality from @yarn-tool/table
 */
tslib_1.__exportStar(require("@yarn-tool/table"), exports);
/**
 * 導出版本差異著色功能
 * Export version difference coloring functionality
 */
var colorize_1 = require("@yarn-tool/semver-diff/lib/colorize");
Object.defineProperty(exports, "colorizeDiff", { enumerable: true, get: function () { return colorize_1.colorizeDiff; } });
//# sourceMappingURL=table.js.map