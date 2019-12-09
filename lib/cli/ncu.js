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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBNkM7QUFDN0Msb0NBQTZDO0FBRzdDLGlGQUFrRjtBQUNsRix5RUFLOEM7QUFLOUMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUscUNBQXNDO0FBQ3RDLDBDQU9xQjtBQUVyQixpQ0FBa0M7QUFHbEMsNENBQTZDO0FBQzdDLDZCQUE2QjtBQVc3QixJQUFZLGdCQU9YO0FBUEQsV0FBWSxnQkFBZ0I7SUFFM0IsbUNBQWlCLENBQUE7SUFDakIsbUNBQWlCLENBQUE7SUFDakIscUNBQW1CLENBQUE7SUFDbkIseUNBQXVCLENBQUE7SUFDdkIscUNBQW1CLENBQUE7QUFDcEIsQ0FBQyxFQVBXLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBTzNCO0FBRUQsSUFBWSw0QkFPWDtBQVBELFdBQVksNEJBQTRCO0lBRXZDLHVEQUF5QixDQUFBO0lBQ3pCLHVEQUF5QixDQUFBO0lBQ3pCLGlEQUFtQixDQUFBO0lBQ25CLHFEQUF1QixDQUFBO0lBQ3ZCLGlEQUFtQixDQUFBO0FBQ3BCLENBQUMsRUFQVyw0QkFBNEIsR0FBNUIsb0NBQTRCLEtBQTVCLG9DQUE0QixRQU92QztBQUVELElBQWtCLGlCQUdqQjtBQUhELFdBQWtCLGlCQUFpQjtJQUVsQyw4QkFBUyxDQUFBO0FBQ1YsQ0FBQyxFQUhpQixpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUdsQztBQWNZLFFBQUEsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO0FBRTNELFFBQUEsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFrRSxDQUFDO0FBd0J4RyxTQUFnQixnQkFBZ0IsQ0FBQyxPQUErRDtJQUUvRixJQUFJLE9BQU8s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SSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3BCO2dCQUNDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0Q7YUFDSSxJQUFJLEtBQUssS0FBSyxVQUFVLEVBQzdCO1lBQ0MsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO2FBQ0ksSUFBSSxLQUFLLEVBQ2Q7WUFDQyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQjtJQUNGLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUdkLElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3BDO1FBRUQsc0JBQXNCO1FBRXRCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBMUNELG9DQTBDQztBQUVELGtCQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeyBydW4gYXMgX25wbUNoZWNrVXBkYXRlcyB9IGZyb20gJ25wbS1jaGVjay11cGRhdGVzJztcbmltcG9ydCB7IElXcmFwRGVkdXBlQ2FjaGUgfSBmcm9tICcuL2RlZHVwZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG4vL2ltcG9ydCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbi8vaW1wb3J0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGZpbmRSb290IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgdG9EZXBlbmRlbmN5VGFibGUgfSBmcm9tICcuLi90YWJsZSc7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgSVVucGFja1lhcmdzQXJndiB9IGZyb20gJy4uL2NsaSc7XG5pbXBvcnQgUGFja2FnZU1hbmFnZXJzTnBtID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3BhY2thZ2UtbWFuYWdlcnMvbnBtJyk7XG5pbXBvcnQge1xuXHRxdWVyeVZlcnNpb25zIGFzIF9xdWVyeVZlcnNpb25zLFxuXHRnZXRWZXJzaW9uVGFyZ2V0IGFzIF9nZXRWZXJzaW9uVGFyZ2V0LFxuXHRpc1VwZ3JhZGVhYmxlIGFzIF9pc1VwZ3JhZGVhYmxlLFxuXHR1cGdyYWRlRGVwZW5kZW5jeURlY2xhcmF0aW9uLFxufSBmcm9tICducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbm1hbmFnZXInO1xuaW1wb3J0IHtcblx0SVRTVW5wYWNrZWRQcm9taXNlTGlrZSxcbn0gZnJvbSAndHMtdHlwZSc7XG5cbmNvbnN0IHZlcnNpb25VdGlsID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3ZlcnNpb24tdXRpbCcpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3QsXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssXG5cdHBhcnNlLFxuXHRyZWFkWWFybkxvY2tmaWxlLFxuXHRzdHJpcERlcHNOYW1lLFxufSBmcm9tICcuLi95YXJubG9jayc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCBzZW12ZXJ1dGlscyA9IHJlcXVpcmUoJ3NlbXZlci11dGlscycpO1xuaW1wb3J0IHBhY2thZ2VKc29uID0gcmVxdWlyZSgncGFja2FnZS1qc29uJyk7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgdHlwZSBJVmVyc2lvblZhbHVlID0gJ2xhdGVzdCcgfCAnKicgfCBzdHJpbmcgfCBFbnVtVmVyc2lvblZhbHVlIHwgRW51bVZlcnNpb25WYWx1ZTI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZlcnNpb25DYWNoZU1hcEtleVxue1xuXHRuYW1lOiBzdHJpbmcsXG5cdHZlcnNpb25UYXJnZXQ6IEVudW1WZXJzaW9uVmFsdWUsXG5cdHZlcnNpb25fb2xkOiBJVmVyc2lvblZhbHVlLFxufVxuXG5leHBvcnQgZW51bSBFbnVtVmVyc2lvblZhbHVlXG57XG5cdCdtYWpvcicgPSAnbWFqb3InLFxuXHQnbWlub3InID0gJ21pbm9yJyxcblx0J2xhdGVzdCcgPSAnbGF0ZXN0Jyxcblx0J2dyZWF0ZXN0JyA9ICdncmVhdGVzdCcsXG5cdCduZXdlc3QnID0gJ25ld2VzdCdcbn1cblxuZXhwb3J0IGVudW0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZFxue1xuXHQnbWFqb3InID0gJ2dyZWF0ZXN0TWFqb3InLFxuXHQnbWlub3InID0gJ2dyZWF0ZXN0TWlub3InLFxuXHQnbGF0ZXN0JyA9ICdsYXRlc3QnLFxuXHQnZ3JlYXRlc3QnID0gJ2dyZWF0ZXN0Jyxcblx0J25ld2VzdCcgPSAnbmV3ZXN0J1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBFbnVtVmVyc2lvblZhbHVlMlxue1xuXHRhbnkgPSAnKidcbn1cblxuZXhwb3J0IHR5cGUgSURlcGVuZGVuY3kgPSBJUGFja2FnZU1hcDtcblxuZXhwb3J0IGludGVyZmFjZSBJUGFja2FnZU1hcFxue1xuXHRbbmFtZTogc3RyaW5nXTogSVZlcnNpb25WYWx1ZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSBleHRlbmRzIElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0dmVyc2lvbl9uZXc6IElWZXJzaW9uVmFsdWUsXG59XG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uQ2FjaGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSVZlcnNpb25DYWNoZU1hcFZhbHVlPigpO1xuXG5leHBvcnQgY29uc3QgcmVtb3RlQ2FjaGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSVRTVW5wYWNrZWRQcm9taXNlTGlrZTxSZXR1cm5UeXBlPHR5cGVvZiBwYWNrYWdlSnNvbj4+PigpO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9ucyA9IElVbnBhY2tZYXJnc0FyZ3Y8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0dXBOY3VUb1lhcmdzPj4gJiB7XG5cdGpzb25fb2xkOiBJUGFja2FnZUpzb247XG5cdGN3ZD86IHN0cmluZztcblx0cGFja2FnZURhdGE/OiBzdHJpbmc7XG5cdHBhY2thZ2VNYW5hZ2VyPzogJ25wbScgfCAnYm93ZXInO1xuXG5cdGpzb25fbmV3PzogSVBhY2thZ2VKc29uO1xuXHRqc29uX2NoYW5nZWQ/OiBib29sZWFuO1xuXG5cdGxpc3RfdXBkYXRlZD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bG9nbGV2ZWw/OiAnc2lsZW50JyB8ICd2ZXJib3NlJztcblxuXHRzZW12ZXJMZXZlbD86IEVudW1WZXJzaW9uVmFsdWUubWFqb3IgfCBFbnVtVmVyc2lvblZhbHVlLm1pbm9yLFxuXG5cdHZlcnNpb25UYXJnZXQ/OiBFbnVtVmVyc2lvblZhbHVlLFxuXG5cdGN1cnJlbnQ/OiBJRGVwZW5kZW5jeTtcblxuXHRub1NhZmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvblRhcmdldChvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiB8IHN0cmluZyB8IElPcHRpb25zWyd2ZXJzaW9uVGFyZ2V0J10pOiBJT3B0aW9uc1sndmVyc2lvblRhcmdldCddXG57XG5cdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG9wdGlvbnNcblx0fVxuXHRlbHNlIGlmIChvcHRpb25zLnZlcnNpb25UYXJnZXQpXG5cdHtcblx0XHRyZXR1cm4gb3B0aW9ucy52ZXJzaW9uVGFyZ2V0XG5cdH1cblxuXHRyZXR1cm4gX2dldFZlcnNpb25UYXJnZXQob3B0aW9ucylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ialZlcnNpb25DYWNoZSh7XG5cdG5hbWUsXG5cdHZlcnNpb25UYXJnZXQsXG5cdHZlcnNpb25fb2xkLFxufTogSVZlcnNpb25DYWNoZU1hcEtleSk6IElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0dmVyc2lvbl9vbGQsXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmpWZXJzaW9uQ2FjaGVWYWx1ZSh7XG5cdG5hbWUsXG5cdHZlcnNpb25UYXJnZXQsXG5cdHZlcnNpb25fb2xkLFxuXHR2ZXJzaW9uX25ldyxcbn06IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSk6IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZVxue1xuXHRyZXR1cm4ge1xuXHRcdG5hbWUsXG5cdFx0dmVyc2lvblRhcmdldCxcblx0XHR2ZXJzaW9uX29sZCxcblx0XHR2ZXJzaW9uX25ldyxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0clZlcnNpb25DYWNoZShrZXk6IElWZXJzaW9uQ2FjaGVNYXBLZXkpXG57XG5cdHJldHVybiBKU09OLnN0cmluZ2lmeShvYmpWZXJzaW9uQ2FjaGUoa2V5KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNRdWVyeWVkVmVyc2lvbkNhY2hlKGtleTogSVZlcnNpb25DYWNoZU1hcEtleSlcbntcblx0cmV0dXJuIHZlcnNpb25DYWNoZU1hcC5oYXMoc3RyVmVyc2lvbkNhY2hlKGtleSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZXlPYmplY3RUb1BhY2thZ2VNYXAob2JqOiBJVmVyc2lvbkNhY2hlTWFwS2V5W10gfCBJVmVyc2lvbkNhY2hlTWFwVmFsdWVbXSxcblx0dXNlVmFyc2lvbk5ldz86IGJvb2xlYW4sXG4pOiBJUGFja2FnZU1hcFxue1xuXHRyZXR1cm4gb2JqLnJlZHVjZShmdW5jdGlvbiAoYTogYW55LCBkYXRhKVxuXHR7XG5cdFx0aWYgKHVzZVZhcnNpb25OZXcpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhLnZlcnNpb25fbmV3ICE9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGE7XG5cblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgSVZlcnNpb25DYWNoZU1hcFZhbHVlIG9iamVjdCwgJHt1dGlsLmluc3BlY3QoZGF0YSl9YClcblx0XHRcdH1cblxuXHRcdFx0YVtkYXRhLm5hbWVdID0gZGF0YS52ZXJzaW9uX25ldztcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGFbZGF0YS5uYW1lXSA9IGRhdGEudmVyc2lvbl9vbGQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGE7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHR9LCB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2thZ2VNYXBUb0tleU9iamVjdChwYWNrYWdlTWFwOiBJUGFja2FnZU1hcCwgdmVyc2lvblRhcmdldDogSVZlcnNpb25DYWNoZU1hcEtleVtcInZlcnNpb25UYXJnZXRcIl0pXG57XG5cdHJldHVybiBPYmplY3Rcblx0XHQuZW50cmllcyhwYWNrYWdlTWFwKVxuXHRcdC5tYXAoKFtuYW1lLCB2ZXJzaW9uX29sZF0pID0+XG5cdFx0e1xuXHRcdFx0cmV0dXJuIG9ialZlcnNpb25DYWNoZSh7XG5cdFx0XHRcdG5hbWUsIHZlcnNpb25fb2xkLCB2ZXJzaW9uVGFyZ2V0LFxuXHRcdFx0fSlcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWU6IHN0cmluZyxcblx0dmVyc2lvbjogSVZlcnNpb25WYWx1ZSA9ICcwJyxcblx0dmVyc2lvblRhcmdldDogRW51bVZlcnNpb25WYWx1ZSA9IEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0LFxuKTogQmx1ZWJpcmQ8SVZlcnNpb25WYWx1ZT5cbntcblx0bGV0IG1ldGhvZCA9IEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2RbdmVyc2lvblRhcmdldF07XG5cblx0aWYgKHZlcnNpb24gPT0gbnVsbClcblx0e1xuXHRcdHZlcnNpb24gPSAnMCc7XG5cblx0XHRzd2l0Y2ggKHZlcnNpb25UYXJnZXQpXG5cdFx0e1xuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDpcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5ncmVhdGVzdDpcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5uZXdlc3Q6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1ham9yOlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yOlxuXHRcdFx0XHRtZXRob2QgPSBFbnVtUGFja2FnZU1hbmFnZXJzTnBtTWV0aG9kLmxhdGVzdDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIEJsdWViaXJkXG5cdFx0LnJlc29sdmU8SVZlcnNpb25WYWx1ZT4oUGFja2FnZU1hbmFnZXJzTnBtW21ldGhvZF0obmFtZSwgdmVyc2lvbiwge30pKVxuXHRcdC50aGVuKGFzeW5jICh2YWx1ZSkgPT5cblx0XHR7XG5cdFx0XHRpZiAodmFsdWUgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0bGV0IHIgPSBhd2FpdCByZXF1ZXN0VmVyc2lvbihuYW1lKTtcblxuXHRcdFx0XHRpZiAodmVyc2lvbiBpbiByWydkaXN0LXRhZ3MnXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiByWydkaXN0LXRhZ3MnXVt2ZXJzaW9uXVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdH0pXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZlcnNpb25DYWNoZU1hcChkYXRhOiBJVmVyc2lvbkNhY2hlTWFwVmFsdWUpXG57XG5cdHJldHVybiB2ZXJzaW9uQ2FjaGVNYXAuc2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSwgb2JqVmVyc2lvbkNhY2hlVmFsdWUoZGF0YSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlSZW1vdGVWZXJzaW9ucyhwYWNrYWdlTWFwOiBJUGFja2FnZU1hcCB8IHN0cmluZ1tdLCBvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiA9IHt9KVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRvcHRpb25zID0gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdFx0Ly9jb25zb2xlLmRpcihvcHRpb25zKTtcblxuXHRcdFx0b3B0aW9ucy5sb2dsZXZlbCA9ICdzaWxlbnQnO1xuXG5cdFx0XHRsZXQgdmVyc2lvblRhcmdldCA9IG9wdGlvbnMudmVyc2lvblRhcmdldCA9IGdldFZlcnNpb25UYXJnZXQob3B0aW9ucykgfHwgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBhY2thZ2VNYXApKVxuXHRcdFx0e1xuXHRcdFx0XHRwYWNrYWdlTWFwID0gcGFja2FnZU1hcC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhW2JdID0gdmVyc2lvblRhcmdldDtcblxuXHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdH0sIHt9IGFzIElQYWNrYWdlTWFwKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhY2thZ2VNYXBBcnJheSA9IHBhY2thZ2VNYXBUb0tleU9iamVjdChwYWNrYWdlTWFwLCB2ZXJzaW9uVGFyZ2V0KTtcblxuXHRcdFx0bGV0IHBhY2thZ2VNYXBBcnJheUZpbHRlZCA9IGF3YWl0IEJsdWViaXJkLnJlc29sdmUocGFja2FnZU1hcEFycmF5KVxuXHRcdFx0XHQuZmlsdGVyKGFzeW5jIChkKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGJvb2wgPSAhaGFzUXVlcnllZFZlcnNpb25DYWNoZShkKTtcblxuXHRcdFx0XHRcdGlmIChib29sICYmIGlzQmFkVmVyc2lvbihkLnZlcnNpb25fb2xkKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodmVyc2lvblRhcmdldCA9PT0gRW51bVZlcnNpb25WYWx1ZS5taW5vcilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0oZC5uYW1lKTtcblxuXHRcdFx0XHRcdFx0XHRkLnZlcnNpb25fb2xkID0gdmVyc2lvbl9uZXcuc3BsaXQoJy4nKVswXSArICcuMC4wJztcblxuXHRcdFx0XHRcdFx0XHRzZXRWZXJzaW9uQ2FjaGVNYXAoe1xuXHRcdFx0XHRcdFx0XHRcdC4uLmQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGJvb2wgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYm9vbFxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgcGFja2FnZU1hcDIgPSBrZXlPYmplY3RUb1BhY2thZ2VNYXAocGFja2FnZU1hcEFycmF5RmlsdGVkKTtcblxuXHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlPElQYWNrYWdlTWFwPihfcXVlcnlWZXJzaW9ucyhwYWNrYWdlTWFwMiwgb3B0aW9ucykpXG5cdFx0XHRcdC50YXAocmV0ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShPYmplY3QuZW50cmllcyhwYWNrYWdlTWFwMikpXG5cdFx0XHRcdFx0XHQuZWFjaChhc3luYyAoW25hbWUsIHZlcnNpb25fb2xkXSkgPT5cblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZlcnNpb25fbmV3ID0gcmV0W25hbWVdO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX29sZC5pbmNsdWRlcygnficpKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zLm5vU2FmZSB8fCB2ZXJzaW9uX25ldyA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3ID0gYXdhaXQgZmV0Y2hWZXJzaW9uKG5hbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZmlsdGVyKHZlcnNpb24pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCB2ZXJzaW9uX29sZClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdH0sIG9wdGlvbnMpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC50aGVuKHJldCA9PiByZXQucG9wKCkpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fbmV3ID09IG51bGwgJiYgaXNCYWRWZXJzaW9uKHZlcnNpb25fb2xkKSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZSwgbnVsbCwgdmVyc2lvblRhcmdldCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAodmVyc2lvbl9uZXcgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0c2V0VmVyc2lvbkNhY2hlTWFwKHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9vbGQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwYWNrYWdlTWFwQXJyYXlcblx0XHRcdFx0XHRcdC5tYXAoZGF0YSA9PiB2ZXJzaW9uQ2FjaGVNYXAuZ2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmFkVmVyc2lvbih2ZXJzaW9uOiBJVmVyc2lvblZhbHVlKVxue1xuXHRsZXQgYm9vbCA9IGZhbHNlO1xuXHRzd2l0Y2ggKHZlcnNpb24pXG5cdHtcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1ham9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5uZXdlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlMi5hbnk6XG5cdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cblx0XHRcdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhuY3VPcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiB8IElPcHRpb25zKTogSU9wdGlvbnNcbntcblx0bmN1T3B0aW9ucyA9IHtcblx0XHQuLi5uY3VPcHRpb25zLFxuXHR9O1xuXG5cdGRlbGV0ZSBuY3VPcHRpb25zLnVwZ3JhZGU7XG5cdGRlbGV0ZSBuY3VPcHRpb25zLmdsb2JhbDtcblxuXHRuY3VPcHRpb25zLnBhY2thZ2VNYW5hZ2VyID0gJ25wbSc7XG5cblx0aWYgKG5jdU9wdGlvbnMuanNvbl9vbGQpXG5cdHtcblx0XHRuY3VPcHRpb25zLnBhY2thZ2VEYXRhID0gSlNPTi5zdHJpbmdpZnkobmN1T3B0aW9ucy5qc29uX29sZCk7XG5cdH1cblxuXHRuY3VPcHRpb25zLmpzb25VcGdyYWRlZCA9IHRydWU7XG5cblx0cmV0dXJuIG5jdU9wdGlvbnMgYXMgSU9wdGlvbnNcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlczxDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oY2FjaGU6IFBhcnRpYWw8Qz4sIG5jdU9wdGlvbnM6IElPcHRpb25zKVxue1xuXHQvL25jdU9wdGlvbnMuc2lsZW50ID0gZmFsc2U7XG5cblx0Ly9uY3VPcHRpb25zLmpzb24gPSBmYWxzZTtcblx0Ly9uY3VPcHRpb25zLmNsaSA9IHRydWU7XG5cblx0Ly9uY3VPcHRpb25zLmFyZ3MgPSBbXTtcblxuXHQvL25jdU9wdGlvbnMubG9nbGV2ZWwgPSAndmVyYm9zZSc7XG5cblx0bmN1T3B0aW9ucyA9IG5wbUNoZWNrVXBkYXRlc09wdGlvbnMobmN1T3B0aW9ucyk7XG5cblx0bmN1T3B0aW9ucy5jd2QgPSBjYWNoZS5jd2Q7XG5cblx0bmN1T3B0aW9ucy5qc29uX25ldyA9IEpTT04ucGFyc2UobmN1T3B0aW9ucy5wYWNrYWdlRGF0YSk7XG5cblx0bmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQgPSBhd2FpdCBfbnBtQ2hlY2tVcGRhdGVzKG5jdU9wdGlvbnMpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMobmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQpO1xuXG5cdG5jdU9wdGlvbnMuanNvbl9jaGFuZ2VkID0gISFrcy5sZW5ndGg7XG5cblx0bGV0IGN1cnJlbnQ6IElEZXBlbmRlbmN5ID0ge307XG5cblx0aWYgKGtzLmxlbmd0aClcblx0e1xuXHRcdGtzLmZvckVhY2gobmFtZSA9PlxuXHRcdHtcblxuXHRcdFx0KDwoa2V5b2YgSVBhY2thZ2VKc29uKVtdPltcblx0XHRcdFx0J2RlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdkZXZEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQncGVlckRlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdvcHRpb25hbERlcGVuZGVuY2llcycsXG5cdFx0XHRdKS5mb3JFYWNoKGtleSA9PlxuXHRcdFx0e1xuXG5cdFx0XHRcdGxldCBkYXRhID0gbmN1T3B0aW9ucy5qc29uX25ld1trZXldO1xuXG5cdFx0XHRcdGlmIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZhbHVlID0gZGF0YVtuYW1lXTtcblxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB2YWx1ZSAhPSBFbnVtVmVyc2lvblZhbHVlMi5hbnkgJiYgdmFsdWUgIT0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y3VycmVudFtuYW1lXSA9IHZhbHVlO1xuXG5cdFx0XHRcdFx0XHRkYXRhW25hbWVdID0gbmN1T3B0aW9ucy5saXN0X3VwZGF0ZWRbbmFtZV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH0pXG5cblx0XHR9KTtcblxuXHR9XG5cblx0bmN1T3B0aW9ucy5jdXJyZW50ID0gY3VycmVudDtcblxuXHRsZXQgdGFibGUgPSB0b0RlcGVuZGVuY3lUYWJsZSh7XG5cdFx0ZnJvbTogbmN1T3B0aW9ucy5jdXJyZW50LFxuXHRcdHRvOiBuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCxcblx0fSkudG9TdHJpbmcoKTtcblxuXHR0YWJsZSAmJiBjb25zb2xlLmxvZyhgXFxuJHt0YWJsZX1cXG5gKTtcblxuXHRyZXR1cm4gbmN1T3B0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTmN1VG9ZYXJnczxUIGV4dGVuZHMgYW55Pih5YXJnczogQXJndjxUPilcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignZGVwJywge1xuXHRcdFx0ZGVzYzogYGNoZWNrIG9ubHkgYSBzcGVjaWZpYyBzZWN0aW9uKHMpIG9mIGRlcGVuZGVuY2llczogcHJvZHxkZXZ8cGVlcnxvcHRpb25hbHxidW5kbGUgKGNvbW1hLWRlbGltaXRlZClgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbWluaW1hbCcsIHtcblx0XHRcdGFsaWFzOiBbJ20nXSxcblx0XHRcdGRlc2M6IGBkbyBub3QgdXBncmFkZSBuZXdlciB2ZXJzaW9ucyB0aGF0IGFyZSBhbHJlYWR5IHNhdGlzZmllZCBieSB0aGUgdmVyc2lvbiByYW5nZSBhY2NvcmRpbmcgdG8gc2VtdmVyYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCduZXdlc3QnLCB7XG5cdFx0XHRhbGlhczogWyduJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgbmV3ZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwYWNrYWdlTWFuYWdlcicsIHtcblx0XHRcdGFsaWFzOiBbJ3AnXSxcblx0XHRcdGRlc2M6IGBucG0gKGRlZmF1bHQpIG9yIGJvd2VyYCxcblx0XHRcdGRlZmF1bHQ6ICducG0nLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVnaXN0cnknLCB7XG5cdFx0XHRhbGlhczogWydyJ10sXG5cdFx0XHRkZXNjOiBgc3BlY2lmeSB0aGlyZC1wYXJ0eSBucG0gcmVnaXN0cnlgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignc2lsZW50Jywge1xuXHRcdFx0YWxpYXM6IFsncyddLFxuXHRcdFx0ZGVzYzogYGRvbid0IG91dHB1dCBhbnl0aGluZyAoLS1sb2dsZXZlbCBzaWxlbnQpYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdncmVhdGVzdCcsIHtcblx0XHRcdGFsaWFzOiBbJ2cnXSxcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCd1cGdyYWRlJywge1xuXHRcdFx0YWxpYXM6IFsndSddLFxuXHRcdFx0ZGVzYzogYG92ZXJ3cml0ZSBwYWNrYWdlIGZpbGVgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NlbXZlckxldmVsJywge1xuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIGhpZ2hlc3QgdmVyc2lvbiB3aXRoaW4gXCJtYWpvclwiIG9yIFwibWlub3JcImAsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdyZW1vdmVSYW5nZScsIHtcblx0XHRcdGRlc2M6IGByZW1vdmUgdmVyc2lvbiByYW5nZXMgZnJvbSB0aGUgZmluYWwgcGFja2FnZSB2ZXJzaW9uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdkZWR1cGUnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHVwZ3JhZGUgbW9kdWxlIGZyb20gcmVzb2x1dGlvbnNgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zOiBJUGFja2FnZU1hcCxcblx0eWFybmxvY2tfb2xkX29iajogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0IHwgc3RyaW5nLFxuXHRvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPixcbilcbntcblx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB5YXJubG9ja19vbGRfb2JqID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0eWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWFybmxvY2tfb2xkX29iaik7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByZXN1bHQgPSBmaWx0ZXJSZXNvbHV0aW9ucyh7XG5cdFx0XHRcdHJlc29sdXRpb25zLFxuXHRcdFx0fSwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdGxldCBkZXBzID0gYXdhaXQgcXVlcnlSZW1vdGVWZXJzaW9ucyhyZXNvbHV0aW9ucywgb3B0aW9ucyk7XG5cblx0XHRcdC8vY29uc29sZS5kaXIoZGVwcyk7XG5cblx0XHRcdGxldCBkZXBzMiA9IGtleU9iamVjdFRvUGFja2FnZU1hcChkZXBzLCB0cnVlKTtcblxuXHRcdFx0bGV0IGRlcHMzID0gT2JqZWN0LnZhbHVlcyhkZXBzKVxuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YVtiLm5hbWVdID0gYjtcblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBJVmVyc2lvbkNhY2hlTWFwVmFsdWU+KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgeWFybmxvY2tfbmV3X29iajogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0ID0ge1xuXHRcdFx0XHQuLi55YXJubG9ja19vbGRfb2JqLFxuXHRcdFx0fTtcblxuXHRcdFx0bGV0IHVwZGF0ZV9saXN0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0bGV0IHlhcm5sb2NrX2NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdFx0T2JqZWN0LmVudHJpZXMocmVzdWx0Lm1heClcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtuYW1lLCBkYXRhXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfa2V5MiA9IG5hbWUgKyAnQCcgKyBkZXBzM1tuYW1lXS52ZXJzaW9uX29sZDtcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIOaqouafpSDniYjmnKznr4TlnI3mmK/lkKbnrKblkIgg6IiHIOeJiOacrOaYr+WQpuS4jeebuOWQjFxuXHRcdFx0XHRcdCAqL1xuLy9cdFx0XHRcdFx0Y29uc29sZS5kaXIoe1xuLy9cdFx0XHRcdFx0XHRkYXRhLFxuLy9cdFx0XHRcdFx0XHRkZXBzOiBkZXBzMltuYW1lXSxcbi8vXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChkYXRhLnZhbHVlLnZlcnNpb24gIT0gbnVsbCAmJiBkZXBzMltuYW1lXSAhPSBudWxsICYmIHNlbXZlci5sdChkYXRhLnZhbHVlLnZlcnNpb24sIGRlcHMyW25hbWVdKSAmJiB5YXJubG9ja19uZXdfb2JqW19rZXkyXSAmJiB5YXJubG9ja19uZXdfb2JqW19rZXkyXS52ZXJzaW9uICE9IGRhdGEudmFsdWUudmVyc2lvbilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhyZXN1bHQuZGVwc1tuYW1lXSlcblx0XHRcdFx0XHRcdFx0LmZvckVhY2godmVyc2lvbiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGtleSA9IG5hbWUgKyAnQCcgKyB2ZXJzaW9uO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIHlhcm5sb2NrX25ld19vYmpba2V5XVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0dXBkYXRlX2xpc3QucHVzaChuYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChyZXN1bHQuaW5zdGFsbGVkW25hbWVdLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKHJlc3VsdC5kZXBzW25hbWVdKVxuXHRcdFx0XHRcdFx0XHRcdC5mb3JFYWNoKHZlcnNpb24gPT5cblx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBrZXkgPSBuYW1lICsgJ0AnICsgdmVyc2lvbjtcblxuXHRcdFx0XHRcdFx0XHRcdFx0eWFybmxvY2tfbmV3X29ialtrZXldID0gZGF0YS52YWx1ZTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHlhcm5sb2NrX29sZF9vYmosXG5cdFx0XHRcdHlhcm5sb2NrX25ld19vYmosXG5cdFx0XHRcdHVwZGF0ZV9saXN0LFxuXHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkLFxuXHRcdFx0XHRkZXBzLFxuXHRcdFx0XHRkZXBzMixcblx0XHRcdFx0ZGVwczMsXG5cdFx0XHR9XG5cdFx0fSlcblx0XHQ7XG59XG5cbi8qXG4oYXN5bmMgKCkgPT5cbntcblx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdGN3ZDogcHJvY2Vzcy5jd2QoKVxuXHR9KTtcblxuXHRsZXQgcGtnID0gcmVxdWlyZSgnRzovVXNlcnMvVGhlIFByb2plY3Qvbm9kZWpzLXlhcm4vd3MtY3JlYXRlLXlhcm4td29ya3NwYWNlcy9wYWNrYWdlLmpzb24nKTtcblxuXHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IGF3YWl0IHJlYWRZYXJuTG9ja2ZpbGUocGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICd5YXJuLmxvY2snKSk7XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMoeWFybmxvY2tfb2xkX29iaikuZmlsdGVyKGsgPT4gay5pbmNsdWRlcygnc3RyaW5nLXdpZHRoJykpXG5cblx0bGV0IHJldCA9IGF3YWl0IGNoZWNrUmVzb2x1dGlvbnNVcGRhdGUocGtnLnJlc29sdXRpb25zLCB5YXJubG9ja19vbGRfb2JqKVxuXG5cdGNvbnNvbGUuZGlyKHJldCk7XG5cbn0pKCk7XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVXBncmFkZWFibGUoY3VycmVudDogSVZlcnNpb25WYWx1ZSwgbGF0ZXN0OiBJVmVyc2lvblZhbHVlKTogYm9vbGVhblxue1xuXHRyZXR1cm4gX2lzVXBncmFkZWFibGUoY3VycmVudCwgbGF0ZXN0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VtdmVyKGN1cnJlbnQ6IElWZXJzaW9uVmFsdWUsXG5cdGxhdGVzdDogSVZlcnNpb25WYWx1ZSxcblx0b3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gPSB7fSxcbik6IElWZXJzaW9uVmFsdWVcbntcblx0cmV0dXJuIHVwZ3JhZGVEZXBlbmRlbmN5RGVjbGFyYXRpb24oY3VycmVudCwgbGF0ZXN0LCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3RWZXJzaW9uKHBhY2thZ2VOYW1lOiBzdHJpbmcpXG57XG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlKHJlbW90ZUNhY2hlTWFwLmdldChwYWNrYWdlTmFtZSkpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdClcblx0XHR7XG5cdFx0XHRpZiAocmVzdWx0ID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBwYWNrYWdlSnNvbihwYWNrYWdlTmFtZSwgeyBhbGxWZXJzaW9uczogdHJ1ZSB9KVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fSlcblx0XHQudGFwKGZ1bmN0aW9uIChyZXN1bHQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJlbW90ZUNhY2hlTWFwLnNldChwYWNrYWdlTmFtZSwgcmVzdWx0KTtcblx0XHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hWZXJzaW9uKHBhY2thZ2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHtcblx0ZmllbGQ/OiBzdHJpbmcgfCAndGltZScgfCAndmVyc2lvbnMnIHwgJ2Rpc3QtdGFncy5sYXRlc3QnLFxuXHRmaWx0ZXI/KHZlcnNpb246IElWZXJzaW9uVmFsdWUpOiBib29sZWFuLFxuXHRjdXJyZW50VmVyc2lvbj86IElWZXJzaW9uVmFsdWUsXG59ID0ge30sIG5jdU9wdGlvbnM/OiBQYXJ0aWFsPElPcHRpb25zPilcbntcblx0bGV0IHsgZmllbGQgPSAndmVyc2lvbnMnIH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiByZXF1ZXN0VmVyc2lvbihwYWNrYWdlTmFtZSlcblx0Ly8ucmVzb2x2ZShwYWNrYWdlSnNvbihwYWNrYWdlTmFtZSwgeyBhbGxWZXJzaW9uczogdHJ1ZSB9KSlcblx0XHQudGhlbjxJVmVyc2lvblZhbHVlW10+KGZ1bmN0aW9uIChyZXN1bHQpXG5cdFx0e1xuXHRcdFx0aWYgKGZpZWxkLnN0YXJ0c1dpdGgoJ2Rpc3QtdGFncy4nKSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgc3BsaXQgPSBmaWVsZC5zcGxpdCgnLicpO1xuXHRcdFx0XHRpZiAocmVzdWx0W3NwbGl0WzBdXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHRbc3BsaXRbMF1dW3NwbGl0WzFdXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoZmllbGQgPT09ICd2ZXJzaW9ucycpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBPYmplY3Qua2V5cyhyZXN1bHRbZmllbGRdKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGZpZWxkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0W2ZpZWxkXTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC50aGVuKHJlc3VsdCA9PlxuXHRcdHtcblxuXHRcdFx0aWYgKG9wdGlvbnMuZmlsdGVyKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0LmZpbHRlcihvcHRpb25zLmZpbHRlcilcblx0XHRcdH1cblxuXHRcdFx0Ly9jb25zb2xlLmRpcihyZXN1bHQpO1xuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzZXR1cE5jdVRvWWFyZ3NcblxuIl19