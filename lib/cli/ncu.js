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
                            }
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
            /**
             * 檢查 版本範圍是否符合 與 版本是否不相同
             */
            if (semver.lt(data.value.version, deps2[name]) && yarnlock_new_obj[name + '@' + deps3[name].version_old].version != data.value.version) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBNkM7QUFDN0Msb0NBQTZDO0FBRzdDLGlGQUFrRjtBQUNsRix5RUFLOEM7QUFLOUMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUscUNBQXNDO0FBQ3RDLDBDQU9xQjtBQUVyQixpQ0FBa0M7QUFHbEMsNENBQTZDO0FBVzdDLElBQVksZ0JBT1g7QUFQRCxXQUFZLGdCQUFnQjtJQUUzQixtQ0FBaUIsQ0FBQTtJQUNqQixtQ0FBaUIsQ0FBQTtJQUNqQixxQ0FBbUIsQ0FBQTtJQUNuQix5Q0FBdUIsQ0FBQTtJQUN2QixxQ0FBbUIsQ0FBQTtBQUNwQixDQUFDLEVBUFcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFPM0I7QUFFRCxJQUFZLDRCQU9YO0FBUEQsV0FBWSw0QkFBNEI7SUFFdkMsdURBQXlCLENBQUE7SUFDekIsdURBQXlCLENBQUE7SUFDekIsaURBQW1CLENBQUE7SUFDbkIscURBQXVCLENBQUE7SUFDdkIsaURBQW1CLENBQUE7QUFDcEIsQ0FBQyxFQVBXLDRCQUE0QixHQUE1QixvQ0FBNEIsS0FBNUIsb0NBQTRCLFFBT3ZDO0FBRUQsSUFBa0IsaUJBR2pCO0FBSEQsV0FBa0IsaUJBQWlCO0lBRWxDLDhCQUFTLENBQUE7QUFDVixDQUFDLEVBSGlCLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBR2xDO0FBY1ksUUFBQSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7QUFFM0QsUUFBQSxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQWtFLENBQUM7QUF3QnhHLFNBQWdCLGdCQUFnQixDQUFDLE9BQStEO0lBRS9GLElBQUksT0FBTyxPQUFPLEtBQUssUUFB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QUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQjtJQUNGLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUVkLElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3BDO1FBRUQsc0JBQXNCO1FBRXRCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBekNELG9DQXlDQztBQUVELGtCQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeyBydW4gYXMgX25wbUNoZWNrVXBkYXRlcyB9IGZyb20gJ25wbS1jaGVjay11cGRhdGVzJztcbmltcG9ydCB7IElXcmFwRGVkdXBlQ2FjaGUgfSBmcm9tICcuL2RlZHVwZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG4vL2ltcG9ydCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbi8vaW1wb3J0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGZpbmRSb290IH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgdG9EZXBlbmRlbmN5VGFibGUgfSBmcm9tICcuLi90YWJsZSc7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgSVVucGFja1lhcmdzQXJndiB9IGZyb20gJy4uL2NsaSc7XG5pbXBvcnQgUGFja2FnZU1hbmFnZXJzTnBtID0gcmVxdWlyZSgnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3BhY2thZ2UtbWFuYWdlcnMvbnBtJyk7XG5pbXBvcnQge1xuXHRxdWVyeVZlcnNpb25zIGFzIF9xdWVyeVZlcnNpb25zLFxuXHRnZXRWZXJzaW9uVGFyZ2V0IGFzIF9nZXRWZXJzaW9uVGFyZ2V0LFxuXHRpc1VwZ3JhZGVhYmxlIGFzIF9pc1VwZ3JhZGVhYmxlLFxuXHR1cGdyYWRlRGVwZW5kZW5jeURlY2xhcmF0aW9uLFxufSBmcm9tICducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbm1hbmFnZXInO1xuaW1wb3J0IHtcblx0SVRTVW5wYWNrZWRQcm9taXNlTGlrZVxufSBmcm9tICd0cy10eXBlJztcblxuY29uc3QgdmVyc2lvblV0aWwgPSByZXF1aXJlKCducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbi11dGlsJyk7XG5pbXBvcnQgQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHtcblx0ZmlsdGVyUmVzb2x1dGlvbnMsXG5cdElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCxcblx0cGFyc2UgYXMgcGFyc2VZYXJuTG9jayxcblx0cGFyc2UsXG5cdHJlYWRZYXJuTG9ja2ZpbGUsXG5cdHN0cmlwRGVwc05hbWUsXG59IGZyb20gJy4uL3lhcm5sb2NrJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHNlbXZlcnV0aWxzID0gcmVxdWlyZSgnc2VtdmVyLXV0aWxzJyk7XG5pbXBvcnQgcGFja2FnZUpzb24gPSByZXF1aXJlKCdwYWNrYWdlLWpzb24nKTtcblxuZXhwb3J0IHR5cGUgSVZlcnNpb25WYWx1ZSA9ICdsYXRlc3QnIHwgJyonIHwgc3RyaW5nIHwgRW51bVZlcnNpb25WYWx1ZSB8IEVudW1WZXJzaW9uVmFsdWUyO1xuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0bmFtZTogc3RyaW5nLFxuXHR2ZXJzaW9uVGFyZ2V0OiBFbnVtVmVyc2lvblZhbHVlLFxuXHR2ZXJzaW9uX29sZDogSVZlcnNpb25WYWx1ZSxcbn1cblxuZXhwb3J0IGVudW0gRW51bVZlcnNpb25WYWx1ZVxue1xuXHQnbWFqb3InID0gJ21ham9yJyxcblx0J21pbm9yJyA9ICdtaW5vcicsXG5cdCdsYXRlc3QnID0gJ2xhdGVzdCcsXG5cdCdncmVhdGVzdCcgPSAnZ3JlYXRlc3QnLFxuXHQnbmV3ZXN0JyA9ICduZXdlc3QnXG59XG5cbmV4cG9ydCBlbnVtIEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2Rcbntcblx0J21ham9yJyA9ICdncmVhdGVzdE1ham9yJyxcblx0J21pbm9yJyA9ICdncmVhdGVzdE1pbm9yJyxcblx0J2xhdGVzdCcgPSAnbGF0ZXN0Jyxcblx0J2dyZWF0ZXN0JyA9ICdncmVhdGVzdCcsXG5cdCduZXdlc3QnID0gJ25ld2VzdCdcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gRW51bVZlcnNpb25WYWx1ZTJcbntcblx0YW55ID0gJyonXG59XG5cbmV4cG9ydCB0eXBlIElEZXBlbmRlbmN5ID0gSVBhY2thZ2VNYXA7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhY2thZ2VNYXBcbntcblx0W25hbWU6IHN0cmluZ106IElWZXJzaW9uVmFsdWVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVmVyc2lvbkNhY2hlTWFwVmFsdWUgZXh0ZW5kcyBJVmVyc2lvbkNhY2hlTWFwS2V5XG57XG5cdHZlcnNpb25fbmV3OiBJVmVyc2lvblZhbHVlLFxufVxuXG5leHBvcnQgY29uc3QgdmVyc2lvbkNhY2hlTWFwID0gbmV3IE1hcDxzdHJpbmcsIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZT4oKTtcblxuZXhwb3J0IGNvbnN0IHJlbW90ZUNhY2hlTWFwID0gbmV3IE1hcDxzdHJpbmcsIElUU1VucGFja2VkUHJvbWlzZUxpa2U8UmV0dXJuVHlwZTx0eXBlb2YgcGFja2FnZUpzb24+Pj4oKTtcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSBJVW5wYWNrWWFyZ3NBcmd2PFJldHVyblR5cGU8dHlwZW9mIHNldHVwTmN1VG9ZYXJncz4+ICYge1xuXHRqc29uX29sZDogSVBhY2thZ2VKc29uO1xuXHRjd2Q/OiBzdHJpbmc7XG5cdHBhY2thZ2VEYXRhPzogc3RyaW5nO1xuXHRwYWNrYWdlTWFuYWdlcj86ICducG0nIHwgJ2Jvd2VyJztcblxuXHRqc29uX25ldz86IElQYWNrYWdlSnNvbjtcblx0anNvbl9jaGFuZ2VkPzogYm9vbGVhbjtcblxuXHRsaXN0X3VwZGF0ZWQ/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5cdGxvZ2xldmVsPzogJ3NpbGVudCcgfCAndmVyYm9zZSc7XG5cblx0c2VtdmVyTGV2ZWw/OiBFbnVtVmVyc2lvblZhbHVlLm1ham9yIHwgRW51bVZlcnNpb25WYWx1ZS5taW5vcixcblxuXHR2ZXJzaW9uVGFyZ2V0PzogRW51bVZlcnNpb25WYWx1ZSxcblxuXHRjdXJyZW50PzogSURlcGVuZGVuY3k7XG5cblx0bm9TYWZlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnNpb25UYXJnZXQob3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gfCBzdHJpbmcgfCBJT3B0aW9uc1sndmVyc2lvblRhcmdldCddKTogSU9wdGlvbnNbJ3ZlcnNpb25UYXJnZXQnXVxue1xuXHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBvcHRpb25zXG5cdH1cblx0ZWxzZSBpZiAob3B0aW9ucy52ZXJzaW9uVGFyZ2V0KVxuXHR7XG5cdFx0cmV0dXJuIG9wdGlvbnMudmVyc2lvblRhcmdldFxuXHR9XG5cblx0cmV0dXJuIF9nZXRWZXJzaW9uVGFyZ2V0KG9wdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmpWZXJzaW9uQ2FjaGUoe1xuXHRuYW1lLFxuXHR2ZXJzaW9uVGFyZ2V0LFxuXHR2ZXJzaW9uX29sZCxcbn06IElWZXJzaW9uQ2FjaGVNYXBLZXkpOiBJVmVyc2lvbkNhY2hlTWFwS2V5XG57XG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdHZlcnNpb25fb2xkLFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JqVmVyc2lvbkNhY2hlVmFsdWUoe1xuXHRuYW1lLFxuXHR2ZXJzaW9uVGFyZ2V0LFxuXHR2ZXJzaW9uX29sZCxcblx0dmVyc2lvbl9uZXcsXG59OiBJVmVyc2lvbkNhY2hlTWFwVmFsdWUpOiBJVmVyc2lvbkNhY2hlTWFwVmFsdWVcbntcblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0dmVyc2lvbl9vbGQsXG5cdFx0dmVyc2lvbl9uZXcsXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJWZXJzaW9uQ2FjaGUoa2V5OiBJVmVyc2lvbkNhY2hlTWFwS2V5KVxue1xuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqVmVyc2lvbkNhY2hlKGtleSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzUXVlcnllZFZlcnNpb25DYWNoZShrZXk6IElWZXJzaW9uQ2FjaGVNYXBLZXkpXG57XG5cdHJldHVybiB2ZXJzaW9uQ2FjaGVNYXAuaGFzKHN0clZlcnNpb25DYWNoZShrZXkpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5T2JqZWN0VG9QYWNrYWdlTWFwKG9iajogSVZlcnNpb25DYWNoZU1hcEtleVtdIHwgSVZlcnNpb25DYWNoZU1hcFZhbHVlW10sXG5cdHVzZVZhcnNpb25OZXc/OiBib29sZWFuLFxuKTogSVBhY2thZ2VNYXBcbntcblx0cmV0dXJuIG9iai5yZWR1Y2UoZnVuY3Rpb24gKGE6IGFueSwgZGF0YSlcblx0e1xuXHRcdGlmICh1c2VWYXJzaW9uTmV3KVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgZGF0YS52ZXJzaW9uX25ldyAhPT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYG5vdCBhIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSBvYmplY3RgKVxuXHRcdFx0fVxuXG5cdFx0XHRhW2RhdGEubmFtZV0gPSBkYXRhLnZlcnNpb25fbmV3O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0YVtkYXRhLm5hbWVdID0gZGF0YS52ZXJzaW9uX29sZDtcblx0XHR9XG5cblx0XHRyZXR1cm4gYTtcblx0XHQvLyBAdHMtaWdub3JlXG5cdH0sIHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja2FnZU1hcFRvS2V5T2JqZWN0KHBhY2thZ2VNYXA6IElQYWNrYWdlTWFwLCB2ZXJzaW9uVGFyZ2V0OiBJVmVyc2lvbkNhY2hlTWFwS2V5W1widmVyc2lvblRhcmdldFwiXSlcbntcblx0cmV0dXJuIE9iamVjdFxuXHRcdC5lbnRyaWVzKHBhY2thZ2VNYXApXG5cdFx0Lm1hcCgoW25hbWUsIHZlcnNpb25fb2xkXSkgPT5cblx0XHR7XG5cdFx0XHRyZXR1cm4gb2JqVmVyc2lvbkNhY2hlKHtcblx0XHRcdFx0bmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25UYXJnZXQsXG5cdFx0XHR9KVxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZTogc3RyaW5nLFxuXHR2ZXJzaW9uOiBJVmVyc2lvblZhbHVlID0gJzAnLFxuXHR2ZXJzaW9uVGFyZ2V0OiBFbnVtVmVyc2lvblZhbHVlID0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QsXG4pOiBCbHVlYmlyZDxJVmVyc2lvblZhbHVlPlxue1xuXHRsZXQgbWV0aG9kID0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZFt2ZXJzaW9uVGFyZ2V0XTtcblxuXHRpZiAodmVyc2lvbiA9PSBudWxsKVxuXHR7XG5cdFx0dmVyc2lvbiA9ICcwJztcblxuXHRcdHN3aXRjaCAodmVyc2lvblRhcmdldClcblx0XHR7XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0OlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmdyZWF0ZXN0OlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm5ld2VzdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWFqb3I6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0XHRcdG1ldGhvZCA9IEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2QubGF0ZXN0O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gQmx1ZWJpcmRcblx0XHQucmVzb2x2ZTxJVmVyc2lvblZhbHVlPihQYWNrYWdlTWFuYWdlcnNOcG1bbWV0aG9kXShuYW1lLCB2ZXJzaW9uKSlcblx0XHQudGhlbihhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdGlmICh2YWx1ZSA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgciA9IGF3YWl0IHJlcXVlc3RWZXJzaW9uKG5hbWUpO1xuXG5cdFx0XHRcdGlmICh2ZXJzaW9uIGluIHJbJ2Rpc3QtdGFncyddKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHJbJ2Rpc3QtdGFncyddW3ZlcnNpb25dXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0fSlcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0VmVyc2lvbkNhY2hlTWFwKGRhdGE6IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZSlcbntcblx0cmV0dXJuIHZlcnNpb25DYWNoZU1hcC5zZXQoc3RyVmVyc2lvbkNhY2hlKGRhdGEpLCBvYmpWZXJzaW9uQ2FjaGVWYWx1ZShkYXRhKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeVJlbW90ZVZlcnNpb25zKHBhY2thZ2VNYXA6IElQYWNrYWdlTWFwIHwgc3RyaW5nW10sIG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+ID0ge30pXG57XG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSBucG1DaGVja1VwZGF0ZXNPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0XHQvL2NvbnNvbGUuZGlyKG9wdGlvbnMpO1xuXG5cdFx0XHRvcHRpb25zLmxvZ2xldmVsID0gJ3NpbGVudCc7XG5cblx0XHRcdGxldCB2ZXJzaW9uVGFyZ2V0ID0gb3B0aW9ucy52ZXJzaW9uVGFyZ2V0ID0gZ2V0VmVyc2lvblRhcmdldChvcHRpb25zKSB8fCBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocGFja2FnZU1hcCkpXG5cdFx0XHR7XG5cdFx0XHRcdHBhY2thZ2VNYXAgPSBwYWNrYWdlTWFwLnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFbYl0gPSB2ZXJzaW9uVGFyZ2V0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdFx0fSwge30gYXMgSVBhY2thZ2VNYXApO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcGFja2FnZU1hcEFycmF5ID0gcGFja2FnZU1hcFRvS2V5T2JqZWN0KHBhY2thZ2VNYXAsIHZlcnNpb25UYXJnZXQpO1xuXG5cdFx0XHRsZXQgcGFja2FnZU1hcEFycmF5RmlsdGVkID0gYXdhaXQgQmx1ZWJpcmQucmVzb2x2ZShwYWNrYWdlTWFwQXJyYXkpXG5cdFx0XHRcdC5maWx0ZXIoYXN5bmMgKGQpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgYm9vbCA9ICFoYXNRdWVyeWVkVmVyc2lvbkNhY2hlKGQpO1xuXG5cdFx0XHRcdFx0aWYgKGJvb2wgJiYgaXNCYWRWZXJzaW9uKGQudmVyc2lvbl9vbGQpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uVGFyZ2V0ID09PSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdmVyc2lvbl9uZXcgPSBhd2FpdCBxdWVyeVBhY2thZ2VNYW5hZ2Vyc05wbShkLm5hbWUpO1xuXG5cdFx0XHRcdFx0XHRcdGQudmVyc2lvbl9vbGQgPSB2ZXJzaW9uX25ldy5zcGxpdCgnLicpWzBdICsgJy4wLjAnO1xuXG5cdFx0XHRcdFx0XHRcdHNldFZlcnNpb25DYWNoZU1hcCh7XG5cdFx0XHRcdFx0XHRcdFx0Li4uZCxcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyxcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0Ym9vbCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBib29sXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGxldCBwYWNrYWdlTWFwMiA9IGtleU9iamVjdFRvUGFja2FnZU1hcChwYWNrYWdlTWFwQXJyYXlGaWx0ZWQpO1xuXG5cdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0LnJlc29sdmU8SVBhY2thZ2VNYXA+KF9xdWVyeVZlcnNpb25zKHBhY2thZ2VNYXAyLCBvcHRpb25zKSlcblx0XHRcdFx0LnRhcChyZXQgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKE9iamVjdC5lbnRyaWVzKHBhY2thZ2VNYXAyKSlcblx0XHRcdFx0XHRcdC5lYWNoKGFzeW5jIChbbmFtZSwgdmVyc2lvbl9vbGRdKSA9PlxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdmVyc2lvbl9uZXcgPSByZXRbbmFtZV07XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fb2xkLmluY2x1ZGVzKCd+JykpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMubm9TYWZlIHx8IHZlcnNpb25fbmV3ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcgPSBhd2FpdCBmZXRjaFZlcnNpb24obmFtZSwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmaWx0ZXIodmVyc2lvbilcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sIHZlcnNpb25fb2xkKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9LCBvcHRpb25zKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbihyZXQgPT4gcmV0LnBvcCgpKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX25ldyA9PSBudWxsICYmIGlzQmFkVmVyc2lvbih2ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIG51bGwsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHZlcnNpb25fbmV3ID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIHZlcnNpb25fb2xkLCB2ZXJzaW9uVGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHNldFZlcnNpb25DYWNoZU1hcCh7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fb2xkLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25fbmV3LFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcGFja2FnZU1hcEFycmF5XG5cdFx0XHRcdFx0XHQubWFwKGRhdGEgPT4gdmVyc2lvbkNhY2hlTWFwLmdldChzdHJWZXJzaW9uQ2FjaGUoZGF0YSkpKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JhZFZlcnNpb24odmVyc2lvbjogSVZlcnNpb25WYWx1ZSlcbntcblx0bGV0IGJvb2wgPSBmYWxzZTtcblx0c3dpdGNoICh2ZXJzaW9uKVxuXHR7XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5tYWpvcjpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubmV3ZXN0OlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmdyZWF0ZXN0OlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZTIuYW55OlxuXHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXG5cdFx0XHRpZiAodmVyc2lvbiA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gYm9vbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlc09wdGlvbnMobmN1T3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gfCBJT3B0aW9ucyk6IElPcHRpb25zXG57XG5cdG5jdU9wdGlvbnMgPSB7XG5cdFx0Li4ubmN1T3B0aW9ucyxcblx0fTtcblxuXHRkZWxldGUgbmN1T3B0aW9ucy51cGdyYWRlO1xuXHRkZWxldGUgbmN1T3B0aW9ucy5nbG9iYWw7XG5cblx0bmN1T3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9ICducG0nO1xuXG5cdGlmIChuY3VPcHRpb25zLmpzb25fb2xkKVxuXHR7XG5cdFx0bmN1T3B0aW9ucy5wYWNrYWdlRGF0YSA9IEpTT04uc3RyaW5naWZ5KG5jdU9wdGlvbnMuanNvbl9vbGQpO1xuXHR9XG5cblx0bmN1T3B0aW9ucy5qc29uVXBncmFkZWQgPSB0cnVlO1xuXG5cdHJldHVybiBuY3VPcHRpb25zIGFzIElPcHRpb25zXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1DaGVja1VwZGF0ZXM8QyBleHRlbmRzIElXcmFwRGVkdXBlQ2FjaGU+KGNhY2hlOiBQYXJ0aWFsPEM+LCBuY3VPcHRpb25zOiBJT3B0aW9ucylcbntcblx0Ly9uY3VPcHRpb25zLnNpbGVudCA9IGZhbHNlO1xuXG5cdC8vbmN1T3B0aW9ucy5qc29uID0gZmFsc2U7XG5cdC8vbmN1T3B0aW9ucy5jbGkgPSB0cnVlO1xuXG5cdC8vbmN1T3B0aW9ucy5hcmdzID0gW107XG5cblx0Ly9uY3VPcHRpb25zLmxvZ2xldmVsID0gJ3ZlcmJvc2UnO1xuXG5cdG5jdU9wdGlvbnMgPSBucG1DaGVja1VwZGF0ZXNPcHRpb25zKG5jdU9wdGlvbnMpO1xuXG5cdG5jdU9wdGlvbnMuY3dkID0gY2FjaGUuY3dkO1xuXG5cdG5jdU9wdGlvbnMuanNvbl9uZXcgPSBKU09OLnBhcnNlKG5jdU9wdGlvbnMucGFja2FnZURhdGEpO1xuXG5cdG5jdU9wdGlvbnMubGlzdF91cGRhdGVkID0gYXdhaXQgX25wbUNoZWNrVXBkYXRlcyhuY3VPcHRpb25zKSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKG5jdU9wdGlvbnMubGlzdF91cGRhdGVkKTtcblxuXHRuY3VPcHRpb25zLmpzb25fY2hhbmdlZCA9ICEha3MubGVuZ3RoO1xuXG5cdGxldCBjdXJyZW50OiBJRGVwZW5kZW5jeSA9IHt9O1xuXG5cdGlmIChrcy5sZW5ndGgpXG5cdHtcblx0XHRrcy5mb3JFYWNoKG5hbWUgPT5cblx0XHR7XG5cblx0XHRcdCg8KGtleW9mIElQYWNrYWdlSnNvbilbXT5bXG5cdFx0XHRcdCdkZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQnZGV2RGVwZW5kZW5jaWVzJyxcblx0XHRcdFx0J3BlZXJEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQnb3B0aW9uYWxEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XSkuZm9yRWFjaChrZXkgPT5cblx0XHRcdHtcblxuXHRcdFx0XHRsZXQgZGF0YSA9IG5jdU9wdGlvbnMuanNvbl9uZXdba2V5XTtcblxuXHRcdFx0XHRpZiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2YWx1ZSA9IGRhdGFbbmFtZV07XG5cblx0XHRcdFx0XHRpZiAodmFsdWUgJiYgdmFsdWUgIT0gRW51bVZlcnNpb25WYWx1ZTIuYW55ICYmIHZhbHVlICE9IEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGN1cnJlbnRbbmFtZV0gPSB2YWx1ZTtcblxuXHRcdFx0XHRcdFx0ZGF0YVtuYW1lXSA9IG5jdU9wdGlvbnMubGlzdF91cGRhdGVkW25hbWVdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9KVxuXG5cdFx0fSk7XG5cblx0fVxuXG5cdG5jdU9wdGlvbnMuY3VycmVudCA9IGN1cnJlbnQ7XG5cblx0bGV0IHRhYmxlID0gdG9EZXBlbmRlbmN5VGFibGUoe1xuXHRcdGZyb206IG5jdU9wdGlvbnMuY3VycmVudCxcblx0XHR0bzogbmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQsXG5cdH0pLnRvU3RyaW5nKCk7XG5cblx0dGFibGUgJiYgY29uc29sZS5sb2coYFxcbiR7dGFibGV9XFxuYCk7XG5cblx0cmV0dXJuIG5jdU9wdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cE5jdVRvWWFyZ3M8VCBleHRlbmRzIGFueT4oeWFyZ3M6IEFyZ3Y8VD4pXG57XG5cdHJldHVybiB5YXJnc1xuXHRcdC5vcHRpb24oJ2RlcCcsIHtcblx0XHRcdGRlc2M6IGBjaGVjayBvbmx5IGEgc3BlY2lmaWMgc2VjdGlvbihzKSBvZiBkZXBlbmRlbmNpZXM6IHByb2R8ZGV2fHBlZXJ8b3B0aW9uYWx8YnVuZGxlIChjb21tYS1kZWxpbWl0ZWQpYCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ21pbmltYWwnLCB7XG5cdFx0XHRhbGlhczogWydtJ10sXG5cdFx0XHRkZXNjOiBgZG8gbm90IHVwZ3JhZGUgbmV3ZXIgdmVyc2lvbnMgdGhhdCBhcmUgYWxyZWFkeSBzYXRpc2ZpZWQgYnkgdGhlIHZlcnNpb24gcmFuZ2UgYWNjb3JkaW5nIHRvIHNlbXZlcmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbmV3ZXN0Jywge1xuXHRcdFx0YWxpYXM6IFsnbiddLFxuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIG5ld2VzdCB2ZXJzaW9ucyBhdmFpbGFibGUgaW5zdGVhZCBvZiB0aGUgbGF0ZXN0IHN0YWJsZSB2ZXJzaW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncGFja2FnZU1hbmFnZXInLCB7XG5cdFx0XHRhbGlhczogWydwJ10sXG5cdFx0XHRkZXNjOiBgbnBtIChkZWZhdWx0KSBvciBib3dlcmAsXG5cdFx0XHRkZWZhdWx0OiAnbnBtJyxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3JlZ2lzdHJ5Jywge1xuXHRcdFx0YWxpYXM6IFsnciddLFxuXHRcdFx0ZGVzYzogYHNwZWNpZnkgdGhpcmQtcGFydHkgbnBtIHJlZ2lzdHJ5YCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NpbGVudCcsIHtcblx0XHRcdGFsaWFzOiBbJ3MnXSxcblx0XHRcdGRlc2M6IGBkb24ndCBvdXRwdXQgYW55dGhpbmcgKC0tbG9nbGV2ZWwgc2lsZW50KWAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZ3JlYXRlc3QnLCB7XG5cdFx0XHRhbGlhczogWydnJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgaGlnaGVzdCB2ZXJzaW9ucyBhdmFpbGFibGUgaW5zdGVhZCBvZiB0aGUgbGF0ZXN0IHN0YWJsZSB2ZXJzaW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigndXBncmFkZScsIHtcblx0XHRcdGFsaWFzOiBbJ3UnXSxcblx0XHRcdGRlc2M6IGBvdmVyd3JpdGUgcGFja2FnZSBmaWxlYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdzZW12ZXJMZXZlbCcsIHtcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb24gd2l0aGluIFwibWFqb3JcIiBvciBcIm1pbm9yXCJgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVtb3ZlUmFuZ2UnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHZlcnNpb24gcmFuZ2VzIGZyb20gdGhlIGZpbmFsIHBhY2thZ2UgdmVyc2lvbmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZGVkdXBlJywge1xuXHRcdFx0ZGVzYzogYHJlbW92ZSB1cGdyYWRlIG1vZHVsZSBmcm9tIHJlc29sdXRpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRkZWZhdWx0OiB0cnVlLFxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShyZXNvbHV0aW9uczogSVBhY2thZ2VNYXAsXG5cdHlhcm5sb2NrX29sZF9vYmo6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCB8IHN0cmluZyxcblx0b3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4sXG4pXG57XG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgeWFybmxvY2tfb2xkX29iaiA9PT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlhcm5sb2NrX29sZF9vYmopO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcmVzdWx0ID0gZmlsdGVyUmVzb2x1dGlvbnMoe1xuXHRcdFx0XHRyZXNvbHV0aW9ucyxcblx0XHRcdH0sIHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdFx0XHRsZXQgZGVwcyA9IGF3YWl0IHF1ZXJ5UmVtb3RlVmVyc2lvbnMocmVzb2x1dGlvbnMsIG9wdGlvbnMpO1xuXG5cdFx0XHQvL2NvbnNvbGUuZGlyKGRlcHMpO1xuXG5cdFx0XHRsZXQgZGVwczIgPSBrZXlPYmplY3RUb1BhY2thZ2VNYXAoZGVwcywgdHJ1ZSk7XG5cblx0XHRcdGxldCBkZXBzMyA9IE9iamVjdC52YWx1ZXMoZGVwcylcblx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFbYi5uYW1lXSA9IGI7XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwge30gYXMgUmVjb3JkPHN0cmluZywgSVZlcnNpb25DYWNoZU1hcFZhbHVlPilcblx0XHRcdDtcblxuXHRcdFx0bGV0IHlhcm5sb2NrX25ld19vYmo6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCA9IHtcblx0XHRcdFx0Li4ueWFybmxvY2tfb2xkX29iaixcblx0XHRcdH07XG5cblx0XHRcdGxldCB1cGRhdGVfbGlzdDogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCB5YXJubG9ja19jaGFuZ2VkID0gZmFsc2U7XG5cblx0XHRcdE9iamVjdC5lbnRyaWVzKHJlc3VsdC5tYXgpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChbbmFtZSwgZGF0YV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiDmqqLmn6Ug54mI5pys56+E5ZyN5piv5ZCm56ym5ZCIIOiIhyDniYjmnKzmmK/lkKbkuI3nm7jlkIxcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRpZiAoc2VtdmVyLmx0KGRhdGEudmFsdWUudmVyc2lvbiwgZGVwczJbbmFtZV0pICYmIHlhcm5sb2NrX25ld19vYmpbbmFtZSArICdAJyArIGRlcHMzW25hbWVdLnZlcnNpb25fb2xkXS52ZXJzaW9uICE9IGRhdGEudmFsdWUudmVyc2lvbilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhyZXN1bHQuZGVwc1tuYW1lXSlcblx0XHRcdFx0XHRcdFx0LmZvckVhY2godmVyc2lvbiA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IGtleSA9IG5hbWUgKyAnQCcgKyB2ZXJzaW9uO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIHlhcm5sb2NrX25ld19vYmpba2V5XVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0dXBkYXRlX2xpc3QucHVzaChuYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChyZXN1bHQuaW5zdGFsbGVkW25hbWVdLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKHJlc3VsdC5kZXBzW25hbWVdKVxuXHRcdFx0XHRcdFx0XHRcdC5mb3JFYWNoKHZlcnNpb24gPT5cblx0XHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBrZXkgPSBuYW1lICsgJ0AnICsgdmVyc2lvbjtcblxuXHRcdFx0XHRcdFx0XHRcdFx0eWFybmxvY2tfbmV3X29ialtrZXldID0gZGF0YS52YWx1ZTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHlhcm5sb2NrX29sZF9vYmosXG5cdFx0XHRcdHlhcm5sb2NrX25ld19vYmosXG5cdFx0XHRcdHVwZGF0ZV9saXN0LFxuXHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkLFxuXHRcdFx0XHRkZXBzLFxuXHRcdFx0XHRkZXBzMixcblx0XHRcdFx0ZGVwczMsXG5cdFx0XHR9XG5cdFx0fSlcblx0XHQ7XG59XG5cbi8qXG4oYXN5bmMgKCkgPT5cbntcblx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdGN3ZDogcHJvY2Vzcy5jd2QoKVxuXHR9KTtcblxuXHRsZXQgcGtnID0gcmVxdWlyZSgnRzovVXNlcnMvVGhlIFByb2plY3Qvbm9kZWpzLXlhcm4vd3MtY3JlYXRlLXlhcm4td29ya3NwYWNlcy9wYWNrYWdlLmpzb24nKTtcblxuXHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IGF3YWl0IHJlYWRZYXJuTG9ja2ZpbGUocGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICd5YXJuLmxvY2snKSk7XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMoeWFybmxvY2tfb2xkX29iaikuZmlsdGVyKGsgPT4gay5pbmNsdWRlcygnc3RyaW5nLXdpZHRoJykpXG5cblx0bGV0IHJldCA9IGF3YWl0IGNoZWNrUmVzb2x1dGlvbnNVcGRhdGUocGtnLnJlc29sdXRpb25zLCB5YXJubG9ja19vbGRfb2JqKVxuXG5cdGNvbnNvbGUuZGlyKHJldCk7XG5cbn0pKCk7XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVXBncmFkZWFibGUoY3VycmVudDogSVZlcnNpb25WYWx1ZSwgbGF0ZXN0OiBJVmVyc2lvblZhbHVlKTogYm9vbGVhblxue1xuXHRyZXR1cm4gX2lzVXBncmFkZWFibGUoY3VycmVudCwgbGF0ZXN0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2VtdmVyKGN1cnJlbnQ6IElWZXJzaW9uVmFsdWUsXG5cdGxhdGVzdDogSVZlcnNpb25WYWx1ZSxcblx0b3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gPSB7fSxcbik6IElWZXJzaW9uVmFsdWVcbntcblx0cmV0dXJuIHVwZ3JhZGVEZXBlbmRlbmN5RGVjbGFyYXRpb24oY3VycmVudCwgbGF0ZXN0LCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3RWZXJzaW9uKHBhY2thZ2VOYW1lOiBzdHJpbmcpXG57XG5cdHJldHVybiBCbHVlYmlyZFxuXHRcdC5yZXNvbHZlKHJlbW90ZUNhY2hlTWFwLmdldChwYWNrYWdlTmFtZSkpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdClcblx0XHR7XG5cdFx0XHRpZiAocmVzdWx0ID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBwYWNrYWdlSnNvbihwYWNrYWdlTmFtZSwgeyBhbGxWZXJzaW9uczogdHJ1ZSB9KVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fSlcblx0XHQudGFwKGZ1bmN0aW9uIChyZXN1bHQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJlbW90ZUNhY2hlTWFwLnNldChwYWNrYWdlTmFtZSwgcmVzdWx0KTtcblx0XHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hWZXJzaW9uKHBhY2thZ2VOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHtcblx0ZmllbGQ/OiBzdHJpbmcgfCAndGltZScgfCAndmVyc2lvbnMnIHwgJ2Rpc3QtdGFncy5sYXRlc3QnLFxuXHRmaWx0ZXI/KHZlcnNpb246IElWZXJzaW9uVmFsdWUpOiBib29sZWFuLFxuXHRjdXJyZW50VmVyc2lvbj86IElWZXJzaW9uVmFsdWUsXG59ID0ge30sIG5jdU9wdGlvbnM/OiBQYXJ0aWFsPElPcHRpb25zPilcbntcblx0bGV0IHsgZmllbGQgPSAndmVyc2lvbnMnIH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiByZXF1ZXN0VmVyc2lvbihwYWNrYWdlTmFtZSlcblx0XHQvLy5yZXNvbHZlKHBhY2thZ2VKc29uKHBhY2thZ2VOYW1lLCB7IGFsbFZlcnNpb25zOiB0cnVlIH0pKVxuXHRcdC50aGVuPElWZXJzaW9uVmFsdWVbXT4oZnVuY3Rpb24gKHJlc3VsdClcblx0XHR7XG5cdFx0XHRpZiAoZmllbGQuc3RhcnRzV2l0aCgnZGlzdC10YWdzLicpKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzcGxpdCA9IGZpZWxkLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGlmIChyZXN1bHRbc3BsaXRbMF1dKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFtzcGxpdFswXV1bc3BsaXRbMV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmaWVsZCA9PT0gJ3ZlcnNpb25zJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHJlc3VsdFtmaWVsZF0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoZmllbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZXN1bHRbZmllbGRdO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnRoZW4ocmVzdWx0ID0+IHtcblxuXHRcdFx0aWYgKG9wdGlvbnMuZmlsdGVyKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0LmZpbHRlcihvcHRpb25zLmZpbHRlcilcblx0XHRcdH1cblxuXHRcdFx0Ly9jb25zb2xlLmRpcihyZXN1bHQpO1xuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzZXR1cE5jdVRvWWFyZ3NcblxuIl19