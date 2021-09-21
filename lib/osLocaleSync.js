"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.osLocaleSync = void 0;
const os_lang_locale_1 = require("os-lang-locale");
const os_locale_1 = require("os-locale");
function osLocaleSync() {
    let lang;
    try {
        lang = (0, os_lang_locale_1.locale)().replace('-', '_');
    }
    catch (e) {
        lang = (0, os_locale_1.sync)();
    }
    return lang;
}
exports.osLocaleSync = osLocaleSync;
//# sourceMappingURL=osLocaleSync.js.map