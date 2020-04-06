"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_command2 = exports.call_commond = exports.create_command = exports.dummy_handler = exports.dummy_builder = void 0;
const cached_command = {};
function dummy_builder(yarg) {
    return yarg;
}
exports.dummy_builder = dummy_builder;
function dummy_handler(args) {
    return args;
}
exports.dummy_handler = dummy_handler;
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
exports.create_command = create_command;
function call_commond(yarg, commond, argv) {
    return cached_command[commond].handler(argv == null ? yarg.argv : argv);
}
exports.call_commond = call_commond;
function create_command2(conf) {
    // @ts-ignore
    let { handler = dummy_handler, builder = dummy_builder, desc } = conf;
    let { describe = desc } = conf;
    let opts = {
        ...conf,
        // @ts-ignore
        builder,
        handler,
        describe,
    };
    let command;
    if (Array.isArray(command)) {
        let cmd = command[0];
        cached_command[cmd] = opts;
        command.slice(1).forEach(c => cached_command[c] = cached_command[cmd]);
    }
    else {
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
exports.create_command2 = create_command2;
//# sourceMappingURL=cli.js.map