"use strict";
/**
 * Created by user on 2019/5/18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processArgvSlice = exports.crossSpawnOtherAsync = exports.crossSpawnOther = exports._crossSpawnOther = exports.checkModileExists = exports.requireResolve = void 0;
const crossSpawn = require("cross-spawn-extra");
const index_1 = require("./index");
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
exports.requireResolve = requireResolve;
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
exports.checkModileExists = checkModileExists;
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
exports._crossSpawnOther = _crossSpawnOther;
function crossSpawnOther(bin, cmd_list, argv, crossSpawnOptions) {
    //consoleDebug.debug(bin, cmd_list);
    let cp = crossSpawn.sync(bin, cmd_list.filter(v => v != null), {
        stdio: 'inherit',
        cwd: argv.cwd,
        ...crossSpawnOptions,
    });
    return _crossSpawnOther(cp);
}
exports.crossSpawnOther = crossSpawnOther;
function crossSpawnOtherAsync(bin, cmd_list, argv) {
    //consoleDebug.debug(bin, cmd_list);
    return crossSpawn.async(bin, cmd_list.filter(v => v != null), {
        stdio: 'inherit',
        cwd: argv.cwd,
    })
        .tap(_crossSpawnOther);
}
exports.crossSpawnOtherAsync = crossSpawnOtherAsync;
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
exports.processArgvSlice = processArgvSlice;
//# sourceMappingURL=spawn.js.map