"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const findYarnWorkspaceRoot = require("find-yarn-workspace-root");
const pkgDir = require("pkg-dir");
const diff_service_1 = require("yarn-lock-diff/lib/diff-service");
const formatter_1 = require("yarn-lock-diff/lib/formatter");
const debug_color2_1 = require("debug-color2");
const path = require("path");
const fs = require("fs-extra");
exports.console = new debug_color2_1.Console2();
exports.consoleDebug = new debug_color2_1.Console2(null, {
    label: true,
    time: true,
});
function findRoot(options, throwError) {
    let hasWorkspace;
    if (!options.skipCheckWorkspace) {
        hasWorkspace = findYarnWorkspaceRoot(options.cwd);
    }
    let pkg = pkgDir.sync(options.cwd);
    if (pkg == null && (options.throwError || (options.throwError == null && throwError))) {
        let err = new TypeError(`can't found package root from target directory '${options.cwd}'`);
        throw err;
    }
    return {
        pkg,
        ws: hasWorkspace,
        root: hasWorkspace == null ? pkg : hasWorkspace,
    };
}
exports.findRoot = findRoot;
function yarnLockDiff(yarnlock_old, yarnlock_new) {
    let r2 = [];
    let r = diff_service_1.DiffService.buildDiff([yarnlock_old], [yarnlock_new])
        .map(formatter_1.FormatterService.buildDiffTable)
        .map(r => r2.push(r));
    return r2[0];
}
exports.yarnLockDiff = yarnLockDiff;
function fsYarnLock(root) {
    let yarnlock_file = path.join(root, 'yarn.lock');
    let yarnlock_exists = fs.existsSync(yarnlock_file);
    let yarnlock_old = yarnlock_exists && fs.readFileSync(yarnlock_file, 'utf8');
    return {
        yarnlock_file,
        yarnlock_exists,
        yarnlock_old,
    };
}
exports.fsYarnLock = fsYarnLock;
function lazyFlags(keys, argv) {
    return keys.map(key => argv[key] && '--' + key);
}
exports.lazyFlags = lazyFlags;
exports.default = exports;
//# sourceMappingURL=index.js.map