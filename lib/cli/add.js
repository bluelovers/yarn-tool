"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by user on 2019/4/30.
 */
const index_1 = require("../index");
function flagsYarnAdd(argv) {
    return index_1.lazyFlags([
        'dev',
        'peer',
        'optional',
        'exact',
        'tilde',
        'ignore-workspace-root-check',
        'audit',
    ], argv);
}
exports.flagsYarnAdd = flagsYarnAdd;
exports.default = flagsYarnAdd;
//# sourceMappingURL=add.js.map