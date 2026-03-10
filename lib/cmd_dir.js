"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommandModuleExports = createCommandModuleExports;
exports._dummyBuilder = _dummyBuilder;
exports._dummyHandler = _dummyHandler;
exports.basenameStrip = basenameStrip;
exports.commandDirStrip = commandDirStrip;
exports.commandDirJoin = commandDirJoin;
exports.lazySpawnArgvSlice = lazySpawnArgvSlice;
const upath2_1 = require("upath2");
const spawn_1 = require("./spawn");
/**
 * 創建命令模組導出對象
 * Create command module export object
 * @param module 命令模組配置
 * @returns 命令模組
 */
function createCommandModuleExports(module) {
    // @ts-ignore
    if (module.builder == null && module.handler == null) {
        // @ts-ignore
        throw new TypeError(`'builder' or 'handler' must exists, but got\nbuilder: ${module.builder}\nhandler: ${module.handler}`);
    }
    // @ts-ignore
    let { builder = _dummyBuilder, handler = _dummyHandler } = module;
    return {
        ...module,
        builder,
        handler,
    };
}
/**
 * 預設命令構建器
 * Default command builder
 * @param yarg Yargs 實例
 * @returns 原始 Yargs 實例
 */
function _dummyBuilder(yarg) {
    return yarg;
}
/**
 * 預設命令處理器
 * Default command handler
 * @param args 命令參數
 * @returns 原始參數
 */
function _dummyHandler(args) {
    return args;
}
/**
 * 去除文件擴展名的文件名
 * Filename without extension
 * @param name 文件名
 * @returns 去除擴展名的文件名
 */
function basenameStrip(name) {
    return (0, upath2_1.basename)(name, (0, upath2_1.extname)(name));
}
/**
 * 命令目錄名稱處理
 * Command directory name processing
 * @param name 目錄名稱
 * @param suffix 後綴
 * @returns 處理後的目錄名稱
 */
function commandDirStrip(name, suffix = '_cmds') {
    return basenameStrip(name) + suffix;
}
/**
 * 命令目錄路徑組合
 * Command directory path joining
 * @param root 根目錄
 * @param name 目錄名稱
 * @param suffix 後綴
 * @returns 組合後的路徑
 */
function commandDirJoin(root, name, suffix = '_cmds') {
    return (0, upath2_1.join)(root, commandDirStrip(name, suffix));
}
/**
 * 懶加載子進程參數切片
 * Lazy load child process argument slicing
 * @param options 選項配置
 * @returns 子進程執行結果
 */
function lazySpawnArgvSlice(options) {
    let cmd_list = (0, spawn_1.processArgvSlice)(options.command).argv;
    return (0, spawn_1.crossSpawnOther)(options.bin, [
        ...(Array.isArray(options.cmd) ? options.cmd : [options.cmd]),
        ...cmd_list,
    ], options.argv, options.crossSpawnOptions);
}
//# sourceMappingURL=cmd_dir.js.map