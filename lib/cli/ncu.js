"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const npm_check_updates_1 = require("npm-check-updates");
//import versionUtil = require('npm-check-updates/lib/version-util');
//import chalk = require('chalk');
const index_1 = require("../index");
const table_1 = require("../table");
const PackageManagersNpm = require("npm-check-updates/lib/package-managers/npm");
const versionmanager_1 = require("npm-check-updates/lib/versionmanager");
const versionUtil = require('npm-check-updates/lib/version-util');
const Bluebird = require("bluebird");
const yarnlock_1 = require("../yarnlock");
const semver = require("semver");
const packageJson = require("package-json");
const util = require("util");
var EnumVersionValue;
(function (EnumVersionValue) {
    EnumVersionValue["major"] = "major";
    EnumVersionValue["minor"] = "minor";
    EnumVersionValue["latest"] = "latest";
    EnumVersionValue["greatest"] = "greatest";
    EnumVersionValue["newest"] = "newest";
})(EnumVersionValue = exports.EnumVersionValue || (exports.EnumVersionValue = {}));
var EnumPackageManagersNpmMethod;
(function (EnumPackageManagersNpmMethod) {
    EnumPackageManagersNpmMethod["major"] = "greatestMajor";
    EnumPackageManagersNpmMethod["minor"] = "greatestMinor";
    EnumPackageManagersNpmMethod["latest"] = "latest";
    EnumPackageManagersNpmMethod["greatest"] = "greatest";
    EnumPackageManagersNpmMethod["newest"] = "newest";
})(EnumPackageManagersNpmMethod = exports.EnumPackageManagersNpmMethod || (exports.EnumPackageManagersNpmMethod = {}));
var EnumVersionValue2;
(function (EnumVersionValue2) {
    EnumVersionValue2["any"] = "*";
})(EnumVersionValue2 = exports.EnumVersionValue2 || (exports.EnumVersionValue2 = {}));
exports.versionCacheMap = new Map();
exports.remoteCacheMap = new Map();
function getVersionTarget(options) {
    if (typeof options === 'string') {
        // @ts-ignore
        return options;
    }
    else if (options.versionTarget) {
        return options.versionTarget;
    }
    return versionmanager_1.getVersionTarget(options);
}
exports.getVersionTarget = getVersionTarget;
function objVersionCache({ name, versionTarget, version_old, }) {
    return {
        name,
        versionTarget,
        version_old,
    };
}
exports.objVersionCache = objVersionCache;
function objVersionCacheValue({ name, versionTarget, version_old, version_new, }) {
    return {
        name,
        versionTarget,
        version_old,
        version_new,
    };
}
exports.objVersionCacheValue = objVersionCacheValue;
function strVersionCache(key) {
    return JSON.stringify(objVersionCache(key));
}
exports.strVersionCache = strVersionCache;
function hasQueryedVersionCache(key) {
    return exports.versionCacheMap.has(strVersionCache(key));
}
exports.hasQueryedVersionCache = hasQueryedVersionCache;
function keyObjectToPackageMap(obj, useVarsionNew) {
    return obj.reduce(function (a, data) {
        if (useVarsionNew) {
            if (typeof data.version_new !== 'string') {
                return a;
                throw new TypeError(`not a IVersionCacheMapValue object, ${util.inspect(data)}`);
            }
            a[data.name] = data.version_new;
        }
        else {
            a[data.name] = data.version_old;
        }
        return a;
        // @ts-ignore
    }, {});
}
exports.keyObjectToPackageMap = keyObjectToPackageMap;
function packageMapToKeyObject(packageMap, versionTarget) {
    return Object
        .entries(packageMap)
        .map(([name, version_old]) => {
        return objVersionCache({
            name, version_old, versionTarget,
        });
    });
}
exports.packageMapToKeyObject = packageMapToKeyObject;
function queryPackageManagersNpm(name, version = '0', versionTarget = EnumVersionValue.latest) {
    let method = EnumPackageManagersNpmMethod[versionTarget];
    if (version == null) {
        version = '0';
        switch (versionTarget) {
            case EnumVersionValue.latest:
            case EnumVersionValue.greatest:
            case EnumVersionValue.newest:
                break;
            case EnumVersionValue.major:
            case EnumVersionValue.minor:
                method = EnumPackageManagersNpmMethod.latest;
                break;
        }
    }
    return Bluebird
        .resolve(PackageManagersNpm[method](name, version))
        .then(async (value) => {
        if (value == null) {
            let r = await requestVersion(name);
            if (version in r['dist-tags']) {
                return r['dist-tags'][version];
            }
        }
        return value;
    });
}
exports.queryPackageManagersNpm = queryPackageManagersNpm;
function setVersionCacheMap(data) {
    return exports.versionCacheMap.set(strVersionCache(data), objVersionCacheValue(data));
}
exports.setVersionCacheMap = setVersionCacheMap;
function queryRemoteVersions(packageMap, options = {}) {
    return Bluebird.resolve()
        .then(async function () {
        options = npmCheckUpdatesOptions(options);
        //console.dir(options);
        options.loglevel = 'silent';
        let versionTarget = options.versionTarget = getVersionTarget(options) || EnumVersionValue.latest;
        if (Array.isArray(packageMap)) {
            packageMap = packageMap.reduce(function (a, b) {
                a[b] = versionTarget;
                return a;
            }, {});
        }
        let packageMapArray = packageMapToKeyObject(packageMap, versionTarget);
        let packageMapArrayFilted = await Bluebird.resolve(packageMapArray)
            .filter(async (d) => {
            let bool = !hasQueryedVersionCache(d);
            if (bool && isBadVersion(d.version_old)) {
                if (versionTarget === EnumVersionValue.minor) {
                    let version_new = await queryPackageManagersNpm(d.name);
                    d.version_old = version_new.split('.')[0] + '.0.0';
                    setVersionCacheMap({
                        ...d,
                        version_new,
                    });
                    bool = false;
                }
            }
            return bool;
        });
        let packageMap2 = keyObjectToPackageMap(packageMapArrayFilted);
        return Bluebird
            .resolve(versionmanager_1.queryVersions(packageMap2, options))
            .tap(ret => {
            return Bluebird.resolve(Object.entries(packageMap2))
                .each(async ([name, version_old]) => {
                let version_new = ret[name];
                if (version_old.includes('~')) {
                    if (!options.noSafe || version_new == null) {
                        version_new = await fetchVersion(name, {
                            filter(version) {
                                return semver.satisfies(version, version_old);
                            },
                        }, options)
                            .then(ret => ret.pop());
                    }
                }
                if (version_new == null && isBadVersion(version_old)) {
                    version_new = await queryPackageManagersNpm(name, null, versionTarget);
                }
                if (version_new == null) {
                    version_new = await queryPackageManagersNpm(name, version_old, versionTarget);
                }
                setVersionCacheMap({
                    name,
                    versionTarget,
                    version_old,
                    version_new,
                });
            });
        })
            .then(() => {
            return packageMapArray
                .map(data => exports.versionCacheMap.get(strVersionCache(data)));
        });
    });
}
exports.queryRemoteVersions = queryRemoteVersions;
function isBadVersion(version) {
    let bool = false;
    switch (version) {
        case EnumVersionValue.minor:
        case EnumVersionValue.major:
        case EnumVersionValue.newest:
        case EnumVersionValue.latest:
        case EnumVersionValue.greatest:
        case "*" /* any */:
            bool = true;
            break;
        default:
            if (version == null) {
                bool = true;
            }
            break;
    }
    return bool;
}
exports.isBadVersion = isBadVersion;
function npmCheckUpdatesOptions(ncuOptions) {
    ncuOptions = {
        ...ncuOptions,
    };
    delete ncuOptions.upgrade;
    delete ncuOptions.global;
    ncuOptions.packageManager = 'npm';
    if (ncuOptions.json_old) {
        ncuOptions.packageData = JSON.stringify(ncuOptions.json_old);
    }
    ncuOptions.jsonUpgraded = true;
    return ncuOptions;
}
exports.npmCheckUpdatesOptions = npmCheckUpdatesOptions;
async function npmCheckUpdates(cache, ncuOptions) {
    //ncuOptions.silent = false;
    //ncuOptions.json = false;
    //ncuOptions.cli = true;
    //ncuOptions.args = [];
    //ncuOptions.loglevel = 'verbose';
    ncuOptions = npmCheckUpdatesOptions(ncuOptions);
    ncuOptions.cwd = cache.cwd;
    ncuOptions.json_new = JSON.parse(ncuOptions.packageData);
    ncuOptions.list_updated = await npm_check_updates_1.run(ncuOptions);
    let ks = Object.keys(ncuOptions.list_updated);
    ncuOptions.json_changed = !!ks.length;
    let current = {};
    if (ks.length) {
        ks.forEach(name => {
            [
                'dependencies',
                'devDependencies',
                'peerDependencies',
                'optionalDependencies',
            ].forEach(key => {
                let data = ncuOptions.json_new[key];
                if (data) {
                    let value = data[name];
                    if (value && value != "*" /* any */ && value != EnumVersionValue.latest) {
                        current[name] = value;
                        data[name] = ncuOptions.list_updated[name];
                    }
                }
            });
        });
    }
    ncuOptions.current = current;
    let table = table_1.toDependencyTable({
        from: ncuOptions.current,
        to: ncuOptions.list_updated,
    }).toString();
    table && index_1.console.log(`\n${table}\n`);
    return ncuOptions;
}
exports.npmCheckUpdates = npmCheckUpdates;
function setupNcuToYargs(yargs) {
    return yargs
        .option('dep', {
        desc: `check only a specific section(s) of dependencies: prod|dev|peer|optional|bundle (comma-delimited)`,
        string: true,
    })
        .option('minimal', {
        alias: ['m'],
        desc: `do not upgrade newer versions that are already satisfied by the version range according to semver`,
        boolean: true,
    })
        .option('newest', {
        alias: ['n'],
        desc: `find the newest versions available instead of the latest stable versions`,
        boolean: true,
    })
        .option('packageManager', {
        alias: ['p'],
        desc: `npm (default) or bower`,
        default: 'npm',
        string: true,
    })
        .option('registry', {
        alias: ['r'],
        desc: `specify third-party npm registry`,
        string: true,
    })
        .option('silent', {
        alias: ['s'],
        desc: `don't output anything (--loglevel silent)`,
        boolean: true,
    })
        .option('greatest', {
        alias: ['g'],
        desc: `find the highest versions available instead of the latest stable versions`,
        boolean: true,
    })
        .option('upgrade', {
        alias: ['u'],
        desc: `overwrite package file`,
        boolean: true,
    })
        .option('semverLevel', {
        desc: `find the highest version within "major" or "minor"`,
        string: true,
    })
        .option('removeRange', {
        desc: `remove version ranges from the final package version`,
        boolean: true,
    })
        .option('dedupe', {
        desc: `remove upgrade module from resolutions`,
        boolean: true,
        default: true,
    });
}
exports.setupNcuToYargs = setupNcuToYargs;
function checkResolutionsUpdate(resolutions, yarnlock_old_obj, options) {
    return Bluebird.resolve()
        .then(async function () {
        if (typeof yarnlock_old_obj === 'string') {
            yarnlock_old_obj = yarnlock_1.parse(yarnlock_old_obj);
        }
        let result = yarnlock_1.filterResolutions({
            resolutions,
        }, yarnlock_old_obj);
        let deps = await queryRemoteVersions(resolutions, options);
        //console.dir(deps);
        let deps2 = keyObjectToPackageMap(deps, true);
        let deps3 = Object.values(deps)
            .reduce(function (a, b) {
            a[b.name] = b;
            return a;
        }, {});
        let yarnlock_new_obj = {
            ...yarnlock_old_obj,
        };
        let update_list = [];
        let yarnlock_changed = false;
        Object.entries(result.max)
            .forEach(function ([name, data]) {
            let _key2 = name + '@' + deps3[name].version_old;
            /**
             * 檢查 版本範圍是否符合 與 版本是否不相同
             */
            //					console.dir({
            //						data,
            //						deps: deps2[name],
            //					});
            if (data.value.version != null && deps2[name] != null && semver.lt(data.value.version, deps2[name]) && yarnlock_new_obj[_key2] && yarnlock_new_obj[_key2].version != data.value.version) {
                Object.keys(result.deps[name])
                    .forEach(version => {
                    let key = name + '@' + version;
                    delete yarnlock_new_obj[key];
                });
                yarnlock_changed = true;
                update_list.push(name);
            }
            else {
                if (result.installed[name].length > 1) {
                    Object.keys(result.deps[name])
                        .forEach(version => {
                        let key = name + '@' + version;
                        yarnlock_new_obj[key] = data.value;
                    });
                    yarnlock_changed = true;
                }
            }
        });
        return {
            yarnlock_old_obj,
            yarnlock_new_obj,
            update_list,
            yarnlock_changed,
            deps,
            deps2,
            deps3,
        };
    });
}
exports.checkResolutionsUpdate = checkResolutionsUpdate;
/*
(async () =>
{
    let rootData = findRoot({
        cwd: process.cwd()
    });

    let pkg = require('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/package.json');

    let yarnlock_old_obj = await readYarnLockfile(path.join(rootData.root, 'yarn.lock'));

    let ks = Object.keys(yarnlock_old_obj).filter(k => k.includes('string-width'))

    let ret = await checkResolutionsUpdate(pkg.resolutions, yarnlock_old_obj)

    console.dir(ret);

})();
 */
