"use strict";
/**
 * Yargs 命令模組工具
 * Yargs command module utilities
 *
 * @author user
 * @created 2019/5/17
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummy_builder = dummy_builder;
exports.dummy_handler = dummy_handler;
exports.create_command = create_command;
exports.call_commond = call_commond;
exports.create_command2 = create_command2;
/**
 * 緩存的命令模組對象
 * Cached command module object
 */
const cached_command = {};
/**
 * 預設的命令構建器，不做任何修改
 * Default command builder that does nothing
 * @param yarg Yargs 實例
 * @returns 原始的 Yargs 實例
 */
function dummy_builder(yarg) {
    return yarg;
}
/**
 * 預設的命令處理器，直接返回參數
 * Default command handler that returns arguments directly
 * @param args 命令參數
 * @returns 原始參數
 */
function dummy_handler(args) {
    return args;
}
/**
 * 創建命令模組
 * Create a command module
 * @param yarg Yargs 實例
 * @param command 命令名稱
 * @param handler 命令處理器
 * @param builder 命令構建器
 * @returns 命令構建器和處理器的元組
 */
function create_command(yarg, command, handler, builder) {
    // @ts-ignore
    builder = builder || dummy_builder;
    cached_command[command] = {
        // @ts-ignore
        builder,
        // @ts-ignore
        handler,
    };
    return [builder, handler];
}
/**
 * 調用已緩存的命令
 * Call a cached command
 * @param yarg Yargs 實例
 * @param commond 命令名稱
 * @param argv 可選的參數對象
 * @returns 命令執行結果
 */
function call_commond(yarg, commond, argv) {
    // @ts-ignore
    return cached_command[commond].handler(argv !== null && argv !== void 0 ? argv : yarg.argv);
}
/**
 * 創建命令模組（增強版）
 * Create a command module (enhanced version)
 * @param conf 命令配置對象
 * @returns Yargs 命令模組
 */
function create_command2(conf) {
    // @ts-ignore
    let { handler = dummy_handler, builder = dummy_builder, desc } = conf;
    let { describe = desc } = conf;
    let opts = {
        // @ts-ignore
        ...conf,
        // @ts-ignore
        builder,
        // @ts-ignore
        handler,
        describe,
    };
    let command;
    if (Array.isArray(command)) {
        let cmd = command[0];
        // @ts-ignore
        cached_command[cmd] = opts;
        command.slice(1).forEach(c => cached_command[c] = cached_command[cmd]);
    }
    else {
        // @ts-ignore
        cached_command[command] = opts;
    }
    _delete(opts);
    function _delete(opts) {
        // @ts-ignore
        delete opts.yarg;
        delete opts.desc;
    }
    return opts;
}
//# sourceMappingURL=cli.js.map