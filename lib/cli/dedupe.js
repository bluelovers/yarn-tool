"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoFromDedupeCache = exports.wrapDedupe = exports.Dedupe = void 0;
const yarn_deduplicate_1 = require("yarn-deduplicate");
const index_1 = require("../index");
const fs = require("fs-extra");
const path = require("upath2");
const yarnlock_1 = require("../yarnlock");
function Dedupe(yarnlock_old) {
    let yarnlock_new = yarn_deduplicate_1.fixDuplicates(yarnlock_old, {
    //useMostCommon: true,
    });
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
    cache.yarnlock_old2 = cache.yarnlock_old;
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
                let msg = yarnlock_1.yarnLockDiff(ret1.yarnlock_old, ret1.yarnlock_new);
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
                if (cache.yarnlock_old2 == null) {
                    cache.yarnlock_old2 = ret1.yarnlock_old;
                }
                fs.writeFileSync(cache.yarnlock_cache.yarnlock_file, ret1.yarnlock_new);
                let msg = yarnlock_1.yarnLockDiff(ret1.yarnlock_old, ret1.yarnlock_new);
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
        cache.yarnlock_cache = index_1.fsYarnLock(cache.rootData.root);
        if (cache.yarnlock_cache.yarnlock_exists) {
            if (cache.yarnlock_changed) {
                let msg = yarnlock_1.yarnLockDiff(cache.yarnlock_old || cache.yarnlock_old2, cache.yarnlock_cache.yarnlock_old);
                if (msg) {
                    cache.yarnlock_msg = msg;
                }
            }
            else {
                let yarnlock_now = fs.readFileSync(cache.yarnlock_cache.yarnlock_file).toString();
                let yarnlock_old2 = cache.yarnlock_old || cache.yarnlock_old2;
                if (yarnlock_old2) {
                    let msg = yarnlock_1.yarnLockDiff(yarnlock_old2, yarnlock_now);
                    if (msg) {
                        cache.yarnlock_msg = msg;
                        cache.yarnlock_changed = true;
                    }
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBR0gsdURBQWlEO0FBQ2pELG9DQUFzRTtBQUN0RSwrQkFBZ0M7QUFFaEMsK0JBQWdDO0FBQ2hDLDBDQUEyQztBQUUzQyxTQUFnQixNQUFNLENBQUMsWUFBb0I7SUFFMUMsSUFBSSxZQUFZLEdBQVcsZ0NBQWEsQ0FBQyxZQUFZLEVBQUU7SUFDdEQsc0JBQXNCO0tBQ3RCLENBQUMsQ0FBQztJQUVILE9BQU87UUFDTjs7V0FFRztRQUNILFlBQVk7UUFDWjs7V0FFRztRQUNILFlBQVk7UUFDWjs7V0FFRztRQUNILGdCQUFnQixFQUFFLFlBQVksS0FBSyxZQUFZO0tBQy9DLENBQUE7QUFDRixDQUFDO0FBcEJELHdCQW9CQztBQXFERCxTQUFnQixVQUFVLENBTUssSUFBbUIsRUFBRSxJQUF3QixFQUFFLE9Bb0M3RTtJQUVBLGFBQWE7SUFDYixJQUFJLEtBQUssR0FBTSxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztJQUVuQyxhQUFhO0lBQ2IsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7SUFJbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQ2Q7UUFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGlCQUFpQixLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTtLQUNsRDtJQUVELGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXBDLGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUVmLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO0lBRS9CLGFBQWE7SUFDYixLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxP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YUFBYSxDQUFDO2dCQUU5RCxJQUFJLGFBQWEsRUFDakI7b0JBQ0MsSUFBSSxHQUFHLEdBQUcsdUJBQVksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBRXBELElBQUksR0FBRyxFQUNQO3dCQUNDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO3dCQUV6QixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO3FCQUM5QjtpQkFDRDthQUNEO1NBQ0Q7S0FDRDtJQUVELGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRELE9BQU87UUFDTixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7UUFDZCxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDeEIsSUFBSTtRQUNKLElBQUk7UUFDSixLQUFLO0tBQ0wsQ0FBQTtBQUNGLENBQUM7QUF4T0QsZ0NBd09DO0FBRUQsU0FBZ0IsbUJBQW1CLENBQTZCLEtBQVE7SUFFdkUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLEdBQUcsS0FBSyxDQUFDO0lBRXRELElBQUksRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztJQUU5RCxPQUFPO1FBQ04sR0FBRyxLQUFLLENBQUMsUUFBUTtRQUNqQixhQUFhO1FBQ2IsbUJBQW1CO1FBQ25CLGVBQWU7UUFDZixnQkFBZ0I7S0FDaEIsQ0FBQztBQUNILENBQUM7QUFiRCxrREFhQztBQUVELGtCQUFlLE1BQU0sQ0FBQztBQUV0Qjs7Ozs7Ozs7Ozs7O0VBWUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzQvMzAuXG4gKi9cblxuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7IGZpeER1cGxpY2F0ZXMgfSBmcm9tICd5YXJuLWRlZHVwbGljYXRlJztcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIGZzWWFybkxvY2t9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBDb25zb2xlMiB9IGZyb20gJ2RlYnVnLWNvbG9yMic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgeWFybkxvY2tEaWZmIH0gZnJvbSAnLi4veWFybmxvY2snO1xuXG5leHBvcnQgZnVuY3Rpb24gRGVkdXBlKHlhcm5sb2NrX29sZDogc3RyaW5nKVxue1xuXHRsZXQgeWFybmxvY2tfbmV3OiBzdHJpbmcgPSBmaXhEdXBsaWNhdGVzKHlhcm5sb2NrX29sZCwge1xuXHRcdC8vdXNlTW9zdENvbW1vbjogdHJ1ZSxcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvKipcblx0XHQgKiDln7fooYzliY3nmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfb2xkLFxuXHRcdC8qKlxuXHRcdCAqIOWft+ihjOW+jOeahCB5YXJuLmxvY2tcblx0XHQgKi9cblx0XHR5YXJubG9ja19uZXcsXG5cdFx0LyoqXG5cdFx0ICogeWFybi5sb2NrIOaYr+WQpuacieiuiuWLlVxuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX2NoYW5nZWQ6IHlhcm5sb2NrX29sZCAhPT0geWFybmxvY2tfbmV3LFxuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdyYXBEZWR1cGVDYWNoZVxue1xuXHQvKipcblx0ICog5aaC5p6c5LiN5a2Y5Zyo5YmH562J5pa8IGFyZ3YuY3dkXG5cdCAqL1xuXHRyZWFkb25seSBjd2Q/OiBzdHJpbmcsXG5cblx0cmVhZG9ubHkgcm9vdERhdGE/OiBSZXR1cm5UeXBlPHR5cGVvZiBmaW5kUm9vdD4sXG5cblx0LyoqXG5cdCAqIOebruWJjeeahCB5YXJuLmxvY2sg54uA5oWLKOmaqOatpempn+abtOWLleeLgOaFiylcblx0ICovXG5cdHlhcm5sb2NrX2NhY2hlPzogUmV0dXJuVHlwZTx0eXBlb2YgZnNZYXJuTG9jaz5cblxuXHQvKipcblx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9ja1xuXHQgKi9cblx0cmVhZG9ubHkgeWFybmxvY2tfb2xkPzogc3RyaW5nLFxuXHR5YXJubG9ja19vbGQyPzogc3RyaW5nLFxuXHQvKipcblx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9jayDmmK/lkKblrZjlnKhcblx0ICovXG5cdHJlYWRvbmx5IHlhcm5sb2NrX29sZF9leGlzdHM/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiB5YXJuLmxvY2sg5piv5ZCm5pyJ6K6K5YuVXG5cdCAqL1xuXHR5YXJubG9ja19jaGFuZ2VkPzogYm9vbGVhbixcblxuXHQvKipcblx0ICog5pyA5b6M5LiA5qyh55qEIHlhcm4ubG9jayBkaWZmIOioiuaBr1xuXHQgKi9cblx0eWFybmxvY2tfbXNnPzogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiDmr4/lgIvmraXpqZ/nmoTni4DmhYsgdHJ1ZSDku6PooajkuK3mlrfmiYDmnInmraXpqZ9cblx0ICogbnVsbCDku6PooajmraTmraXpqZ/kuI3lrZjlnKhcblx0ICogdm9pZC91bmRlZmluZWQg5Luj6KGo5q2k5q2l6amf5pyq5Z+36KGMXG5cdCAqL1xuXHRyZWFkb25seSByZXQ6IHtcblx0XHRyZWFkb25seSBpbml0OiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdFx0cmVhZG9ubHkgYmVmb3JlOiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdFx0cmVhZG9ubHkgbWFpbjogYm9vbGVhbiB8IHZvaWQgfCBudWxsLFxuXHRcdHJlYWRvbmx5IGFmdGVyOiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdH0sXG5cblx0cmVhZG9ubHkgY29uc29sZURlYnVnPzogQ29uc29sZTIsXG5cdHJlYWRvbmx5IGNvbnNvbGU/OiBDb25zb2xlMixcblxuXHRbazogc3RyaW5nXTogdW5rbm93blxufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcERlZHVwZTxUIGV4dGVuZHMge1xuXHRjd2Q/OiBzdHJpbmcsXG5cdFtrOiBzdHJpbmddOiB1bmtub3duLFxufSwgVSBleHRlbmRzIFQgfCB7XG5cdGN3ZDogc3RyaW5nLFxuXHRbazogc3RyaW5nXTogdW5rbm93bixcbn0sIEMgZXh0ZW5kcyBJV3JhcERlZHVwZUNhY2hlPih5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIG9wdGlvbnM6IHtcblxuXHQvKipcblx0ICog5aaC5p6c5Yid5aeL5YyW5rKS5pyJ55m855Sf6Yyv6KqkIOatpOatpempn+W/heWumuWft+ihjFxuXHQgKi9cblx0aW5pdD8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmlrwg56ys5LiA5qyhIERlZHVwZSDliY3nmoTmraXpqZ9cblx0ICovXG5cdGJlZm9yZT8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmraTmraXpqZ/ngrrlv4XopoHpgbjpoIVcblx0ICovXG5cdG1haW4oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmlrwg56ys5LqM5qyhIERlZHVwZSDlvoznmoTmraXpqZ9cblx0ICovXG5cdGFmdGVyPyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOaWvCDnrKzkuozmrKEgRGVkdXBlIOW+jOeahOatpempn1xuXHQgKi9cblx0YWZ0ZXI/KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5aaC5p6c57WQ5p2f5YmN5rKS5pyJ55m855Sf6Yyv6KqkIOatpOatpempn+W/heWumuWft+ihjFxuXHQgKi9cblx0ZW5kPyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOatpempn+mWk+WFseS6q+eahOe3qeWtmOizh+ioiuS4puS4lOacg+W9semfv+mDqOWIhuihjOeCulxuXHQgKi9cblx0Y2FjaGU/OiBQYXJ0aWFsPEM+XG59KVxue1xuXHQvLyBAdHMtaWdub3JlXG5cdGxldCBjYWNoZTogQyA9IG9wdGlvbnMuY2FjaGUgfHwge307XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5jd2QgPSBjYWNoZS5jd2QgfHwgYXJndi5jd2Q7XG5cblxuXG5cdGlmICghY2FjaGUuY3dkKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgY2FjaGUuY3dkIGlzICcke2NhY2hlLmN3ZH0nYClcblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUuY3dkID0gcGF0aC5yZXNvbHZlKGNhY2hlLmN3ZCk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5yZXQgPSB7fTtcblxuXHRjYWNoZS55YXJubG9ja19tc2cgPSB1bmRlZmluZWQ7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5jb25zb2xlID0gY2FjaGUuY29uc29sZSB8fCBjb25zb2xlO1xuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLmNvbnNvbGVEZWJ1ZyA9IGNhY2hlLmNvbnNvbGVEZWJ1ZyB8fCBjb25zb2xlRGVidWc7XG5cblx0bGV0IHsgaW5pdCwgYmVmb3JlLCBtYWluLCBhZnRlciwgZW5kIH0gPSBvcHRpb25zO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUucm9vdERhdGEgPSBjYWNoZS5yb290RGF0YSB8fCBmaW5kUm9vdCh7XG5cdFx0Li4uYXJndixcblx0XHRjd2Q6IGNhY2hlLmN3ZCxcblx0fSwgdHJ1ZSk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS55YXJubG9ja19jYWNoZSA9IGNhY2hlLnlhcm5sb2NrX2NhY2hlIHx8IGZzWWFybkxvY2soY2FjaGUucm9vdERhdGEucm9vdCk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS55YXJubG9ja19vbGQgPSBjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQ7XG5cblx0Y2FjaGUueWFybmxvY2tfb2xkMiA9IGNhY2hlLnlhcm5sb2NrX29sZDtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnlhcm5sb2NrX29sZF9leGlzdHMgPSBjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19leGlzdHM7XG5cblx0TEFCRUwxOiB7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FjaGUucmV0LmluaXQgPSBpbml0ID8gISFpbml0KHlhcmcsIGFyZ3YsIGNhY2hlKSA6IG51bGw7XG5cblx0XHRpZiAoY2FjaGUucmV0LmluaXQpXG5cdFx0e1xuXHRcdFx0YnJlYWsgTEFCRUwxO1xuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjYWNoZS5yZXQuYmVmb3JlID0gYmVmb3JlID8gISFiZWZvcmUoeWFyZywgYXJndiwgY2FjaGUpIDogbnVsbDtcblx0XHRpZiAoY2FjaGUucmV0LmJlZm9yZSlcblx0XHR7XG5cdFx0XHRicmVhayBMQUJFTDE7XG5cdFx0fVxuXG5cdFx0Y2FjaGUueWFybmxvY2tfY2FjaGUgPSBmc1lhcm5Mb2NrKGNhY2hlLnJvb3REYXRhLnJvb3QpO1xuXG5cdFx0aWYgKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2V4aXN0cylcblx0XHR7XG5cdFx0XHRsZXQgcmV0MSA9IERlZHVwZShjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQpO1xuXG5cdFx0XHRpZiAocmV0MS55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0e1xuXHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2ZpbGUsIHJldDEueWFybmxvY2tfbmV3KTtcblxuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHJldDEueWFybmxvY2tfb2xkLCByZXQxLnlhcm5sb2NrX25ldyk7XG5cblx0XHRcdFx0aWYgKG1zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhY2hlLnlhcm5sb2NrX21zZyA9IG1zZztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCA9IHJldDEueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBEZWR1cGxpY2F0aW9uIHlhcm4ubG9ja2ApO1xuXHRcdFx0XHRjb25zb2xlRGVidWcuZ3JheS5pbmZvKGAke2NhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2ZpbGV9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNhY2hlLnJldC5tYWluID0gISFtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKTtcblx0XHRpZiAoY2FjaGUucmV0Lm1haW4pXG5cdFx0e1xuXHRcdFx0YnJlYWsgTEFCRUwxO1xuXHRcdH1cblxuXHRcdGNhY2hlLnlhcm5sb2NrX2NhY2hlID0gZnNZYXJuTG9jayhjYWNoZS5yb290RGF0YS5yb290KTtcblxuXHRcdGlmIChjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19leGlzdHMpXG5cdFx0e1xuXHRcdFx0bGV0IHJldDEgPSBEZWR1cGUoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkKTtcblxuXHRcdFx0aWYgKHJldDEueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX29sZDIgPT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhY2hlLnlhcm5sb2NrX29sZDIgPSByZXQxLnlhcm5sb2NrX29sZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZSwgcmV0MS55YXJubG9ja19uZXcpO1xuXG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYocmV0MS55YXJubG9ja19vbGQsIHJldDEueWFybmxvY2tfbmV3KTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfbXNnID0gbXNnO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkID0gcmV0MS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5ncmF5LmluZm8oYCR7Y2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZX1gKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IHJldDEueWFybmxvY2tfY2hhbmdlZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2hhbmdlZClcblx0XHR7XG5cdFx0XHRpZiAoIWNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2V4aXN0cyB8fCAhY2FjaGUueWFybmxvY2tfb2xkIHx8IGNhY2hlLnlhcm5sb2NrX29sZCA9PSBjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQpXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FjaGUucmV0LmFmdGVyID0gYWZ0ZXIgPyAhIWFmdGVyKHlhcmcsIGFyZ3YsIGNhY2hlKSA6IG51bGw7XG5cdFx0aWYgKGNhY2hlLnJldC5hZnRlcilcblx0XHR7XG5cdFx0XHRicmVhayBMQUJFTDE7XG5cdFx0fVxuXG5cdFx0Y2FjaGUueWFybmxvY2tfY2FjaGUgPSBmc1lhcm5Mb2NrKGNhY2hlLnJvb3REYXRhLnJvb3QpO1xuXG5cdFx0aWYgKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2V4aXN0cylcblx0XHR7XG5cdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihjYWNoZS55YXJubG9ja19vbGQgfHwgY2FjaGUueWFybmxvY2tfb2xkMiwgY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkKTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfbXNnID0gbXNnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB5YXJubG9ja19ub3cgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZSkudG9TdHJpbmcoKTtcblx0XHRcdFx0bGV0IHlhcm5sb2NrX29sZDIgPSBjYWNoZS55YXJubG9ja19vbGQgfHwgY2FjaGUueWFybmxvY2tfb2xkMjtcblxuXHRcdFx0XHRpZiAoeWFybmxvY2tfb2xkMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYoeWFybmxvY2tfb2xkMiwgeWFybmxvY2tfbm93KTtcblxuXHRcdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfbXNnID0gbXNnO1xuXG5cdFx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnJldC5lbmQgPSBlbmQgPyAhIWVuZCh5YXJnLCBhcmd2LCBjYWNoZSkgOiBudWxsO1xuXG5cdHJldHVybiB7XG5cdFx0Y3dkOiBjYWNoZS5jd2QsXG5cdFx0cm9vdERhdGE6IGNhY2hlLnJvb3REYXRhLFxuXHRcdHlhcmcsXG5cdFx0YXJndixcblx0XHRjYWNoZSxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mb0Zyb21EZWR1cGVDYWNoZTxDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oY2FjaGU6IEMpXG57XG5cdGxldCB7IHlhcm5sb2NrX2NoYW5nZWQsIHlhcm5sb2NrX29sZF9leGlzdHMgfSA9IGNhY2hlO1xuXG5cdGxldCB7IHlhcm5sb2NrX2ZpbGUsIHlhcm5sb2NrX2V4aXN0cyB9ID0gY2FjaGUueWFybmxvY2tfY2FjaGU7XG5cblx0cmV0dXJuIHtcblx0XHQuLi5jYWNoZS5yb290RGF0YSxcblx0XHR5YXJubG9ja19maWxlLFxuXHRcdHlhcm5sb2NrX29sZF9leGlzdHMsXG5cdFx0eWFybmxvY2tfZXhpc3RzLFxuXHRcdHlhcm5sb2NrX2NoYW5nZWQsXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IERlZHVwZTtcblxuLypcbndyYXBEZWR1cGUobnVsbCwgbnVsbCwge1xuXHRjYWNoZToge1xuXHRcdGN3ZDogJy4nLFxuXHR9LFxuXHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coeWFyZywgYXJndiwgY2FjaGUpO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn0pO1xuKi9cbiJdfQ==