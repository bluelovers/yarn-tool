"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummy_builder = dummy_builder;
exports.dummy_handler = dummy_handler;
exports.create_command = create_command;
exports.call_commond = call_commond;
exports.create_command2 = create_command2;
const cached_command = {};
function dummy_builder(yarg) {
    return yarg;
}
function dummy_handler(args) {
    return args;
}
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
function call_commond(yarg, commond, argv) {
    // @ts-ignore
    return cached_command[commond].handler(argv !== null && argv !== void 0 ? argv : yarg.argv);
}
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