"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupNcuToYargs2 = void 0;
const tslib_1 = require("tslib");
(0, tslib_1.__exportStar)(require("@yarn-tool/ncu"), exports);
const ncu_1 = require("@yarn-tool/ncu");
function setupNcuToYargs2(yargs) {
    return (0, ncu_1.setupNcuToYargs)(yargs)
        .option('resolutions', {
        alias: ['R'],
        desc: 'do with resolutions only',
        boolean: true,
    })
        .option('no-safe', {
        boolean: true,
    })
        .example(`$0 ncu -u`, `check new version and update package.json`)
        .example(`$0 ncu -R`, `check new version of resolutions in package.json`)
        .example(`$0 ncu -u -R`, `check new version of resolutions in package.json and update package.json`);
}
exports.setupNcuToYargs2 = setupNcuToYargs2;
exports.default = ncu_1.setupNcuToYargs;
//# sourceMappingURL=ncu.js.map