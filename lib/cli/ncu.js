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
                throw new TypeError(`not a IVersionCacheMapValue object`);
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
            if (semver.lt(data.value.version, deps2[name]) && yarnlock_new_obj[_key2] && yarnlock_new_obj[_key2].version != data.value.version) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBNkM7QUFDN0Msb0NBQTZDO0FBRzdDLGlGQUFrRjtBQUNsRix5RUFLOEM7QUFLOUMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUscUNBQXNDO0FBQ3RDLDBDQU9xQjtBQUVyQixpQ0FBa0M7QUFHbEMsNENBQTZDO0FBVzdDLElBQVksZ0JBT1g7QUFQRCxXQUFZLGdCQUFnQjtJQUUzQixtQ0FBaUIsQ0FBQTtJQUNqQixtQ0FBaUIsQ0FBQTtJQUNqQixxQ0FBbUIsQ0FBQTtJQUNuQix5Q0FBdUIsQ0FBQTtJQUN2QixxQ0FBbUIsQ0FBQTtBQUNwQixDQUFDLEVBUFcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFPM0I7QUFFRCxJQUFZLDRCQU9YO0FBUEQsV0FBWSw0QkFBNEI7SUFFdkMsdURBQXlCLENBQUE7SUFDekIsdURBQXlCLENBQUE7SUFDekIsaURBQW1CLENBQUE7SUFDbkIscURBQXVCLENBQUE7SUFDdkIsaURBQW1CLENBQUE7QUFDcEIsQ0FBQyxFQVBXLDRCQUE0QixHQUE1QixvQ0FBNEIsS0FBNUIsb0NBQTRCLFFBT3ZDO0FBRUQsSUFBa0IsaUJBR2pCO0FBSEQsV0FBa0IsaUJBQWlCO0lBRWxDLDhCQUFTLENBQUE7QUFDVixDQUFDLEVBSGlCLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBR2xDO0FBY1ksUUFBQSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7QUFFM0QsUUFBQSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQWtFLENBQUM7QUF3QnhHLFNBQWdCLGdCQUFnQixDQUFDLE9BQStEO0lBRS9GLElBQUksT0FBTyxPQUFPLEtBQUssUUFB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LENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNsQzthQUNJLElBQUksS0FBSyxFQUNkO1lBQ0MsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckI7SUFDRixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFHZCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQ2xCO1lBQ0MsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNwQztRQUVELHNCQUFzQjtRQUV0QixPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQTFDRCxvQ0EwQ0M7QUFFRCxrQkFBZSxlQUFlLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzQvMzAuXG4gKi9cblxuaW1wb3J0IHsgcnVuIGFzIF9ucG1DaGVja1VwZGF0ZXMgfSBmcm9tICducG0tY2hlY2stdXBkYXRlcyc7XG5pbXBvcnQgeyBJV3JhcERlZHVwZUNhY2hlIH0gZnJvbSAnLi9kZWR1cGUnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cy9wYWNrYWdlLWpzb24nO1xuLy9pbXBvcnQgdmVyc2lvblV0aWwgPSByZXF1aXJlKCducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbi11dGlsJyk7XG4vL2ltcG9ydCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBmaW5kUm9vdCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHRvRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi4vdGFibGUnO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IElVbnBhY2tZYXJnc0FyZ3YgfSBmcm9tICcuLi9jbGknO1xuaW1wb3J0IFBhY2thZ2VNYW5hZ2Vyc05wbSA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi9wYWNrYWdlLW1hbmFnZXJzL25wbScpO1xuaW1wb3J0IHtcblx0cXVlcnlWZXJzaW9ucyBhcyBfcXVlcnlWZXJzaW9ucyxcblx0Z2V0VmVyc2lvblRhcmdldCBhcyBfZ2V0VmVyc2lvblRhcmdldCxcblx0aXNVcGdyYWRlYWJsZSBhcyBfaXNVcGdyYWRlYWJsZSxcblx0dXBncmFkZURlcGVuZGVuY3lEZWNsYXJhdGlvbixcbn0gZnJvbSAnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3ZlcnNpb25tYW5hZ2VyJztcbmltcG9ydCB7XG5cdElUU1VucGFja2VkUHJvbWlzZUxpa2UsXG59IGZyb20gJ3RzLXR5cGUnO1xuXG5jb25zdCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbmltcG9ydCBCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQge1xuXHRmaWx0ZXJSZXNvbHV0aW9ucyxcblx0SVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0LFxuXHRwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrLFxuXHRwYXJzZSxcblx0cmVhZFlhcm5Mb2NrZmlsZSxcblx0c3RyaXBEZXBzTmFtZSxcbn0gZnJvbSAnLi4veWFybmxvY2snO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgc2VtdmVydXRpbHMgPSByZXF1aXJlKCdzZW12ZXItdXRpbHMnKTtcbmltcG9ydCBwYWNrYWdlSnNvbiA9IHJlcXVpcmUoJ3BhY2thZ2UtanNvbicpO1xuXG5leHBvcnQgdHlwZSBJVmVyc2lvblZhbHVlID0gJ2xhdGVzdCcgfCAnKicgfCBzdHJpbmcgfCBFbnVtVmVyc2lvblZhbHVlIHwgRW51bVZlcnNpb25WYWx1ZTI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZlcnNpb25DYWNoZU1hcEtleVxue1xuXHRuYW1lOiBzdHJpbmcsXG5cdHZlcnNpb25UYXJnZXQ6IEVudW1WZXJzaW9uVmFsdWUsXG5cdHZlcnNpb25fb2xkOiBJVmVyc2lvblZhbHVlLFxufVxuXG5leHBvcnQgZW51bSBFbnVtVmVyc2lvblZhbHVlXG57XG5cdCdtYWpvcicgPSAnbWFqb3InLFxuXHQnbWlub3InID0gJ21pbm9yJyxcblx0J2xhdGVzdCcgPSAnbGF0ZXN0Jyxcblx0J2dyZWF0ZXN0JyA9ICdncmVhdGVzdCcsXG5cdCduZXdlc3QnID0gJ25ld2VzdCdcbn1cblxuZXhwb3J0IGVudW0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZFxue1xuXHQnbWFqb3InID0gJ2dyZWF0ZXN0TWFqb3InLFxuXHQnbWlub3InID0gJ2dyZWF0ZXN0TWlub3InLFxuXHQnbGF0ZXN0JyA9ICdsYXRlc3QnLFxuXHQnZ3JlYXRlc3QnID0gJ2dyZWF0ZXN0Jyxcblx0J25ld2VzdCcgPSAnbmV3ZXN0J1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBFbnVtVmVyc2lvblZhbHVlMlxue1xuXHRhbnkgPSAnKidcbn1cblxuZXhwb3J0IHR5cGUgSURlcGVuZGVuY3kgPSBJUGFja2FnZU1hcDtcblxuZXhwb3J0IGludGVyZmFjZSBJUGFja2FnZU1hcFxue1xuXHRbbmFtZTogc3RyaW5nXTogSVZlcnNpb25WYWx1ZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSBleHRlbmRzIElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0dmVyc2lvbl9uZXc6IElWZXJzaW9uVmFsdWUsXG59XG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uQ2FjaGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSVZlcnNpb25DYWNoZU1hcFZhbHVlPigpO1xuXG5leHBvcnQgY29uc3QgcmVtb3RlQ2FjaGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSVRTVW5wYWNrZWRQcm9taXNlTGlrZTxSZXR1cm5UeXBlPHR5cGVvZiBwYWNrYWdlSnNvbj4+PigpO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9ucyA9IElVbnBhY2tZYXJnc0FyZ3Y8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0dXBOY3VUb1lhcmdzPj4gJiB7XG5cdGpzb25fb2xkOiBJUGFja2FnZUpzb247XG5cdGN3ZD86IHN0cmluZztcblx0cGFja2FnZURhdGE/OiBzdHJpbmc7XG5cdHBhY2thZ2VNYW5hZ2VyPzogJ25wbScgfCAnYm93ZXInO1xuXG5cdGpzb25fbmV3PzogSVBhY2thZ2VKc29uO1xuXHRqc29uX2NoYW5nZWQ/OiBib29sZWFuO1xuXG5cdGxpc3RfdXBkYXRlZD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bG9nbGV2ZWw/OiAnc2lsZW50JyB8ICd2ZXJib3NlJztcblxuXHRzZW12ZXJMZXZlbD86IEVudW1WZXJzaW9uVmFsdWUubWFqb3IgfCBFbnVtVmVyc2lvblZhbHVlLm1pbm9yLFxuXG5cdHZlcnNpb25UYXJnZXQ/OiBFbnVtVmVyc2lvblZhbHVlLFxuXG5cdGN1cnJlbnQ/OiBJRGVwZW5kZW5jeTtcblxuXHRub1NhZmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvblRhcmdldChvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiB8IHN0cmluZyB8IElPcHRpb25zWyd2ZXJzaW9uVGFyZ2V0J10pOiBJT3B0aW9uc1sndmVyc2lvblRhcmdldCddXG57XG5cdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG9wdGlvbnNcblx0fVxuXHRlbHNlIGlmIChvcHRpb25zLnZlcnNpb25UYXJnZXQpXG5cdHtcblx0XHRyZXR1cm4gb3B0aW9ucy52ZXJzaW9uVGFyZ2V0XG5cdH1cblxuXHRyZXR1cm4gX2dldFZlcnNpb25UYXJnZXQob3B0aW9ucylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ialZlcnNpb25DYWNoZSh7XG5cdG5hbWUsXG5cdHZlcnNpb25UYXJnZXQsXG5cdHZlcnNpb25fb2xkLFxufTogSVZlcnNpb25DYWNoZU1hcEtleSk6IElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0dmVyc2lvbl9vbGQsXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmpWZXJzaW9uQ2FjaGVWYWx1ZSh7XG5cdG5hbWUsXG5cdHZlcnNpb25UYXJnZXQsXG5cdHZlcnNpb25fb2xkLFxuXHR2ZXJzaW9uX25ldyxcbn06IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSk6IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZVxue1xuXHRyZXR1cm4ge1xuXHRcdG5hbWUsXG5cdFx0dmVyc2lvblRhcmdldCxcblx0XHR2ZXJzaW9uX29sZCxcblx0XHR2ZXJzaW9uX25ldyxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0clZlcnNpb25DYWNoZShrZXk6IElWZXJzaW9uQ2FjaGVNYXBLZXkpXG57XG5cdHJldHVybiBKU09OLnN0cmluZ2lmeShvYmpWZXJzaW9uQ2FjaGUoa2V5KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNRdWVyeWVkVmVyc2lvbkNhY2hlKGtleTogSVZlcnNpb25DYWNoZU1hcEtleSlcbntcblx0cmV0dXJuIHZlcnNpb25DYWNoZU1hcC5oYXMoc3RyVmVyc2lvbkNhY2hlKGtleSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZXlPYmplY3RUb1BhY2thZ2VNYXAob2JqOiBJVmVyc2lvbkNhY2hlTWFwS2V5W10gfCBJVmVyc2lvbkNhY2hlTWFwVmFsdWVbXSxcblx0dXNlVmFyc2lvbk5ldz86IGJvb2xlYW4sXG4pOiBJUGFja2FnZU1hcFxue1xuXHRyZXR1cm4gb2JqLnJlZHVjZShmdW5jdGlvbiAoYTogYW55LCBkYXRhKVxuXHR7XG5cdFx0aWYgKHVzZVZhcnNpb25OZXcpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhLnZlcnNpb25fbmV3ICE9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgSVZlcnNpb25DYWNoZU1hcFZhbHVlIG9iamVjdGApXG5cdFx0XHR9XG5cblx0XHRcdGFbZGF0YS5uYW1lXSA9IGRhdGEudmVyc2lvbl9uZXc7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRhW2RhdGEubmFtZV0gPSBkYXRhLnZlcnNpb25fb2xkO1xuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0fSwge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrYWdlTWFwVG9LZXlPYmplY3QocGFja2FnZU1hcDogSVBhY2thZ2VNYXAsIHZlcnNpb25UYXJnZXQ6IElWZXJzaW9uQ2FjaGVNYXBLZXlbXCJ2ZXJzaW9uVGFyZ2V0XCJdKVxue1xuXHRyZXR1cm4gT2JqZWN0XG5cdFx0LmVudHJpZXMocGFja2FnZU1hcClcblx0XHQubWFwKChbbmFtZSwgdmVyc2lvbl9vbGRdKSA9PlxuXHRcdHtcblx0XHRcdHJldHVybiBvYmpWZXJzaW9uQ2FjaGUoe1xuXHRcdFx0XHRuYW1lLCB2ZXJzaW9uX29sZCwgdmVyc2lvblRhcmdldCxcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeVBhY2thZ2VNYW5hZ2Vyc05wbShuYW1lOiBzdHJpbmcsXG5cdHZlcnNpb246IElWZXJzaW9uVmFsdWUgPSAnMCcsXG5cdHZlcnNpb25UYXJnZXQ6IEVudW1WZXJzaW9uVmFsdWUgPSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdCxcbik6IEJsdWViaXJkPElWZXJzaW9uVmFsdWU+XG57XG5cdGxldCBtZXRob2QgPSBFbnVtUGFja2FnZU1hbmFnZXJzTnBtTWV0aG9kW3ZlcnNpb25UYXJnZXRdO1xuXG5cdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdHtcblx0XHR2ZXJzaW9uID0gJzAnO1xuXG5cdFx0c3dpdGNoICh2ZXJzaW9uVGFyZ2V0KVxuXHRcdHtcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubmV3ZXN0OlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5tYWpvcjpcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5taW5vcjpcblx0XHRcdFx0bWV0aG9kID0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZC5sYXRlc3Q7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlPElWZXJzaW9uVmFsdWU+KFBhY2thZ2VNYW5hZ2Vyc05wbVttZXRob2RdKG5hbWUsIHZlcnNpb24pKVxuXHRcdC50aGVuKGFzeW5jICh2YWx1ZSkgPT5cblx0XHR7XG5cdFx0XHRpZiAodmFsdWUgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0bGV0IHIgPSBhd2FpdCByZXF1ZXN0VmVyc2lvbihuYW1lKTtcblxuXHRcdFx0XHRpZiAodmVyc2lvbiBpbiByWydkaXN0LXRhZ3MnXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiByWydkaXN0LXRhZ3MnXVt2ZXJzaW9uXVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH0pXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZlcnNpb25DYWNoZU1hcChkYXRhOiBJVmVyc2lvbkNhY2hlTWFwVmFsdWUpXG57XG5cdHJldHVybiB2ZXJzaW9uQ2FjaGVNYXAuc2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSwgb2JqVmVyc2lvbkNhY2hlVmFsdWUoZGF0YSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlSZW1vdGVWZXJzaW9ucyhwYWNrYWdlTWFwOiBJUGFja2FnZU1hcCB8IHN0cmluZ1tdLCBvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiA9IHt9KVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRvcHRpb25zID0gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdFx0Ly9jb25zb2xlLmRpcihvcHRpb25zKTtcblxuXHRcdFx0b3B0aW9ucy5sb2dsZXZlbCA9ICdzaWxlbnQnO1xuXG5cdFx0XHRsZXQgdmVyc2lvblRhcmdldCA9IG9wdGlvbnMudmVyc2lvblRhcmdldCA9IGdldFZlcnNpb25UYXJnZXQob3B0aW9ucykgfHwgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBhY2thZ2VNYXApKVxuXHRcdFx0e1xuXHRcdFx0XHRwYWNrYWdlTWFwID0gcGFja2FnZU1hcC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhW2JdID0gdmVyc2lvblRhcmdldDtcblxuXHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdH0sIHt9IGFzIElQYWNrYWdlTWFwKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhY2thZ2VNYXBBcnJheSA9IHBhY2thZ2VNYXBUb0tleU9iamVjdChwYWNrYWdlTWFwLCB2ZXJzaW9uVGFyZ2V0KTtcblxuXHRcdFx0bGV0IHBhY2thZ2VNYXBBcnJheUZpbHRlZCA9IGF3YWl0IEJsdWViaXJkLnJlc29sdmUocGFja2FnZU1hcEFycmF5KVxuXHRcdFx0XHQuZmlsdGVyKGFzeW5jIChkKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGJvb2wgPSAhaGFzUXVlcnllZFZlcnNpb25DYWNoZShkKTtcblxuXHRcdFx0XHRcdGlmIChib29sICYmIGlzQmFkVmVyc2lvbihkLnZlcnNpb25fb2xkKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodmVyc2lvblRhcmdldCA9PT0gRW51bVZlcnNpb25WYWx1ZS5taW5vcilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0oZC5uYW1lKTtcblxuXHRcdFx0XHRcdFx0XHRkLnZlcnNpb25fb2xkID0gdmVyc2lvbl9uZXcuc3BsaXQoJy4nKVswXSArICcuMC4wJztcblxuXHRcdFx0XHRcdFx0XHRzZXRWZXJzaW9uQ2FjaGVNYXAoe1xuXHRcdFx0XHRcdFx0XHRcdC4uLmQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGJvb2wgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYm9vbFxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgcGFja2FnZU1hcDIgPSBrZXlPYmplY3RUb1BhY2thZ2VNYXAocGFja2FnZU1hcEFycmF5RmlsdGVkKTtcblxuXHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlPElQYWNrYWdlTWFwPihfcXVlcnlWZXJzaW9ucyhwYWNrYWdlTWFwMiwgb3B0aW9ucykpXG5cdFx0XHRcdC50YXAocmV0ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShPYmplY3QuZW50cmllcyhwYWNrYWdlTWFwMikpXG5cdFx0XHRcdFx0XHQuZWFjaChhc3luYyAoW25hbWUsIHZlcnNpb25fb2xkXSkgPT5cblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZlcnNpb25fbmV3ID0gcmV0W25hbWVdO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX29sZC5pbmNsdWRlcygnficpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zLm5vU2FmZSB8fCB2ZXJzaW9uX25ldyA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3ID0gYXdhaXQgZmV0Y2hWZXJzaW9uKG5hbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZmlsdGVyKHZlcnNpb24pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCB2ZXJzaW9uX29sZClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdH0sIG9wdGlvbnMpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKHJldCA9PiByZXQucG9wKCkpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fbmV3ID09IG51bGwgJiYgaXNCYWRWZXJzaW9uKHZlcnNpb25fb2xkKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZSwgbnVsbCwgdmVyc2lvblRhcmdldCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAodmVyc2lvbl9uZXcgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0c2V0VmVyc2lvbkNhY2hlTWFwKHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9vbGQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwYWNrYWdlTWFwQXJyYXlcblx0XHRcdFx0XHRcdC5tYXAoZGF0YSA9PiB2ZXJzaW9uQ2FjaGVNYXAuZ2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmFkVmVyc2lvbih2ZXJzaW9uOiBJVmVyc2lvblZhbHVlKVxue1xuXHRsZXQgYm9vbCA9IGZhbHNlO1xuXHRzd2l0Y2ggKHZlcnNpb24pXG5cdHtcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1ham9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5uZXdlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlMi5hbnk6XG5cdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cblx0XHRcdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhuY3VPcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiB8IElPcHRpb25zKTogSU9wdGlvbnNcbntcblx0bmN1T3B0aW9ucyA9IHtcblx0XHQuLi5uY3VPcHRpb25zLFxuXHR9O1xuXG5cdGRlbGV0ZSBuY3VPcHRpb25zLnVwZ3JhZGU7XG5cdGRlbGV0ZSBuY3VPcHRpb25zLmdsb2JhbDtcblxuXHRuY3VPcHRpb25zLnBhY2thZ2VNYW5hZ2VyID0gJ25wbSc7XG5cblx0aWYgKG5jdU9wdGlvbnMuanNvbl9vbGQpXG5cdHtcblx0XHRuY3VPcHRpb25zLnBhY2thZ2VEYXRhID0gSlNPTi5zdHJpbmdpZnkobmN1T3B0aW9ucy5qc29uX29sZCk7XG5cdH1cblxuXHRuY3VPcHRpb25zLmpzb25VcGdyYWRlZCA9IHRydWU7XG5cblx0cmV0dXJuIG5jdU9wdGlvbnMgYXMgSU9wdGlvbnNcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlczxDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oY2FjaGU6IFBhcnRpYWw8Qz4sIG5jdU9wdGlvbnM6IElPcHRpb25zKVxue1xuXHQvL25jdU9wdGlvbnMuc2lsZW50ID0gZmFsc2U7XG5cblx0Ly9uY3VPcHRpb25zLmpzb24gPSBmYWxzZTtcblx0Ly9uY3VPcHRpb25zLmNsaSA9IHRydWU7XG5cblx0Ly9uY3VPcHRpb25zLmFyZ3MgPSBbXTtcblxuXHQvL25jdU9wdGlvbnMubG9nbGV2ZWwgPSAndmVyYm9zZSc7XG5cblx0bmN1T3B0aW9ucyA9IG5wbUNoZWNrVXBkYXRlc09wdGlvbnMobmN1T3B0aW9ucyk7XG5cblx0bmN1T3B0aW9ucy5jd2QgPSBjYWNoZS5jd2Q7XG5cblx0bmN1T3B0aW9ucy5qc29uX25ldyA9IEpTT04ucGFyc2UobmN1T3B0aW9ucy5wYWNrYWdlRGF0YSk7XG5cblx0bmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQgPSBhd2FpdCBfbnBtQ2hlY2tVcGRhdGVzKG5jdU9wdGlvbnMpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMobmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQpO1xuXG5cdG5jdU9wdGlvbnMuanNvbl9jaGFuZ2VkID0gISFrcy5sZW5ndGg7XG5cblx0bGV0IGN1cnJlbnQ6IElEZXBlbmRlbmN5ID0ge307XG5cblx0aWYgKGtzLmxlbmd0aClcblx0e1xuXHRcdGtzLmZvckVhY2gobmFtZSA9PlxuXHRcdHtcblxuXHRcdFx0KDwoa2V5b2YgSVBhY2thZ2VKc29uKVtdPltcblx0XHRcdFx0J2RlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdkZXZEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQncGVlckRlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdvcHRpb25hbERlcGVuZGVuY2llcycsXG5cdFx0XHRdKS5mb3JFYWNoKGtleSA9PlxuXHRcdFx0e1xuXG5cdFx0XHRcdGxldCBkYXRhID0gbmN1T3B0aW9ucy5qc29uX25ld1trZXldO1xuXG5cdFx0XHRcdGlmIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZhbHVlID0gZGF0YVtuYW1lXTtcblxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB2YWx1ZSAhPSBFbnVtVmVyc2lvblZhbHVlMi5hbnkgJiYgdmFsdWUgIT0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y3VycmVudFtuYW1lXSA9IHZhbHVlO1xuXG5cdFx0XHRcdFx0XHRkYXRhW25hbWVdID0gbmN1T3B0aW9ucy5saXN0X3VwZGF0ZWRbbmFtZV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH0pXG5cblx0XHR9KTtcblxuXHR9XG5cblx0bmN1T3B0aW9ucy5jdXJyZW50ID0gY3VycmVudDtcblxuXHRsZXQgdGFibGUgPSB0b0RlcGVuZGVuY3lUYWJsZSh7XG5cdFx0ZnJvbTogbmN1T3B0aW9ucy5jdXJyZW50LFxuXHRcdHRvOiBuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCxcblx0fSkudG9TdHJpbmcoKTtcblxuXHR0YWJsZSAmJiBjb25zb2xlLmxvZyhgXFxuJHt0YWJsZX1cXG5gKTtcblxuXHRyZXR1cm4gbmN1T3B0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTmN1VG9ZYXJnczxUIGV4dGVuZHMgYW55Pih5YXJnczogQXJndjxUPilcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignZGVwJywge1xuXHRcdFx0ZGVzYzogYGNoZWNrIG9ubHkgYSBzcGVjaWZpYyBzZWN0aW9uKHMpIG9mIGRlcGVuZGVuY2llczogcHJvZHxkZXZ8cGVlcnxvcHRpb25hbHxidW5kbGUgKGNvbW1hLWRlbGltaXRlZClgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbWluaW1hbCcsIHtcblx0XHRcdGFsaWFzOiBbJ20nXSxcblx0XHRcdGRlc2M6IGBkbyBub3QgdXBncmFkZSBuZXdlciB2ZXJzaW9ucyB0aGF0IGFyZSBhbHJlYWR5IHNhdGlzZmllZCBieSB0aGUgdmVyc2lvbiByYW5nZSBhY2NvcmRpbmcgdG8gc2VtdmVyYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCduZXdlc3QnLCB7XG5cdFx0XHRhbGlhczogWyduJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgbmV3ZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwYWNrYWdlTWFuYWdlcicsIHtcblx0XHRcdGFsaWFzOiBbJ3AnXSxcblx0XHRcdGRlc2M6IGBucG0gKGRlZmF1bHQpIG9yIGJvd2VyYCxcblx0XHRcdGRlZmF1bHQ6ICducG0nLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVnaXN0cnknLCB7XG5cdFx0XHRhbGlhczogWydyJ10sXG5cdFx0XHRkZXNjOiBgc3BlY2lmeSB0aGlyZC1wYXJ0eSBucG0gcmVnaXN0cnlgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignc2lsZW50Jywge1xuXHRcdFx0YWxpYXM6IFsncyddLFxuXHRcdFx0ZGVzYzogYGRvbid0IG91dHB1dCBhbnl0aGluZyAoLS1sb2dsZXZlbCBzaWxlbnQpYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdncmVhdGVzdCcsIHtcblx0XHRcdGFsaWFzOiBbJ2cnXSxcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCd1cGdyYWRlJywge1xuXHRcdFx0YWxpYXM6IFsndSddLFxuXHRcdFx0ZGVzYzogYG92ZXJ3cml0ZSBwYWNrYWdlIGZpbGVgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NlbXZlckxldmVsJywge1xuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIGhpZ2hlc3QgdmVyc2lvbiB3aXRoaW4gXCJtYWpvclwiIG9yIFwibWlub3JcImAsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdyZW1vdmVSYW5nZScsIHtcblx0XHRcdGRlc2M6IGByZW1vdmUgdmVyc2lvbiByYW5nZXMgZnJvbSB0aGUgZmluYWwgcGFja2FnZSB2ZXJzaW9uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdkZWR1cGUnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHVwZ3JhZGUgbW9kdWxlIGZyb20gcmVzb2x1dGlvbnNgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zOiBJUGFja2FnZU1hcCxcblx0eWFybmxvY2tfb2xkX29iajogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0IHwgc3RyaW5nLFxuXHRvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPixcbilcbntcblx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB5YXJubG9ja19vbGRfb2JqID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0eWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWFybmxvY2tfb2xkX29iaik7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByZXN1bHQgPSBmaWx0ZXJSZXNvbHV0aW9ucyh7XG5cdFx0XHRcdHJlc29sdXRpb25zLFxuXHRcdFx0fSwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdGxldCBkZXBzID0gYXdhaXQgcXVlcnlSZW1vdGVWZXJzaW9ucyhyZXNvbHV0aW9ucywgb3B0aW9ucyk7XG5cblx0XHRcdC8vY29uc29sZS5kaXIoZGVwcyk7XG5cblx0XHRcdGxldCBkZXBzMiA9IGtleU9iamVjdFRvUGFja2FnZU1hcChkZXBzLCB0cnVlKTtcblxuXHRcdFx0bGV0IGRlcHMzID0gT2JqZWN0LnZhbHVlcyhkZXBzKVxuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YVtiLm5hbWVdID0gYjtcblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBJVmVyc2lvbkNhY2hlTWFwVmFsdWU+KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgeWFybmxvY2tfbmV3X29iajogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0ID0ge1xuXHRcdFx0XHQuLi55YXJubG9ja19vbGRfb2JqLFxuXHRcdFx0fTtcblxuXHRcdFx0bGV0IHVwZGF0ZV9saXN0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0bGV0IHlhcm5sb2NrX2NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdFx0T2JqZWN0LmVudHJpZXMocmVzdWx0Lm1heClcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtuYW1lLCBkYXRhXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfa2V5MiA9IG5hbWUgKyAnQCcgKyBkZXBzM1tuYW1lXS52ZXJzaW9uX29sZDtcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOaqouafpSDniYjmnKznr4TlnI3mmK/lkKbnrKblkIgg6IiHIOeJiOacrOaYr+WQpuS4jeebuOWQjFxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGlmIChzZW12ZXIubHQoZGF0YS52YWx1ZS52ZXJzaW9uLCBkZXBzMltuYW1lXSkgJiYgeWFybmxvY2tfbmV3X29ialtfa2V5Ml0gJiYgeWFybmxvY2tfbmV3X29ialtfa2V5Ml0udmVyc2lvbiAhPSBkYXRhLnZhbHVlLnZlcnNpb24pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0T2JqZWN0LmtleXMocmVzdWx0LmRlcHNbbmFtZV0pXG5cdFx0XHRcdFx0XHRcdC5mb3JFYWNoKHZlcnNpb24gPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGxldCBrZXkgPSBuYW1lICsgJ0AnICsgdmVyc2lvbjtcblxuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSB5YXJubG9ja19uZXdfb2JqW2tleV1cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdHVwZGF0ZV9saXN0LnB1c2gobmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0Lmluc3RhbGxlZFtuYW1lXS5sZW5ndGggPiAxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhyZXN1bHQuZGVwc1tuYW1lXSlcblx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaCh2ZXJzaW9uID0+XG5cdFx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQga2V5ID0gbmFtZSArICdAJyArIHZlcnNpb247XG5cblx0XHRcdFx0XHRcdFx0XHRcdHlhcm5sb2NrX25ld19vYmpba2V5XSA9IGRhdGEudmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR5YXJubG9ja19vbGRfb2JqLFxuXHRcdFx0XHR5YXJubG9ja19uZXdfb2JqLFxuXHRcdFx0XHR1cGRhdGVfbGlzdCxcblx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCxcblx0XHRcdFx0ZGVwcyxcblx0XHRcdFx0ZGVwczIsXG5cdFx0XHRcdGRlcHMzLFxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0O1xufVxuXG4vKlxuKGFzeW5jICgpID0+XG57XG5cdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKClcblx0fSk7XG5cblx0bGV0IHBrZyA9IHJlcXVpcmUoJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMvcGFja2FnZS5qc29uJyk7XG5cblx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBhd2FpdCByZWFkWWFybkxvY2tmaWxlKHBhdGguam9pbihyb290RGF0YS5yb290LCAneWFybi5sb2NrJykpO1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKHlhcm5sb2NrX29sZF9vYmopLmZpbHRlcihrID0+IGsuaW5jbHVkZXMoJ3N0cmluZy13aWR0aCcpKVxuXG5cdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHBrZy5yZXNvbHV0aW9ucywgeWFybmxvY2tfb2xkX29iailcblxuXHRjb25zb2xlLmRpcihyZXQpO1xuXG59KSgpO1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpc1VwZ3JhZGVhYmxlKGN1cnJlbnQ6IElWZXJzaW9uVmFsdWUsIGxhdGVzdDogSVZlcnNpb25WYWx1ZSk6IGJvb2xlYW5cbntcblx0cmV0dXJuIF9pc1VwZ3JhZGVhYmxlKGN1cnJlbnQsIGxhdGVzdClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNlbXZlcihjdXJyZW50OiBJVmVyc2lvblZhbHVlLFxuXHRsYXRlc3Q6IElWZXJzaW9uVmFsdWUsXG5cdG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+ID0ge30sXG4pOiBJVmVyc2lvblZhbHVlXG57XG5cdHJldHVybiB1cGdyYWRlRGVwZW5kZW5jeURlY2xhcmF0aW9uKGN1cnJlbnQsIGxhdGVzdCwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0VmVyc2lvbihwYWNrYWdlTmFtZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gQmx1ZWJpcmRcblx0XHQucmVzb2x2ZShyZW1vdGVDYWNoZU1hcC5nZXQocGFja2FnZU5hbWUpKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpXG5cdFx0e1xuXHRcdFx0aWYgKHJlc3VsdCA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcGFja2FnZUpzb24ocGFja2FnZU5hbWUsIHsgYWxsVmVyc2lvbnM6IHRydWUgfSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdH0pXG5cdFx0LnRhcChmdW5jdGlvbiAocmVzdWx0KVxuXHRcdHtcblx0XHRcdHJldHVybiByZW1vdGVDYWNoZU1hcC5zZXQocGFja2FnZU5hbWUsIHJlc3VsdCk7XG5cdFx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoVmVyc2lvbihwYWNrYWdlTmFtZTogc3RyaW5nLCBvcHRpb25zOiB7XG5cdGZpZWxkPzogc3RyaW5nIHwgJ3RpbWUnIHwgJ3ZlcnNpb25zJyB8ICdkaXN0LXRhZ3MubGF0ZXN0Jyxcblx0ZmlsdGVyPyh2ZXJzaW9uOiBJVmVyc2lvblZhbHVlKTogYm9vbGVhbixcblx0Y3VycmVudFZlcnNpb24/OiBJVmVyc2lvblZhbHVlLFxufSA9IHt9LCBuY3VPcHRpb25zPzogUGFydGlhbDxJT3B0aW9ucz4pXG57XG5cdGxldCB7IGZpZWxkID0gJ3ZlcnNpb25zJyB9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gcmVxdWVzdFZlcnNpb24ocGFja2FnZU5hbWUpXG5cdC8vLnJlc29sdmUocGFja2FnZUpzb24ocGFja2FnZU5hbWUsIHsgYWxsVmVyc2lvbnM6IHRydWUgfSkpXG5cdFx0LnRoZW48SVZlcnNpb25WYWx1ZVtdPihmdW5jdGlvbiAocmVzdWx0KVxuXHRcdHtcblx0XHRcdGlmIChmaWVsZC5zdGFydHNXaXRoKCdkaXN0LXRhZ3MuJykpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHNwbGl0ID0gZmllbGQuc3BsaXQoJy4nKTtcblx0XHRcdFx0aWYgKHJlc3VsdFtzcGxpdFswXV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0W3NwbGl0WzBdXVtzcGxpdFsxXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGZpZWxkID09PSAndmVyc2lvbnMnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMocmVzdWx0W2ZpZWxkXSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmaWVsZClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFtmaWVsZF07XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQudGhlbihyZXN1bHQgPT5cblx0XHR7XG5cblx0XHRcdGlmIChvcHRpb25zLmZpbHRlcilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdC5maWx0ZXIob3B0aW9ucy5maWx0ZXIpXG5cdFx0XHR9XG5cblx0XHRcdC8vY29uc29sZS5kaXIocmVzdWx0KTtcblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2V0dXBOY3VUb1lhcmdzXG5cbiJdfQ==