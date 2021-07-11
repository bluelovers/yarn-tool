"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazySpawnArgvSlice = exports.commandDirJoin = exports.commandDirStrip = exports.basenameStrip = exports._dummyHandler = exports._dummyBuilder = exports.createCommandModuleExports = void 0;
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
exports.createCommandModuleExports = createCommandModuleExports;
function _dummyBuilder(yarg) {
    return yarg;
}
exports._dummyBuilder = _dummyBuilder;
function _dummyHandler(args) {
    return args;
}
exports._dummyHandler = _dummyHandler;
function basenameStrip(name) {
    return (0, upath2_1.basename)(name, (0, upath2_1.extname)(name));
}
exports.basenameStrip = basenameStrip;
function commandDirStrip(name, suffix = '_cmds') {
    return basenameStrip(name) + suffix;
}
exports.commandDirStrip = commandDirStrip;
function commandDirJoin(root, name, suffix = '_cmds') {
    return (0, upath2_1.join)(root, commandDirStrip(name, suffix));
}
exports.commandDirJoin = commandDirJoin;
function lazySpawnArgvSlice(options) {
    let cmd_list = (0, spawn_1.processArgvSlice)(options.command).argv;
    return (0, spawn_1.crossSpawnOther)(options.bin, [
        ...(Array.isArray(options.cmd) ? options.cmd : [options.cmd]),
        ...cmd_list,
    ], options.argv, options.crossSpawnOptions);
}
exports.lazySpawnArgvSlice = lazySpawnArgvSlice;
//# sourceMappingURL=cmd_dir.js.map