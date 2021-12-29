"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJSONSync = exports.writePackageJson = exports.parsePackageJson = exports.readPackageJson = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs-extra"));
const package_dts_1 = require("@ts-type/package-dts");
Object.defineProperty(exports, "readPackageJson", { enumerable: true, get: function () { return package_dts_1.readPackageJson; } });
const fs_json_1 = require("@bluelovers/fs-json");
function parsePackageJson(text) {
    return JSON.parse(text);
}
exports.parsePackageJson = parsePackageJson;
function writePackageJson(file, data, options = {}) {
    let { spaces = 2 } = options;
    return (0, fs_json_1.writeJSONSync)(file, data, {
        ...options,
        spaces
    });
}
exports.writePackageJson = writePackageJson;
function writeJSONSync(file, data, options = {}) {
    let { spaces = 2 } = options;
    return fs.writeJSONSync(file, data, {
        ...options,
        spaces
    });
}
exports.writeJSONSync = writeJSONSync;
//# sourceMappingURL=pkg.js.map