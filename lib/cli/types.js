"use strict";
/**
 * Created by user on 2019/7/1.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackageJsonInfo = void 0;
const packageJson = require("package-json");
const package_json_1 = require("package-json");
const add_1 = require("./add");
const Bluebird = require("bluebird");
async function fetchPackageJsonInfo(packageName, excludeVersion) {
    let m = (typeof packageName === 'string') ? add_1.parseArgvPkgName(packageName) : packageName;
    if (!m) {
        return null;
    }
    let { version, name, namespace } = m;
    if (excludeVersion || version === '') {
        version = undefined;
    }
    if (namespace) {
        name = namespace + '/' + name;
    }
    let pkg = await Bluebird.resolve(packageJson(name, {
        version: (version == null ? 'latest' : version),
        fullMetadata: true,
    }))
        .catch(package_json_1.VersionNotFoundError, err => {
        if (version != null) {
            return packageJson(`${m.namespace}${m.name}`, {
                version: 'latest',
                fullMetadata: true,
            });
        }
        return null;
    })
        .catch(package_json_1.PackageNotFoundError, err => null);
    return pkg;
}
exports.fetchPackageJsonInfo = fetchPackageJsonInfo;
//# sourceMappingURL=types.js.map