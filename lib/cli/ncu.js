"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVersion = exports.requestVersion = exports.updateSemver = exports.isUpgradeable = exports.checkResolutionsUpdate = exports.setupNcuToYargs = exports.npmCheckUpdates = exports.npmCheckUpdatesOptions = exports.isBadVersion = exports.queryRemoteVersions = exports.setVersionCacheMap = exports.queryPackageManagersNpm = exports.packageMapToKeyObject = exports.keyObjectToPackageMap = exports.hasQueryedVersionCache = exports.strVersionCache = exports.objVersionCacheValue = exports.objVersionCache = exports.getVersionTarget = exports.remoteCacheMap = exports.versionCacheMap = exports.EnumVersionValue2 = exports.EnumPackageManagersNpmMethod = exports.EnumVersionValue = void 0;
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
const util_1 = require("util");
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
    // @ts-ignore
    return obj.reduce(function (a, data) {
        if (useVarsionNew) {
            if (typeof data.version_new !== 'string') {
                return a;
                throw new TypeError(`not a IVersionCacheMapValue object, ${util_1.inspect(data)}`);
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
        .resolve(PackageManagersNpm[method](name, version, {}))
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
    // @ts-ignore
    delete ncuOptions.global;
    ncuOptions.packageManager = 'npm';
    if (ncuOptions.json_old) {
        ncuOptions.packageData = JSON.stringify(ncuOptions.json_old);
    }
    // @ts-ignore
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRUgseURBQTREO0FBRzVELHFFQUFxRTtBQUNyRSxrQ0FBa0M7QUFDbEMsb0NBQTZDO0FBQzdDLG9DQUE2QztBQUc3QyxpRkFBa0Y7QUFDbEYseUVBSzhDO0FBSzlDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ2xFLHFDQUFzQztBQUN0QywwQ0FRcUI7QUFFckIsaUNBQWtDO0FBR2xDLDRDQUE2QztBQUM3QywrQkFBK0I7QUFXL0IsSUFBWSxnQkFPWDtBQVBELFdBQVksZ0JBQWdCO0lBRTNCLG1DQUFpQixDQUFBO0lBQ2pCLG1DQUFpQixDQUFBO0lBQ2pCLHFDQUFtQixDQUFBO0lBQ25CLHlDQUF1QixDQUFBO0lBQ3ZCLHFDQUFtQixDQUFBO0FBQ3BCLENBQUMsRUFQVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQU8zQjtBQUVELElBQVksNEJBT1g7QUFQRCxXQUFZLDRCQUE0QjtJQUV2Qyx1REFBeUIsQ0FBQTtJQUN6Qix1REFBeUIsQ0FBQTtJQUN6QixpREFBbUIsQ0FBQTtJQUNuQixxREFBdUIsQ0FBQTtJQUN2QixpREFBbUIsQ0FBQTtBQUNwQixDQUFDLEVBUFcsNEJBQTRCLEdBQTVCLG9DQUE0QixLQUE1QixvQ0FBNEIsUUFPdkM7QUFFRCxJQUFrQixpQkFHakI7QUFIRCxXQUFrQixpQkFBaUI7SUFFbEMsOEJBQVMsQ0FBQTtBQUNWLENBQUMsRUFIaUIsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFHbEM7QUFjWSxRQUFBLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztBQUUzRCxRQUFBLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0UsQ0FBQztBQXdCeEcsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBK0Q7SUFFL0YsSUFBSSxPQUFP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RyxDQUFDLENBQUM7WUFDL0IsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3BCO2dCQUNDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0Q7YUFDSSxJQUFJLEtBQUssS0FBSyxVQUFVLEVBQzdCO1lBQ0MsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO2FBQ0ksSUFBSSxLQUFLLEVBQ2Q7WUFDQyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQjtJQUNGLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUdkLElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3BDO1FBRUQsc0JBQXNCO1FBRXRCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBMUNELG9DQTBDQztBQUVELGtCQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeyBydW4gYXMgX25wbUNoZWNrVXBkYXRlcyB9IGZyb20gJ25wbS1jaGVjay11cGRhdGVzJztcbmltcG9ydCB7IElXcmFwRGVkdXBlQ2FjaGUgfSBmcm9tICcuL2RlZHVwZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG4vL2ltcG9ydCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbi8vaW1wb3J0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGZpbmRSb290IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgdG9EZXBlbmRlbmN5VGFibGUgfSBmcm9tICcuLi90YWJsZSc7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgSVVucGFja1lhcmdzQXJndiB9IGZyb20gJy4uL2NsaSc7XG5pbXBvcnQgUGFja2FnZU1hbmFnZXJzTnBtID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3BhY2thZ2UtbWFuYWdlcnMvbnBtJyk7XG5pbXBvcnQge1xuXHRxdWVyeVZlcnNpb25zIGFzIF9xdWVyeVZlcnNpb25zLFxuXHRnZXRWZXJzaW9uVGFyZ2V0IGFzIF9nZXRWZXJzaW9uVGFyZ2V0LFxuXHRpc1VwZ3JhZGVhYmxlIGFzIF9pc1VwZ3JhZGVhYmxlLFxuXHR1cGdyYWRlRGVwZW5kZW5jeURlY2xhcmF0aW9uLFxufSBmcm9tICducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbm1hbmFnZXInO1xuaW1wb3J0IHtcblx0SVRTVW5wYWNrZWRQcm9taXNlTGlrZSxcbn0gZnJvbSAndHMtdHlwZSc7XG5cbmNvbnN0IHZlcnNpb25VdGlsID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3ZlcnNpb24tdXRpbCcpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3QsXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssXG5cdHBhcnNlLFxuXHRyZWFkWWFybkxvY2tmaWxlLFxuXHRzdHJpcERlcHNOYW1lLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG59IGZyb20gJy4uL3lhcm5sb2NrJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHNlbXZlcnV0aWxzID0gcmVxdWlyZSgnc2VtdmVyLXV0aWxzJyk7XG5pbXBvcnQgcGFja2FnZUpzb24gPSByZXF1aXJlKCdwYWNrYWdlLWpzb24nKTtcbmltcG9ydCB7IGluc3BlY3QgfSBmcm9tICd1dGlsJztcblxuZXhwb3J0IHR5cGUgSVZlcnNpb25WYWx1ZSA9ICdsYXRlc3QnIHwgJyonIHwgc3RyaW5nIHwgRW51bVZlcnNpb25WYWx1ZSB8IEVudW1WZXJzaW9uVmFsdWUyO1xuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0bmFtZTogc3RyaW5nLFxuXHR2ZXJzaW9uVGFyZ2V0OiBFbnVtVmVyc2lvblZhbHVlLFxuXHR2ZXJzaW9uX29sZDogSVZlcnNpb25WYWx1ZSxcbn1cblxuZXhwb3J0IGVudW0gRW51bVZlcnNpb25WYWx1ZVxue1xuXHQnbWFqb3InID0gJ21ham9yJyxcblx0J21pbm9yJyA9ICdtaW5vcicsXG5cdCdsYXRlc3QnID0gJ2xhdGVzdCcsXG5cdCdncmVhdGVzdCcgPSAnZ3JlYXRlc3QnLFxuXHQnbmV3ZXN0JyA9ICduZXdlc3QnXG59XG5cbmV4cG9ydCBlbnVtIEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2Rcbntcblx0J21ham9yJyA9ICdncmVhdGVzdE1ham9yJyxcblx0J21pbm9yJyA9ICdncmVhdGVzdE1pbm9yJyxcblx0J2xhdGVzdCcgPSAnbGF0ZXN0Jyxcblx0J2dyZWF0ZXN0JyA9ICdncmVhdGVzdCcsXG5cdCduZXdlc3QnID0gJ25ld2VzdCdcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gRW51bVZlcnNpb25WYWx1ZTJcbntcblx0YW55ID0gJyonXG59XG5cbmV4cG9ydCB0eXBlIElEZXBlbmRlbmN5ID0gSVBhY2thZ2VNYXA7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhY2thZ2VNYXBcbntcblx0W25hbWU6IHN0cmluZ106IElWZXJzaW9uVmFsdWVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVmVyc2lvbkNhY2hlTWFwVmFsdWUgZXh0ZW5kcyBJVmVyc2lvbkNhY2hlTWFwS2V5XG57XG5cdHZlcnNpb25fbmV3OiBJVmVyc2lvblZhbHVlLFxufVxuXG5leHBvcnQgY29uc3QgdmVyc2lvbkNhY2hlTWFwID0gbmV3IE1hcDxzdHJpbmcsIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZT4oKTtcblxuZXhwb3J0IGNvbnN0IHJlbW90ZUNhY2hlTWFwID0gbmV3IE1hcDxzdHJpbmcsIElUU1VucGFja2VkUHJvbWlzZUxpa2U8UmV0dXJuVHlwZTx0eXBlb2YgcGFja2FnZUpzb24+Pj4oKTtcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSBJVW5wYWNrWWFyZ3NBcmd2PFJldHVyblR5cGU8dHlwZW9mIHNldHVwTmN1VG9ZYXJncz4+ICYge1xuXHRqc29uX29sZDogSVBhY2thZ2VKc29uO1xuXHRjd2Q/OiBzdHJpbmc7XG5cdHBhY2thZ2VEYXRhPzogc3RyaW5nO1xuXHRwYWNrYWdlTWFuYWdlcj86ICducG0nIHwgJ2Jvd2VyJztcblxuXHRqc29uX25ldz86IElQYWNrYWdlSnNvbjtcblx0anNvbl9jaGFuZ2VkPzogYm9vbGVhbjtcblxuXHRsaXN0X3VwZGF0ZWQ/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5cdGxvZ2xldmVsPzogJ3NpbGVudCcgfCAndmVyYm9zZSc7XG5cblx0c2VtdmVyTGV2ZWw/OiBFbnVtVmVyc2lvblZhbHVlLm1ham9yIHwgRW51bVZlcnNpb25WYWx1ZS5taW5vcixcblxuXHR2ZXJzaW9uVGFyZ2V0PzogRW51bVZlcnNpb25WYWx1ZSxcblxuXHRjdXJyZW50PzogSURlcGVuZGVuY3k7XG5cblx0bm9TYWZlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnNpb25UYXJnZXQob3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gfCBzdHJpbmcgfCBJT3B0aW9uc1sndmVyc2lvblRhcmdldCddKTogSU9wdGlvbnNbJ3ZlcnNpb25UYXJnZXQnXVxue1xuXHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBvcHRpb25zXG5cdH1cblx0ZWxzZSBpZiAob3B0aW9ucy52ZXJzaW9uVGFyZ2V0KVxuXHR7XG5cdFx0cmV0dXJuIG9wdGlvbnMudmVyc2lvblRhcmdldFxuXHR9XG5cblx0cmV0dXJuIF9nZXRWZXJzaW9uVGFyZ2V0KG9wdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmpWZXJzaW9uQ2FjaGUoe1xuXHRuYW1lLFxuXHR2ZXJzaW9uVGFyZ2V0LFxuXHR2ZXJzaW9uX29sZCxcbn06IElWZXJzaW9uQ2FjaGVNYXBLZXkpOiBJVmVyc2lvbkNhY2hlTWFwS2V5XG57XG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdHZlcnNpb25fb2xkLFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JqVmVyc2lvbkNhY2hlVmFsdWUoe1xuXHRuYW1lLFxuXHR2ZXJzaW9uVGFyZ2V0LFxuXHR2ZXJzaW9uX29sZCxcblx0dmVyc2lvbl9uZXcsXG59OiBJVmVyc2lvbkNhY2hlTWFwVmFsdWUpOiBJVmVyc2lvbkNhY2hlTWFwVmFsdWVcbntcblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0dmVyc2lvbl9vbGQsXG5cdFx0dmVyc2lvbl9uZXcsXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJWZXJzaW9uQ2FjaGUoa2V5OiBJVmVyc2lvbkNhY2hlTWFwS2V5KVxue1xuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqVmVyc2lvbkNhY2hlKGtleSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzUXVlcnllZFZlcnNpb25DYWNoZShrZXk6IElWZXJzaW9uQ2FjaGVNYXBLZXkpXG57XG5cdHJldHVybiB2ZXJzaW9uQ2FjaGVNYXAuaGFzKHN0clZlcnNpb25DYWNoZShrZXkpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5T2JqZWN0VG9QYWNrYWdlTWFwKG9iajogSVZlcnNpb25DYWNoZU1hcEtleVtdIHwgSVZlcnNpb25DYWNoZU1hcFZhbHVlW10sXG5cdHVzZVZhcnNpb25OZXc/OiBib29sZWFuLFxuKTogSVBhY2thZ2VNYXBcbntcblx0Ly8gQHRzLWlnbm9yZVxuXHRyZXR1cm4gb2JqLnJlZHVjZShmdW5jdGlvbiAoYTogYW55LCBkYXRhKVxuXHR7XG5cdFx0aWYgKHVzZVZhcnNpb25OZXcpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhLnZlcnNpb25fbmV3ICE9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGE7XG5cblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgSVZlcnNpb25DYWNoZU1hcFZhbHVlIG9iamVjdCwgJHtpbnNwZWN0KGRhdGEpfWApXG5cdFx0XHR9XG5cblx0XHRcdGFbZGF0YS5uYW1lXSA9IGRhdGEudmVyc2lvbl9uZXc7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRhW2RhdGEubmFtZV0gPSBkYXRhLnZlcnNpb25fb2xkO1xuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0fSwge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrYWdlTWFwVG9LZXlPYmplY3QocGFja2FnZU1hcDogSVBhY2thZ2VNYXAsIHZlcnNpb25UYXJnZXQ6IElWZXJzaW9uQ2FjaGVNYXBLZXlbXCJ2ZXJzaW9uVGFyZ2V0XCJdKVxue1xuXHRyZXR1cm4gT2JqZWN0XG5cdFx0LmVudHJpZXMocGFja2FnZU1hcClcblx0XHQubWFwKChbbmFtZSwgdmVyc2lvbl9vbGRdKSA9PlxuXHRcdHtcblx0XHRcdHJldHVybiBvYmpWZXJzaW9uQ2FjaGUoe1xuXHRcdFx0XHRuYW1lLCB2ZXJzaW9uX29sZCwgdmVyc2lvblRhcmdldCxcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeVBhY2thZ2VNYW5hZ2Vyc05wbShuYW1lOiBzdHJpbmcsXG5cdHZlcnNpb246IElWZXJzaW9uVmFsdWUgPSAnMCcsXG5cdHZlcnNpb25UYXJnZXQ6IEVudW1WZXJzaW9uVmFsdWUgPSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdCxcbik6IEJsdWViaXJkPElWZXJzaW9uVmFsdWU+XG57XG5cdGxldCBtZXRob2QgPSBFbnVtUGFja2FnZU1hbmFnZXJzTnBtTWV0aG9kW3ZlcnNpb25UYXJnZXRdO1xuXG5cdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdHtcblx0XHR2ZXJzaW9uID0gJzAnO1xuXG5cdFx0c3dpdGNoICh2ZXJzaW9uVGFyZ2V0KVxuXHRcdHtcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubmV3ZXN0OlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5tYWpvcjpcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5taW5vcjpcblx0XHRcdFx0bWV0aG9kID0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZC5sYXRlc3Q7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlPElWZXJzaW9uVmFsdWU+KFBhY2thZ2VNYW5hZ2Vyc05wbVttZXRob2RdKG5hbWUsIHZlcnNpb24sIHt9KSlcblx0XHQudGhlbihhc3luYyAodmFsdWUpID0+XG5cdFx0e1xuXHRcdFx0aWYgKHZhbHVlID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCByID0gYXdhaXQgcmVxdWVzdFZlcnNpb24obmFtZSk7XG5cblx0XHRcdFx0aWYgKHZlcnNpb24gaW4gclsnZGlzdC10YWdzJ10pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gclsnZGlzdC10YWdzJ11bdmVyc2lvbl1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHR9KVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRWZXJzaW9uQ2FjaGVNYXAoZGF0YTogSVZlcnNpb25DYWNoZU1hcFZhbHVlKVxue1xuXHRyZXR1cm4gdmVyc2lvbkNhY2hlTWFwLnNldChzdHJWZXJzaW9uQ2FjaGUoZGF0YSksIG9ialZlcnNpb25DYWNoZVZhbHVlKGRhdGEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5UmVtb3RlVmVyc2lvbnMocGFja2FnZU1hcDogSVBhY2thZ2VNYXAgfCBzdHJpbmdbXSwgb3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gPSB7fSlcbntcblx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IG5wbUNoZWNrVXBkYXRlc09wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRcdC8vY29uc29sZS5kaXIob3B0aW9ucyk7XG5cblx0XHRcdG9wdGlvbnMubG9nbGV2ZWwgPSAnc2lsZW50JztcblxuXHRcdFx0bGV0IHZlcnNpb25UYXJnZXQgPSBvcHRpb25zLnZlcnNpb25UYXJnZXQgPSBnZXRWZXJzaW9uVGFyZ2V0KG9wdGlvbnMpIHx8IEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0O1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwYWNrYWdlTWFwKSlcblx0XHRcdHtcblx0XHRcdFx0cGFja2FnZU1hcCA9IHBhY2thZ2VNYXAucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YVtiXSA9IHZlcnNpb25UYXJnZXQ7XG5cblx0XHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0XHR9LCB7fSBhcyBJUGFja2FnZU1hcCk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYWNrYWdlTWFwQXJyYXkgPSBwYWNrYWdlTWFwVG9LZXlPYmplY3QocGFja2FnZU1hcCwgdmVyc2lvblRhcmdldCk7XG5cblx0XHRcdGxldCBwYWNrYWdlTWFwQXJyYXlGaWx0ZWQgPSBhd2FpdCBCbHVlYmlyZC5yZXNvbHZlKHBhY2thZ2VNYXBBcnJheSlcblx0XHRcdFx0LmZpbHRlcihhc3luYyAoZCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBib29sID0gIWhhc1F1ZXJ5ZWRWZXJzaW9uQ2FjaGUoZCk7XG5cblx0XHRcdFx0XHRpZiAoYm9vbCAmJiBpc0JhZFZlcnNpb24oZC52ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHZlcnNpb25UYXJnZXQgPT09IEVudW1WZXJzaW9uVmFsdWUubWlub3IpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKGQubmFtZSk7XG5cblx0XHRcdFx0XHRcdFx0ZC52ZXJzaW9uX29sZCA9IHZlcnNpb25fbmV3LnNwbGl0KCcuJylbMF0gKyAnLjAuMCc7XG5cblx0XHRcdFx0XHRcdFx0c2V0VmVyc2lvbkNhY2hlTWFwKHtcblx0XHRcdFx0XHRcdFx0XHQuLi5kLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3LFxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRib29sID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGJvb2xcblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0bGV0IHBhY2thZ2VNYXAyID0ga2V5T2JqZWN0VG9QYWNrYWdlTWFwKHBhY2thZ2VNYXBBcnJheUZpbHRlZCk7XG5cblx0XHRcdHJldHVybiBCbHVlYmlyZFxuXHRcdFx0XHQucmVzb2x2ZTxJUGFja2FnZU1hcD4oX3F1ZXJ5VmVyc2lvbnMocGFja2FnZU1hcDIsIG9wdGlvbnMpKVxuXHRcdFx0XHQudGFwKHJldCA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoT2JqZWN0LmVudHJpZXMocGFja2FnZU1hcDIpKVxuXHRcdFx0XHRcdFx0LmVhY2goYXN5bmMgKFtuYW1lLCB2ZXJzaW9uX29sZF0pID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB2ZXJzaW9uX25ldyA9IHJldFtuYW1lXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAodmVyc2lvbl9vbGQuaW5jbHVkZXMoJ34nKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5ub1NhZmUgfHwgdmVyc2lvbl9uZXcgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IGZldGNoVmVyc2lvbihuYW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZpbHRlcih2ZXJzaW9uKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgdmVyc2lvbl9vbGQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBvcHRpb25zKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbihyZXQgPT4gcmV0LnBvcCgpKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX25ldyA9PSBudWxsICYmIGlzQmFkVmVyc2lvbih2ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIG51bGwsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fbmV3ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIHZlcnNpb25fb2xkLCB2ZXJzaW9uVGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHNldFZlcnNpb25DYWNoZU1hcCh7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fb2xkLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3LFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcGFja2FnZU1hcEFycmF5XG5cdFx0XHRcdFx0XHQubWFwKGRhdGEgPT4gdmVyc2lvbkNhY2hlTWFwLmdldChzdHJWZXJzaW9uQ2FjaGUoZGF0YSkpKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JhZFZlcnNpb24odmVyc2lvbjogSVZlcnNpb25WYWx1ZSlcbntcblx0bGV0IGJvb2wgPSBmYWxzZTtcblx0c3dpdGNoICh2ZXJzaW9uKVxuXHR7XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5tYWpvcjpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubmV3ZXN0OlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmdyZWF0ZXN0OlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZTIuYW55OlxuXHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXG5cdFx0XHRpZiAodmVyc2lvbiA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gYm9vbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlc09wdGlvbnMobmN1T3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gfCBJT3B0aW9ucyk6IElPcHRpb25zXG57XG5cdG5jdU9wdGlvbnMgPSB7XG5cdFx0Li4ubmN1T3B0aW9ucyxcblx0fTtcblxuXHRkZWxldGUgbmN1T3B0aW9ucy51cGdyYWRlO1xuXHQvLyBAdHMtaWdub3JlXG5cdGRlbGV0ZSBuY3VPcHRpb25zLmdsb2JhbDtcblxuXHRuY3VPcHRpb25zLnBhY2thZ2VNYW5hZ2VyID0gJ25wbSc7XG5cblx0aWYgKG5jdU9wdGlvbnMuanNvbl9vbGQpXG5cdHtcblx0XHRuY3VPcHRpb25zLnBhY2thZ2VEYXRhID0gSlNPTi5zdHJpbmdpZnkobmN1T3B0aW9ucy5qc29uX29sZCk7XG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdG5jdU9wdGlvbnMuanNvblVwZ3JhZGVkID0gdHJ1ZTtcblxuXHRyZXR1cm4gbmN1T3B0aW9ucyBhcyBJT3B0aW9uc1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtQ2hlY2tVcGRhdGVzPEMgZXh0ZW5kcyBJV3JhcERlZHVwZUNhY2hlPihjYWNoZTogUGFydGlhbDxDPiwgbmN1T3B0aW9uczogSU9wdGlvbnMpXG57XG5cdC8vbmN1T3B0aW9ucy5zaWxlbnQgPSBmYWxzZTtcblxuXHQvL25jdU9wdGlvbnMuanNvbiA9IGZhbHNlO1xuXHQvL25jdU9wdGlvbnMuY2xpID0gdHJ1ZTtcblxuXHQvL25jdU9wdGlvbnMuYXJncyA9IFtdO1xuXG5cdC8vbmN1T3B0aW9ucy5sb2dsZXZlbCA9ICd2ZXJib3NlJztcblxuXHRuY3VPcHRpb25zID0gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhuY3VPcHRpb25zKTtcblxuXHRuY3VPcHRpb25zLmN3ZCA9IGNhY2hlLmN3ZDtcblxuXHRuY3VPcHRpb25zLmpzb25fbmV3ID0gSlNPTi5wYXJzZShuY3VPcHRpb25zLnBhY2thZ2VEYXRhKTtcblxuXHRuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCA9IGF3YWl0IF9ucG1DaGVja1VwZGF0ZXMobmN1T3B0aW9ucykgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyhuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCk7XG5cblx0bmN1T3B0aW9ucy5qc29uX2NoYW5nZWQgPSAhIWtzLmxlbmd0aDtcblxuXHRsZXQgY3VycmVudDogSURlcGVuZGVuY3kgPSB7fTtcblxuXHRpZiAoa3MubGVuZ3RoKVxuXHR7XG5cdFx0a3MuZm9yRWFjaChuYW1lID0+XG5cdFx0e1xuXG5cdFx0XHQoPChrZXlvZiBJUGFja2FnZUpzb24pW10+W1xuXHRcdFx0XHQnZGVwZW5kZW5jaWVzJyxcblx0XHRcdFx0J2RldkRlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdwZWVyRGVwZW5kZW5jaWVzJyxcblx0XHRcdFx0J29wdGlvbmFsRGVwZW5kZW5jaWVzJyxcblx0XHRcdF0pLmZvckVhY2goa2V5ID0+XG5cdFx0XHR7XG5cblx0XHRcdFx0bGV0IGRhdGEgPSBuY3VPcHRpb25zLmpzb25fbmV3W2tleV07XG5cblx0XHRcdFx0aWYgKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdmFsdWUgPSBkYXRhW25hbWVdO1xuXG5cdFx0XHRcdFx0aWYgKHZhbHVlICYmIHZhbHVlICE9IEVudW1WZXJzaW9uVmFsdWUyLmFueSAmJiB2YWx1ZSAhPSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjdXJyZW50W25hbWVdID0gdmFsdWU7XG5cblx0XHRcdFx0XHRcdGRhdGFbbmFtZV0gPSBuY3VPcHRpb25zLmxpc3RfdXBkYXRlZFtuYW1lXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fSlcblxuXHRcdH0pO1xuXG5cdH1cblxuXHRuY3VPcHRpb25zLmN1cnJlbnQgPSBjdXJyZW50O1xuXG5cdGxldCB0YWJsZSA9IHRvRGVwZW5kZW5jeVRhYmxlKHtcblx0XHRmcm9tOiBuY3VPcHRpb25zLmN1cnJlbnQsXG5cdFx0dG86IG5jdU9wdGlvbnMubGlzdF91cGRhdGVkLFxuXHR9KS50b1N0cmluZygpO1xuXG5cdHRhYmxlICYmIGNvbnNvbGUubG9nKGBcXG4ke3RhYmxlfVxcbmApO1xuXG5cdHJldHVybiBuY3VPcHRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBOY3VUb1lhcmdzPFQgZXh0ZW5kcyBhbnk+KHlhcmdzOiBBcmd2PFQ+KVxue1xuXHRyZXR1cm4geWFyZ3Ncblx0XHQub3B0aW9uKCdkZXAnLCB7XG5cdFx0XHRkZXNjOiBgY2hlY2sgb25seSBhIHNwZWNpZmljIHNlY3Rpb24ocykgb2YgZGVwZW5kZW5jaWVzOiBwcm9kfGRldnxwZWVyfG9wdGlvbmFsfGJ1bmRsZSAoY29tbWEtZGVsaW1pdGVkKWAsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdtaW5pbWFsJywge1xuXHRcdFx0YWxpYXM6IFsnbSddLFxuXHRcdFx0ZGVzYzogYGRvIG5vdCB1cGdyYWRlIG5ld2VyIHZlcnNpb25zIHRoYXQgYXJlIGFscmVhZHkgc2F0aXNmaWVkIGJ5IHRoZSB2ZXJzaW9uIHJhbmdlIGFjY29yZGluZyB0byBzZW12ZXJgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ25ld2VzdCcsIHtcblx0XHRcdGFsaWFzOiBbJ24nXSxcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBuZXdlc3QgdmVyc2lvbnMgYXZhaWxhYmxlIGluc3RlYWQgb2YgdGhlIGxhdGVzdCBzdGFibGUgdmVyc2lvbnNgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3BhY2thZ2VNYW5hZ2VyJywge1xuXHRcdFx0YWxpYXM6IFsncCddLFxuXHRcdFx0ZGVzYzogYG5wbSAoZGVmYXVsdCkgb3IgYm93ZXJgLFxuXHRcdFx0ZGVmYXVsdDogJ25wbScsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdyZWdpc3RyeScsIHtcblx0XHRcdGFsaWFzOiBbJ3InXSxcblx0XHRcdGRlc2M6IGBzcGVjaWZ5IHRoaXJkLXBhcnR5IG5wbSByZWdpc3RyeWAsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdzaWxlbnQnLCB7XG5cdFx0XHRhbGlhczogWydzJ10sXG5cdFx0XHRkZXNjOiBgZG9uJ3Qgb3V0cHV0IGFueXRoaW5nICgtLWxvZ2xldmVsIHNpbGVudClgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2dyZWF0ZXN0Jywge1xuXHRcdFx0YWxpYXM6IFsnZyddLFxuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIGhpZ2hlc3QgdmVyc2lvbnMgYXZhaWxhYmxlIGluc3RlYWQgb2YgdGhlIGxhdGVzdCBzdGFibGUgdmVyc2lvbnNgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3VwZ3JhZGUnLCB7XG5cdFx0XHRhbGlhczogWyd1J10sXG5cdFx0XHRkZXNjOiBgb3ZlcndyaXRlIHBhY2thZ2UgZmlsZWAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignc2VtdmVyTGV2ZWwnLCB7XG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgaGlnaGVzdCB2ZXJzaW9uIHdpdGhpbiBcIm1ham9yXCIgb3IgXCJtaW5vclwiYCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3JlbW92ZVJhbmdlJywge1xuXHRcdFx0ZGVzYzogYHJlbW92ZSB2ZXJzaW9uIHJhbmdlcyBmcm9tIHRoZSBmaW5hbCBwYWNrYWdlIHZlcnNpb25gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2RlZHVwZScsIHtcblx0XHRcdGRlc2M6IGByZW1vdmUgdXBncmFkZSBtb2R1bGUgZnJvbSByZXNvbHV0aW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0ZGVmYXVsdDogdHJ1ZSxcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUmVzb2x1dGlvbnNVcGRhdGUocmVzb2x1dGlvbnM6IElQYWNrYWdlTWFwLFxuXHR5YXJubG9ja19vbGRfb2JqOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3QgfCBzdHJpbmcsXG5cdG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+LFxuKVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIHlhcm5sb2NrX29sZF9vYmogPT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR5YXJubG9ja19vbGRfb2JqID0gcGFyc2VZYXJuTG9jayh5YXJubG9ja19vbGRfb2JqKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHJlc3VsdCA9IGZpbHRlclJlc29sdXRpb25zKHtcblx0XHRcdFx0cmVzb2x1dGlvbnMsXG5cdFx0XHR9LCB5YXJubG9ja19vbGRfb2JqKTtcblxuXHRcdFx0bGV0IGRlcHMgPSBhd2FpdCBxdWVyeVJlbW90ZVZlcnNpb25zKHJlc29sdXRpb25zLCBvcHRpb25zKTtcblxuXHRcdFx0Ly9jb25zb2xlLmRpcihkZXBzKTtcblxuXHRcdFx0bGV0IGRlcHMyID0ga2V5T2JqZWN0VG9QYWNrYWdlTWFwKGRlcHMsIHRydWUpO1xuXG5cdFx0XHRsZXQgZGVwczMgPSBPYmplY3QudmFsdWVzKGRlcHMpXG5cdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhW2IubmFtZV0gPSBiO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZT4pXG5cdFx0XHQ7XG5cblx0XHRcdGxldCB5YXJubG9ja19uZXdfb2JqOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3QgPSB7XG5cdFx0XHRcdC4uLnlhcm5sb2NrX29sZF9vYmosXG5cdFx0XHR9O1xuXG5cdFx0XHRsZXQgdXBkYXRlX2xpc3Q6IHN0cmluZ1tdID0gW107XG5cdFx0XHRsZXQgeWFybmxvY2tfY2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0XHRPYmplY3QuZW50cmllcyhyZXN1bHQubWF4KVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW25hbWUsIGRhdGFdKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF9rZXkyID0gbmFtZSArICdAJyArIGRlcHMzW25hbWVdLnZlcnNpb25fb2xkO1xuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICog5qqi5p+lIOeJiOacrOevhOWcjeaYr+WQpuespuWQiCDoiIcg54mI5pys5piv5ZCm5LiN55u45ZCMXG5cdFx0XHRcdFx0ICovXG4vL1x0XHRcdFx0XHRjb25zb2xlLmRpcih7XG4vL1x0XHRcdFx0XHRcdGRhdGEsXG4vL1x0XHRcdFx0XHRcdGRlcHM6IGRlcHMyW25hbWVdLFxuLy9cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKGRhdGEudmFsdWUudmVyc2lvbiAhPSBudWxsICYmIGRlcHMyW25hbWVdICE9IG51bGwgJiYgc2VtdmVyLmx0KGRhdGEudmFsdWUudmVyc2lvbiwgZGVwczJbbmFtZV0pICYmIHlhcm5sb2NrX25ld19vYmpbX2tleTJdICYmIHlhcm5sb2NrX25ld19vYmpbX2tleTJdLnZlcnNpb24gIT0gZGF0YS52YWx1ZS52ZXJzaW9uKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKHJlc3VsdC5kZXBzW25hbWVdKVxuXHRcdFx0XHRcdFx0XHQuZm9yRWFjaCh2ZXJzaW9uID0+XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsZXQga2V5ID0gbmFtZSArICdAJyArIHZlcnNpb247XG5cblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgeWFybmxvY2tfbmV3X29ialtrZXldXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHR1cGRhdGVfbGlzdC5wdXNoKG5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5pbnN0YWxsZWRbbmFtZV0ubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXMocmVzdWx0LmRlcHNbbmFtZV0pXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2godmVyc2lvbiA9PlxuXHRcdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGtleSA9IG5hbWUgKyAnQCcgKyB2ZXJzaW9uO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR5YXJubG9ja19uZXdfb2JqW2tleV0gPSBkYXRhLnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eWFybmxvY2tfb2xkX29iaixcblx0XHRcdFx0eWFybmxvY2tfbmV3X29iaixcblx0XHRcdFx0dXBkYXRlX2xpc3QsXG5cdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQsXG5cdFx0XHRcdGRlcHMsXG5cdFx0XHRcdGRlcHMyLFxuXHRcdFx0XHRkZXBzMyxcblx0XHRcdH1cblx0XHR9KVxuXHRcdDtcbn1cblxuLypcbihhc3luYyAoKSA9Plxue1xuXHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0Y3dkOiBwcm9jZXNzLmN3ZCgpXG5cdH0pO1xuXG5cdGxldCBwa2cgPSByZXF1aXJlKCdHOi9Vc2Vycy9UaGUgUHJvamVjdC9ub2RlanMteWFybi93cy1jcmVhdGUteWFybi13b3Jrc3BhY2VzL3BhY2thZ2UuanNvbicpO1xuXG5cdGxldCB5YXJubG9ja19vbGRfb2JqID0gYXdhaXQgcmVhZFlhcm5Mb2NrZmlsZShwYXRoLmpvaW4ocm9vdERhdGEucm9vdCwgJ3lhcm4ubG9jaycpKTtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyh5YXJubG9ja19vbGRfb2JqKS5maWx0ZXIoayA9PiBrLmluY2x1ZGVzKCdzdHJpbmctd2lkdGgnKSlcblxuXHRsZXQgcmV0ID0gYXdhaXQgY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShwa2cucmVzb2x1dGlvbnMsIHlhcm5sb2NrX29sZF9vYmopXG5cblx0Y29uc29sZS5kaXIocmV0KTtcblxufSkoKTtcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaXNVcGdyYWRlYWJsZShjdXJyZW50OiBJVmVyc2lvblZhbHVlLCBsYXRlc3Q6IElWZXJzaW9uVmFsdWUpOiBib29sZWFuXG57XG5cdHJldHVybiBfaXNVcGdyYWRlYWJsZShjdXJyZW50LCBsYXRlc3QpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZW12ZXIoY3VycmVudDogSVZlcnNpb25WYWx1ZSxcblx0bGF0ZXN0OiBJVmVyc2lvblZhbHVlLFxuXHRvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiA9IHt9LFxuKTogSVZlcnNpb25WYWx1ZVxue1xuXHRyZXR1cm4gdXBncmFkZURlcGVuZGVuY3lEZWNsYXJhdGlvbihjdXJyZW50LCBsYXRlc3QsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdFZlcnNpb24ocGFja2FnZU5hbWU6IHN0cmluZylcbntcblx0cmV0dXJuIEJsdWViaXJkXG5cdFx0LnJlc29sdmUocmVtb3RlQ2FjaGVNYXAuZ2V0KHBhY2thZ2VOYW1lKSlcblx0XHQudGhlbihmdW5jdGlvbiAocmVzdWx0KVxuXHRcdHtcblx0XHRcdGlmIChyZXN1bHQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHBhY2thZ2VKc29uKHBhY2thZ2VOYW1lLCB7IGFsbFZlcnNpb25zOiB0cnVlIH0pXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHRcblx0XHR9KVxuXHRcdC50YXAoZnVuY3Rpb24gKHJlc3VsdClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmVtb3RlQ2FjaGVNYXAuc2V0KHBhY2thZ2VOYW1lLCByZXN1bHQpO1xuXHRcdH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaFZlcnNpb24ocGFja2FnZU5hbWU6IHN0cmluZywgb3B0aW9uczoge1xuXHRmaWVsZD86IHN0cmluZyB8ICd0aW1lJyB8ICd2ZXJzaW9ucycgfCAnZGlzdC10YWdzLmxhdGVzdCcsXG5cdGZpbHRlcj8odmVyc2lvbjogSVZlcnNpb25WYWx1ZSk6IGJvb2xlYW4sXG5cdGN1cnJlbnRWZXJzaW9uPzogSVZlcnNpb25WYWx1ZSxcbn0gPSB7fSwgbmN1T3B0aW9ucz86IFBhcnRpYWw8SU9wdGlvbnM+KVxue1xuXHRsZXQgeyBmaWVsZCA9ICd2ZXJzaW9ucycgfSA9IG9wdGlvbnM7XG5cblx0cmV0dXJuIHJlcXVlc3RWZXJzaW9uKHBhY2thZ2VOYW1lKVxuXHQvLy5yZXNvbHZlKHBhY2thZ2VKc29uKHBhY2thZ2VOYW1lLCB7IGFsbFZlcnNpb25zOiB0cnVlIH0pKVxuXHRcdC50aGVuPElWZXJzaW9uVmFsdWVbXT4oZnVuY3Rpb24gKHJlc3VsdClcblx0XHR7XG5cdFx0XHRpZiAoZmllbGQuc3RhcnRzV2l0aCgnZGlzdC10YWdzLicpKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzcGxpdCA9IGZpZWxkLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGlmIChyZXN1bHRbc3BsaXRbMF1dKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFtzcGxpdFswXV1bc3BsaXRbMV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmaWVsZCA9PT0gJ3ZlcnNpb25zJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHJlc3VsdFtmaWVsZF0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoZmllbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXN1bHRbZmllbGRdO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnRoZW4ocmVzdWx0ID0+XG5cdFx0e1xuXG5cdFx0XHRpZiAob3B0aW9ucy5maWx0ZXIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXN1bHQuZmlsdGVyKG9wdGlvbnMuZmlsdGVyKVxuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUuZGlyKHJlc3VsdCk7XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNldHVwTmN1VG9ZYXJnc1xuXG4iXX0=