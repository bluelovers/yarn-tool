"use strict";
/**
 * Created by user on 2026/3/10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPackageManager = detectPackageManager;
const detect_package_manager_1 = require("@yarn-tool/detect-package-manager");
function detectPackageManager(argv) {
    const pmMap = {};
    for (const client of (0, detect_package_manager_1._whichPackageManagerSyncGenerator)([
        argv === null || argv === void 0 ? void 0 : argv.npmClients,
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
    return {
        npmClients,
        pmMap,
        pmIsYarn: npmClients === "yarn" /* EnumPackageManager.yarn */,
    };
}
//# sourceMappingURL=pm.js.map