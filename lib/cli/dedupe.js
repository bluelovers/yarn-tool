"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFHSCx1REFBaUQ7QUFDakQsb0NBQXNFO0FBQ3RFLCtCQUFnQztBQUVoQywrQkFBZ0M7QUFDaEMsMENBQTJDO0FBRTNDLFNBQWdCLE1BQU0sQ0FBQyxZQUFvQjtJQUUxQyxJQUFJLFlBQVksR0FBVyxnQ0FBYSxDQUFDLFlBQVksRUFBRTtJQUN0RCxzQkFBc0I7S0FDdEIsQ0FBQyxDQUFDO0lBRUgsT0FBTztRQUNOOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsZ0JBQWdCLEVBQUUsWUFBWSxLQUFLLFlBQVk7S0FDL0MsQ0FBQTtBQUNGLENBQUM7QUFwQkQsd0JBb0JDO0FBcURELFNBQWdCLFVBQVUsQ0FNSyxJQUFtQixFQUFFLElBQXdCLEVBQUUsT0FvQzdFO0lBRUEsYUFBYTtJQUNiLElBQUksS0FBSyxHQUFNLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO0lBRW5DLGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUlsQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFDZDtRQUNDLE1BQU0sSUFBSSxTQUFTLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0tBQ2xEO0lBRUQsYUFBYTtJQUNiLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFcEMsYUFBYTtJQUNiLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBRWYsS0FBSyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7SUFFL0IsYUFBYTtJQUNiLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxlQUFPLENBQUM7SUFDekMsYUFBYTtJQUNiLEtBQUssQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksSUFBSSxvQkFBWSxDQUFDO0lBRXhELElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRWpELGFBQWE7SUFDYixLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLElBQUksZ0JBQVEsQ0FBQztRQUMzQyxHQUFHLElBQUk7UUFDUCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7S0FDZCxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRVQsYUFBYTtJQUNiLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsSUFBSSxrQkFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0UsYUFBYTtJQUNiLEtBQUssQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7SUFFdkQsS0FBSyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO0lBRXpDLGFBQWE7SUFDYixLQUFLLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7SUFFakUsTUFBTSxFQUFFO1FBRVAsYUFBYTtRQUNiLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFekQsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFDbEI7WUFDQyxNQUFNLE1BQU0sQ0FBQztTQUNiO1FBRUQsYUFBYTtRQUNiLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDL0QsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFDcEI7WUFDQyxNQUFNLE1BQU0sQ0FBQztTQUNiO1FBRUQsS0FBSyxDQUFDLGNBQWMsR0FBRyxrQkFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkQsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFDeEM7WUFDQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVyRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDekI7Z0JBQ0MsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXhFLElBQUksR0FBRyxHQUFHLHVCQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTdELElBQUksR0FBRyxFQUNQO29CQUNDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO2lCQUN6QjtnQkFFRCxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2dCQUU5QixLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUV0RCxvQkFBWSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUM3QyxvQkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7YUFDaEU7U0FDRDtRQUVELGFBQWE7UUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFDbEI7WUFDQyxNQUFNLE1BQU0sQ0FBQztTQUNiO1FBRUQsS0FBSyxDQUFDLGNBQWMsR0FBRyxrQkFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkQsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFDeEM7WUFDQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVyRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDekI7Z0JBQ0MsSUFBSSxLQUFLLENBQUMsYUFBYSxJQUFJLElBQUksRUFDL0I7b0JBQ0MsS0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUN4QztnQkFFRCxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEUsSUFBSSxHQUFHLEdBQUcsdUJBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFN0QsSUFBSSxHQUFHLEVBQ1A7b0JBQ0MsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7aUJBQ3pCO2dCQUVELEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Z0JBRTlCLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBRXRELG9CQUFZLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQzdDLG9CQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQzthQUNoRTtpQkFDSSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLEVBQ3ZDO2dCQUNDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7YUFDL0M7U0FDRDtRQUVELElBQUksS0FBSyxDQUFDLGdCQUFnQixFQUMxQjtZQUNDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksRUFDM0g7Z0JBQ0MsS0FBSyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQzthQUMvQjtTQUNEO1FBRUQsYUFBYTtRQUNiLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDNUQsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFDbkI7WUFDQyxNQUFNLE1BQU0sQ0FBQztTQUNiO1FBRUQsS0FBSyxDQUFDLGNBQWMsR0FBRyxrQkFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkQsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFDeEM7WUFDQyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsRUFDMUI7Z0JBQ0MsSUFBSSxHQUFHLEdBQUcsdUJBQVksQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFckcsSUFBSSxHQUFHLEVBQ1A7b0JBQ0MsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7aUJBQ3pCO2FBQ0Q7aUJBRUQ7Z0JBQ0MsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsRixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUM7Z0JBRTlELElBQUksYUFBYSxFQUNqQjtvQkFDQyxJQUFJLEdBQUcsR0FBRyx1QkFBWSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFFcEQsSUFBSSxHQUFHLEVBQ1A7d0JBQ0MsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7d0JBRXpCLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7cUJBQzlCO2lCQUNEO2FBQ0Q7U0FDRDtLQUNEO0lBRUQsYUFBYTtJQUNiLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFdEQsT0FBTztRQUNOLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztRQUNkLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixJQUFJO1FBQ0osSUFBSTtRQUNKLEtBQUs7S0FDTCxDQUFBO0FBQ0YsQ0FBQztBQXhPRCxnQ0F3T0M7QUFFRCxTQUFnQixtQkFBbUIsQ0FBNkIsS0FBUTtJQUV2RSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFFdEQsSUFBSSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO0lBRTlELE9BQU87UUFDTixHQUFHLEtBQUssQ0FBQyxRQUFRO1FBQ2pCLGFBQWE7UUFDYixtQkFBbUI7UUFDbkIsZUFBZTtRQUNmLGdCQUFnQjtLQUNoQixDQUFDO0FBQ0gsQ0FBQztBQWJELGtEQWFDO0FBRUQsa0JBQWUsTUFBTSxDQUFDO0FBRXRCOzs7Ozs7Ozs7Ozs7RUFZRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHsgZml4RHVwbGljYXRlcyB9IGZyb20gJ3lhcm4tZGVkdXBsaWNhdGUnO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9ja30gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IENvbnNvbGUyIH0gZnJvbSAnZGVidWctY29sb3IyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyB5YXJuTG9ja0RpZmYgfSBmcm9tICcuLi95YXJubG9jayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWR1cGUoeWFybmxvY2tfb2xkOiBzdHJpbmcpXG57XG5cdGxldCB5YXJubG9ja19uZXc6IHN0cmluZyA9IGZpeER1cGxpY2F0ZXMoeWFybmxvY2tfb2xkLCB7XG5cdFx0Ly91c2VNb3N0Q29tbW9uOiB0cnVlLFxuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8qKlxuXHRcdCAqIOWft+ihjOWJjeeahCB5YXJuLmxvY2tcblx0XHQgKi9cblx0XHR5YXJubG9ja19vbGQsXG5cdFx0LyoqXG5cdFx0ICog5Z+36KGM5b6M55qEIHlhcm4ubG9ja1xuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX25ldyxcblx0XHQvKipcblx0XHQgKiB5YXJuLmxvY2sg5piv5ZCm5pyJ6K6K5YuVXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfY2hhbmdlZDogeWFybmxvY2tfb2xkICE9PSB5YXJubG9ja19uZXcsXG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJV3JhcERlZHVwZUNhY2hlXG57XG5cdC8qKlxuXHQgKiDlpoLmnpzkuI3lrZjlnKjliYfnrYnmlrwgYXJndi5jd2Rcblx0ICovXG5cdHJlYWRvbmx5IGN3ZD86IHN0cmluZyxcblxuXHRyZWFkb25seSByb290RGF0YT86IFJldHVyblR5cGU8dHlwZW9mIGZpbmRSb290PixcblxuXHQvKipcblx0ICog55uu5YmN55qEIHlhcm4ubG9jayDni4DmhYso6Zqo5q2l6amf5pu05YuV54uA5oWLKVxuXHQgKi9cblx0eWFybmxvY2tfY2FjaGU/OiBSZXR1cm5UeXBlPHR5cGVvZiBmc1lhcm5Mb2NrPlxuXG5cdC8qKlxuXHQgKiDln7fooYzliY3nmoQgeWFybi5sb2NrXG5cdCAqL1xuXHRyZWFkb25seSB5YXJubG9ja19vbGQ/OiBzdHJpbmcsXG5cdHlhcm5sb2NrX29sZDI/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiDln7fooYzliY3nmoQgeWFybi5sb2NrIOaYr+WQpuWtmOWcqFxuXHQgKi9cblx0cmVhZG9ubHkgeWFybmxvY2tfb2xkX2V4aXN0cz86IHN0cmluZyxcblx0LyoqXG5cdCAqIHlhcm4ubG9jayDmmK/lkKbmnInororli5Vcblx0ICovXG5cdHlhcm5sb2NrX2NoYW5nZWQ/OiBib29sZWFuLFxuXG5cdC8qKlxuXHQgKiDmnIDlvozkuIDmrKHnmoQgeWFybi5sb2NrIGRpZmYg6KiK5oGvXG5cdCAqL1xuXHR5YXJubG9ja19tc2c/OiBzdHJpbmcsXG5cblx0LyoqXG5cdCAqIOavj+WAi+atpempn+eahOeLgOaFiyB0cnVlIOS7o+ihqOS4reaWt+aJgOacieatpempn1xuXHQgKiBudWxsIOS7o+ihqOatpOatpempn+S4jeWtmOWcqFxuXHQgKiB2b2lkL3VuZGVmaW5lZCDku6PooajmraTmraXpqZ/mnKrln7fooYxcblx0ICovXG5cdHJlYWRvbmx5IHJldDoge1xuXHRcdHJlYWRvbmx5IGluaXQ6IGJvb2xlYW4gfCB2b2lkIHwgbnVsbCxcblx0XHRyZWFkb25seSBiZWZvcmU6IGJvb2xlYW4gfCB2b2lkIHwgbnVsbCxcblx0XHRyZWFkb25seSBtYWluOiBib29sZWFuIHwgdm9pZCB8IG51bGwsXG5cdFx0cmVhZG9ubHkgYWZ0ZXI6IGJvb2xlYW4gfCB2b2lkIHwgbnVsbCxcblx0fSxcblxuXHRyZWFkb25seSBjb25zb2xlRGVidWc/OiBDb25zb2xlMixcblx0cmVhZG9ubHkgY29uc29sZT86IENvbnNvbGUyLFxuXG5cdFtrOiBzdHJpbmddOiB1bmtub3duXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRGVkdXBlPFQgZXh0ZW5kcyB7XG5cdGN3ZD86IHN0cmluZyxcblx0W2s6IHN0cmluZ106IHVua25vd24sXG59LCBVIGV4dGVuZHMgVCB8IHtcblx0Y3dkOiBzdHJpbmcsXG5cdFtrOiBzdHJpbmddOiB1bmtub3duLFxufSwgQyBleHRlbmRzIElXcmFwRGVkdXBlQ2FjaGU+KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgb3B0aW9uczoge1xuXG5cdC8qKlxuXHQgKiDlpoLmnpzliJ3lp4vljJbmspLmnInnmbznlJ/pjK/oqqQg5q2k5q2l6amf5b+F5a6a5Z+36KGMXG5cdCAqL1xuXHRpbml0Pyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOaWvCDnrKzkuIDmrKEgRGVkdXBlIOWJjeeahOatpempn1xuXHQgKi9cblx0YmVmb3JlPyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOatpOatpempn+eCuuW/heimgemBuOmghVxuXHQgKi9cblx0bWFpbih5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOaWvCDnrKzkuozmrKEgRGVkdXBlIOW+jOeahOatpempn1xuXHQgKi9cblx0YWZ0ZXI/KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5pa8IOesrOS6jOasoSBEZWR1cGUg5b6M55qE5q2l6amfXG5cdCAqL1xuXHRhZnRlcj8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDlpoLmnpzntZDmnZ/liY3mspLmnInnmbznlJ/pjK/oqqQg5q2k5q2l6amf5b+F5a6a5Z+36KGMXG5cdCAqL1xuXHRlbmQ/KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5q2l6amf6ZaT5YWx5Lqr55qE57ep5a2Y6LOH6KiK5Lim5LiU5pyD5b2x6Z+/6YOo5YiG6KGM54K6XG5cdCAqL1xuXHRjYWNoZT86IFBhcnRpYWw8Qz5cbn0pXG57XG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IGNhY2hlOiBDID0gb3B0aW9ucy5jYWNoZSB8fCB7fTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLmN3ZCA9IGNhY2hlLmN3ZCB8fCBhcmd2LmN3ZDtcblxuXG5cblx0aWYgKCFjYWNoZS5jd2QpXG5cdHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBjYWNoZS5jd2QgaXMgJyR7Y2FjaGUuY3dkfSdgKVxuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5jd2QgPSBwYXRoLnJlc29sdmUoY2FjaGUuY3dkKTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnJldCA9IHt9O1xuXG5cdGNhY2hlLnlhcm5sb2NrX21zZyA9IHVuZGVmaW5lZDtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLmNvbnNvbGUgPSBjYWNoZS5jb25zb2xlIHx8IGNvbnNvbGU7XG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUuY29uc29sZURlYnVnID0gY2FjaGUuY29uc29sZURlYnVnIHx8IGNvbnNvbGVEZWJ1ZztcblxuXHRsZXQgeyBpbml0LCBiZWZvcmUsIG1haW4sIGFmdGVyLCBlbmQgfSA9IG9wdGlvbnM7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5yb290RGF0YSA9IGNhY2hlLnJvb3REYXRhIHx8IGZpbmRSb290KHtcblx0XHQuLi5hcmd2LFxuXHRcdGN3ZDogY2FjaGUuY3dkLFxuXHR9LCB0cnVlKTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnlhcm5sb2NrX2NhY2hlID0gY2FjaGUueWFybmxvY2tfY2FjaGUgfHwgZnNZYXJuTG9jayhjYWNoZS5yb290RGF0YS5yb290KTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnlhcm5sb2NrX29sZCA9IGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZDtcblxuXHRjYWNoZS55YXJubG9ja19vbGQyID0gY2FjaGUueWFybmxvY2tfb2xkO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUueWFybmxvY2tfb2xkX2V4aXN0cyA9IGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2V4aXN0cztcblxuXHRMQUJFTDE6IHtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjYWNoZS5yZXQuaW5pdCA9IGluaXQgPyAhIWluaXQoeWFyZywgYXJndiwgY2FjaGUpIDogbnVsbDtcblxuXHRcdGlmIChjYWNoZS5yZXQuaW5pdClcblx0XHR7XG5cdFx0XHRicmVhayBMQUJFTDE7XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNhY2hlLnJldC5iZWZvcmUgPSBiZWZvcmUgPyAhIWJlZm9yZSh5YXJnLCBhcmd2LCBjYWNoZSkgOiBudWxsO1xuXHRcdGlmIChjYWNoZS5yZXQuYmVmb3JlKVxuXHRcdHtcblx0XHRcdGJyZWFrIExBQkVMMTtcblx0XHR9XG5cblx0XHRjYWNoZS55YXJubG9ja19jYWNoZSA9IGZzWWFybkxvY2soY2FjaGUucm9vdERhdGEucm9vdCk7XG5cblx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzKVxuXHRcdHtcblx0XHRcdGxldCByZXQxID0gRGVkdXBlKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdGlmIChyZXQxLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZSwgcmV0MS55YXJubG9ja19uZXcpO1xuXG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYocmV0MS55YXJubG9ja19vbGQsIHJldDEueWFybmxvY2tfbmV3KTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfbXNnID0gbXNnO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkID0gcmV0MS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5ncmF5LmluZm8oYCR7Y2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZmlsZX1gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FjaGUucmV0Lm1haW4gPSAhIW1haW4oeWFyZywgYXJndiwgY2FjaGUpO1xuXHRcdGlmIChjYWNoZS5yZXQubWFpbilcblx0XHR7XG5cdFx0XHRicmVhayBMQUJFTDE7XG5cdFx0fVxuXG5cdFx0Y2FjaGUueWFybmxvY2tfY2FjaGUgPSBmc1lhcm5Mb2NrKGNhY2hlLnJvb3REYXRhLnJvb3QpO1xuXG5cdFx0aWYgKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2V4aXN0cylcblx0XHR7XG5cdFx0XHRsZXQgcmV0MSA9IERlZHVwZShjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQpO1xuXG5cdFx0XHRpZiAocmV0MS55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfb2xkMiA9PSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfb2xkMiA9IHJldDEueWFybmxvY2tfb2xkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyhjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlLCByZXQxLnlhcm5sb2NrX25ldyk7XG5cblx0XHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihyZXQxLnlhcm5sb2NrX29sZCwgcmV0MS55YXJubG9ja19uZXcpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19tc2cgPSBtc2c7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQgPSByZXQxLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgRGVkdXBsaWNhdGlvbiB5YXJuLmxvY2tgKTtcblx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuaW5mbyhgJHtjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlfWApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoY2FjaGUueWFybmxvY2tfY2hhbmdlZCA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jaGFuZ2VkID0gcmV0MS55YXJubG9ja19jaGFuZ2VkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjYWNoZS55YXJubG9ja19jaGFuZ2VkKVxuXHRcdHtcblx0XHRcdGlmICghY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzIHx8ICFjYWNoZS55YXJubG9ja19vbGQgfHwgY2FjaGUueWFybmxvY2tfb2xkID09IGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZClcblx0XHRcdHtcblx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjYWNoZS5yZXQuYWZ0ZXIgPSBhZnRlciA/ICEhYWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpIDogbnVsbDtcblx0XHRpZiAoY2FjaGUucmV0LmFmdGVyKVxuXHRcdHtcblx0XHRcdGJyZWFrIExBQkVMMTtcblx0XHR9XG5cblx0XHRjYWNoZS55YXJubG9ja19jYWNoZSA9IGZzWWFybkxvY2soY2FjaGUucm9vdERhdGEucm9vdCk7XG5cblx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzKVxuXHRcdHtcblx0XHRcdGlmIChjYWNoZS55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKGNhY2hlLnlhcm5sb2NrX29sZCB8fCBjYWNoZS55YXJubG9ja19vbGQyLCBjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19tc2cgPSBtc2c7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGV0IHlhcm5sb2NrX25vdyA9IGZzLnJlYWRGaWxlU3luYyhjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlKS50b1N0cmluZygpO1xuXHRcdFx0XHRsZXQgeWFybmxvY2tfb2xkMiA9IGNhY2hlLnlhcm5sb2NrX29sZCB8fCBjYWNoZS55YXJubG9ja19vbGQyO1xuXG5cdFx0XHRcdGlmICh5YXJubG9ja19vbGQyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZih5YXJubG9ja19vbGQyLCB5YXJubG9ja19ub3cpO1xuXG5cdFx0XHRcdFx0aWYgKG1zZylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19tc2cgPSBtc2c7XG5cblx0XHRcdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUucmV0LmVuZCA9IGVuZCA/ICEhZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKSA6IG51bGw7XG5cblx0cmV0dXJuIHtcblx0XHRjd2Q6IGNhY2hlLmN3ZCxcblx0XHRyb290RGF0YTogY2FjaGUucm9vdERhdGEsXG5cdFx0eWFyZyxcblx0XHRhcmd2LFxuXHRcdGNhY2hlLFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZvRnJvbURlZHVwZUNhY2hlPEMgZXh0ZW5kcyBJV3JhcERlZHVwZUNhY2hlPihjYWNoZTogQylcbntcblx0bGV0IHsgeWFybmxvY2tfY2hhbmdlZCwgeWFybmxvY2tfb2xkX2V4aXN0cyB9ID0gY2FjaGU7XG5cblx0bGV0IHsgeWFybmxvY2tfZmlsZSwgeWFybmxvY2tfZXhpc3RzIH0gPSBjYWNoZS55YXJubG9ja19jYWNoZTtcblxuXHRyZXR1cm4ge1xuXHRcdC4uLmNhY2hlLnJvb3REYXRhLFxuXHRcdHlhcm5sb2NrX2ZpbGUsXG5cdFx0eWFybmxvY2tfb2xkX2V4aXN0cyxcblx0XHR5YXJubG9ja19leGlzdHMsXG5cdFx0eWFybmxvY2tfY2hhbmdlZCxcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgRGVkdXBlO1xuXG4vKlxud3JhcERlZHVwZShudWxsLCBudWxsLCB7XG5cdGNhY2hlOiB7XG5cdFx0Y3dkOiAnLicsXG5cdH0sXG5cdG1haW4oeWFyZywgYXJndiwgY2FjaGUpXG5cdHtcblx0XHRjb25zb2xlLmxvZyh5YXJnLCBhcmd2LCBjYWNoZSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufSk7XG4qL1xuIl19