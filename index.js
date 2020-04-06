"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.YT_BIN = exports.YT_ROOT = void 0;
const path = require("upath2");
exports.YT_ROOT = path.normalize(__dirname);
exports.YT_BIN = path.join(exports.YT_ROOT, 'bin/yarn-tool');
exports.default = exports.YT_ROOT;
//# sourceMappingURL=index.js.map