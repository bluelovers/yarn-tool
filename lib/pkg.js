"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJSONSync = exports.writePackageJson = exports.parsePackageJson = exports.readPackageJson = void 0;
const fs = require("fs-extra");
const package_dts_1 = require("@ts-type/package-dts");
Object.defineProperty(exports, "readPackageJson", { enumerable: true, get: function () { return package_dts_1.readPackageJson; } });
function parsePackageJson(text) {
    return JSON.parse(text);
}
exports.parsePackageJson = parsePackageJson;
function writePackageJson(file, data, options = {}) {
    let { spaces = 2 } = options;
    return fs.writeJSONSync(file, data, {
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