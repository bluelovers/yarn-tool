"use strict";
/**
 * Created by user on 2019/5/22.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotifier = void 0;
const isNpx = require("is-npx");
function updateNotifier() {
    if (!isNpx()) {
        const path = require('upath2');
        const _updateNotifier = require('update-notifier');
        const pkg = require(path.join(__dirname, '../package.json'));
        _updateNotifier({ pkg }).notify();
    }
}
exports.updateNotifier = updateNotifier;
//# sourceMappingURL=update-notifier.js.map