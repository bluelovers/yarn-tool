"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dedupe = exports.yarnDedupe = exports.infoFromDedupeCache = exports.wrapDedupe = void 0;
var wrapDedupe_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe");
Object.defineProperty(exports, "wrapDedupe", { enumerable: true, get: function () { return wrapDedupe_1.wrapDedupe; } });
var infoFromDedupeCache_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/infoFromDedupeCache");
Object.defineProperty(exports, "infoFromDedupeCache", { enumerable: true, get: function () { return infoFromDedupeCache_1.infoFromDedupeCache; } });
var dedupe_1 = require("@yarn-tool/yarnlock/lib/dedupe");
Object.defineProperty(exports, "yarnDedupe", { enumerable: true, get: function () { return dedupe_1.yarnDedupe; } });
Object.defineProperty(exports, "Dedupe", { enumerable: true, get: function () { return dedupe_1.Dedupe; } });
const dedupe_2 = require("@yarn-tool/yarnlock/lib/dedupe");
exports.default = dedupe_2.yarnDedupe;
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
//# sourceMappingURL=dedupe.js.map