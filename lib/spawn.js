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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bhd24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGF3bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILGdEQUFpRDtBQUdqRCxtQ0FBZ0Q7QUFLaEQsU0FBZ0IsY0FBYyxDQUFDLElBQVk7SUFFMUMsSUFDQTtRQUNDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEMsSUFBSSxHQUFHLEVBQ1A7WUFDQyxPQUFPLEdBQUcsQ0FBQTtTQUNWO0tBQ0Q7SUFDRCxPQUFPLENBQUMsRUFDUjtLQUVDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBakJELHdDQWlCQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLElBTWpDO0lBRUEsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXhELElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxlQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELGVBQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUNqRCxlQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksQ0FBQyxVQUFVLElBQUksZ0JBQWdCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7UUFFOUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUNaO1lBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUNwQjtZQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFdBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDL0M7UUFFRCxPQUFPLElBQUks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RyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUU5QyxJQUFJLFVBQVUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRCxPQUFPO1FBQ04sVUFBVTtRQUNWLEdBQUc7UUFDSCxVQUFVO1FBQ1YsV0FBVztRQUNYLFVBQVU7UUFDVixJQUFJO1FBQ0osVUFBVTtRQUNWLEdBQUc7S0FDSCxDQUFDO0FBQ0gsQ0FBQztBQTFDRCw0Q0EwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTguXG4gKi9cblxuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi9jbGknO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBjb25zb2xlIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgQXJndW1lbnRzIH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgU3Bhd25TeW5jT3B0aW9ucyB9IGZyb20gJ2Nyb3NzLXNwYXduLWV4dHJhL3R5cGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZVJlc29sdmUobmFtZTogc3RyaW5nKVxue1xuXHR0cnlcblx0e1xuXHRcdGxldCByZXQgPSByZXF1aXJlLnJlc29sdmUobmFtZSk7XG5cblx0XHRpZiAocmV0KVxuXHRcdHtcblx0XHRcdHJldHVybiByZXRcblx0XHR9XG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja01vZGlsZUV4aXN0cyhhcmd2OiB7XG5cdG5hbWU6IHN0cmluZyxcblx0bXNnPzogc3RyaW5nLFxuXHRyZXF1aXJlTmFtZT86IHN0cmluZyxcblx0aW5zdGFsbENtZD86IHN0cmluZ1xuXHRwcm9jZXNzRXhpdD86IGJvb2xlYW4gfCBudW1iZXIsXG59KVxue1xuXHRsZXQgcmV0ID0gcmVxdWlyZVJlc29sdmUoYXJndi5yZXF1aXJlTmFtZSB8fCBhcmd2Lm5hbWUpO1xuXG5cdGlmICghcmV0KVxuXHR7XG5cdFx0Y29uc29sZS5tYWdlbnRhLmxvZyhgbW9kdWxlICcke2FyZ3YubmFtZX0nIG5vdCBleGlzdHNgKTtcblx0XHRjb25zb2xlLmxvZyhgcGxlYXNlIHVzZSBmb2xsb3cgY21kIGZvciBpbnN0YWxsYCk7XG5cdFx0Y29uc29sZS5jeWFuLmxvZyhgXFxuXFx0JHthcmd2Lmluc3RhbGxDbWQgfHwgJ25wbSBpbnN0YWxsIC1nJ30gJHthcmd2Lm5hbWV9XFxuYCk7XG5cblx0XHRpZiAoYXJndi5tc2cpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coYCR7YXJndi5tc2d9XFxuYCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YucHJvY2Vzc0V4aXQpXG5cdFx0e1xuXHRcdFx0cHJvY2Vzcy5leGl0KChhcmd2LnByb2Nlc3NFeGl0IGFzIG51bWJlcikgfCAwKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfY3Jvc3NTcGF3bk90aGVyPFQ+KGNwOiBUKVxue1xuXHQvLyBAdHMtaWdub3JlXG5cdGlmIChjcC5lcnJvcilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHR0aHJvdyBjcC5lcnJvclxuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRpZiAoY3Auc2lnbmFsKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnNvbGVEZWJ1Zy5lcnJvcihgY3Auc2lnbmFsYCwgY3Auc2lnbmFsKTtcblx0XHRwcm9jZXNzLmV4aXQoMSlcblx0fVxuXG5cdHJldHVybiBjcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzU3Bhd25PdGhlcihiaW46IHN0cmluZyxcblx0Y21kX2xpc3Q6IHN0cmluZ1tdLFxuXHRhcmd2OiBQYXJ0aWFsPEFyZ3VtZW50cz4gJiB7XG5cdFx0Y3dkOiBzdHJpbmdcblx0fSxcblx0Y3Jvc3NTcGF3bk9wdGlvbnM/OiBTcGF3blN5bmNPcHRpb25zXG4pXG57XG5cdC8vY29uc29sZURlYnVnLmRlYnVnKGJpbiwgY21kX2xpc3QpO1xuXG5cdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYyhiaW4sIGNtZF9saXN0LmZpbHRlcih2ID0+IHYgIT0gbnVsbCksIHtcblx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0Li4uY3Jvc3NTcGF3bk9wdGlvbnMsXG5cdH0pO1xuXG5cdHJldHVybiBfY3Jvc3NTcGF3bk90aGVyKGNwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzU3Bhd25PdGhlckFzeW5jKGJpbjogc3RyaW5nLCBjbWRfbGlzdDogc3RyaW5nW10sIGFyZ3YpXG57XG5cdC8vY29uc29sZURlYnVnLmRlYnVnKGJpbiwgY21kX2xpc3QpO1xuXG5cdHJldHVybiBjcm9zc1NwYXduLmFzeW5jKGJpbiwgY21kX2xpc3QuZmlsdGVyKHYgPT4gdiAhPSBudWxsKSwge1xuXHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0Y3dkOiBhcmd2LmN3ZCxcblx0fSlcblx0XHQudGFwKF9jcm9zc1NwYXduT3RoZXIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzQXJndlNsaWNlKGtleXNfaW5wdXQ6IHN0cmluZyB8IHN0cmluZ1tdLCBhcmd2X2lucHV0ID0gcHJvY2Vzcy5hcmd2LCBzdGFydGluZGV4OiBudW1iZXIgPSAyKVxue1xuXHRpZiAodHlwZW9mIGtleXNfaW5wdXQgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0a2V5c19pbnB1dCA9IFtrZXlzX2lucHV0XTtcblx0fVxuXG5cdGxldCBhcmd2X2JlZm9yZSA9IGFyZ3ZfaW5wdXQuc2xpY2UoMCwgc3RhcnRpbmRleCk7XG5cdGxldCBhcmd2X2FmdGVyID0gYXJndl9pbnB1dC5zbGljZShzdGFydGluZGV4KTtcblxuXHRsZXQgaWR4ID0ga2V5c19pbnB1dC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdHtcblx0XHRsZXQgaSA9IGFyZ3ZfYWZ0ZXIuaW5kZXhPZihiKTtcblxuXHRcdGlmIChhID09PSAtMSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gaTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoaSAhPT0gLTEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIE1hdGgubWluKGksIGEpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFcblx0fSwgLTEpO1xuXG5cblx0bGV0IGFyZ3YgPSAoaWR4ID4gLTEpID8gYXJndl9hZnRlci5zbGljZShpZHggKyAxKSA6IG51bGw7XG5cdGxldCBrZXkgPSAoaWR4ID4gLTEpID8gYXJndl9hZnRlcltpZHhdIDogbnVsbDtcblxuXHRsZXQgaWR4X3JlYmFzZSA9IChpZHggPiAtMSkgPyBpZHggKyBzdGFydGluZGV4IDogLTE7XG5cblx0cmV0dXJuIHtcblx0XHRpZHhfcmViYXNlLFxuXHRcdGlkeCxcblx0XHRhcmd2X2lucHV0LFxuXHRcdGFyZ3ZfYmVmb3JlLFxuXHRcdGFyZ3ZfYWZ0ZXIsXG5cdFx0YXJndixcblx0XHRrZXlzX2lucHV0LFxuXHRcdGtleSxcblx0fTtcbn1cbiJdfQ==