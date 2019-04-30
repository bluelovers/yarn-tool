"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_deduplicate_1 = require("yarn-deduplicate");
function Dedupe(yarnlock_old) {
    let yarnlock_new = yarn_deduplicate_1.fixDuplicates(yarnlock_old);
    return {
        yarnlock_old,
        yarnlock_new,
        yarnlock_changed: yarnlock_old !== yarnlock_new,
    };
}
exports.Dedupe = Dedupe;
exports.default = Dedupe;
//# sourceMappingURL=dedupe.js.map