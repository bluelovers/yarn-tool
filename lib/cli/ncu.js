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
const Bluebird = require("bluebird");
const yarnlock_1 = require("../yarnlock");
const semver = require("semver");
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
        options = {
            ...options,
        };
        options.packageManager = 'npm';
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
async function npmCheckUpdates(cache, ncuOptions) {
    //ncuOptions.silent = false;
    //ncuOptions.json = false;
    //ncuOptions.cli = true;
    //ncuOptions.args = [];
    //ncuOptions.loglevel = 'verbose';
    delete ncuOptions.upgrade;
    delete ncuOptions.global;
    if (ncuOptions.safe) {
        ncuOptions.semverLevel = EnumVersionValue.minor;
    }
    delete ncuOptions.safe;
    ncuOptions.packageManager = 'npm';
    ncuOptions.packageData = JSON.stringify(ncuOptions.json_old);
    ncuOptions.cwd = cache.cwd;
    ncuOptions.jsonUpgraded = true;
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
    table && index_1.console.log(table);
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
function checkResolutionsUpdate(resolutions, yarnlock_old_obj, options = {}) {
    return Bluebird.resolve()
        .then(async function () {
        if (typeof yarnlock_old_obj === 'string') {
            yarnlock_old_obj = yarnlock_1.parse(yarnlock_old_obj);
        }
        let result = yarnlock_1.filterResolutions({
            resolutions
        }, yarnlock_old_obj);
        let deps = await queryRemoteVersions(resolutions, options);
        let deps2 = keyObjectToPackageMap(deps, true);
        let yarnlock_new_obj = {
            ...yarnlock_old_obj
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
exports.default = setupNcuToYargs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBNkM7QUFDN0Msb0NBQTZDO0FBRzdDLGlGQUFrRjtBQUNsRix5RUFHOEM7QUFDOUMscUNBQXNDO0FBQ3RDLDBDQU9xQjtBQUVyQixpQ0FBa0M7QUFXbEMsSUFBWSxnQkFPWDtBQVBELFdBQVksZ0JBQWdCO0lBRTNCLG1DQUFpQixDQUFBO0lBQ2pCLG1DQUFpQixDQUFBO0lBQ2pCLHFDQUFtQixDQUFBO0lBQ25CLHlDQUF1QixDQUFBO0lBQ3ZCLHFDQUFtQixDQUFBO0FBQ3BCLENBQUMsRUFQVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQU8zQjtBQUVELElBQVksNEJBT1g7QUFQRCxXQUFZLDRCQUE0QjtJQUV2Qyx1REFBeUIsQ0FBQTtJQUN6Qix1REFBeUIsQ0FBQTtJQUN6QixpREFBbUIsQ0FBQTtJQUNuQixxREFBdUIsQ0FBQTtJQUN2QixpREFBbUIsQ0FBQTtBQUNwQixDQUFDLEVBUFcsNEJBQTRCLEdBQTVCLG9DQUE0QixLQUE1QixvQ0FBNEIsUUFPdkM7QUFFRCxJQUFrQixpQkFHakI7QUFIRCxXQUFrQixpQkFBaUI7SUFFbEMsOEJBQVMsQ0FBQTtBQUNWLENBQUMsRUFIaUIsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFHbEM7QUFjWSxRQUFBLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztBQXNCeEUsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBK0Q7SUFFL0YsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQy9CO1FBQ0MsYUFBYTtRQUNiLE9BQU8sT0FBTyxDQUFBO0tBQ2Q7U0FDSSxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQzlCO1FBQ0MsT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFB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QUFHLEdBQUcsT0FBTyxDQUFDO3dCQUUvQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FDRjtvQkFFRCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7aUJBQ3hCO2FBQ0Q7UUFFRixDQUFDLENBQUMsQ0FDRjtRQUVELE9BQU87WUFDTixnQkFBZ0I7WUFDaEIsZ0JBQWdCO1lBQ2hCLFdBQVc7WUFDWCxnQkFBZ0I7WUFDaEIsSUFBSTtZQUNKLEtBQUs7U0FDTCxDQUFBO0lBQ0YsQ0FBQyxDQUFDLENBQ0Y7QUFDRixDQUFDO0FBekVELHdEQXlFQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFFSCxrQkFBZSxlQUFlLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzQvMzAuXG4gKi9cblxuaW1wb3J0IHsgcnVuIGFzIF9ucG1DaGVja1VwZGF0ZXMgfSBmcm9tICducG0tY2hlY2stdXBkYXRlcyc7XG5pbXBvcnQgeyBJV3JhcERlZHVwZUNhY2hlIH0gZnJvbSAnLi9kZWR1cGUnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cy9wYWNrYWdlLWpzb24nO1xuLy9pbXBvcnQgdmVyc2lvblV0aWwgPSByZXF1aXJlKCducG0tY2hlY2stdXBkYXRlcy9saWIvdmVyc2lvbi11dGlsJyk7XG4vL2ltcG9ydCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBmaW5kUm9vdCB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IHRvRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi4vdGFibGUnO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IElVbnBhY2tZYXJnc0FyZ3YgfSBmcm9tICcuLi9jbGknO1xuaW1wb3J0IFBhY2thZ2VNYW5hZ2Vyc05wbSA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi9wYWNrYWdlLW1hbmFnZXJzL25wbScpO1xuaW1wb3J0IHtcblx0cXVlcnlWZXJzaW9ucyBhcyBfcXVlcnlWZXJzaW9ucyxcblx0Z2V0VmVyc2lvblRhcmdldCBhcyBfZ2V0VmVyc2lvblRhcmdldCxcbn0gZnJvbSAnbnBtLWNoZWNrLXVwZGF0ZXMvbGliL3ZlcnNpb25tYW5hZ2VyJztcbmltcG9ydCBCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQge1xuXHRmaWx0ZXJSZXNvbHV0aW9ucyxcblx0SVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0LFxuXHRwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrLFxuXHRwYXJzZSxcblx0cmVhZFlhcm5Mb2NrZmlsZSxcblx0c3RyaXBEZXBzTmFtZSxcbn0gZnJvbSAnLi4veWFybmxvY2snO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuZXhwb3J0IHR5cGUgSVZlcnNpb25WYWx1ZSA9ICdsYXRlc3QnIHwgJyonIHwgc3RyaW5nIHwgRW51bVZlcnNpb25WYWx1ZSB8IEVudW1WZXJzaW9uVmFsdWUyO1xuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJzaW9uQ2FjaGVNYXBLZXlcbntcblx0bmFtZTogc3RyaW5nLFxuXHR2ZXJzaW9uVGFyZ2V0OiBFbnVtVmVyc2lvblZhbHVlLFxuXHR2ZXJzaW9uX29sZDogSVZlcnNpb25WYWx1ZSxcbn1cblxuZXhwb3J0IGVudW0gRW51bVZlcnNpb25WYWx1ZVxue1xuXHQnbWFqb3InID0gJ21ham9yJyxcblx0J21pbm9yJyA9ICdtaW5vcicsXG5cdCdsYXRlc3QnID0gJ2xhdGVzdCcsXG5cdCdncmVhdGVzdCcgPSAnZ3JlYXRlc3QnLFxuXHQnbmV3ZXN0JyA9ICduZXdlc3QnXG59XG5cbmV4cG9ydCBlbnVtIEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2Rcbntcblx0J21ham9yJyA9ICdncmVhdGVzdE1ham9yJyxcblx0J21pbm9yJyA9ICdncmVhdGVzdE1pbm9yJyxcblx0J2xhdGVzdCcgPSAnbGF0ZXN0Jyxcblx0J2dyZWF0ZXN0JyA9ICdncmVhdGVzdCcsXG5cdCduZXdlc3QnID0gJ25ld2VzdCdcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gRW51bVZlcnNpb25WYWx1ZTJcbntcblx0YW55ID0gJyonXG59XG5cbmV4cG9ydCB0eXBlIElEZXBlbmRlbmN5ID0gSVBhY2thZ2VNYXA7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhY2thZ2VNYXBcbntcblx0W25hbWU6IHN0cmluZ106IElWZXJzaW9uVmFsdWVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVmVyc2lvbkNhY2hlTWFwVmFsdWUgZXh0ZW5kcyBJVmVyc2lvbkNhY2hlTWFwS2V5XG57XG5cdHZlcnNpb25fbmV3OiBJVmVyc2lvblZhbHVlLFxufVxuXG5leHBvcnQgY29uc3QgdmVyc2lvbkNhY2hlTWFwID0gbmV3IE1hcDxzdHJpbmcsIElWZXJzaW9uQ2FjaGVNYXBWYWx1ZT4oKTtcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSBJVW5wYWNrWWFyZ3NBcmd2PFJldHVyblR5cGU8dHlwZW9mIHNldHVwTmN1VG9ZYXJncz4+ICYge1xuXHRqc29uX29sZDogSVBhY2thZ2VKc29uO1xuXHRjd2Q/OiBzdHJpbmc7XG5cdHBhY2thZ2VEYXRhPzogc3RyaW5nO1xuXHRwYWNrYWdlTWFuYWdlcj86ICducG0nIHwgJ2Jvd2VyJztcblxuXHRqc29uX25ldz86IElQYWNrYWdlSnNvbjtcblx0anNvbl9jaGFuZ2VkPzogYm9vbGVhbjtcblxuXHRsaXN0X3VwZGF0ZWQ/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5cdGxvZ2xldmVsPzogJ3NpbGVudCcgfCAndmVyYm9zZSc7XG5cblx0c2VtdmVyTGV2ZWw/OiBFbnVtVmVyc2lvblZhbHVlLm1ham9yIHwgRW51bVZlcnNpb25WYWx1ZS5taW5vcixcblxuXHR2ZXJzaW9uVGFyZ2V0PzogRW51bVZlcnNpb25WYWx1ZSxcblxuXHRjdXJyZW50PzogSURlcGVuZGVuY3k7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uVGFyZ2V0KG9wdGlvbnM6IFBhcnRpYWw8SU9wdGlvbnM+IHwgc3RyaW5nIHwgSU9wdGlvbnNbJ3ZlcnNpb25UYXJnZXQnXSk6IElPcHRpb25zWyd2ZXJzaW9uVGFyZ2V0J11cbntcblx0aWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gb3B0aW9uc1xuXHR9XG5cdGVsc2UgaWYgKG9wdGlvbnMudmVyc2lvblRhcmdldClcblx0e1xuXHRcdHJldHVybiBvcHRpb25zLnZlcnNpb25UYXJnZXRcblx0fVxuXG5cdHJldHVybiBfZ2V0VmVyc2lvblRhcmdldChvcHRpb25zKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JqVmVyc2lvbkNhY2hlKHtcblx0bmFtZSxcblx0dmVyc2lvblRhcmdldCxcblx0dmVyc2lvbl9vbGQsXG59OiBJVmVyc2lvbkNhY2hlTWFwS2V5KTogSVZlcnNpb25DYWNoZU1hcEtleVxue1xuXHRyZXR1cm4ge1xuXHRcdG5hbWUsXG5cdFx0dmVyc2lvblRhcmdldCxcblx0XHR2ZXJzaW9uX29sZCxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ialZlcnNpb25DYWNoZVZhbHVlKHtcblx0bmFtZSxcblx0dmVyc2lvblRhcmdldCxcblx0dmVyc2lvbl9vbGQsXG5cdHZlcnNpb25fbmV3LFxufTogSVZlcnNpb25DYWNoZU1hcFZhbHVlKTogSVZlcnNpb25DYWNoZU1hcFZhbHVlXG57XG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uVGFyZ2V0LFxuXHRcdHZlcnNpb25fb2xkLFxuXHRcdHZlcnNpb25fbmV3LFxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyVmVyc2lvbkNhY2hlKGtleTogSVZlcnNpb25DYWNoZU1hcEtleSlcbntcblx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9ialZlcnNpb25DYWNoZShrZXkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1F1ZXJ5ZWRWZXJzaW9uQ2FjaGUoa2V5OiBJVmVyc2lvbkNhY2hlTWFwS2V5KVxue1xuXHRyZXR1cm4gdmVyc2lvbkNhY2hlTWFwLmhhcyhzdHJWZXJzaW9uQ2FjaGUoa2V5KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleU9iamVjdFRvUGFja2FnZU1hcChvYmo6IElWZXJzaW9uQ2FjaGVNYXBLZXlbXSB8IElWZXJzaW9uQ2FjaGVNYXBWYWx1ZVtdLFxuXHR1c2VWYXJzaW9uTmV3PzogYm9vbGVhbixcbik6IElQYWNrYWdlTWFwXG57XG5cdHJldHVybiBvYmoucmVkdWNlKGZ1bmN0aW9uIChhOiBhbnksIGRhdGEpXG5cdHtcblx0XHRpZiAodXNlVmFyc2lvbk5ldylcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIGRhdGEudmVyc2lvbl9uZXcgIT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBub3QgYSBJVmVyc2lvbkNhY2hlTWFwVmFsdWUgb2JqZWN0YClcblx0XHRcdH1cblxuXHRcdFx0YVtkYXRhLm5hbWVdID0gZGF0YS52ZXJzaW9uX25ldztcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGFbZGF0YS5uYW1lXSA9IGRhdGEudmVyc2lvbl9vbGQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGE7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHR9LCB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2thZ2VNYXBUb0tleU9iamVjdChwYWNrYWdlTWFwOiBJUGFja2FnZU1hcCwgdmVyc2lvblRhcmdldDogSVZlcnNpb25DYWNoZU1hcEtleVtcInZlcnNpb25UYXJnZXRcIl0pXG57XG5cdHJldHVybiBPYmplY3Rcblx0XHQuZW50cmllcyhwYWNrYWdlTWFwKVxuXHRcdC5tYXAoKFtuYW1lLCB2ZXJzaW9uX29sZF0pID0+XG5cdFx0e1xuXG5cdFx0XHRyZXR1cm4gb2JqVmVyc2lvbkNhY2hlKHtcblx0XHRcdFx0bmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25UYXJnZXQsXG5cdFx0XHR9KVxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0obmFtZTogc3RyaW5nLFxuXHR2ZXJzaW9uOiBJVmVyc2lvblZhbHVlID0gJzAnLFxuXHR2ZXJzaW9uVGFyZ2V0OiBFbnVtVmVyc2lvblZhbHVlID0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QsXG4pOiBCbHVlYmlyZDxJVmVyc2lvblZhbHVlPlxue1xuXHRsZXQgbWV0aG9kID0gRW51bVBhY2thZ2VNYW5hZ2Vyc05wbU1ldGhvZFt2ZXJzaW9uVGFyZ2V0XTtcblxuXHRpZiAodmVyc2lvbiA9PSBudWxsKVxuXHR7XG5cdFx0dmVyc2lvbiA9ICcwJztcblxuXHRcdHN3aXRjaCAodmVyc2lvblRhcmdldClcblx0XHR7XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubGF0ZXN0OlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmdyZWF0ZXN0OlxuXHRcdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm5ld2VzdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWFqb3I6XG5cdFx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0XHRcdG1ldGhvZCA9IEVudW1QYWNrYWdlTWFuYWdlcnNOcG1NZXRob2QubGF0ZXN0O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZTxJVmVyc2lvblZhbHVlPihQYWNrYWdlTWFuYWdlcnNOcG1bbWV0aG9kXShuYW1lLCB2ZXJzaW9uKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZlcnNpb25DYWNoZU1hcChkYXRhOiBJVmVyc2lvbkNhY2hlTWFwVmFsdWUpXG57XG5cdHJldHVybiB2ZXJzaW9uQ2FjaGVNYXAuc2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSwgb2JqVmVyc2lvbkNhY2hlVmFsdWUoZGF0YSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlSZW1vdGVWZXJzaW9ucyhwYWNrYWdlTWFwOiBJUGFja2FnZU1hcCB8IHN0cmluZ1tdLCBvcHRpb25zOiBQYXJ0aWFsPElPcHRpb25zPiA9IHt9KVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0fTtcblxuXHRcdFx0b3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9ICducG0nO1xuXHRcdFx0b3B0aW9ucy5sb2dsZXZlbCA9ICdzaWxlbnQnO1xuXG5cdFx0XHRsZXQgdmVyc2lvblRhcmdldCA9IG9wdGlvbnMudmVyc2lvblRhcmdldCA9IGdldFZlcnNpb25UYXJnZXQob3B0aW9ucykgfHwgRW51bVZlcnNpb25WYWx1ZS5sYXRlc3Q7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBhY2thZ2VNYXApKVxuXHRcdFx0e1xuXHRcdFx0XHRwYWNrYWdlTWFwID0gcGFja2FnZU1hcC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhW2JdID0gdmVyc2lvblRhcmdldDtcblxuXHRcdFx0XHRcdHJldHVybiBhXG5cdFx0XHRcdH0sIHt9IGFzIElQYWNrYWdlTWFwKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhY2thZ2VNYXBBcnJheSA9IHBhY2thZ2VNYXBUb0tleU9iamVjdChwYWNrYWdlTWFwLCB2ZXJzaW9uVGFyZ2V0KTtcblxuXHRcdFx0bGV0IHBhY2thZ2VNYXBBcnJheUZpbHRlZCA9IGF3YWl0IEJsdWViaXJkLnJlc29sdmUocGFja2FnZU1hcEFycmF5KVxuXHRcdFx0XHQuZmlsdGVyKGFzeW5jIChkKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGJvb2wgPSAhaGFzUXVlcnllZFZlcnNpb25DYWNoZShkKTtcblxuXHRcdFx0XHRcdGlmIChib29sICYmIGlzQmFkVmVyc2lvbihkLnZlcnNpb25fb2xkKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodmVyc2lvblRhcmdldCA9PT0gRW51bVZlcnNpb25WYWx1ZS5taW5vcilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZlcnNpb25fbmV3ID0gYXdhaXQgcXVlcnlQYWNrYWdlTWFuYWdlcnNOcG0oZC5uYW1lKTtcblxuXHRcdFx0XHRcdFx0XHRkLnZlcnNpb25fb2xkID0gdmVyc2lvbl9uZXcuc3BsaXQoJy4nKVswXSArICcuMC4wJztcblxuXHRcdFx0XHRcdFx0XHRzZXRWZXJzaW9uQ2FjaGVNYXAoe1xuXHRcdFx0XHRcdFx0XHRcdC4uLmQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGJvb2wgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYm9vbFxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgcGFja2FnZU1hcDIgPSBrZXlPYmplY3RUb1BhY2thZ2VNYXAocGFja2FnZU1hcEFycmF5RmlsdGVkKTtcblxuXHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdC5yZXNvbHZlPElQYWNrYWdlTWFwPihfcXVlcnlWZXJzaW9ucyhwYWNrYWdlTWFwMiwgb3B0aW9ucykpXG5cdFx0XHRcdC50YXAocmV0ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShPYmplY3QuZW50cmllcyhwYWNrYWdlTWFwMikpXG5cdFx0XHRcdFx0XHQuZWFjaChhc3luYyAoW25hbWUsIHZlcnNpb25fb2xkXSkgPT5cblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IHZlcnNpb25fbmV3ID0gcmV0W25hbWVdO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh2ZXJzaW9uX25ldyA9PSBudWxsICYmIGlzQmFkVmVyc2lvbih2ZXJzaW9uX29sZCkpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR2ZXJzaW9uX25ldyA9IGF3YWl0IHF1ZXJ5UGFja2FnZU1hbmFnZXJzTnBtKG5hbWUsIG51bGwsIHZlcnNpb25UYXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0c2V0VmVyc2lvbkNhY2hlTWFwKHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdHZlcnNpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9vbGQsXG5cdFx0XHRcdFx0XHRcdFx0dmVyc2lvbl9uZXcsXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwYWNrYWdlTWFwQXJyYXlcblx0XHRcdFx0XHRcdC5tYXAoZGF0YSA9PiB2ZXJzaW9uQ2FjaGVNYXAuZ2V0KHN0clZlcnNpb25DYWNoZShkYXRhKSkpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmFkVmVyc2lvbih2ZXJzaW9uOiBJVmVyc2lvblZhbHVlKVxue1xuXHRsZXQgYm9vbCA9IGZhbHNlO1xuXHRzd2l0Y2ggKHZlcnNpb24pXG5cdHtcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUubWlub3I6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLm1ham9yOlxuXHRcdGNhc2UgRW51bVZlcnNpb25WYWx1ZS5uZXdlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlLmxhdGVzdDpcblx0XHRjYXNlIEVudW1WZXJzaW9uVmFsdWUuZ3JlYXRlc3Q6XG5cdFx0Y2FzZSBFbnVtVmVyc2lvblZhbHVlMi5hbnk6XG5cdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cblx0XHRcdGlmICh2ZXJzaW9uID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtQ2hlY2tVcGRhdGVzPEMgZXh0ZW5kcyBJV3JhcERlZHVwZUNhY2hlPihjYWNoZTogUGFydGlhbDxDPiwgbmN1T3B0aW9uczogSU9wdGlvbnMpXG57XG5cdC8vbmN1T3B0aW9ucy5zaWxlbnQgPSBmYWxzZTtcblxuXHQvL25jdU9wdGlvbnMuanNvbiA9IGZhbHNlO1xuXHQvL25jdU9wdGlvbnMuY2xpID0gdHJ1ZTtcblxuXHQvL25jdU9wdGlvbnMuYXJncyA9IFtdO1xuXG5cdC8vbmN1T3B0aW9ucy5sb2dsZXZlbCA9ICd2ZXJib3NlJztcblxuXHRkZWxldGUgbmN1T3B0aW9ucy51cGdyYWRlO1xuXHRkZWxldGUgbmN1T3B0aW9ucy5nbG9iYWw7XG5cblx0aWYgKG5jdU9wdGlvbnMuc2FmZSlcblx0e1xuXHRcdG5jdU9wdGlvbnMuc2VtdmVyTGV2ZWwgPSBFbnVtVmVyc2lvblZhbHVlLm1pbm9yO1xuXHR9XG5cblx0ZGVsZXRlIG5jdU9wdGlvbnMuc2FmZTtcblxuXHRuY3VPcHRpb25zLnBhY2thZ2VNYW5hZ2VyID0gJ25wbSc7XG5cblx0bmN1T3B0aW9ucy5wYWNrYWdlRGF0YSA9IEpTT04uc3RyaW5naWZ5KG5jdU9wdGlvbnMuanNvbl9vbGQpO1xuXG5cdG5jdU9wdGlvbnMuY3dkID0gY2FjaGUuY3dkO1xuXHRuY3VPcHRpb25zLmpzb25VcGdyYWRlZCA9IHRydWU7XG5cblx0bmN1T3B0aW9ucy5qc29uX25ldyA9IEpTT04ucGFyc2UobmN1T3B0aW9ucy5wYWNrYWdlRGF0YSk7XG5cblx0bmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQgPSBhd2FpdCBfbnBtQ2hlY2tVcGRhdGVzKG5jdU9wdGlvbnMpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMobmN1T3B0aW9ucy5saXN0X3VwZGF0ZWQpO1xuXG5cdG5jdU9wdGlvbnMuanNvbl9jaGFuZ2VkID0gISFrcy5sZW5ndGg7XG5cblx0bGV0IGN1cnJlbnQ6IElEZXBlbmRlbmN5ID0ge307XG5cblx0aWYgKGtzLmxlbmd0aClcblx0e1xuXHRcdGtzLmZvckVhY2gobmFtZSA9PlxuXHRcdHtcblxuXHRcdFx0KDwoa2V5b2YgSVBhY2thZ2VKc29uKVtdPltcblx0XHRcdFx0J2RlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdkZXZEZXBlbmRlbmNpZXMnLFxuXHRcdFx0XHQncGVlckRlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdvcHRpb25hbERlcGVuZGVuY2llcycsXG5cdFx0XHRdKS5mb3JFYWNoKGtleSA9PlxuXHRcdFx0e1xuXG5cdFx0XHRcdGxldCBkYXRhID0gbmN1T3B0aW9ucy5qc29uX25ld1trZXldO1xuXG5cdFx0XHRcdGlmIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZhbHVlID0gZGF0YVtuYW1lXTtcblxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB2YWx1ZSAhPSBFbnVtVmVyc2lvblZhbHVlMi5hbnkgJiYgdmFsdWUgIT0gRW51bVZlcnNpb25WYWx1ZS5sYXRlc3QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y3VycmVudFtuYW1lXSA9IHZhbHVlO1xuXG5cdFx0XHRcdFx0XHRkYXRhW25hbWVdID0gbmN1T3B0aW9ucy5saXN0X3VwZGF0ZWRbbmFtZV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH0pXG5cblx0XHR9KTtcblxuXHR9XG5cblx0bmN1T3B0aW9ucy5jdXJyZW50ID0gY3VycmVudDtcblxuXHRsZXQgdGFibGUgPSB0b0RlcGVuZGVuY3lUYWJsZSh7XG5cdFx0ZnJvbTogbmN1T3B0aW9ucy5jdXJyZW50LFxuXHRcdHRvOiBuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCxcblx0fSkudG9TdHJpbmcoKTtcblxuXHR0YWJsZSAmJiBjb25zb2xlLmxvZyh0YWJsZSk7XG5cblx0cmV0dXJuIG5jdU9wdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cE5jdVRvWWFyZ3M8VCBleHRlbmRzIGFueT4oeWFyZ3M6IEFyZ3Y8VD4pXG57XG5cdHJldHVybiB5YXJnc1xuXHRcdC5vcHRpb24oJ2RlcCcsIHtcblx0XHRcdGRlc2M6IGBjaGVjayBvbmx5IGEgc3BlY2lmaWMgc2VjdGlvbihzKSBvZiBkZXBlbmRlbmNpZXM6IHByb2R8ZGV2fHBlZXJ8b3B0aW9uYWx8YnVuZGxlIChjb21tYS1kZWxpbWl0ZWQpYCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ21pbmltYWwnLCB7XG5cdFx0XHRhbGlhczogWydtJ10sXG5cdFx0XHRkZXNjOiBgZG8gbm90IHVwZ3JhZGUgbmV3ZXIgdmVyc2lvbnMgdGhhdCBhcmUgYWxyZWFkeSBzYXRpc2ZpZWQgYnkgdGhlIHZlcnNpb24gcmFuZ2UgYWNjb3JkaW5nIHRvIHNlbXZlcmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbmV3ZXN0Jywge1xuXHRcdFx0YWxpYXM6IFsnbiddLFxuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIG5ld2VzdCB2ZXJzaW9ucyBhdmFpbGFibGUgaW5zdGVhZCBvZiB0aGUgbGF0ZXN0IHN0YWJsZSB2ZXJzaW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncGFja2FnZU1hbmFnZXInLCB7XG5cdFx0XHRhbGlhczogWydwJ10sXG5cdFx0XHRkZXNjOiBgbnBtIChkZWZhdWx0KSBvciBib3dlcmAsXG5cdFx0XHRkZWZhdWx0OiAnbnBtJyxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3JlZ2lzdHJ5Jywge1xuXHRcdFx0YWxpYXM6IFsnciddLFxuXHRcdFx0ZGVzYzogYHNwZWNpZnkgdGhpcmQtcGFydHkgbnBtIHJlZ2lzdHJ5YCxcblx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NpbGVudCcsIHtcblx0XHRcdGFsaWFzOiBbJ3MnXSxcblx0XHRcdGRlc2M6IGBkb24ndCBvdXRwdXQgYW55dGhpbmcgKC0tbG9nbGV2ZWwgc2lsZW50KWAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZ3JlYXRlc3QnLCB7XG5cdFx0XHRhbGlhczogWydnJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgaGlnaGVzdCB2ZXJzaW9ucyBhdmFpbGFibGUgaW5zdGVhZCBvZiB0aGUgbGF0ZXN0IHN0YWJsZSB2ZXJzaW9uc2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigndXBncmFkZScsIHtcblx0XHRcdGFsaWFzOiBbJ3UnXSxcblx0XHRcdGRlc2M6IGBvdmVyd3JpdGUgcGFja2FnZSBmaWxlYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdzZW12ZXJMZXZlbCcsIHtcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb24gd2l0aGluIFwibWFqb3JcIiBvciBcIm1pbm9yXCJgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVtb3ZlUmFuZ2UnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHZlcnNpb24gcmFuZ2VzIGZyb20gdGhlIGZpbmFsIHBhY2thZ2UgdmVyc2lvbmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZGVkdXBlJywge1xuXHRcdFx0ZGVzYzogYHJlbW92ZSB1cGdyYWRlIG1vZHVsZSBmcm9tIHJlc29sdXRpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRkZWZhdWx0OiB0cnVlLFxuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShyZXNvbHV0aW9uczogSVBhY2thZ2VNYXAsIHlhcm5sb2NrX29sZF9vYmo6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCB8IHN0cmluZywgb3B0aW9uczogUGFydGlhbDxJT3B0aW9ucz4gPSB7fSlcbntcblx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB5YXJubG9ja19vbGRfb2JqID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0eWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWFybmxvY2tfb2xkX29iaik7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByZXN1bHQgPSBmaWx0ZXJSZXNvbHV0aW9ucyh7XG5cdFx0XHRcdHJlc29sdXRpb25zXG5cdFx0XHR9LCB5YXJubG9ja19vbGRfb2JqKTtcblxuXHRcdFx0bGV0IGRlcHMgPSBhd2FpdCBxdWVyeVJlbW90ZVZlcnNpb25zKHJlc29sdXRpb25zLCBvcHRpb25zKTtcblxuXHRcdFx0bGV0IGRlcHMyID0ga2V5T2JqZWN0VG9QYWNrYWdlTWFwKGRlcHMsIHRydWUpO1xuXG5cdFx0XHRsZXQgeWFybmxvY2tfbmV3X29iaiA9IHtcblx0XHRcdFx0Li4ueWFybmxvY2tfb2xkX29ialxuXHRcdFx0fTtcblxuXHRcdFx0bGV0IHVwZGF0ZV9saXN0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0bGV0IHlhcm5sb2NrX2NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdFx0T2JqZWN0LmVudHJpZXMocmVzdWx0Lm1heClcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtuYW1lLCBkYXRhXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChzZW12ZXIubHQoZGF0YS52YWx1ZS52ZXJzaW9uLCBkZXBzMltuYW1lXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0T2JqZWN0LmtleXMocmVzdWx0LmRlcHNbbmFtZV0pXG5cdFx0XHRcdFx0XHRcdC5mb3JFYWNoKHZlcnNpb24gPT4ge1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGtleSA9IG5hbWUgKyAnQCcgKyB2ZXJzaW9uO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIHlhcm5sb2NrX25ld19vYmpba2V5XVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHR5YXJubG9ja19jaGFuZ2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0dXBkYXRlX2xpc3QucHVzaChuYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChyZXN1bHQuaW5zdGFsbGVkW25hbWVdLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKHJlc3VsdC5kZXBzW25hbWVdKVxuXHRcdFx0XHRcdFx0XHRcdC5mb3JFYWNoKHZlcnNpb24gPT4ge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQga2V5ID0gbmFtZSArICdAJyArIHZlcnNpb247XG5cblx0XHRcdFx0XHRcdFx0XHRcdHlhcm5sb2NrX25ld19vYmpba2V5XSA9IGRhdGEudmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRcdHlhcm5sb2NrX2NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR5YXJubG9ja19vbGRfb2JqLFxuXHRcdFx0XHR5YXJubG9ja19uZXdfb2JqLFxuXHRcdFx0XHR1cGRhdGVfbGlzdCxcblx0XHRcdFx0eWFybmxvY2tfY2hhbmdlZCxcblx0XHRcdFx0ZGVwcyxcblx0XHRcdFx0ZGVwczIsXG5cdFx0XHR9XG5cdFx0fSlcblx0O1xufVxuXG4vKlxuKGFzeW5jICgpID0+XG57XG5cdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKClcblx0fSk7XG5cblx0bGV0IHBrZyA9IHJlcXVpcmUoJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMvcGFja2FnZS5qc29uJyk7XG5cblx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBhd2FpdCByZWFkWWFybkxvY2tmaWxlKHBhdGguam9pbihyb290RGF0YS5yb290LCAneWFybi5sb2NrJykpO1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKHlhcm5sb2NrX29sZF9vYmopLmZpbHRlcihrID0+IGsuaW5jbHVkZXMoJ3N0cmluZy13aWR0aCcpKVxuXG5cdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHBrZy5yZXNvbHV0aW9ucywgeWFybmxvY2tfb2xkX29iailcblxuXHRjb25zb2xlLmRpcihyZXQpO1xuXG59KSgpO1xuICovXG5cbmV4cG9ydCBkZWZhdWx0IHNldHVwTmN1VG9ZYXJnc1xuIl19