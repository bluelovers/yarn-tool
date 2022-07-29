"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.yargsProcessExit = exports.printRootData = exports.chalkByConsole = exports.lazyFlags = exports.filterYargsArguments = exports.pathEqual = exports.pathNormalize = exports.findRoot = exports.consoleDebug = exports.console = void 0;
const path = require("upath2");
const debug_color2_1 = require("debug-color2");
const util_1 = require("debug-color2/lib/util");
const package_dts_1 = require("@ts-type/package-dts");
const find_root_1 = require("@yarn-tool/find-root");
Object.defineProperty(exports, "findRoot", { enumerable: true, get: function () { return find_root_1.findRoot; } });
const yargs_util_1 = require("@yarn-tool/yargs-util");
Object.defineProperty(exports, "yargsProcessExit", { enumerable: true, get: function () { return yargs_util_1.yargsProcessExit; } });
const upath2_1 = require("upath2");
exports.console = new debug_color2_1.Console2();
exports.consoleDebug = new debug_color2_1.Console2(null, {
    label: true,
    time: true,
});
function pathNormalize(input) {
    return path.normalize(input);
}
exports.pathNormalize = pathNormalize;
function pathEqual(a, b) {
    return path.normalize(a) === path.normalize(b);
}
exports.pathEqual = pathEqual;
function filterYargsArguments(argv, list) {
    let ls = Object.entries(argv);
    if (Array.isArray(list)) {
        ls = ls
            .filter(([key, value]) => {
            return list.includes(key);
        });
    }
    else {
        ls = ls
            .filter(([key, value]) => {
            return list(key, value);
        });
    }
    return ls.reduce((a, [key, value]) => {
        // @ts-ignore
        a[key] = value;
        return a;
    }, {});
}
exports.filterYargsArguments = filterYargsArguments;
function lazyFlags(keys, argv) {
    return keys.reduce((a, key) => {
        if (argv[key]) {
            a.push('--' + key);
        }
        return a;
    }, []);
}
exports.lazyFlags = lazyFlags;
exports.chalkByConsole = (0, util_1.createFnChalkByConsole)(exports.console);
function printRootData(rootData, argv) {
    let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;
    let pkg_file = path.join(rootData.pkg, 'package.json');
    let pkg_data = (0, package_dts_1.readPackageJson)(pkg_file);
    (0, exports.chalkByConsole)((chalk, console) => {
        console.info([
            chalk.white(`Package:`),
            `${pkg_data.name}@${pkg_data.version}`,
            chalk.red((0, upath2_1.relative)(doWorkspace ? rootData.ws : argv.cwd, rootData.pkg)),
        ].join(' '));
    }, exports.consoleDebug);
}
exports.printRootData = printRootData;
exports.default = exports;
//# sourceMappingURL=index.js.map