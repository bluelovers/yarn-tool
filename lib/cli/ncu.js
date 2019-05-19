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
    return Bluebird.resolve(PackageManagersNpm[method](name, version));
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
                            }
                        }, options)
                            .then(ret => ret.pop());
                    }
                }
                if (version_new == null && isBadVersion(version_old)) {
                    version_new = await queryPackageManagersNpm(name, null, versionTarget);
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
        //console.log(deps);
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
            if (semver.lt(data.value.version, deps2[name])) {
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
function fetchVersion(packageName, options, ncuOptions) {
    let { field = 'versions' } = options;
    return Bluebird
        .resolve(packageJson(packageName, { allVersions: true }))
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
        else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBNkM7QUFDN0Msb0NBQTZDO0FBRzdDLGlGQUFrRjtBQUNsRix5RUFLOEM7QUFFOUMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUscUNBQXNDO0FBQ3RDLDBDQU9xQjtBQUVyQixpQ0FBa0M7QUFHbEMsNENBQTZDO0FBVzdDLElBQVksZ0JBT1g7QUFQRCxXQUFZLGdCQUFnQjtJQUUzQixtQ0FBaUIsQ0FBQTtJQUNqQixtQ0FBaUIsQ0FBQTtJQUNqQixxQ0FBbUIsQ0FBQTtJQUNuQix5Q0FBdUIsQ0FBQTtJQUN2QixxQ0FBbUIsQ0FBQTtBQUNwQixDQUFDLEVBUFcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFPM0I7QUFFRCxJQUFZLDRCQU9YO0FBUEQsV0FBWSw0QkFBNEI7SUFFdkMsdURBQXlCLENBQUE7SUFDekIsdURBQXlCLENBQUE7SUFDekIsaURBQW1CLENBQUE7SUFDbkIscURBQXVCLENBQUE7SUFDdkIsaURBQW1CLENBQUE7QUFDcEIsQ0FBQyxFQVBXLDRCQUE0QixHQUE1QixvQ0FBNEIsS0FBNUIsb0NBQTRCLFFBT3ZDO0FBRUQsSUFBa0IsaUJBR2pCO0FBSEQsV0FBa0IsaUJBQWlCO0lBRWxDLDhCQUFTLENBQUE7QUFDVixDQUFDLEVBSGlCLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBR2xDO0FBY1ksUUFBQSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7QUF3QnhFLFNBQWdCLGdCQUFnQixDQUFDLE9BQStEO0lBRS9GLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUMvQjtRQUNDLGFBQWE7UUFDYixPQUFPLE9BQU8sQ0FBQTtLQUNk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LE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQjtJQUNGLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUVkLElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3BDO1FBRUQsc0JBQXNCO1FBRXRCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBeENELG9DQXdDQztBQUVELGtCQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeyBydW4gYXMgX25wbUNoZWNrVXBkYXRlcyB9IGZyb20gJ25wbS1jaGVjay11cGRhdGVzJztcbmltcG9ydCB7IElXcmFwRGVkdXBlQ2FjaGUgfSBmcm9tICcuL2RlZHVwZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG4vL2ltcG9ydCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbi8vaW1wb3J0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGZpbmRSb290IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgdG9EZXBlbmRlbmN5VGFibGUgfSBmcm9tICcuLi90YWJsZSc7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgSVVucGFja1lhcmdzQXJndiB9IGZyb20gJy4uL2NsaSc7XG5pbXBvcnQgUGFja2FnZU1hbmFnZXJzTnBtID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3BhY2thZ2UtbWFuYWdlcnMvbnBtJyk7XG5pbXBvcnQge1xuXHRxdWVyeVZlcnNpb25zIGFzIF9xdWVyeVZlcnNpb25zLFxuXHRnZXRWZXJzaW9uVGFyZ2V0IGFzIF9nZXRWZXJzaW9uVGFyZ2V0LFxuXHRpc1VwZ3JhZGVhYmxlIGFzIF9pc1VwZ3JhZGVhYmxlLFxuXHR1cGdyYWRlRGVwZW5kZW5jeURlY2xhcmF0aW9uLFxufSBmcm9tICducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbm1hbmFnZXInO1xuXG5jb25zdCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbmltcG9ydCBCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQge1xuXHRmaWx0ZXJSZXNvbHV0aW9ucyxcblx0SVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0LFxuXHRwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrLFxuXHRwYXJzZSxcblx0cmVhZFlhcm5Mb2NrZmlsZSxcblx0c3RyaXBEZXBzTmFtZSxcbn0gZnJvbSAnLi4veWFybmxvY2snO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgc2VtdmVydXRpbHMgPSByZXF1aXJlKCdzZW12ZXItdXRpbHMnKTtcbmltcG9ydCBwYWNrYWdlSnNvbiA9IHJlcXVpcmUoJ3BhY2thZ2UtanNvbicpO1xuXG5leHBvcnQgdHlwZSBJVmVyc2lvblZhbHVlID0gJ2xhdGVzdCcgfCAnKicgfCBzdHJpbmcgfCBFbnVtVmVyc2lvblZhbHVlIHwgRW51bVZlcnNpb25WYWx1ZTI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZlcnNpb25DYWNoZU1hcEtleVxue1xuXHRuYW1lOiBzdHJpbmcsXG5cdHZlcnNpb25UYXJnZXQ6IEVudW1WZXJzaW9uVmFsdWUsXG5cdHZlcnNpb25fb2xkOiBJVmVyc2lvblZhbHVlLFxufVxuXG5leHBvcnQgZW51bSBFbnVtVmVyc2lvblZhbHVlXG57XG5cdCdtYWpvcicgPSAnbWFqb3InLFxuXHQnbWlub3InID0gJ21pbm9yJyxcblx0J2xhdGVzdCcgPSAnbGF0ZXN0Jyxcblx0J2dyZWF0ZXN0JyA9ICdncmVhdGVzdCcsXG5cdCduZXdlc3QnID0gJ25ld2VzdCdcbn1cblxuZXhwb3J0IGVudW0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZFxue1xuXHQnbWFqb3InID0gJ2dyZWF0ZXN0TWFqb3InLFxuXHQnbWlub3InID0gJ2dyZWF0ZXN0TWlub3InLFxuXHQnbGF0ZXN0JyA9ICdsYXRlc3QnLFxuXHQnZ3JlYXRlc3QnID0gJ2dyZWF0ZXN0Jyxcblx0J25ld2VzdCcgPSAnbmV3ZXN0J1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBFbnVtVmVyc2lvblZhbHVlMlxue1xuXHRhbnkgPSAnKidcbn1cblxuZXhwb3J0IHR5cGUgSURlcGVuZGVuY3kgPSBJUGFja2FnZU1hcDtcblxuZXhwb3J0IGludGVyZmFjZSBJUGFja2FnZU1hcFxue1xuXHRbbmFtZTogc3RyaW5nXTogSVZlcnNpb25WYWx1ZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSBleHRlbmRzIElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0dmVyc2lvbl9uZXc6IElWZXJzaW9uVmFsdWUsXG59XG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uQ2FjaGVNYXAgPSBuZXcgTWFwPHN0cmluZywgSVZlcnNpb25DYWNoZU1hcFZhbHVlPigpO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9ucyA9IElVbnBhY2tZYXJnc0FyZ3Y8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0dXBOY3VUb1lhcmdzPj4gJiB7XG5cdGpzb25fb2xkOiBJUGFja2FnZUpzb247XG5cdGN3ZD86IHN0cmluZztcblx0cGFja2FnZURhdGE/OiBzdHJpbmc7XG5cdHBhY2thZ2VNYW5hZ2VyPzogJ25wbScgfCAnYm93ZXInO1xuXG5cdGpzb25fbmV3PzogSVBhY2thZ2VKc29uO1xuXHRqc29uX2NoYW5nZWQ/OiBib29sZWFuO1xuXG5cdGxpc3RfdXBkYXRlZD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bG9nbGV2ZWw/OiAnc2lsZW50JyB8ICd2ZXJib3NlJztcblxuXHRzZW12ZXJMZXZlbD86IEVudW1WZXJzaW9uVmFsdWUubWFqb3IgfCBFbnVtVmVyc2lvblZhbHVlLm1pbm9yLFxuXG5cdHZlcnNpb25UYXJnZXQ/OiBFbnVtVmVyc2lvblZhbHVlLFxuXG5cdGN1cnJlbnQ/OiBJRGVwZW5kZW5jeTtcblxuXHRub1NhZmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvblRhcmdldChvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiB8IHN0cmluZyB8IElPcHRpb25zWyd2ZXJzaW9uVGFyZ2V0J10pOiBJT3B0aW9uc1sndmVyc2lvblRhcmdldCddXG57XG5cdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG9wdGlvbnNcblx0fVxuXHRlbHNlIGlmIChvcHRpb25zLnZlcnNpb25UYXJnZXQpXG5cdHtcblx0XHRyZXR1cm4gb3B0aW9ucy52ZXJzaW9uVGFyZ2V0XG5cdH1cblxuXHRyZXR1cm4gX2dldFZlcnNpb25UYXJnZXQob3B0aW9ucylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ialZlcnNpb25DYWNoZSh7XG5cdG5hbWUsXG5cdHZlcnNpb25UYXJnZXQsXG5cdHZlcnNpb25fb2xkLFxufTogSVZlcnNpb25DYWNoZU1hcEtleSk6IElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0dmVyc2lvbl9vbGQsXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmpWZXJzaW9uQ2FjaGVWYWx1ZSh7XG5cdG5hbWUsXG5cdHZlcnNpb25UYXJnZXQsXG5cdHZlcnNpb25fb2xkLFxuXHR2ZXJzaW9uX25ldyxcbn06IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSk6IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZVxue1xuXHRyZXR1cm4ge1xuXHRcdG5hbWUsXG5cdFx0dmVyc2lvblRhcmdldCxcblx0XHR2ZXJzaW9uX29sZCxcblx0XHR2ZXJzaW9uX25ldyxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0clZlcnNpb25DYWNoZShrZXk6IElWZXJzaW9uQ2FjaGVNYXBLZXkpXG57XG5cdHJldHVybiBKU09OLnN0cmluZ2lmeShvYmpWZXJzaW9uQ2FjaGUoa2V5KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNRdWVyeWVkVmVyc2lvbkNhY2hlKGtleTogSVZlcnNpb25DYWNoZU1hcEtleSlcbntcblx0cmV0dXJuIHZlcnNpb25DYWNoZU1hcC5oYXMoc3RyVmVyc2lvbkNhY2hlKGtleSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZXlPYmplY3RUb1BhY2thZ2VNYXAob2JqOiBJVmVyc2lvbkNhY2hlTWFwS2V5W10gfCBJVmVyc2lvbkNhY2hlTWFwVmFsdWVbXSxcblx0dXNlVmFyc2lvbk5ldz86IGJvb2xlYW4sXG4pOiBJUGFja2FnZU1hcFxue1xuXHRyZXR1cm4gb2JqLnJlZHVjZShmdW5jdGlvbiAoYTogYW55LCBkYXRhKVxuXHR7XG5cdFx0aWYgKHVzZVZhcnNpb25OZXcpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhLnZlcnNpb25fbmV3ICE9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgSVZlcnNpb25DYWNoZU1hcFZhbHVlIG9iamVjdGApXG5cdFx0XHR9XG5cblx0XHRcdGFbZGF0YS5uYW1lXSA9IGRhdGEudmVyc2lvbl9uZXc7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRhW2RhdGEubmFtZV0gPSBkYXRhLnZlcnNpb25fb2xkO1xuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0fSwge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrYWdlTWFwVG9LZXlPYmplY3QocGFja2FnZU1hcDogSVBhY2thZ2VNYXAsIHZlcnNpb25UYXJnZXQ6IElWZXJzaW9uQ2FjaGVNYXBLZXlbXCJ2ZXJzaW9uVGFyZ2V0XCJdKVxue1xuXHRyZXR1cm4gT2JqZWN0XG5cdFx0LmVudHJpZXMocGFja2FnZU1hcClcblx0XHQubWFwKChbbmFtZSwgdmVyc2lvbl9vbGRdKSA9PlxuXHRcdHtcblx0XHRcdHJldHVybiBvYmpWZXJzaW9uQ2FjaGUoe1xuXHRcdFx0XHRuYW1lLCB2ZXJzaW9uX29sZCwgdmVyc2lvblRhcmdldCxcblx0XHRcdH0pXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeVBhY2thZ2VNYW5hZ2Vyc05wbShuYW1lOiBzdHJpbmcsXG5cdHZlcnNpb246IElWZXJzaW9uVmFsdWUgPSAnMCcsXG5cdHZlcnNpb25UYXJnZXQ6IEVudW1WZXJzaW9uVmFsdWUgPSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdCxcbik6IEJsdWViaXJkPElWZXJzaW9uVmFsdWU+XG57XG5cdGxldCBtZXRob2QgPSBFbnVtUGFja2FnZU1hbmFnZXJzTnBtTWV0aG9kW3ZlcnNpb25UYXJnZXRdO1xuXG5cdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdHtcblx0XHR2ZXJzaW9uID0gJzAnO1xuXG5cdFx0c3dpdGNoICh2ZXJzaW9uVGFyZ2V0KVxuXHRcdHtcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubmV3ZXN0OlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5tYWpvcjpcblx0XHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5taW5vcjpcblx0XHRcdFx0bWV0aG9kID0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZC5sYXRlc3Q7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlPElWZXJzaW9uVmFsdWU+KFBhY2thZ2VNYW5hZ2Vyc05wbVttZXRob2RdKG5hbWUsIHZlcnNpb24pKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0VmVyc2lvbkNhY2hlTWFwKGRhdGE6IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSlcbntcblx0cmV0dXJuIHZlcnNpb25DYWNoZU1hcC5zZXQoc3RyVmVyc2lvbkNhY2hlKGRhdGEpLCBvYmpWZXJzaW9uQ2FjaGVWYWx1ZShkYXRhKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeVJlbW90ZVZlcnNpb25zKHBhY2thZ2VNYXA6IElQYWNrYWdlTWFwIHwgc3RyaW5nW10sIG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+ID0ge30pXG57XG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSBucG1DaGVja1VwZGF0ZXNPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0XHQvL2NvbnNvbGUuZGlyKG9wdGlvbnMpO1xuXG5cdFx0XHRvcHRpb25zLmxvZ2xldmVsID0gJ3NpbGVudCc7XG5cblx0XHRcdGxldCB2ZXJzaW9uVGFyZ2V0ID0gb3B0aW9ucy52ZXJzaW9uVGFyZ2V0ID0gZ2V0VmVyc2lvblRhcmdldChvcHRpb25zKSB8fCBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocGFja2FnZU1hcCkpXG5cdFx0XHR7XG5cdFx0XHRcdHBhY2thZ2VNYXAgPSBwYWNrYWdlTWFwLnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFbYl0gPSB2ZXJzaW9uVGFyZ2V0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdFx0fSwge30gYXMgSVBhY2thZ2VNYXApO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcGFja2FnZU1hcEFycmF5ID0gcGFja2FnZU1hcFRvS2V5T2JqZWN0KHBhY2thZ2VNYXAsIHZlcnNpb25UYXJnZXQpO1xuXG5cdFx0XHRsZXQgcGFja2FnZU1hcEFycmF5RmlsdGVkID0gYXdhaXQgQmx1ZWJpcmQucmVzb2x2ZShwYWNrYWdlTWFwQXJyYXkpXG5cdFx0XHRcdC5maWx0ZXIoYXN5bmMgKGQpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYm9vbCA9ICFoYXNRdWVyeWVkVmVyc2lvbkNhY2hlKGQpO1xuXG5cdFx0XHRcdFx0aWYgKGJvb2wgJiYgaXNCYWRWZXJzaW9uKGQudmVyc2lvbl9vbGQpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uVGFyZ2V0ID09PSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdmVyc2lvbl9uZXcgPSBhd2FpdCBxdWVyeVBhY2thZ2VNYW5hZ2Vyc05wbShkLm5hbWUpO1xuXG5cdFx0XHRcdFx0XHRcdGQudmVyc2lvbl9vbGQgPSB2ZXJzaW9uX25ldy5zcGxpdCgnLicpWzBdICsgJy4wLjAnO1xuXG5cdFx0XHRcdFx0XHRcdHNldFZlcnNpb25DYWNoZU1hcCh7XG5cdFx0XHRcdFx0XHRcdFx0Li4uZCxcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyxcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0Ym9vbCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBib29sXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGxldCBwYWNrYWdlTWFwMiA9IGtleU9iamVjdFRvUGFja2FnZU1hcChwYWNrYWdlTWFwQXJyYXlGaWx0ZWQpO1xuXG5cdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0LnJlc29sdmU8SVBhY2thZ2VNYXA+KF9xdWVyeVZlcnNpb25zKHBhY2thZ2VNYXAyLCBvcHRpb25zKSlcblx0XHRcdFx0LnRhcChyZXQgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKE9iamVjdC5lbnRyaWVzKHBhY2thZ2VNYXAyKSlcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChbbmFtZSwgdmVyc2lvbl9vbGRdKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdmVyc2lvbl9uZXcgPSByZXRbbmFtZV07XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fb2xkLmluY2x1ZGVzKCd+JykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMubm9TYWZlIHx8IHZlcnNpb25fbmV3ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcgPSBhd2FpdCBmZXRjaFZlcnNpb24obmFtZSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmaWx0ZXIodmVyc2lvbilcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sIHZlcnNpb25fb2xkKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBvcHRpb25zKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbihyZXQgPT4gcmV0LnBvcCgpKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX25ldyA9PSBudWxsICYmIGlzQmFkVmVyc2lvbih2ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIG51bGwsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0c2V0VmVyc2lvbkNhY2hlTWFwKHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9vbGQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwYWNrYWdlTWFwQXJyYXlcblx0XHRcdFx0XHRcdC5tYXAoZGF0YSA9PiB2ZXJzaW9uQ2FjaGVNYXAuZ2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmFkVmVyc2lvbih2ZXJzaW9uOiBJVmVyc2lvblZhbHVlKVxue1xuXHRsZXQgYm9vbCA9IGZhbHNlO1xuXHRzd2l0Y2ggKHZlcnNpb24pXG5cdHtcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1ham9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5uZXdlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlMi5hbnk6XG5cdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cblx0XHRcdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhuY3VPcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiB8IElPcHRpb25zKTogSU9wdGlvbnNcbntcblx0bmN1T3B0aW9ucyA9IHtcblx0XHQuLi5uY3VPcHRpb25zLFxuXHR9O1xuXG5cdGRlbGV0ZSBuY3VPcHRpb25zLnVwZ3JhZGU7XG5cdGRlbGV0ZSBuY3VPcHRpb25zLmdsb2JhbDtcblxuXHRuY3VPcHRpb25zLnBhY2thZ2VNYW5hZ2VyID0gJ25wbSc7XG5cblx0aWYgKG5jdU9wdGlvbnMuanNvbl9vbGQpXG5cdHtcblx0XHRuY3VPcHRpb25zLnBhY2thZ2VEYXRhID0gSlNPTi5zdHJpbmdpZnkobmN1T3B0aW9ucy5qc29uX29sZCk7XG5cdH1cblxuXHRuY3VPcHRpb25zLmpzb25VcGdyYWRlZCA9IHRydWU7XG5cblx0cmV0dXJuIG5jdU9wdGlvbnMgYXMgSU9wdGlvbnNcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlczxDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oY2FjaGU6IFBhcnRpYWw8Qz4sIG5jdU9wdGlvbnM6IElPcHRpb25zKVxue1xuXHQvL25jdU9wdGlvbnMuc2lsZW50ID0gZmFsc2U7XG5cblx0Ly9uY3VPcHRpb25zLmpzb24gPSBmYWxzZTtcblx0Ly9uY3VPcHRpb25zLmNsaSA9IHRydWU7XG5cblx0Ly9uY3VPcHRpb25zLmFyZ3MgPSBbXTtcblxuXHQvL25jdU9wdGlvbnMubG9nbGV2ZWwgPSAndmVyYm9zZSc7XG5cblx0bmN1T3B0aW9ucyA9IG5wbUNoZWNrVXBkYXRlc09wdGlvbnMobmN1T3B0aW9ucyk7XG5cblx0bmN1T3B0aW9ucy5jd2QgPSBjYWNoZS5jd2Q7XG5cblx0bmN1T3B0aW9ucy5qc29uX25ldyA9IEpTT04ucGFyc2UobmN1T3B0aW9ucy5wYWNrYWdlRGF0YSk7XG5cblx0bmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQgPSBhd2FpdCBfbnBtQ2hlY2tVcGRhdGVzKG5jdU9wdGlvbnMpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMobmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQpO1xuXG5cdG5jdU9wdGlvbnMuanNvbl9jaGFuZ2VkID0gISFrcy5sZW5ndGg7XG5cblx0bGV0IGN1cnJlbnQ6IElEZXBlbmRlbmN5ID0ge307XG5cblx0aWYgKGtzLmxlbmd0aClcblx0e1xuXHRcdGtzLmZvckVhY2gobmFtZSA9PlxuXHRcdHtcblxuXHRcdFx0KDwoa2V5b2YgSVBhY2thZ2VKc29uKVtdPltcblx0XHRcdFx0J2RlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdkZXZEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQncGVlckRlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdvcHRpb25hbERlcGVuZGVuY2llcycsXG5cdFx0XHRdKS5mb3JFYWNoKGtleSA9PlxuXHRcdFx0e1xuXG5cdFx0XHRcdGxldCBkYXRhID0gbmN1T3B0aW9ucy5qc29uX25ld1trZXldO1xuXG5cdFx0XHRcdGlmIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZhbHVlID0gZGF0YVtuYW1lXTtcblxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB2YWx1ZSAhPSBFbnVtVmVyc2lvblZhbHVlMi5hbnkgJiYgdmFsdWUgIT0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y3VycmVudFtuYW1lXSA9IHZhbHVlO1xuXG5cdFx0XHRcdFx0XHRkYXRhW25hbWVdID0gbmN1T3B0aW9ucy5saXN0X3VwZGF0ZWRbbmFtZV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH0pXG5cblx0XHR9KTtcblxuXHR9XG5cblx0bmN1T3B0aW9ucy5jdXJyZW50ID0gY3VycmVudDtcblxuXHRsZXQgdGFibGUgPSB0b0RlcGVuZGVuY3lUYWJsZSh7XG5cdFx0ZnJvbTogbmN1T3B0aW9ucy5jdXJyZW50LFxuXHRcdHRvOiBuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCxcblx0fSkudG9TdHJpbmcoKTtcblxuXHR0YWJsZSAmJiBjb25zb2xlLmxvZyhgXFxuJHt0YWJsZX1cXG5gKTtcblxuXHRyZXR1cm4gbmN1T3B0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTmN1VG9ZYXJnczxUIGV4dGVuZHMgYW55Pih5YXJnczogQXJndjxUPilcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignZGVwJywge1xuXHRcdFx0ZGVzYzogYGNoZWNrIG9ubHkgYSBzcGVjaWZpYyBzZWN0aW9uKHMpIG9mIGRlcGVuZGVuY2llczogcHJvZHxkZXZ8cGVlcnxvcHRpb25hbHxidW5kbGUgKGNvbW1hLWRlbGltaXRlZClgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbWluaW1hbCcsIHtcblx0XHRcdGFsaWFzOiBbJ20nXSxcblx0XHRcdGRlc2M6IGBkbyBub3QgdXBncmFkZSBuZXdlciB2ZXJzaW9ucyB0aGF0IGFyZSBhbHJlYWR5IHNhdGlzZmllZCBieSB0aGUgdmVyc2lvbiByYW5nZSBhY2NvcmRpbmcgdG8gc2VtdmVyYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCduZXdlc3QnLCB7XG5cdFx0XHRhbGlhczogWyduJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgbmV3ZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwYWNrYWdlTWFuYWdlcicsIHtcblx0XHRcdGFsaWFzOiBbJ3AnXSxcblx0XHRcdGRlc2M6IGBucG0gKGRlZmF1bHQpIG9yIGJvd2VyYCxcblx0XHRcdGRlZmF1bHQ6ICducG0nLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVnaXN0cnknLCB7XG5cdFx0XHRhbGlhczogWydyJ10sXG5cdFx0XHRkZXNjOiBgc3BlY2lmeSB0aGlyZC1wYXJ0eSBucG0gcmVnaXN0cnlgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignc2lsZW50Jywge1xuXHRcdFx0YWxpYXM6IFsncyddLFxuXHRcdFx0ZGVzYzogYGRvbid0IG91dHB1dCBhbnl0aGluZyAoLS1sb2dsZXZlbCBzaWxlbnQpYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdncmVhdGVzdCcsIHtcblx0XHRcdGFsaWFzOiBbJ2cnXSxcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCd1cGdyYWRlJywge1xuXHRcdFx0YWxpYXM6IFsndSddLFxuXHRcdFx0ZGVzYzogYG92ZXJ3cml0ZSBwYWNrYWdlIGZpbGVgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NlbXZlckxldmVsJywge1xuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIGhpZ2hlc3QgdmVyc2lvbiB3aXRoaW4gXCJtYWpvclwiIG9yIFwibWlub3JcImAsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdyZW1vdmVSYW5nZScsIHtcblx0XHRcdGRlc2M6IGByZW1vdmUgdmVyc2lvbiByYW5nZXMgZnJvbSB0aGUgZmluYWwgcGFja2FnZSB2ZXJzaW9uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdkZWR1cGUnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHVwZ3JhZGUgbW9kdWxlIGZyb20gcmVzb2x1dGlvbnNgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zOiBJUGFja2FnZU1hcCxcblx0eWFybmxvY2tfb2xkX29iajogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0IHwgc3RyaW5nLFxuXHRvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPixcbilcbntcblx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB5YXJubG9ja19vbGRfb2JqID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0eWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWFybmxvY2tfb2xkX29iaik7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByZXN1bHQgPSBmaWx0ZXJSZXNvbHV0aW9ucyh7XG5cdFx0XHRcdHJlc29sdXRpb25zLFxuXHRcdFx0fSwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdGxldCBkZXBzID0gYXdhaXQgcXVlcnlSZW1vdGVWZXJzaW9ucyhyZXNvbHV0aW9ucywgb3B0aW9ucyk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZGVwcyk7XG5cblx0XHRcdGxldCBkZXBzMiA9IGtleU9iamVjdFRvUGFja2FnZU1hcChkZXBzLCB0cnVlKTtcblxuXHRcdFx0bGV0IGRlcHMzID0gT2JqZWN0LnZhbHVlcyhkZXBzKVxuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YVtiLm5hbWVdID0gYjtcblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7fSlcblx0XHRcdDtcblxuXHRcdFx0bGV0IHlhcm5sb2NrX25ld19vYmogPSB7XG5cdFx0XHRcdC4uLnlhcm5sb2NrX29sZF9vYmosXG5cdFx0XHR9O1xuXG5cdFx0XHRsZXQgdXBkYXRlX2xpc3Q6IHN0cmluZ1tdID0gW107XG5cdFx0XHRsZXQgeWFybmxvY2tfY2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0XHRPYmplY3QuZW50cmllcyhyZXN1bHQubWF4KVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW25hbWUsIGRhdGFdKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHNlbXZlci5sdChkYXRhLnZhbHVlLnZlcnNpb24sIGRlcHMyW25hbWVdKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhyZXN1bHQuZGVwc1tuYW1lXSlcblx0XHRcdFx0XHRcdFx0LmZvckVhY2godmVyc2lvbiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQga2V5ID0gbmFtZSArICdAJyArIHZlcnNpb247XG5cblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgeWFybmxvY2tfbmV3X29ialtrZXldXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHR1cGRhdGVfbGlzdC5wdXNoKG5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5pbnN0YWxsZWRbbmFtZV0ubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXMocmVzdWx0LmRlcHNbbmFtZV0pXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2godmVyc2lvbiA9PlxuXHRcdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGtleSA9IG5hbWUgKyAnQCcgKyB2ZXJzaW9uO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHR5YXJubG9ja19uZXdfb2JqW2tleV0gPSBkYXRhLnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eWFybmxvY2tfb2xkX29iaixcblx0XHRcdFx0eWFybmxvY2tfbmV3X29iaixcblx0XHRcdFx0dXBkYXRlX2xpc3QsXG5cdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQsXG5cdFx0XHRcdGRlcHMsXG5cdFx0XHRcdGRlcHMyLFxuXHRcdFx0XHRkZXBzMyxcblx0XHRcdH1cblx0XHR9KVxuXHRcdDtcbn1cblxuLypcbihhc3luYyAoKSA9Plxue1xuXHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0Y3dkOiBwcm9jZXNzLmN3ZCgpXG5cdH0pO1xuXG5cdGxldCBwa2cgPSByZXF1aXJlKCdHOi9Vc2Vycy9UaGUgUHJvamVjdC9ub2RlanMteWFybi93cy1jcmVhdGUteWFybi13b3Jrc3BhY2VzL3BhY2thZ2UuanNvbicpO1xuXG5cdGxldCB5YXJubG9ja19vbGRfb2JqID0gYXdhaXQgcmVhZFlhcm5Mb2NrZmlsZShwYXRoLmpvaW4ocm9vdERhdGEucm9vdCwgJ3lhcm4ubG9jaycpKTtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyh5YXJubG9ja19vbGRfb2JqKS5maWx0ZXIoayA9PiBrLmluY2x1ZGVzKCdzdHJpbmctd2lkdGgnKSlcblxuXHRsZXQgcmV0ID0gYXdhaXQgY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShwa2cucmVzb2x1dGlvbnMsIHlhcm5sb2NrX29sZF9vYmopXG5cblx0Y29uc29sZS5kaXIocmV0KTtcblxufSkoKTtcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaXNVcGdyYWRlYWJsZShjdXJyZW50OiBJVmVyc2lvblZhbHVlLCBsYXRlc3Q6IElWZXJzaW9uVmFsdWUpOiBib29sZWFuXG57XG5cdHJldHVybiBfaXNVcGdyYWRlYWJsZShjdXJyZW50LCBsYXRlc3QpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZW12ZXIoY3VycmVudDogSVZlcnNpb25WYWx1ZSxcblx0bGF0ZXN0OiBJVmVyc2lvblZhbHVlLFxuXHRvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiA9IHt9LFxuKTogSVZlcnNpb25WYWx1ZVxue1xuXHRyZXR1cm4gdXBncmFkZURlcGVuZGVuY3lEZWNsYXJhdGlvbihjdXJyZW50LCBsYXRlc3QsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hWZXJzaW9uKHBhY2thZ2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHtcblx0ZmllbGQ/OiBzdHJpbmcgfCAndGltZScgfCAndmVyc2lvbnMnIHwgJ2Rpc3QtdGFncy5sYXRlc3QnLFxuXHRmaWx0ZXI/KHZlcnNpb246IElWZXJzaW9uVmFsdWUpOiBib29sZWFuLFxufSwgbmN1T3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4pXG57XG5cdGxldCB7IGZpZWxkID0gJ3ZlcnNpb25zJyB9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gQmx1ZWJpcmRcblx0XHQucmVzb2x2ZShwYWNrYWdlSnNvbihwYWNrYWdlTmFtZSwgeyBhbGxWZXJzaW9uczogdHJ1ZSB9KSlcblx0XHQudGhlbjxJVmVyc2lvblZhbHVlW10+KGZ1bmN0aW9uIChyZXN1bHQpXG5cdFx0e1xuXHRcdFx0aWYgKGZpZWxkLnN0YXJ0c1dpdGgoJ2Rpc3QtdGFncy4nKSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgc3BsaXQgPSBmaWVsZC5zcGxpdCgnLicpO1xuXHRcdFx0XHRpZiAocmVzdWx0W3NwbGl0WzBdXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHRbc3BsaXRbMF1dW3NwbGl0WzFdXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoZmllbGQgPT09ICd2ZXJzaW9ucycpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBPYmplY3Qua2V5cyhyZXN1bHRbZmllbGRdKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFtmaWVsZF07XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQudGhlbihyZXN1bHQgPT4ge1xuXG5cdFx0XHRpZiAob3B0aW9ucy5maWx0ZXIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXN1bHQuZmlsdGVyKG9wdGlvbnMuZmlsdGVyKVxuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUuZGlyKHJlc3VsdCk7XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNldHVwTmN1VG9ZYXJnc1xuIl19