"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_deduplicate_1 = require("yarn-deduplicate");
const index_1 = require("../index");
const fs = require("fs-extra");
const path = require("path");
function Dedupe(yarnlock_old) {
    let yarnlock_new = yarn_deduplicate_1.fixDuplicates(yarnlock_old);
    return {
        /**
         * 執行前的 yarn.lock
         */
        yarnlock_old,
        /**
         * 執行後的 yarn.lock
         */
        yarnlock_new,
        /**
         * yarn.lock 是否有變動
         */
        yarnlock_changed: yarnlock_old !== yarnlock_new,
    };
}
exports.Dedupe = Dedupe;
function wrapDedupe(yarg, argv, options) {
    // @ts-ignore
    let cache = options.cache || {};
    // @ts-ignore
    cache.cwd = cache.cwd || argv.cwd;
    if (!cache.cwd) {
        throw new TypeError(`cache.cwd is '${cache.cwd}'`);
    }
    // @ts-ignore
    cache.cwd = path.resolve(cache.cwd);
    // @ts-ignore
    cache.ret = {};
    cache.yarnlock_msg = undefined;
    // @ts-ignore
    cache.console = cache.console || index_1.console;
    // @ts-ignore
    cache.consoleDebug = cache.consoleDebug || index_1.consoleDebug;
    let { init, before, main, after, end } = options;
    // @ts-ignore
    cache.rootData = cache.rootData || index_1.findRoot({
        ...argv,
        cwd: cache.cwd,
    }, true);
    // @ts-ignore
    cache.yarnlock_cache = cache.yarnlock_cache || index_1.fsYarnLock(cache.rootData.root);
    // @ts-ignore
    cache.yarnlock_old = cache.yarnlock_cache.yarnlock_old;
    // @ts-ignore
    cache.yarnlock_old_exists = cache.yarnlock_cache.yarnlock_exists;
    LABEL1: {
        // @ts-ignore
        cache.ret.init = init ? !!init(yarg, argv, cache) : null;
        if (cache.ret.init) {
            break LABEL1;
        }
        // @ts-ignore
        cache.ret.before = before ? !!before(yarg, argv, cache) : null;
        if (cache.ret.before) {
            break LABEL1;
        }
        cache.yarnlock_cache = index_1.fsYarnLock(cache.rootData.root);
        if (cache.yarnlock_cache.yarnlock_exists) {
            let ret1 = Dedupe(cache.yarnlock_cache.yarnlock_old);
            if (ret1.yarnlock_changed) {
                fs.writeFileSync(cache.yarnlock_cache.yarnlock_file, ret1.yarnlock_new);
                let msg = index_1.yarnLockDiff(ret1.yarnlock_old, ret1.yarnlock_new);
                if (msg) {
                    cache.yarnlock_msg = msg;
                }
                cache.yarnlock_changed = true;
                cache.yarnlock_cache.yarnlock_old = ret1.yarnlock_new;
                index_1.consoleDebug.info(`Deduplication yarn.lock`);
                index_1.consoleDebug.gray.info(`${cache.yarnlock_cache.yarnlock_file}`);
            }
        }
        // @ts-ignore
        cache.ret.main = !!main(yarg, argv, cache);
        if (cache.ret.main) {
            break LABEL1;
        }
        cache.yarnlock_cache = index_1.fsYarnLock(cache.rootData.root);
        if (cache.yarnlock_cache.yarnlock_exists) {
            let ret1 = Dedupe(cache.yarnlock_cache.yarnlock_old);
            if (ret1.yarnlock_changed) {
                fs.writeFileSync(cache.yarnlock_cache.yarnlock_file, ret1.yarnlock_new);
                let msg = index_1.yarnLockDiff(ret1.yarnlock_old, ret1.yarnlock_new);
                if (msg) {
                    cache.yarnlock_msg = msg;
                }
                cache.yarnlock_changed = true;
                cache.yarnlock_cache.yarnlock_old = ret1.yarnlock_new;
                index_1.consoleDebug.info(`Deduplication yarn.lock`);
                index_1.consoleDebug.gray.info(`${cache.yarnlock_cache.yarnlock_file}`);
            }
            else if (cache.yarnlock_changed == null) {
                cache.yarnlock_changed = ret1.yarnlock_changed;
            }
        }
        if (cache.yarnlock_changed) {
            if (!cache.yarnlock_cache.yarnlock_exists || !cache.yarnlock_old || cache.yarnlock_old == cache.yarnlock_cache.yarnlock_old) {
                cache.yarnlock_changed = false;
            }
        }
        // @ts-ignore
        cache.ret.after = after ? !!after(yarg, argv, cache) : null;
        if (cache.ret.after) {
            break LABEL1;
        }
        if (cache.yarnlock_changed) {
            let msg = index_1.yarnLockDiff(cache.yarnlock_old, cache.yarnlock_cache.yarnlock_old);
            if (msg) {
                cache.yarnlock_msg = msg;
            }
        }
    }
    // @ts-ignore
    cache.ret.end = end ? !!end(yarg, argv, cache) : null;
    return {
        cwd: cache.cwd,
        rootData: cache.rootData,
        yarg,
        argv,
        cache,
    };
}
exports.wrapDedupe = wrapDedupe;
function infoFromDedupeCache(cache) {
    let { yarnlock_changed, yarnlock_old_exists } = cache;
    let { yarnlock_file, yarnlock_exists } = cache.yarnlock_cache;
    return {
        ...cache.rootData,
        yarnlock_file,
        yarnlock_old_exists,
        yarnlock_exists,
        yarnlock_changed,
    };
}
exports.infoFromDedupeCache = infoFromDedupeCache;
exports.default = Dedupe;
/*
wrapDedupe(null, null, {
    cache: {
        cwd: '.',
    },
    main(yarg, argv, cache)
    {
        console.log(yarg, argv, cache);

        return true;
    }
});
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFHSCx1REFBaUQ7QUFDakQsb0NBQXFGO0FBQ3JGLCtCQUFnQztBQUVoQyw2QkFBOEI7QUFFOUIsU0FBZ0IsTUFBTSxDQUFDLFlBQW9CO0lBRTFDLElBQUksWUFBWSxHQUFXLGdDQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFdkQsT0FBTztRQUNOOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsZ0JBQWdCLEVBQUUsWUFBWSxLQUFLLFlBQVk7S0FDL0MsQ0FBQTtBQUNGLENBQUM7QUFsQkQsd0JBa0JDO0FBb0RELFNBQWdCLFVBQVUsQ0FNSyxJQUFtQixFQUFFLElBQXdCLEVBQUUsT0FvQzdFO0lBRUEsYUFBYTtJQUNiLElBQUksS0FBSyxHQUFNLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO0lBRW5DLGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUlsQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFDZDtRQUNDLE1BQU0sSUFBSSxTQUFTLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0tBQ2xEO0lBRUQsYUFBYTtJQUNiLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFcEMsYUFBYTtJQUNiLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBRWYsS0FBSyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7SUFFL0IsYUFBYTtJQUNiLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxlQUFPLENBQUM7SUFDekMsYUFBYTtJQUNiLEtB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Q2pCLGFBQWE7UUFDYixtQkFBbUI7UUFDbkIsZUFBZTtRQUNmLGdCQUFnQjtLQUNoQixDQUFDO0FBQ0gsQ0FBQztBQWJELGtEQWFDO0FBRUQsa0JBQWUsTUFBTSxDQUFDO0FBRXRCOzs7Ozs7Ozs7Ozs7RUFZRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHsgZml4RHVwbGljYXRlcyB9IGZyb20gJ3lhcm4tZGVkdXBsaWNhdGUnO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jaywgeWFybkxvY2tEaWZmIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IENvbnNvbGUyIH0gZnJvbSAnZGVidWctY29sb3IyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gRGVkdXBlKHlhcm5sb2NrX29sZDogc3RyaW5nKVxue1xuXHRsZXQgeWFybmxvY2tfbmV3OiBzdHJpbmcgPSBmaXhEdXBsaWNhdGVzKHlhcm5sb2NrX29sZCk7XG5cblx0cmV0dXJuIHtcblx0XHQvKipcblx0XHQgKiDln7fooYzliY3nmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfb2xkLFxuXHRcdC8qKlxuXHRcdCAqIOWft+ihjOW+jOeahCB5YXJuLmxvY2tcblx0XHQgKi9cblx0XHR5YXJubG9ja19uZXcsXG5cdFx0LyoqXG5cdFx0ICogeWFybi5sb2NrIOaYr+WQpuacieiuiuWLlVxuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX2NoYW5nZWQ6IHlhcm5sb2NrX29sZCAhPT0geWFybmxvY2tfbmV3LFxuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdyYXBEZWR1cGVDYWNoZVxue1xuXHQvKipcblx0ICog5aaC5p6c5LiN5a2Y5Zyo5YmH562J5pa8IGFyZ3YuY3dkXG5cdCAqL1xuXHRyZWFkb25seSBjd2Q/OiBzdHJpbmcsXG5cblx0cmVhZG9ubHkgcm9vdERhdGE/OiBSZXR1cm5UeXBlPHR5cGVvZiBmaW5kUm9vdD4sXG5cblx0LyoqXG5cdCAqIOebruWJjeeahCB5YXJuLmxvY2sg54uA5oWLKOmaqOatpempn+abtOWLleeLgOaFiylcblx0ICovXG5cdHlhcm5sb2NrX2NhY2hlPzogUmV0dXJuVHlwZTx0eXBlb2YgZnNZYXJuTG9jaz5cblxuXHQvKipcblx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9ja1xuXHQgKi9cblx0cmVhZG9ubHkgeWFybmxvY2tfb2xkPzogc3RyaW5nLFxuXHQvKipcblx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9jayDmmK/lkKblrZjlnKhcblx0ICovXG5cdHJlYWRvbmx5IHlhcm5sb2NrX29sZF9leGlzdHM/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiB5YXJuLmxvY2sg5piv5ZCm5pyJ6K6K5YuVXG5cdCAqL1xuXHR5YXJubG9ja19jaGFuZ2VkPzogYm9vbGVhbixcblxuXHQvKipcblx0ICog5pyA5b6M5LiA5qyh55qEIHlhcm4ubG9jayBkaWZmIOioiuaBr1xuXHQgKi9cblx0eWFybmxvY2tfbXNnPzogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiDmr4/lgIvmraXpqZ/nmoTni4DmhYsgdHJ1ZSDku6PooajkuK3mlrfmiYDmnInmraXpqZ9cblx0ICogbnVsbCDku6PooajmraTmraXpqZ/kuI3lrZjlnKhcblx0ICogdm9pZC91bmRlZmluZWQg5Luj6KGo5q2k5q2l6amf5pyq5Z+36KGMXG5cdCAqL1xuXHRyZWFkb25seSByZXQ6IHtcblx0XHRyZWFkb25seSBpbml0OiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdFx0cmVhZG9ubHkgYmVmb3JlOiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdFx0cmVhZG9ubHkgbWFpbjogYm9vbGVhbiB8IHZvaWQgfCBudWxsLFxuXHRcdHJlYWRvbmx5IGFmdGVyOiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdH0sXG5cblx0cmVhZG9ubHkgY29uc29sZURlYnVnPzogQ29uc29sZTIsXG5cdHJlYWRvbmx5IGNvbnNvbGU/OiBDb25zb2xlMixcblxuXHRbazogc3RyaW5nXTogdW5rbm93blxufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcERlZHVwZTxUIGV4dGVuZHMge1xuXHRjd2Q/OiBzdHJpbmcsXG5cdFtrOiBzdHJpbmddOiB1bmtub3duLFxufSwgVSBleHRlbmRzIFQgfCB7XG5cdGN3ZDogc3RyaW5nLFxuXHRbazogc3RyaW5nXTogdW5rbm93bixcbn0sIEMgZXh0ZW5kcyBJV3JhcERlZHVwZUNhY2hlPih5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIG9wdGlvbnM6IHtcblxuXHQvKipcblx0ICog5aaC5p6c5Yid5aeL5YyW5rKS5pyJ55m855Sf6Yyv6KqkIOatpOatpempn+W/heWumuWft+ihjFxuXHQgKi9cblx0aW5pdD8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmlrwg56ys5LiA5qyhIERlZHVwZSDliY3nmoTmraXpqZ9cblx0ICovXG5cdGJlZm9yZT8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmraTmraXpqZ/ngrrlv4XopoHpgbjpoIVcblx0ICovXG5cdG1haW4oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmlrwg56ys5LqM5qyhIERlZHVwZSDlvoznmoTmraXpqZ9cblx0ICovXG5cdGFmdGVyPyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOaWvCDnrKzkuozmrKEgRGVkdXBlIOW+jOeahOatpempn1xuXHQgKi9cblx0YWZ0ZXI/KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5aaC5p6c57WQ5p2f5YmN5rKS5pyJ55m855Sf6Yyv6KqkIOatpOatpempn+W/heWumuWft+ihjFxuXHQgKi9cblx0ZW5kPyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOatpempn+mWk+WFseS6q+eahOe3qeWtmOizh+ioiuS4puS4lOacg+W9semfv+mDqOWIhuihjOeCulxuXHQgKi9cblx0Y2FjaGU/OiBQYXJ0aWFsPEM+XG59KVxue1xuXHQvLyBAdHMtaWdub3JlXG5cdGxldCBjYWNoZTogQyA9IG9wdGlvbnMuY2FjaGUgfHwge307XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5jd2QgPSBjYWNoZS5jd2QgfHwgYXJndi5jd2Q7XG5cblxuXG5cdGlmICghY2FjaGUuY3dkKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgY2FjaGUuY3dkIGlzICcke2NhY2hlLmN3ZH0nYClcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUuY3dkID0gcGF0aC5yZXNvbHZlKGNhY2hlLmN3ZCk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5yZXQgPSB7fTtcblxuXHRjYWNoZS55YXJubG9ja19tc2cgPSB1bmRlZmluZWQ7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5jb25zb2xlID0gY2FjaGUuY29uc29sZSB8fCBjb25zb2xlO1xuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLmNvbnNvbGVEZWJ1ZyA9IGNhY2hlLmNvbnNvbGVEZWJ1ZyB8fCBjb25zb2xlRGVidWc7XG5cblx0bGV0IHsgaW5pdCwgYmVmb3JlLCBtYWluLCBhZnRlciwgZW5kIH0gPSBvcHRpb25zO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUucm9vdERhdGEgPSBjYWNoZS5yb290RGF0YSB8fCBmaW5kUm9vdCh7XG5cdFx0Li4uYXJndixcblx0XHRjd2Q6IGNhY2hlLmN3ZCxcblx0fSwgdHJ1ZSk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS55YXJubG9ja19jYWNoZSA9IGNhY2hlLnlhcm5sb2NrX2NhY2hlIHx8IGZzWWFybkxvY2soY2FjaGUucm9vdERhdGEucm9vdCk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS55YXJubG9ja19vbGQgPSBjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQ7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS55YXJubG9ja19vbGRfZXhpc3RzID0gY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzO1xuXG5cdExBQkVMMToge1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNhY2hlLnJldC5pbml0ID0gaW5pdCA/ICEhaW5pdCh5YXJnLCBhcmd2LCBjYWNoZSkgOiBudWxsO1xuXG5cdFx0aWYgKGNhY2hlLnJldC5pbml0KVxuXHRcdHtcblx0XHRcdGJyZWFrIExBQkVMMTtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FjaGUucmV0LmJlZm9yZSA9IGJlZm9yZSA/ICEhYmVmb3JlKHlhcmcsIGFyZ3YsIGNhY2hlKSA6IG51bGw7XG5cdFx0aWYgKGNhY2hlLnJldC5iZWZvcmUpXG5cdFx0e1xuXHRcdFx0YnJlYWsgTEFCRUwxO1xuXHRcdH1cblxuXHRcdGNhY2hlLnlhcm5sb2NrX2NhY2hlID0gZnNZYXJuTG9jayhjYWNoZS5yb290RGF0YS5yb290KTtcblxuXHRcdGlmIChjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19leGlzdHMpXG5cdFx0e1xuXHRcdFx0bGV0IHJldDEgPSBEZWR1cGUoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkKTtcblxuXHRcdFx0aWYgKHJldDEueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyhjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlLCByZXQxLnlhcm5sb2NrX25ldyk7XG5cblx0XHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihyZXQxLnlhcm5sb2NrX29sZCwgcmV0MS55YXJubG9ja19uZXcpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19tc2cgPSBtc2c7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQgPSByZXQxLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgRGVkdXBsaWNhdGlvbiB5YXJuLmxvY2tgKTtcblx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuaW5mbyhgJHtjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlfWApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjYWNoZS5yZXQubWFpbiA9ICEhbWFpbih5YXJnLCBhcmd2LCBjYWNoZSk7XG5cdFx0aWYgKGNhY2hlLnJldC5tYWluKVxuXHRcdHtcblx0XHRcdGJyZWFrIExBQkVMMTtcblx0XHR9XG5cblx0XHRjYWNoZS55YXJubG9ja19jYWNoZSA9IGZzWWFybkxvY2soY2FjaGUucm9vdERhdGEucm9vdCk7XG5cblx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzKVxuXHRcdHtcblx0XHRcdGxldCByZXQxID0gRGVkdXBlKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdGlmIChyZXQxLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZSwgcmV0MS55YXJubG9ja19uZXcpO1xuXG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYocmV0MS55YXJubG9ja19vbGQsIHJldDEueWFybmxvY2tfbmV3KTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfbXNnID0gbXNnO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkID0gcmV0MS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5ncmF5LmluZm8oYCR7Y2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZX1gKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IHJldDEueWFybmxvY2tfY2hhbmdlZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2hhbmdlZClcblx0XHR7XG5cdFx0XHRpZiAoIWNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2V4aXN0cyB8fCAhY2FjaGUueWFybmxvY2tfb2xkIHx8IGNhY2hlLnlhcm5sb2NrX29sZCA9PSBjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQpXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FjaGUucmV0LmFmdGVyID0gYWZ0ZXIgPyAhIWFmdGVyKHlhcmcsIGFyZ3YsIGNhY2hlKSA6IG51bGw7XG5cdFx0aWYgKGNhY2hlLnJldC5hZnRlcilcblx0XHR7XG5cdFx0XHRicmVhayBMQUJFTDE7XG5cdFx0fVxuXG5cdFx0aWYgKGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0e1xuXHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihjYWNoZS55YXJubG9ja19vbGQsIGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdGlmIChtc2cpXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX21zZyA9IG1zZztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnJldC5lbmQgPSBlbmQgPyAhIWVuZCh5YXJnLCBhcmd2LCBjYWNoZSkgOiBudWxsO1xuXG5cdHJldHVybiB7XG5cdFx0Y3dkOiBjYWNoZS5jd2QsXG5cdFx0cm9vdERhdGE6IGNhY2hlLnJvb3REYXRhLFxuXHRcdHlhcmcsXG5cdFx0YXJndixcblx0XHRjYWNoZSxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mb0Zyb21EZWR1cGVDYWNoZTxDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oY2FjaGU6IEMpXG57XG5cdGxldCB7IHlhcm5sb2NrX2NoYW5nZWQsIHlhcm5sb2NrX29sZF9leGlzdHMgfSA9IGNhY2hlO1xuXG5cdGxldCB7IHlhcm5sb2NrX2ZpbGUsIHlhcm5sb2NrX2V4aXN0cyB9ID0gY2FjaGUueWFybmxvY2tfY2FjaGU7XG5cblx0cmV0dXJuIHtcblx0XHQuLi5jYWNoZS5yb290RGF0YSxcblx0XHR5YXJubG9ja19maWxlLFxuXHRcdHlhcm5sb2NrX29sZF9leGlzdHMsXG5cdFx0eWFybmxvY2tfZXhpc3RzLFxuXHRcdHlhcm5sb2NrX2NoYW5nZWQsXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IERlZHVwZTtcblxuLypcbndyYXBEZWR1cGUobnVsbCwgbnVsbCwge1xuXHRjYWNoZToge1xuXHRcdGN3ZDogJy4nLFxuXHR9LFxuXHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coeWFyZywgYXJndiwgY2FjaGUpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn0pO1xuKi9cbiJdfQ==