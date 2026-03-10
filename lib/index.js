"use strict";
/**
 * yarn-tool 核心功能模組
 * Core functionality module for yarn-tool
 *
 * @author user
 * @created 2019/4/30
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.yargsProcessExit = exports.chalkByConsole = exports.consoleDebug = exports.console = void 0;
exports.filterYargsArguments = filterYargsArguments;
exports.lazyFlags = lazyFlags;
exports.printRootData = printRootData;
const tslib_1 = require("tslib");
const upath2_1 = tslib_1.__importStar(require("upath2"));
const debug_color2_1 = require("debug-color2");
const util_1 = require("debug-color2/lib/util");
const package_dts_1 = require("@ts-type/package-dts");
const yargs_util_1 = require("@yarn-tool/yargs-util");
Object.defineProperty(exports, "yargsProcessExit", { enumerable: true, get: function () { return yargs_util_1.yargsProcessExit; } });
const pm_1 = require("./pm");
/**
 * 主要的控制台輸出實例
 * Main console output instance
 */
exports.console = new debug_color2_1.Console2();
/**
 * 調試用控制台輸出實例，包含標籤和時間戳
 * Debug console output instance with label and timestamp
 */
exports.consoleDebug = new debug_color2_1.Console2(null, {
    label: true,
    time: true,
});
/**
 * 過濾 Yargs 參數，只保留指定的鍵或符合條件的鍵值對
 * Filter Yargs arguments, keeping only specified keys or key-value pairs that meet conditions
 * @param argv Yargs 參數對象
 * @param list 鍵名列表或過濾函數
 * @returns 過濾後的參數對象
 */
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
/**
 * 根據布林值參數生成標誌陣列
 * Generate flag array based on boolean arguments
 * @param keys 標誌鍵名列表
 * @param argv 參數對象
 * @returns 標誌陣列
 */
function lazyFlags(keys, argv) {
    return keys.reduce((a, key) => {
        if (argv[key]) {
            a.push('--' + key);
        }
        return a;
    }, []);
}
/**
 * 基於控制台實例創建的 Chalk 實例
 * Chalk instance created based on console instance
 */
exports.chalkByConsole = (0, util_1.createFnChalkByConsole)(exports.console);
/**
 * 列印根目錄數據信息
 * Print root directory data information
 * @param rootData 根目錄數據
 * @param argv 參數對象
 */
function printRootData(rootData, argv) {
    let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;
    let pkg_file = upath2_1.default.join(rootData.pkg, 'package.json');
    let pkg_data = (0, package_dts_1.readPackageJson)(pkg_file);
    const { npmClients, pmIsYarn, pmMap } = (0, pm_1.detectPackageManager)(argv);
    (0, exports.chalkByConsole)((chalk, console) => {
        console.info([
            chalk.white(`Package:`),
            `${pkg_data.name}@${pkg_data.version}`,
            chalk.red((0, upath2_1.relative)(doWorkspace ? rootData.ws : argv.cwd, rootData.pkg)),
        ].join(' '));
        console.info([
            chalk.white(`npmClients:`),
            npmClients,
            chalk.red(pmMap[npmClients]),
        ].join(' '));
    }, exports.consoleDebug);
    exports.consoleDebug.dir(pmMap);
}
//# sourceMappingURL=index.js.map