function isUpgradeable(current, latest) {
    return versionmanager_1.isUpgradeable(current, latest);
}
exports.isUpgradeable = isUpgradeable;
function updateSemver(current, latest, options = {}) {
    return versionmanager_1.upgradeDependencyDeclaration(current, latest, options);
}
exports.updateSemver = updateSemver;
function requestVersion(packageName) {
    return Bluebird
        .resolve(exports.remoteCacheMap.get(packageName))
        .then(function (result) {
        if (result == null) {
            return packageJson(packageName, { allVersions: true });
        }
        return result;
    })
        .tap(function (result) {
        return exports.remoteCacheMap.set(packageName, result);
    });
}
exports.requestVersion = requestVersion;
function fetchVersion(packageName, options = {}, ncuOptions) {
    let { field = 'versions' } = options;
    return requestVersion(packageName)
        //.resolve(packageJson(packageName, { allVersions: true }))
        .then(function (result) {
        if (field.startsWith('dist-tags.')) {
            const split = field.split('.');
            if (result[split[0]]) {
                return result[split[0]][split[1]];
            }
        }
        else if (field === 'versions') {
            return Object.keys(result[field]);
        }
        else if (field) {
            return result[field];
        }
    })
        .then(result => {
        if (options.filter) {
            return result.filter(options.filter);
        }
        //console.dir(result);
        return result;
    });
}
exports.fetchVersion = fetchVersion;
exports.default = setupNcuToYargs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBNkM7QUFDN0Msb0NBQTZDO0FBRzdDLGlGQUFrRjtBQUNsRix5RUFLOEM7QUFLOUMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUscUNBQXNDO0FBQ3RDLDBDQU9xQjtBQUVyQixpQ0FBa0M7QUFHbEMsNENBQTZDO0FBQzdDLDZCQUE2QjtBQVc3QixJQUFZLGdCQU9YO0FBUEQsV0FBWSxnQkFBZ0I7SUFFM0IsbUNBQWlCLENBQUE7SUFDakIsbUNBQWlCLENBQUE7SUFDakIscUNBQW1CLENBQUE7SUFDbkIseUNBQXVCLENBQUE7SUFDdkIscUNBQW1CLENBQUE7QUFDcEIsQ0FBQyxFQVBXLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBTzNCO0FBRUQsSUFBWSw0QkFPWDtBQVBELFdBQVksNEJBQTRCO0lBRXZDLHVEQUF5QixDQUFBO0lBQ3pCLHVEQUF5QixDQUFBO0lBQ3pCLGlEQUFtQixDQUFBO0lBQ25CLHFEQUF1QixDQUFBO0lBQ3ZCLGlEQUFtQixDQUFBO0FBQ3BCLENBQUMsRUFQVyw0QkFBNEIsR0FBNUIsb0NBQTRCLEtBQTVCLG9DQUE0QixRQU92QztBQUVELElBQWtCLGlCQUdqQjtBQUhELFdBQWtCLGlCQUFpQjtJQUVsQyw4QkFBUyxDQUFBO0FBQ1YsQ0FBQyxFQUhpQixpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUdsQztBQWNZLFFBQUEsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO0FBRTNELFFBQUEsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFrRSxDQUFDO0FBd0J4RyxTQUFnQixnQkFBZ0IsQ0FBQyxPQUErRDtJQUUvRixJQUFJLE9BQU8s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QyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDcEI7Z0JBQ0MsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEM7U0FDRDthQUNJLElBQUksS0FBSyxLQUFLLFVBQVUsRUFDN0I7WUFDQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbEM7YUFDSSxJQUFJLEtBQUssRUFDZDtZQUNDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JCO0lBQ0YsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBR2QsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUNsQjtZQUNDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDcEM7UUFFRCxzQkFBc0I7UUFFdEIsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUExQ0Qsb0NBMENDO0FBRUQsa0JBQWUsZUFBZSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS80LzMwLlxuICovXG5cbmltcG9ydCB7IHJ1biBhcyBfbnBtQ2hlY2tVcGRhdGVzIH0gZnJvbSAnbnBtLWNoZWNrLXVwZGF0ZXMnO1xuaW1wb3J0IHsgSVdyYXBEZWR1cGVDYWNoZSB9IGZyb20gJy4vZGVkdXBlJztcbmltcG9ydCBJUGFja2FnZUpzb24gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMvcGFja2FnZS1qc29uJztcbi8vaW1wb3J0IHZlcnNpb25VdGlsID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3ZlcnNpb24tdXRpbCcpO1xuLy9pbXBvcnQgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpO1xuaW1wb3J0IHsgY29uc29sZSwgZmluZFJvb3QgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyB0b0RlcGVuZGVuY3lUYWJsZSB9IGZyb20gJy4uL3RhYmxlJztcbmltcG9ydCB7IEFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBJVW5wYWNrWWFyZ3NBcmd2IH0gZnJvbSAnLi4vY2xpJztcbmltcG9ydCBQYWNrYWdlTWFuYWdlcnNOcG0gPSByZXF1aXJlKCducG0tY2hlY2stdXBkYXRlcy9saWIvcGFja2FnZS1tYW5hZ2Vycy9ucG0nKTtcbmltcG9ydCB7XG5cdHF1ZXJ5VmVyc2lvbnMgYXMgX3F1ZXJ5VmVyc2lvbnMsXG5cdGdldFZlcnNpb25UYXJnZXQgYXMgX2dldFZlcnNpb25UYXJnZXQsXG5cdGlzVXBncmFkZWFibGUgYXMgX2lzVXBncmFkZWFibGUsXG5cdHVwZ3JhZGVEZXBlbmRlbmN5RGVjbGFyYXRpb24sXG59IGZyb20gJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9ubWFuYWdlcic7XG5pbXBvcnQge1xuXHRJVFNVbnBhY2tlZFByb21pc2VMaWtlLFxufSBmcm9tICd0cy10eXBlJztcblxuY29uc3QgdmVyc2lvblV0aWwgPSByZXF1aXJlKCducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbi11dGlsJyk7XG5pbXBvcnQgQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHtcblx0ZmlsdGVyUmVzb2x1dGlvbnMsXG5cdElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCxcblx0cGFyc2UgYXMgcGFyc2VZYXJuTG9jayxcblx0cGFyc2UsXG5cdHJlYWRZYXJuTG9ja2ZpbGUsXG5cdHN0cmlwRGVwc05hbWUsXG59IGZyb20gJy4uL3lhcm5sb2NrJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHNlbXZlcnV0aWxzID0gcmVxdWlyZSgnc2VtdmVyLXV0aWxzJyk7XG5pbXBvcnQgcGFja2FnZUpzb24gPSByZXF1aXJlKCdwYWNrYWdlLWpzb24nKTtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmV4cG9ydCB0eXBlIElWZXJzaW9uVmFsdWUgPSAnbGF0ZXN0JyB8ICcqJyB8IHN0cmluZyB8IEVudW1WZXJzaW9uVmFsdWUgfCBFbnVtVmVyc2lvblZhbHVlMjtcblxuZXhwb3J0IGludGVyZmFjZSBJVmVyc2lvbkNhY2hlTWFwS2V5XG57XG5cdG5hbWU6IHN0cmluZyxcblx0dmVyc2lvblRhcmdldDogRW51bVZlcnNpb25WYWx1ZSxcblx0dmVyc2lvbl9vbGQ6IElWZXJzaW9uVmFsdWUsXG59XG5cbmV4cG9ydCBlbnVtIEVudW1WZXJzaW9uVmFsdWVcbntcblx0J21ham9yJyA9ICdtYWpvcicsXG5cdCdtaW5vcicgPSAnbWlub3InLFxuXHQnbGF0ZXN0JyA9ICdsYXRlc3QnLFxuXHQnZ3JlYXRlc3QnID0gJ2dyZWF0ZXN0Jyxcblx0J25ld2VzdCcgPSAnbmV3ZXN0J1xufVxuXG5leHBvcnQgZW51bSBFbnVtUGFja2FnZU1hbmFnZXJzTnBtTWV0aG9kXG57XG5cdCdtYWpvcicgPSAnZ3JlYXRlc3RNYWpvcicsXG5cdCdtaW5vcicgPSAnZ3JlYXRlc3RNaW5vcicsXG5cdCdsYXRlc3QnID0gJ2xhdGVzdCcsXG5cdCdncmVhdGVzdCcgPSAnZ3JlYXRlc3QnLFxuXHQnbmV3ZXN0JyA9ICduZXdlc3QnXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEVudW1WZXJzaW9uVmFsdWUyXG57XG5cdGFueSA9ICcqJ1xufVxuXG5leHBvcnQgdHlwZSBJRGVwZW5kZW5jeSA9IElQYWNrYWdlTWFwO1xuXG5leHBvcnQgaW50ZXJmYWNlIElQYWNrYWdlTWFwXG57XG5cdFtuYW1lOiBzdHJpbmddOiBJVmVyc2lvblZhbHVlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZlcnNpb25DYWNoZU1hcFZhbHVlIGV4dGVuZHMgSVZlcnNpb25DYWNoZU1hcEtleVxue1xuXHR2ZXJzaW9uX25ldzogSVZlcnNpb25WYWx1ZSxcbn1cblxuZXhwb3J0IGNvbnN0IHZlcnNpb25DYWNoZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJVmVyc2lvbkNhY2hlTWFwVmFsdWU+KCk7XG5cbmV4cG9ydCBjb25zdCByZW1vdGVDYWNoZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBJVFNVbnBhY2tlZFByb21pc2VMaWtlPFJldHVyblR5cGU8dHlwZW9mIHBhY2thZ2VKc29uPj4+KCk7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zID0gSVVucGFja1lhcmdzQXJndjxSZXR1cm5UeXBlPHR5cGVvZiBzZXR1cE5jdVRvWWFyZ3M+PiAmIHtcblx0anNvbl9vbGQ6IElQYWNrYWdlSnNvbjtcblx0Y3dkPzogc3RyaW5nO1xuXHRwYWNrYWdlRGF0YT86IHN0cmluZztcblx0cGFja2FnZU1hbmFnZXI/OiAnbnBtJyB8ICdib3dlcic7XG5cblx0anNvbl9uZXc/OiBJUGFja2FnZUpzb247XG5cdGpzb25fY2hhbmdlZD86IGJvb2xlYW47XG5cblx0bGlzdF91cGRhdGVkPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuXHRsb2dsZXZlbD86ICdzaWxlbnQnIHwgJ3ZlcmJvc2UnO1xuXG5cdHNlbXZlckxldmVsPzogRW51bVZlcnNpb25WYWx1ZS5tYWpvciB8IEVudW1WZXJzaW9uVmFsdWUubWlub3IsXG5cblx0dmVyc2lvblRhcmdldD86IEVudW1WZXJzaW9uVmFsdWUsXG5cblx0Y3VycmVudD86IElEZXBlbmRlbmN5O1xuXG5cdG5vU2FmZT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uVGFyZ2V0KG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+IHwgc3RyaW5nIHwgSU9wdGlvbnNbJ3ZlcnNpb25UYXJnZXQnXSk6IElPcHRpb25zWyd2ZXJzaW9uVGFyZ2V0J11cbntcblx0aWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gb3B0aW9uc1xuXHR9XG5cdGVsc2UgaWYgKG9wdGlvbnMudmVyc2lvblRhcmdldClcblx0e1xuXHRcdHJldHVybiBvcHRpb25zLnZlcnNpb25UYXJnZXRcblx0fVxuXG5cdHJldHVybiBfZ2V0VmVyc2lvblRhcmdldChvcHRpb25zKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JqVmVyc2lvbkNhY2hlKHtcblx0bmFtZSxcblx0dmVyc2lvblRhcmdldCxcblx0dmVyc2lvbl9vbGQsXG59OiBJVmVyc2lvbkNhY2hlTWFwS2V5KTogSVZlcnNpb25DYWNoZU1hcEtleVxue1xuXHRyZXR1cm4ge1xuXHRcdG5hbWUsXG5cdFx0dmVyc2lvblRhcmdldCxcblx0XHR2ZXJzaW9uX29sZCxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ialZlcnNpb25DYWNoZVZhbHVlKHtcblx0bmFtZSxcblx0dmVyc2lvblRhcmdldCxcblx0dmVyc2lvbl9vbGQsXG5cdHZlcnNpb25fbmV3LFxufTogSVZlcnNpb25DYWNoZU1hcFZhbHVlKTogSVZlcnNpb25DYWNoZU1hcFZhbHVlXG57XG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdHZlcnNpb25fb2xkLFxuXHRcdHZlcnNpb25fbmV3LFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyVmVyc2lvbkNhY2hlKGtleTogSVZlcnNpb25DYWNoZU1hcEtleSlcbntcblx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9ialZlcnNpb25DYWNoZShrZXkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1F1ZXJ5ZWRWZXJzaW9uQ2FjaGUoa2V5OiBJVmVyc2lvbkNhY2hlTWFwS2V5KVxue1xuXHRyZXR1cm4gdmVyc2lvbkNhY2hlTWFwLmhhcyhzdHJWZXJzaW9uQ2FjaGUoa2V5KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleU9iamVjdFRvUGFja2FnZU1hcChvYmo6IElWZXJzaW9uQ2FjaGVNYXBLZXlbXSB8IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZVtdLFxuXHR1c2VWYXJzaW9uTmV3PzogYm9vbGVhbixcbik6IElQYWNrYWdlTWFwXG57XG5cdHJldHVybiBvYmoucmVkdWNlKGZ1bmN0aW9uIChhOiBhbnksIGRhdGEpXG5cdHtcblx0XHRpZiAodXNlVmFyc2lvbk5ldylcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIGRhdGEudmVyc2lvbl9uZXcgIT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYTtcblxuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBub3QgYSBJVmVyc2lvbkNhY2hlTWFwVmFsdWUgb2JqZWN0LCAke3V0aWwuaW5zcGVjdChkYXRhKX1gKVxuXHRcdFx0fVxuXG5cdFx0XHRhW2RhdGEubmFtZV0gPSBkYXRhLnZlcnNpb25fbmV3O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0YVtkYXRhLm5hbWVdID0gZGF0YS52ZXJzaW9uX29sZDtcblx0XHR9XG5cblx0XHRyZXR1cm4gYTtcblx0XHQvLyBAdHMtaWdub3JlXG5cdH0sIHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja2FnZU1hcFRvS2V5T2JqZWN0KHBhY2thZ2VNYXA6IElQYWNrYWdlTWFwLCB2ZXJzaW9uVGFyZ2V0OiBJVmVyc2lvbkNhY2hlTWFwS2V5W1widmVyc2lvblRhcmdldFwiXSlcbntcblx0cmV0dXJuIE9iamVjdFxuXHRcdC5lbnRyaWVzKHBhY2thZ2VNYXApXG5cdFx0Lm1hcCgoW25hbWUsIHZlcnNpb25fb2xkXSkgPT5cblx0XHR7XG5cdFx0XHRyZXR1cm4gb2JqVmVyc2lvbkNhY2hlKHtcblx0XHRcdFx0bmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25UYXJnZXQsXG5cdFx0XHR9KVxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZTogc3RyaW5nLFxuXHR2ZXJzaW9uOiBJVmVyc2lvblZhbHVlID0gJzAnLFxuXHR2ZXJzaW9uVGFyZ2V0OiBFbnVtVmVyc2lvblZhbHVlID0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QsXG4pOiBCbHVlYmlyZDxJVmVyc2lvblZhbHVlPlxue1xuXHRsZXQgbWV0aG9kID0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZFt2ZXJzaW9uVGFyZ2V0XTtcblxuXHRpZiAodmVyc2lvbiA9PSBudWxsKVxuXHR7XG5cdFx0dmVyc2lvbiA9ICcwJztcblxuXHRcdHN3aXRjaCAodmVyc2lvblRhcmdldClcblx0XHR7XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0OlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmdyZWF0ZXN0OlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm5ld2VzdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWFqb3I6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0XHRcdG1ldGhvZCA9IEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2QubGF0ZXN0O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gQmx1ZWJpcmRcblx0XHQucmVzb2x2ZTxJVmVyc2lvblZhbHVlPihQYWNrYWdlTWFuYWdlcnNOcG1bbWV0aG9kXShuYW1lLCB2ZXJzaW9uKSlcblx0XHQudGhlbihhc3luYyAodmFsdWUpID0+XG5cdFx0e1xuXHRcdFx0aWYgKHZhbHVlID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCByID0gYXdhaXQgcmVxdWVzdFZlcnNpb24obmFtZSk7XG5cblx0XHRcdFx0aWYgKHZlcnNpb24gaW4gclsnZGlzdC10YWdzJ10pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gclsnZGlzdC10YWdzJ11bdmVyc2lvbl1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9KVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRWZXJzaW9uQ2FjaGVNYXAoZGF0YTogSVZlcnNpb25DYWNoZU1hcFZhbHVlKVxue1xuXHRyZXR1cm4gdmVyc2lvbkNhY2hlTWFwLnNldChzdHJWZXJzaW9uQ2FjaGUoZGF0YSksIG9ialZlcnNpb25DYWNoZVZhbHVlKGRhdGEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5UmVtb3RlVmVyc2lvbnMocGFja2FnZU1hcDogSVBhY2thZ2VNYXAgfCBzdHJpbmdbXSwgb3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gPSB7fSlcbntcblx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IG5wbUNoZWNrVXBkYXRlc09wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRcdC8vY29uc29sZS5kaXIob3B0aW9ucyk7XG5cblx0XHRcdG9wdGlvbnMubG9nbGV2ZWwgPSAnc2lsZW50JztcblxuXHRcdFx0bGV0IHZlcnNpb25UYXJnZXQgPSBvcHRpb25zLnZlcnNpb25UYXJnZXQgPSBnZXRWZXJzaW9uVGFyZ2V0KG9wdGlvbnMpIHx8IEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0O1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwYWNrYWdlTWFwKSlcblx0XHRcdHtcblx0XHRcdFx0cGFja2FnZU1hcCA9IHBhY2thZ2VNYXAucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YVtiXSA9IHZlcnNpb25UYXJnZXQ7XG5cblx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHR9LCB7fSBhcyBJUGFja2FnZU1hcCk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYWNrYWdlTWFwQXJyYXkgPSBwYWNrYWdlTWFwVG9LZXlPYmplY3QocGFja2FnZU1hcCwgdmVyc2lvblRhcmdldCk7XG5cblx0XHRcdGxldCBwYWNrYWdlTWFwQXJyYXlGaWx0ZWQgPSBhd2FpdCBCbHVlYmlyZC5yZXNvbHZlKHBhY2thZ2VNYXBBcnJheSlcblx0XHRcdFx0LmZpbHRlcihhc3luYyAoZCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBib29sID0gIWhhc1F1ZXJ5ZWRWZXJzaW9uQ2FjaGUoZCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbCAmJiBpc0JhZFZlcnNpb24oZC52ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHZlcnNpb25UYXJnZXQgPT09IEVudW1WZXJzaW9uVmFsdWUubWlub3IpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKGQubmFtZSk7XG5cblx0XHRcdFx0XHRcdFx0ZC52ZXJzaW9uX29sZCA9IHZlcnNpb25fbmV3LnNwbGl0KCcuJylbMF0gKyAnLjAuMCc7XG5cblx0XHRcdFx0XHRcdFx0c2V0VmVyc2lvbkNhY2hlTWFwKHtcblx0XHRcdFx0XHRcdFx0XHQuLi5kLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3LFxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRib29sID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGJvb2xcblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0bGV0IHBhY2thZ2VNYXAyID0ga2V5T2JqZWN0VG9QYWNrYWdlTWFwKHBhY2thZ2VNYXBBcnJheUZpbHRlZCk7XG5cblx0XHRcdHJldHVybiBCbHVlYmlyZFxuXHRcdFx0XHQucmVzb2x2ZTxJUGFja2FnZU1hcD4oX3F1ZXJ5VmVyc2lvbnMocGFja2FnZU1hcDIsIG9wdGlvbnMpKVxuXHRcdFx0XHQudGFwKHJldCA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoT2JqZWN0LmVudHJpZXMocGFja2FnZU1hcDIpKVxuXHRcdFx0XHRcdFx0LmVhY2goYXN5bmMgKFtuYW1lLCB2ZXJzaW9uX29sZF0pID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB2ZXJzaW9uX25ldyA9IHJldFtuYW1lXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAodmVyc2lvbl9vbGQuaW5jbHVkZXMoJ34nKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5ub1NhZmUgfHwgdmVyc2lvbl9uZXcgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IGZldGNoVmVyc2lvbihuYW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZpbHRlcih2ZXJzaW9uKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgdmVyc2lvbl9vbGQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBvcHRpb25zKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbihyZXQgPT4gcmV0LnBvcCgpKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX25ldyA9PSBudWxsICYmIGlzQmFkVmVyc2lvbih2ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIG51bGwsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fbmV3ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIHZlcnNpb25fb2xkLCB2ZXJzaW9uVGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHNldFZlcnNpb25DYWNoZU1hcCh7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fb2xkLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3LFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcGFja2FnZU1hcEFycmF5XG5cdFx0XHRcdFx0XHQubWFwKGRhdGEgPT4gdmVyc2lvbkNhY2hlTWFwLmdldChzdHJWZXJzaW9uQ2FjaGUoZGF0YSkpKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JhZFZlcnNpb24odmVyc2lvbjogSVZlcnNpb25WYWx1ZSlcbntcblx0bGV0IGJvb2wgPSBmYWxzZTtcblx0c3dpdGNoICh2ZXJzaW9uKVxuXHR7XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5tYWpvcjpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubmV3ZXN0OlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmdyZWF0ZXN0OlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZTIuYW55OlxuXHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXG5cdFx0XHRpZiAodmVyc2lvbiA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gYm9vbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlc09wdGlvbnMobmN1T3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gfCBJT3B0aW9ucyk6IElPcHRpb25zXG57XG5cdG5jdU9wdGlvbnMgPSB7XG5cdFx0Li4ubmN1T3B0aW9ucyxcblx0fTtcblxuXHRkZWxldGUgbmN1T3B0aW9ucy51cGdyYWRlO1xuXHRkZWxldGUgbmN1T3B0aW9ucy5nbG9iYWw7XG5cblx0bmN1T3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9ICducG0nO1xuXG5cdGlmIChuY3VPcHRpb25zLmpzb25fb2xkKVxuXHR7XG5cdFx0bmN1T3B0aW9ucy5wYWNrYWdlRGF0YSA9IEpTT04uc3RyaW5naWZ5KG5jdU9wdGlvbnMuanNvbl9vbGQpO1xuXHR9XG5cblx0bmN1T3B0aW9ucy5qc29uVXBncmFkZWQgPSB0cnVlO1xuXG5cdHJldHVybiBuY3VPcHRpb25zIGFzIElPcHRpb25zXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1DaGVja1VwZGF0ZXM8QyBleHRlbmRzIElXcmFwRGVkdXBlQ2FjaGU+KGNhY2hlOiBQYXJ0aWFsPEM+LCBuY3VPcHRpb25zOiBJT3B0aW9ucylcbntcblx0Ly9uY3VPcHRpb25zLnNpbGVudCA9IGZhbHNlO1xuXG5cdC8vbmN1T3B0aW9ucy5qc29uID0gZmFsc2U7XG5cdC8vbmN1T3B0aW9ucy5jbGkgPSB0cnVlO1xuXG5cdC8vbmN1T3B0aW9ucy5hcmdzID0gW107XG5cblx0Ly9uY3VPcHRpb25zLmxvZ2xldmVsID0gJ3ZlcmJvc2UnO1xuXG5cdG5jdU9wdGlvbnMgPSBucG1DaGVja1VwZGF0ZXNPcHRpb25zKG5jdU9wdGlvbnMpO1xuXG5cdG5jdU9wdGlvbnMuY3dkID0gY2FjaGUuY3dkO1xuXG5cdG5jdU9wdGlvbnMuanNvbl9uZXcgPSBKU09OLnBhcnNlKG5jdU9wdGlvbnMucGFja2FnZURhdGEpO1xuXG5cdG5jdU9wdGlvbnMubGlzdF91cGRhdGVkID0gYXdhaXQgX25wbUNoZWNrVXBkYXRlcyhuY3VPcHRpb25zKSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKG5jdU9wdGlvbnMubGlzdF91cGRhdGVkKTtcblxuXHRuY3VPcHRpb25zLmpzb25fY2hhbmdlZCA9ICEha3MubGVuZ3RoO1xuXG5cdGxldCBjdXJyZW50OiBJRGVwZW5kZW5jeSA9IHt9O1xuXG5cdGlmIChrcy5sZW5ndGgpXG5cdHtcblx0XHRrcy5mb3JFYWNoKG5hbWUgPT5cblx0XHR7XG5cblx0XHRcdCg8KGtleW9mIElQYWNrYWdlSnNvbilbXT5bXG5cdFx0XHRcdCdkZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQnZGV2RGVwZW5kZW5jaWVzJyxcblx0XHRcdFx0J3BlZXJEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQnb3B0aW9uYWxEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XSkuZm9yRWFjaChrZXkgPT5cblx0XHRcdHtcblxuXHRcdFx0XHRsZXQgZGF0YSA9IG5jdU9wdGlvbnMuanNvbl9uZXdba2V5XTtcblxuXHRcdFx0XHRpZiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2YWx1ZSA9IGRhdGFbbmFtZV07XG5cblx0XHRcdFx0XHRpZiAodmFsdWUgJiYgdmFsdWUgIT0gRW51bVZlcnNpb25WYWx1ZTIuYW55ICYmIHZhbHVlICE9IEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGN1cnJlbnRbbmFtZV0gPSB2YWx1ZTtcblxuXHRcdFx0XHRcdFx0ZGF0YVtuYW1lXSA9IG5jdU9wdGlvbnMubGlzdF91cGRhdGVkW25hbWVdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9KVxuXG5cdFx0fSk7XG5cblx0fVxuXG5cdG5jdU9wdGlvbnMuY3VycmVudCA9IGN1cnJlbnQ7XG5cblx0bGV0IHRhYmxlID0gdG9EZXBlbmRlbmN5VGFibGUoe1xuXHRcdGZyb206IG5jdU9wdGlvbnMuY3VycmVudCxcblx0XHR0bzogbmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQsXG5cdH0pLnRvU3RyaW5nKCk7XG5cblx0dGFibGUgJiYgY29uc29sZS5sb2coYFxcbiR7dGFibGV9XFxuYCk7XG5cblx0cmV0dXJuIG5jdU9wdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cE5jdVRvWWFyZ3M8VCBleHRlbmRzIGFueT4oeWFyZ3M6IEFyZ3Y8VD4pXG57XG5cdHJldHVybiB5YXJnc1xuXHRcdC5vcHRpb24oJ2RlcCcsIHtcblx0XHRcdGRlc2M6IGBjaGVjayBvbmx5IGEgc3BlY2lmaWMgc2VjdGlvbihzKSBvZiBkZXBlbmRlbmNpZXM6IHByb2R8ZGV2fHBlZXJ8b3B0aW9uYWx8YnVuZGxlIChjb21tYS1kZWxpbWl0ZWQpYCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ21pbmltYWwnLCB7XG5cdFx0XHRhbGlhczogWydtJ10sXG5cdFx0XHRkZXNjOiBgZG8gbm90IHVwZ3JhZGUgbmV3ZXIgdmVyc2lvbnMgdGhhdCBhcmUgYWxyZWFkeSBzYXRpc2ZpZWQgYnkgdGhlIHZlcnNpb24gcmFuZ2UgYWNjb3JkaW5nIHRvIHNlbXZlcmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbmV3ZXN0Jywge1xuXHRcdFx0YWxpYXM6IFsnbiddLFxuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIG5ld2VzdCB2ZXJzaW9ucyBhdmFpbGFibGUgaW5zdGVhZCBvZiB0aGUgbGF0ZXN0IHN0YWJsZSB2ZXJzaW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncGFja2FnZU1hbmFnZXInLCB7XG5cdFx0XHRhbGlhczogWydwJ10sXG5cdFx0XHRkZXNjOiBgbnBtIChkZWZhdWx0KSBvciBib3dlcmAsXG5cdFx0XHRkZWZhdWx0OiAnbnBtJyxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3JlZ2lzdHJ5Jywge1xuXHRcdFx0YWxpYXM6IFsnciddLFxuXHRcdFx0ZGVzYzogYHNwZWNpZnkgdGhpcmQtcGFydHkgbnBtIHJlZ2lzdHJ5YCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NpbGVudCcsIHtcblx0XHRcdGFsaWFzOiBbJ3MnXSxcblx0XHRcdGRlc2M6IGBkb24ndCBvdXRwdXQgYW55dGhpbmcgKC0tbG9nbGV2ZWwgc2lsZW50KWAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZ3JlYXRlc3QnLCB7XG5cdFx0XHRhbGlhczogWydnJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgaGlnaGVzdCB2ZXJzaW9ucyBhdmFpbGFibGUgaW5zdGVhZCBvZiB0aGUgbGF0ZXN0IHN0YWJsZSB2ZXJzaW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigndXBncmFkZScsIHtcblx0XHRcdGFsaWFzOiBbJ3UnXSxcblx0XHRcdGRlc2M6IGBvdmVyd3JpdGUgcGFja2FnZSBmaWxlYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdzZW12ZXJMZXZlbCcsIHtcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb24gd2l0aGluIFwibWFqb3JcIiBvciBcIm1pbm9yXCJgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVtb3ZlUmFuZ2UnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHZlcnNpb24gcmFuZ2VzIGZyb20gdGhlIGZpbmFsIHBhY2thZ2UgdmVyc2lvbmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZGVkdXBlJywge1xuXHRcdFx0ZGVzYzogYHJlbW92ZSB1cGdyYWRlIG1vZHVsZSBmcm9tIHJlc29sdXRpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRkZWZhdWx0OiB0cnVlLFxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShyZXNvbHV0aW9uczogSVBhY2thZ2VNYXAsXG5cdHlhcm5sb2NrX29sZF9vYmo6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCB8IHN0cmluZyxcblx0b3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4sXG4pXG57XG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgeWFybmxvY2tfb2xkX29iaiA9PT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlhcm5sb2NrX29sZF9vYmopO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcmVzdWx0ID0gZmlsdGVyUmVzb2x1dGlvbnMoe1xuXHRcdFx0XHRyZXNvbHV0aW9ucyxcblx0XHRcdH0sIHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdFx0XHRsZXQgZGVwcyA9IGF3YWl0IHF1ZXJ5UmVtb3RlVmVyc2lvbnMocmVzb2x1dGlvbnMsIG9wdGlvbnMpO1xuXG5cdFx0XHQvL2NvbnNvbGUuZGlyKGRlcHMpO1xuXG5cdFx0XHRsZXQgZGVwczIgPSBrZXlPYmplY3RUb1BhY2thZ2VNYXAoZGVwcywgdHJ1ZSk7XG5cblx0XHRcdGxldCBkZXBzMyA9IE9iamVjdC52YWx1ZXMoZGVwcylcblx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFbYi5uYW1lXSA9IGI7XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwge30gYXMgUmVjb3JkPHN0cmluZywgSVZlcnNpb25DYWNoZU1hcFZhbHVlPilcblx0XHRcdDtcblxuXHRcdFx0bGV0IHlhcm5sb2NrX25ld19vYmo6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCA9IHtcblx0XHRcdFx0Li4ueWFybmxvY2tfb2xkX29iaixcblx0XHRcdH07XG5cblx0XHRcdGxldCB1cGRhdGVfbGlzdDogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCB5YXJubG9ja19jaGFuZ2VkID0gZmFsc2U7XG5cblx0XHRcdE9iamVjdC5lbnRyaWVzKHJlc3VsdC5tYXgpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChbbmFtZSwgZGF0YV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2tleTIgPSBuYW1lICsgJ0AnICsgZGVwczNbbmFtZV0udmVyc2lvbl9vbGQ7XG5cblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiDmqqLmn6Ug54mI5pys56+E5ZyN5piv5ZCm56ym5ZCIIOiIhyDniYjmnKzmmK/lkKbkuI3nm7jlkIxcblx0XHRcdFx0XHQgKi9cbi8vXHRcdFx0XHRcdGNvbnNvbGUuZGlyKHtcbi8vXHRcdFx0XHRcdFx0ZGF0YSxcbi8vXHRcdFx0XHRcdFx0ZGVwczogZGVwczJbbmFtZV0sXG4vL1x0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAoZGF0YS52YWx1ZS52ZXJzaW9uICE9IG51bGwgJiYgZGVwczJbbmFtZV0gIT0gbnVsbCAmJiBzZW12ZXIubHQoZGF0YS52YWx1ZS52ZXJzaW9uLCBkZXBzMltuYW1lXSkgJiYgeWFybmxvY2tfbmV3X29ialtfa2V5Ml0gJiYgeWFybmxvY2tfbmV3X29ialtfa2V5Ml0udmVyc2lvbiAhPSBkYXRhLnZhbHVlLnZlcnNpb24pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0T2JqZWN0LmtleXMocmVzdWx0LmRlcHNbbmFtZV0pXG5cdFx0XHRcdFx0XHRcdC5mb3JFYWNoKHZlcnNpb24gPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBrZXkgPSBuYW1lICsgJ0AnICsgdmVyc2lvbjtcblxuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSB5YXJubG9ja19uZXdfb2JqW2tleV1cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdHVwZGF0ZV9saXN0LnB1c2gobmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0Lmluc3RhbGxlZFtuYW1lXS5sZW5ndGggPiAxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhyZXN1bHQuZGVwc1tuYW1lXSlcblx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaCh2ZXJzaW9uID0+XG5cdFx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQga2V5ID0gbmFtZSArICdAJyArIHZlcnNpb247XG5cblx0XHRcdFx0XHRcdFx0XHRcdHlhcm5sb2NrX25ld19vYmpba2V5XSA9IGRhdGEudmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR5YXJubG9ja19vbGRfb2JqLFxuXHRcdFx0XHR5YXJubG9ja19uZXdfb2JqLFxuXHRcdFx0XHR1cGRhdGVfbGlzdCxcblx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCxcblx0XHRcdFx0ZGVwcyxcblx0XHRcdFx0ZGVwczIsXG5cdFx0XHRcdGRlcHMzLFxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0O1xufVxuXG4vKlxuKGFzeW5jICgpID0+XG57XG5cdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKClcblx0fSk7XG5cblx0bGV0IHBrZyA9IHJlcXVpcmUoJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMvcGFja2FnZS5qc29uJyk7XG5cblx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBhd2FpdCByZWFkWWFybkxvY2tmaWxlKHBhdGguam9pbihyb290RGF0YS5yb290LCAneWFybi5sb2NrJykpO1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKHlhcm5sb2NrX29sZF9vYmopLmZpbHRlcihrID0+IGsuaW5jbHVkZXMoJ3N0cmluZy13aWR0aCcpKVxuXG5cdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHBrZy5yZXNvbHV0aW9ucywgeWFybmxvY2tfb2xkX29iailcblxuXHRjb25zb2xlLmRpcihyZXQpO1xuXG59KSgpO1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VwZ3JhZGVhYmxlKGN1cnJlbnQ6IElWZXJzaW9uVmFsdWUsIGxhdGVzdDogSVZlcnNpb25WYWx1ZSk6IGJvb2xlYW5cbntcblx0cmV0dXJuIF9pc1VwZ3JhZGVhYmxlKGN1cnJlbnQsIGxhdGVzdClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlbXZlcihjdXJyZW50OiBJVmVyc2lvblZhbHVlLFxuXHRsYXRlc3Q6IElWZXJzaW9uVmFsdWUsXG5cdG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+ID0ge30sXG4pOiBJVmVyc2lvblZhbHVlXG57XG5cdHJldHVybiB1cGdyYWRlRGVwZW5kZW5jeURlY2xhcmF0aW9uKGN1cnJlbnQsIGxhdGVzdCwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0VmVyc2lvbihwYWNrYWdlTmFtZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gQmx1ZWJpcmRcblx0XHQucmVzb2x2ZShyZW1vdGVDYWNoZU1hcC5nZXQocGFja2FnZU5hbWUpKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpXG5cdFx0e1xuXHRcdFx0aWYgKHJlc3VsdCA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcGFja2FnZUpzb24ocGFja2FnZU5hbWUsIHsgYWxsVmVyc2lvbnM6IHRydWUgfSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdH0pXG5cdFx0LnRhcChmdW5jdGlvbiAocmVzdWx0KVxuXHRcdHtcblx0XHRcdHJldHVybiByZW1vdGVDYWNoZU1hcC5zZXQocGFja2FnZU5hbWUsIHJlc3VsdCk7XG5cdFx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoVmVyc2lvbihwYWNrYWdlTmFtZTogc3RyaW5nLCBvcHRpb25zOiB7XG5cdGZpZWxkPzogc3RyaW5nIHwgJ3RpbWUnIHwgJ3ZlcnNpb25zJyB8ICdkaXN0LXRhZ3MubGF0ZXN0Jyxcblx0ZmlsdGVyPyh2ZXJzaW9uOiBJVmVyc2lvblZhbHVlKTogYm9vbGVhbixcblx0Y3VycmVudFZlcnNpb24/OiBJVmVyc2lvblZhbHVlLFxufSA9IHt9LCBuY3VPcHRpb25zPzogUGFydGlhbDxJT3B0aW9ucz4pXG57XG5cdGxldCB7IGZpZWxkID0gJ3ZlcnNpb25zJyB9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gcmVxdWVzdFZlcnNpb24ocGFja2FnZU5hbWUpXG5cdC8vLnJlc29sdmUocGFja2FnZUpzb24ocGFja2FnZU5hbWUsIHsgYWxsVmVyc2lvbnM6IHRydWUgfSkpXG5cdFx0LnRoZW48SVZlcnNpb25WYWx1ZVtdPihmdW5jdGlvbiAocmVzdWx0KVxuXHRcdHtcblx0XHRcdGlmIChmaWVsZC5zdGFydHNXaXRoKCdkaXN0LXRhZ3MuJykpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHNwbGl0ID0gZmllbGQuc3BsaXQoJy4nKTtcblx0XHRcdFx0aWYgKHJlc3VsdFtzcGxpdFswXV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0W3NwbGl0WzBdXVtzcGxpdFsxXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGZpZWxkID09PSAndmVyc2lvbnMnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMocmVzdWx0W2ZpZWxkXSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmaWVsZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFtmaWVsZF07XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQudGhlbihyZXN1bHQgPT5cblx0XHR7XG5cblx0XHRcdGlmIChvcHRpb25zLmZpbHRlcilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdC5maWx0ZXIob3B0aW9ucy5maWx0ZXIpXG5cdFx0XHR9XG5cblx0XHRcdC8vY29uc29sZS5kaXIocmVzdWx0KTtcblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2V0dXBOY3VUb1lhcmdzXG5cbiJdfQ==