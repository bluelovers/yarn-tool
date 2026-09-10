"use strict";
/**
 * Created by user on 2026/3/10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPackageManager = detectPackageManager;
const detect_package_manager_1 = require("@yarn-tool/detect-package-manager");
let _cachedDetectPackageManager = {};
function detectPackageManager(argv) {
    let input = argv === null || argv === void 0 ? void 0 : argv.npmClients;
    if (_cachedDetectPackageManager[input]) {
        return _cachedDetectPackageManager[input];
    }
    const pmMap = {};
    for (const client of (0, detect_package_manager_1._whichPackageManagerSyncGenerator)([
        input,
        "pnpm" /* EnumPackageManager.pnpm */,
        'lerna',
        "yarn" /* EnumPackageManager.yarn */,
        'corepack',
    ], {
        returnDefault: true,
        noUseDefaultClients: true,
    })) {
        pmMap[client[0]] = client[1];
    }
    const npmClients = "pnpm" /* EnumPackageManager.pnpm */ in pmMap
        ? "pnpm" /* EnumPackageManager.pnpm */
        : "yarn" /* EnumPackageManager.yarn */;
    const result = _cachedDetectPackageManager[input] = {
        npmClients,
        pmMap,
        pmIsYarn: npmClients === "yarn" /* EnumPackageManager.yarn */,
    };
    return result;
}
//# sourceMappingURL=pm.js.map