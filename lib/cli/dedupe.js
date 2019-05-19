"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_deduplicate_1 = require("yarn-deduplicate");
const index_1 = require("../index");
const fs = require("fs-extra");
const path = require("path");
const yarnlock_1 = require("../yarnlock");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFHSCx1REFBaUQ7QUFDakQsb0NBQXNFO0FBQ3RFLCtCQUFnQztBQUVoQyw2QkFBOEI7QUFDOUIsMENBQTJDO0FBRTNDLFNBQWdCLE1BQU0sQ0FBQyxZQUFvQjtJQUUxQyxJQUFJLFlBQVksR0FBVyxnQ0FBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXZELE9BQU87UUFDTjs7V0FFRztRQUNILFlBQVk7UUFDWjs7V0FFRztRQUNILFlBQVk7UUFDWjs7V0FFRztRQUNILGdCQUFnQixFQUFFLFlBQVksS0FBSyxZQUFZO0tBQy9DLENBQUE7QUFDRixDQUFDO0FBbEJELHdCQWtCQztBQXFERCxTQUFnQixVQUFVLENBTUssSUFBbUIsRUFBRSxJQUF3QixFQUFFLE9Bb0M3RTtJQUVBLGFBQWE7SUFDYixJQUFJLEtBQUssR0FBTSxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztJQUVuQyxhQUFhO0lBQ2IsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7SUFJbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQ2Q7UUFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGlCQUFpQixLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTtLQUNsRDtJQUVELGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXBDLGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUVmLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO0lBRS9CLGFBQWE7SUFDYixLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBTyxDQUFDO0lBQ3pDLGFBQWE7SUFDYixLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLElBQUksb0JBQVksQ0FBQztJQUV4RCxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUVqRCxhQUFhO0lBQ2IsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxJQUFJLGdCQUFRLENBQUM7UUFDM0MsR0FBRyxJQUFJO1FBQ1AsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO0tBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVULGFBQWE7SUFDYixLQUFLLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLElBQUksa0JBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRS9FLGFBQWE7SUFDYixLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO0lBRXZELEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztJQUV6QyxhQUFhO0lBQ2IsS0FBSyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0lBRWpFLE1BQU0sRUFBRTtRQUVQLGFBQWE7UUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRXpELElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQ2xCO1lBQ0MsTUFBTSxNQUFNLENBQUM7U0FDYjtRQUVELGFBQWE7UUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQy9ELElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQ3BCO1lBQ0MsTUFBTSxNQUFNLENBQUM7U0FDYjtRQUVELEtBQUssQ0FBQyxjQUFjLEdBQUcsa0JBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZELElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQ3hDO1lBQ0MsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFckQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQ3pCO2dCQUNDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUV4RSxJQUFJLEdBQUcsR0FBRyx1QkFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUU3RCxJQUFJLEdBQUcsRUFDUDtvQkFDQyxLQUFLLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztpQkFDekI7Z0JBRUQsS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztnQkFFOUIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFFdEQsb0JBQVksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDN0Msb0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2FBQ2hFO1NBQ0Q7UUFFRCxhQUFhO1FBQ2IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQ2xCO1lBQ0MsTUFBTSxNQUFNLENBQUM7U0FDYjtRQUVELEtBQUssQ0FBQyxjQUFjLEdBQUcsa0JBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZELElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQ3hDO1lBQ0MsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFckQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQ3pCO2dCQUNDLElBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQy9CO29CQUNDLEtBQUssQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDeEM7Z0JBRUQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXhFLElBQUksR0FBRyxHQUFHLHVCQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRTdELElBQUksR0FBRyxFQUNQO29CQUNDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO2lCQUN6QjtnQkFFRCxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2dCQUU5QixLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUV0RCxvQkFBWSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUM3QyxvQkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7YUFDaEU7aUJBQ0ksSUFBSSxLQUFLLENBQUMsZ0JBQWdCLElBQUksSUFBSSxFQUN2QztnQkFDQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO2FBQy9DO1NBQ0Q7UUFFRCxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsRUFDMUI7WUFDQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQzNIO2dCQUNDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7YUFDL0I7U0FDRDtRQUVELGFBQWE7UUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzVELElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQ25CO1lBQ0MsTUFBTSxNQUFNLENBQUM7U0FDYjtRQUVELEtBQUssQ0FBQyxjQUFjLEdBQUcsa0JBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZELElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQ3hDO1lBQ0MsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLEVBQzFCO2dCQUNDLElBQUksR0FBRyxHQUFHLHVCQUFZLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXJHLElBQUksR0FBRyxFQUNQO29CQUNDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO2lCQUN6QjthQUNEO2lCQUVEO2dCQUNDLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEYsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDO2dCQUU5RCxJQUFJLGFBQWEsRUFDakI7b0JBQ0MsSUFBSSxHQUFHLEdBQUcsdUJBQVksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBRXBELElBQUksR0FBRyxFQUNQO3dCQUNDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO3dCQUV6QixLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO3FCQUM5QjtpQkFDRDthQUNEO1NBQ0Q7S0FDRDtJQUVELGFBQWE7SUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXRELE9BQU87UUFDTixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7UUFDZCxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDeEIsSUFBSTtRQUNKLElBQUk7UUFDSixLQUFLO0tBQ0wsQ0FBQTtBQUNGLENBQUM7QUF4T0QsZ0NBd09DO0FBRUQsU0FBZ0IsbUJBQW1CLENBQTZCLEtBQVE7SUFFdkUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLEdBQUcsS0FBSyxDQUFDO0lBRXRELElBQUksRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztJQUU5RCxPQUFPO1FBQ04sR0FBRyxLQUFLLENBQUMsUUFBUTtRQUNqQixhQUFhO1FBQ2IsbUJBQW1CO1FBQ25CLGVBQWU7UUFDZixnQkFBZ0I7S0FDaEIsQ0FBQztBQUNILENBQUM7QUFiRCxrREFhQztBQUVELGtCQUFlLE1BQU0sQ0FBQztBQUV0Qjs7Ozs7Ozs7Ozs7O0VBWUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzQvMzAuXG4gKi9cblxuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7IGZpeER1cGxpY2F0ZXMgfSBmcm9tICd5YXJuLWRlZHVwbGljYXRlJztcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIGZzWWFybkxvY2t9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBDb25zb2xlMiB9IGZyb20gJ2RlYnVnLWNvbG9yMic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCB7IHlhcm5Mb2NrRGlmZiB9IGZyb20gJy4uL3lhcm5sb2NrJztcblxuZXhwb3J0IGZ1bmN0aW9uIERlZHVwZSh5YXJubG9ja19vbGQ6IHN0cmluZylcbntcblx0bGV0IHlhcm5sb2NrX25ldzogc3RyaW5nID0gZml4RHVwbGljYXRlcyh5YXJubG9ja19vbGQpO1xuXG5cdHJldHVybiB7XG5cdFx0LyoqXG5cdFx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9ja1xuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX29sZCxcblx0XHQvKipcblx0XHQgKiDln7fooYzlvoznmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfbmV3LFxuXHRcdC8qKlxuXHRcdCAqIHlhcm4ubG9jayDmmK/lkKbmnInororli5Vcblx0XHQgKi9cblx0XHR5YXJubG9ja19jaGFuZ2VkOiB5YXJubG9ja19vbGQgIT09IHlhcm5sb2NrX25ldyxcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXcmFwRGVkdXBlQ2FjaGVcbntcblx0LyoqXG5cdCAqIOWmguaenOS4jeWtmOWcqOWJh+etieaWvCBhcmd2LmN3ZFxuXHQgKi9cblx0cmVhZG9ubHkgY3dkPzogc3RyaW5nLFxuXG5cdHJlYWRvbmx5IHJvb3REYXRhPzogUmV0dXJuVHlwZTx0eXBlb2YgZmluZFJvb3Q+LFxuXG5cdC8qKlxuXHQgKiDnm67liY3nmoQgeWFybi5sb2NrIOeLgOaFiyjpmqjmraXpqZ/mm7Tli5Xni4DmhYspXG5cdCAqL1xuXHR5YXJubG9ja19jYWNoZT86IFJldHVyblR5cGU8dHlwZW9mIGZzWWFybkxvY2s+XG5cblx0LyoqXG5cdCAqIOWft+ihjOWJjeeahCB5YXJuLmxvY2tcblx0ICovXG5cdHJlYWRvbmx5IHlhcm5sb2NrX29sZD86IHN0cmluZyxcblx0eWFybmxvY2tfb2xkMj86IHN0cmluZyxcblx0LyoqXG5cdCAqIOWft+ihjOWJjeeahCB5YXJuLmxvY2sg5piv5ZCm5a2Y5ZyoXG5cdCAqL1xuXHRyZWFkb25seSB5YXJubG9ja19vbGRfZXhpc3RzPzogc3RyaW5nLFxuXHQvKipcblx0ICogeWFybi5sb2NrIOaYr+WQpuacieiuiuWLlVxuXHQgKi9cblx0eWFybmxvY2tfY2hhbmdlZD86IGJvb2xlYW4sXG5cblx0LyoqXG5cdCAqIOacgOW+jOS4gOasoeeahCB5YXJuLmxvY2sgZGlmZiDoqIrmga9cblx0ICovXG5cdHlhcm5sb2NrX21zZz86IHN0cmluZyxcblxuXHQvKipcblx0ICog5q+P5YCL5q2l6amf55qE54uA5oWLIHRydWUg5Luj6KGo5Lit5pa35omA5pyJ5q2l6amfXG5cdCAqIG51bGwg5Luj6KGo5q2k5q2l6amf5LiN5a2Y5ZyoXG5cdCAqIHZvaWQvdW5kZWZpbmVkIOS7o+ihqOatpOatpempn+acquWft+ihjFxuXHQgKi9cblx0cmVhZG9ubHkgcmV0OiB7XG5cdFx0cmVhZG9ubHkgaW5pdDogYm9vbGVhbiB8IHZvaWQgfCBudWxsLFxuXHRcdHJlYWRvbmx5IGJlZm9yZTogYm9vbGVhbiB8IHZvaWQgfCBudWxsLFxuXHRcdHJlYWRvbmx5IG1haW46IGJvb2xlYW4gfCB2b2lkIHwgbnVsbCxcblx0XHRyZWFkb25seSBhZnRlcjogYm9vbGVhbiB8IHZvaWQgfCBudWxsLFxuXHR9LFxuXG5cdHJlYWRvbmx5IGNvbnNvbGVEZWJ1Zz86IENvbnNvbGUyLFxuXHRyZWFkb25seSBjb25zb2xlPzogQ29uc29sZTIsXG5cblx0W2s6IHN0cmluZ106IHVua25vd25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBEZWR1cGU8VCBleHRlbmRzIHtcblx0Y3dkPzogc3RyaW5nLFxuXHRbazogc3RyaW5nXTogdW5rbm93bixcbn0sIFUgZXh0ZW5kcyBUIHwge1xuXHRjd2Q6IHN0cmluZyxcblx0W2s6IHN0cmluZ106IHVua25vd24sXG59LCBDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBvcHRpb25zOiB7XG5cblx0LyoqXG5cdCAqIOWmguaenOWIneWni+WMluaykuacieeZvOeUn+mMr+iqpCDmraTmraXpqZ/lv4Xlrprln7fooYxcblx0ICovXG5cdGluaXQ/KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5pa8IOesrOS4gOasoSBEZWR1cGUg5YmN55qE5q2l6amfXG5cdCAqL1xuXHRiZWZvcmU/KHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5q2k5q2l6amf54K65b+F6KaB6YG46aCFXG5cdCAqL1xuXHRtYWluKHlhcmc6IHlhcmdzLkFyZ3Y8VD4sIGFyZ3Y6IHlhcmdzLkFyZ3VtZW50czxVPiwgY2FjaGU6IEMpOiBib29sZWFuIHwgdm9pZCxcblxuXHQvKipcblx0ICog5pa8IOesrOS6jOasoSBEZWR1cGUg5b6M55qE5q2l6amfXG5cdCAqL1xuXHRhZnRlcj8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmlrwg56ys5LqM5qyhIERlZHVwZSDlvoznmoTmraXpqZ9cblx0ICovXG5cdGFmdGVyPyh5YXJnOiB5YXJncy5Bcmd2PFQ+LCBhcmd2OiB5YXJncy5Bcmd1bWVudHM8VT4sIGNhY2hlOiBDKTogYm9vbGVhbiB8IHZvaWQsXG5cblx0LyoqXG5cdCAqIOWmguaenOe1kOadn+WJjeaykuacieeZvOeUn+mMr+iqpCDmraTmraXpqZ/lv4Xlrprln7fooYxcblx0ICovXG5cdGVuZD8oeWFyZzogeWFyZ3MuQXJndjxUPiwgYXJndjogeWFyZ3MuQXJndW1lbnRzPFU+LCBjYWNoZTogQyk6IGJvb2xlYW4gfCB2b2lkLFxuXG5cdC8qKlxuXHQgKiDmraXpqZ/plpPlhbHkuqvnmoTnt6nlrZjos4foqIrkuKbkuJTmnIPlvbHpn7/pg6jliIbooYzngrpcblx0ICovXG5cdGNhY2hlPzogUGFydGlhbDxDPlxufSlcbntcblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgY2FjaGU6IEMgPSBvcHRpb25zLmNhY2hlIHx8IHt9O1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUuY3dkID0gY2FjaGUuY3dkIHx8IGFyZ3YuY3dkO1xuXG5cblxuXHRpZiAoIWNhY2hlLmN3ZClcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYGNhY2hlLmN3ZCBpcyAnJHtjYWNoZS5jd2R9J2ApXG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLmN3ZCA9IHBhdGgucmVzb2x2ZShjYWNoZS5jd2QpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUucmV0ID0ge307XG5cblx0Y2FjaGUueWFybmxvY2tfbXNnID0gdW5kZWZpbmVkO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUuY29uc29sZSA9IGNhY2hlLmNvbnNvbGUgfHwgY29uc29sZTtcblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5jb25zb2xlRGVidWcgPSBjYWNoZS5jb25zb2xlRGVidWcgfHwgY29uc29sZURlYnVnO1xuXG5cdGxldCB7IGluaXQsIGJlZm9yZSwgbWFpbiwgYWZ0ZXIsIGVuZCB9ID0gb3B0aW9ucztcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLnJvb3REYXRhID0gY2FjaGUucm9vdERhdGEgfHwgZmluZFJvb3Qoe1xuXHRcdC4uLmFyZ3YsXG5cdFx0Y3dkOiBjYWNoZS5jd2QsXG5cdH0sIHRydWUpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUueWFybmxvY2tfY2FjaGUgPSBjYWNoZS55YXJubG9ja19jYWNoZSB8fCBmc1lhcm5Mb2NrKGNhY2hlLnJvb3REYXRhLnJvb3QpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Y2FjaGUueWFybmxvY2tfb2xkID0gY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkO1xuXG5cdGNhY2hlLnlhcm5sb2NrX29sZDIgPSBjYWNoZS55YXJubG9ja19vbGQ7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS55YXJubG9ja19vbGRfZXhpc3RzID0gY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzO1xuXG5cdExBQkVMMToge1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNhY2hlLnJldC5pbml0ID0gaW5pdCA/ICEhaW5pdCh5YXJnLCBhcmd2LCBjYWNoZSkgOiBudWxsO1xuXG5cdFx0aWYgKGNhY2hlLnJldC5pbml0KVxuXHRcdHtcblx0XHRcdGJyZWFrIExBQkVMMTtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FjaGUucmV0LmJlZm9yZSA9IGJlZm9yZSA/ICEhYmVmb3JlKHlhcmcsIGFyZ3YsIGNhY2hlKSA6IG51bGw7XG5cdFx0aWYgKGNhY2hlLnJldC5iZWZvcmUpXG5cdFx0e1xuXHRcdFx0YnJlYWsgTEFCRUwxO1xuXHRcdH1cblxuXHRcdGNhY2hlLnlhcm5sb2NrX2NhY2hlID0gZnNZYXJuTG9jayhjYWNoZS5yb290RGF0YS5yb290KTtcblxuXHRcdGlmIChjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19leGlzdHMpXG5cdFx0e1xuXHRcdFx0bGV0IHJldDEgPSBEZWR1cGUoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkKTtcblxuXHRcdFx0aWYgKHJldDEueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyhjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlLCByZXQxLnlhcm5sb2NrX25ldyk7XG5cblx0XHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihyZXQxLnlhcm5sb2NrX29sZCwgcmV0MS55YXJubG9ja19uZXcpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19tc2cgPSBtc2c7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19vbGQgPSByZXQxLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgRGVkdXBsaWNhdGlvbiB5YXJuLmxvY2tgKTtcblx0XHRcdFx0Y29uc29sZURlYnVnLmdyYXkuaW5mbyhgJHtjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19maWxlfWApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjYWNoZS5yZXQubWFpbiA9ICEhbWFpbih5YXJnLCBhcmd2LCBjYWNoZSk7XG5cdFx0aWYgKGNhY2hlLnJldC5tYWluKVxuXHRcdHtcblx0XHRcdGJyZWFrIExBQkVMMTtcblx0XHR9XG5cblx0XHRjYWNoZS55YXJubG9ja19jYWNoZSA9IGZzWWFybkxvY2soY2FjaGUucm9vdERhdGEucm9vdCk7XG5cblx0XHRpZiAoY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfZXhpc3RzKVxuXHRcdHtcblx0XHRcdGxldCByZXQxID0gRGVkdXBlKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdGlmIChyZXQxLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19vbGQyID09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYWNoZS55YXJubG9ja19vbGQyID0gcmV0MS55YXJubG9ja19vbGQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2ZpbGUsIHJldDEueWFybmxvY2tfbmV3KTtcblxuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHJldDEueWFybmxvY2tfb2xkLCByZXQxLnlhcm5sb2NrX25ldyk7XG5cblx0XHRcdFx0aWYgKG1zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhY2hlLnlhcm5sb2NrX21zZyA9IG1zZztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCA9IHJldDEueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBEZWR1cGxpY2F0aW9uIHlhcm4ubG9ja2ApO1xuXHRcdFx0XHRjb25zb2xlRGVidWcuZ3JheS5pbmZvKGAke2NhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2ZpbGV9YCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChjYWNoZS55YXJubG9ja19jaGFuZ2VkID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQgPSByZXQxLnlhcm5sb2NrX2NoYW5nZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0e1xuXHRcdFx0aWYgKCFjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19leGlzdHMgfHwgIWNhY2hlLnlhcm5sb2NrX29sZCB8fCBjYWNoZS55YXJubG9ja19vbGQgPT0gY2FjaGUueWFybmxvY2tfY2FjaGUueWFybmxvY2tfb2xkKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZS55YXJubG9ja19jaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNhY2hlLnJldC5hZnRlciA9IGFmdGVyID8gISFhZnRlcih5YXJnLCBhcmd2LCBjYWNoZSkgOiBudWxsO1xuXHRcdGlmIChjYWNoZS5yZXQuYWZ0ZXIpXG5cdFx0e1xuXHRcdFx0YnJlYWsgTEFCRUwxO1xuXHRcdH1cblxuXHRcdGNhY2hlLnlhcm5sb2NrX2NhY2hlID0gZnNZYXJuTG9jayhjYWNoZS5yb290RGF0YS5yb290KTtcblxuXHRcdGlmIChjYWNoZS55YXJubG9ja19jYWNoZS55YXJubG9ja19leGlzdHMpXG5cdFx0e1xuXHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYoY2FjaGUueWFybmxvY2tfb2xkIHx8IGNhY2hlLnlhcm5sb2NrX29sZDIsIGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdFx0aWYgKG1zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhY2hlLnlhcm5sb2NrX21zZyA9IG1zZztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgeWFybmxvY2tfbm93ID0gZnMucmVhZEZpbGVTeW5jKGNhY2hlLnlhcm5sb2NrX2NhY2hlLnlhcm5sb2NrX2ZpbGUpLnRvU3RyaW5nKCk7XG5cdFx0XHRcdGxldCB5YXJubG9ja19vbGQyID0gY2FjaGUueWFybmxvY2tfb2xkIHx8IGNhY2hlLnlhcm5sb2NrX29sZDI7XG5cblx0XHRcdFx0aWYgKHlhcm5sb2NrX29sZDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHlhcm5sb2NrX29sZDIsIHlhcm5sb2NrX25vdyk7XG5cblx0XHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNhY2hlLnlhcm5sb2NrX21zZyA9IG1zZztcblxuXHRcdFx0XHRcdFx0Y2FjaGUueWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5yZXQuZW5kID0gZW5kID8gISFlbmQoeWFyZywgYXJndiwgY2FjaGUpIDogbnVsbDtcblxuXHRyZXR1cm4ge1xuXHRcdGN3ZDogY2FjaGUuY3dkLFxuXHRcdHJvb3REYXRhOiBjYWNoZS5yb290RGF0YSxcblx0XHR5YXJnLFxuXHRcdGFyZ3YsXG5cdFx0Y2FjaGUsXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZm9Gcm9tRGVkdXBlQ2FjaGU8QyBleHRlbmRzIElXcmFwRGVkdXBlQ2FjaGU+KGNhY2hlOiBDKVxue1xuXHRsZXQgeyB5YXJubG9ja19jaGFuZ2VkLCB5YXJubG9ja19vbGRfZXhpc3RzIH0gPSBjYWNoZTtcblxuXHRsZXQgeyB5YXJubG9ja19maWxlLCB5YXJubG9ja19leGlzdHMgfSA9IGNhY2hlLnlhcm5sb2NrX2NhY2hlO1xuXG5cdHJldHVybiB7XG5cdFx0Li4uY2FjaGUucm9vdERhdGEsXG5cdFx0eWFybmxvY2tfZmlsZSxcblx0XHR5YXJubG9ja19vbGRfZXhpc3RzLFxuXHRcdHlhcm5sb2NrX2V4aXN0cyxcblx0XHR5YXJubG9ja19jaGFuZ2VkLFxuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBEZWR1cGU7XG5cbi8qXG53cmFwRGVkdXBlKG51bGwsIG51bGwsIHtcblx0Y2FjaGU6IHtcblx0XHRjd2Q6ICcuJyxcblx0fSxcblx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0e1xuXHRcdGNvbnNvbGUubG9nKHlhcmcsIGFyZ3YsIGNhY2hlKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59KTtcbiovXG4iXX0=