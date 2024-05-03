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
function _dummyBuilder(yarg) {
    return yarg;
}
function _dummyHandler(args) {
    return args;
}
function basenameStrip(name) {
    return (0, upath2_1.basename)(name, (0, upath2_1.extname)(name));
}
function commandDirStrip(name, suffix = '_cmds') {
    return basenameStrip(name) + suffix;
}
function commandDirJoin(root, name, suffix = '_cmds') {
    return (0, upath2_1.join)(root, commandDirStrip(name, suffix));
}
function lazySpawnArgvSlice(options) {
    let cmd_list = (0, spawn_1.processArgvSlice)(options.command).argv;
    return (0, spawn_1.crossSpawnOther)(options.bin, [
        ...(Array.isArray(options.cmd) ? options.cmd : [options.cmd]),
        ...cmd_list,
    ], options.argv, options.crossSpawnOptions);
}
//# sourceMappingURL=cmd_dir.js.map