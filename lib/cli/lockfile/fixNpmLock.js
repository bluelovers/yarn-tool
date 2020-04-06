"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortDeps = exports.fixNpmLock = void 0;
/**
 * Created by user on 2020/3/31.
 */
const naturalCompare = require("string-natural-compare");
function fixNpmLock(npmLock) {
    if (npmLock.dependencies && typeof npmLock.dependencies === 'object') {
        let keys = sortDeps(npmLock.dependencies);
        for (let key of keys) {
            if (key === 'dependencies') {
                delete npmLock.dependencies[key];
                continue;
            }
            let entry = npmLock.dependencies[key];
            fixNpmLock(entry);
        }
    }
    if (npmLock.requires && typeof npmLock.requires === 'object') {
        sortDeps(npmLock.requires);
    }
    // @ts-ignore
    //delete npmLock.resolved;
    // @ts-ignore
    //delete npmLock.integrity;
    return npmLock;
}
exports.fixNpmLock = fixNpmLock;
function sortDeps(record) {
    let keys = Object.keys(record)
        .sort((a, b) => {
        let at1 = a.startsWith('@') ? 1 : 0;
        let at2 = b.startsWith('@') ? 1 : 0;
        let c = (at2 - at1);
        return c || naturalCompare(a, b);
    });
    for (let key of keys) {
        let old = record[key];
        delete record[key];
        record[key] = old;
    }
    return keys;
}
exports.sortDeps = sortDeps;
exports.default = fixNpmLock;
//# sourceMappingURL=fixNpmLock.js.map