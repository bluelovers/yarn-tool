"use strict";
/**
 * 子進程執行工具模組
 * Child process execution utilities
 *
 * @author user
 * @created 2019/5/18
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireResolve = requireResolve;
exports.checkModileExists = checkModileExists;
exports._crossSpawnOther = _crossSpawnOther;
exports.crossSpawnOther = crossSpawnOther;
exports.crossSpawnOtherAsync = crossSpawnOtherAsync;
exports.processArgvSlice = processArgvSlice;
const tslib_1 = require("tslib");
const cross_spawn_extra_1 = tslib_1.__importDefault(require("cross-spawn-extra"));
const index_1 = require("./index");
/**
 * 安全解析模組路徑
 * Safely resolve module path
 * @param name 模組名稱
 * @returns 模組路徑或 null
 */
function requireResolve(name) {
    try {
        let ret = require.resolve(name);
        if (ret) {
            return ret;
        }
    }
    catch (e) {
    }
    return null;
}
/**
 * 檢查模組是否存在，若不存在則提示安裝
 * Check if module exists, prompt installation if not
 * @param argv 檢查配置對象
 * @returns 模組路徑或 null
 */
function checkModileExists(argv) {
    let ret = requireResolve(argv.requireName || argv.name);
    if (!ret) {
        index_1.console.magenta.log(`module '${argv.name}' not exists`);
        index_1.console.log(`please use follow cmd for install`);
        index_1.console.cyan.log(`\n\t${argv.installCmd || 'npm install -g'} ${argv.name}\n`);
        if (argv.msg) {
            index_1.console.log(`${argv.msg}\n`);
        }
        if (argv.processExit) {
            process.exit(argv.processExit | 0);
        }
        return null;
    }
    return ret;
}
/**
 * 處理子進程執行結果
 * Handle child process execution result
 * @param cp 子進程執行結果
 * @returns 原始結果或拋出錯誤
 */
function _crossSpawnOther(cp) {
    // @ts-ignore
    if (cp.error) {
        // @ts-ignore
        throw cp.error;
    }
    // @ts-ignore
    if (cp.signal) {
        // @ts-ignore
        index_1.consoleDebug.error(`cp.signal`, cp.signal);
        process.exit(1);
    }
    return cp;
}
/**
 * 同步執行子進程命令
 * Synchronously execute child process command
 * @param bin 可執行文件路徑
 * @param cmd_list 命令參數列表
 * @param argv 參數對象
 * @param crossSpawnOptions 子進程選項
 * @returns 子進程執行結果
 */
function crossSpawnOther(bin, cmd_list, argv, crossSpawnOptions) {
    //consoleDebug.debug(bin, cmd_list);
    let cp = cross_spawn_extra_1.default.sync(bin, cmd_list.filter(v => v != null), {
        stdio: 'inherit',
        cwd: argv.cwd,
        ...crossSpawnOptions,
    });
    return _crossSpawnOther(cp);
}
/**
 * 異步執行子進程命令
 * Asynchronously execute child process command
 * @param bin 可執行文件路徑
 * @param cmd_list 命令參數列表
 * @param argv 參數對象
 * @returns 子進程執行結果的 Promise
 */
function crossSpawnOtherAsync(bin, cmd_list, argv) {
    //consoleDebug.debug(bin, cmd_list);
    return cross_spawn_extra_1.default.async(bin, cmd_list.filter(v => v != null), {
        stdio: 'inherit',
        cwd: argv.cwd,
    })
        .tap(_crossSpawnOther);
}
/**
 * 處理命令行參數切片
 * Process command line argument slicing
 * @param keys_input 鍵名或鍵名列表
 * @param argv_input 原始參數數組
 * @param startindex 開始索引
 * @returns 處理後的參數信息對象
 */
function processArgvSlice(keys_input, argv_input = process.argv, startindex = 2) {
    if (typeof keys_input === 'string') {
        keys_input = [keys_input];
    }
    let argv_before = argv_input.slice(0, startindex);
    let argv_after = argv_input.slice(startindex);
    let idx = keys_input.reduce(function (a, b) {
        let i = argv_after.indexOf(b);
        if (a === -1) {
            return i;
        }
        else if (i !== -1) {
            return Math.min(i, a);
        }
        return a;
    }, -1);
    let argv = (idx > -1) ? argv_after.slice(idx + 1) : null;
    let key = (idx > -1) ? argv_after[idx] : null;
    let idx_rebase = (idx > -1) ? idx + startindex : -1;
    return {
        idx_rebase,
        idx,
        argv_input,
        argv_before,
        argv_after,
        argv,
        keys_input,
        key,
    };
}
//# sourceMappingURL=spawn.js.map