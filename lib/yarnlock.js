"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportYarnLock = exports.filterDuplicateYarnLock = exports._diffArray = exports.yarnLockDiff = exports.removeResolutionsCore = exports.removeResolutions = exports.filterResolutions = exports.stripDepsName = exports.writeYarnLockfile = exports.readYarnLockfile = exports.stringify = exports.parse = exports.parseFull = void 0;
const lockfile = require("@yarnpkg/lockfile");
const fs = require("fs-extra");
const diff_service_1 = require("yarn-lock-diff/lib/diff-service");
const formatter_1 = require("yarn-lock-diff/lib/formatter");
const table_1 = require("./table");
const index_1 = require("./index");
const semver = require("semver");
const { _formatVersion } = formatter_1.FormatterService;
function parseFull(text) {
    return lockfile.parse(text.toString());
}
exports.parseFull = parseFull;
function parse(text) {
    return parseFull(text).object;
}
exports.parse = parse;
function stringify(json) {
    return lockfile.stringify(json);
}
exports.stringify = stringify;
function readYarnLockfile(file) {
    let data = fs.readFileSync(file);
    return parse(data);
}
exports.readYarnLockfile = readYarnLockfile;
function writeYarnLockfile(file, data) {
    return fs.writeFileSync(file, stringify(data));
}
exports.writeYarnLockfile = writeYarnLockfile;
function stripDepsName(name) {
    let m = name.match(/^(@?.+?)@(.+)$/);
    if (!m) {
        throw new TypeError(`name is not dependencies, ${name}`);
    }
    let r = m.slice(1);
    //console.dir(r);
    //process.exit()
    return r;
}
exports.stripDepsName = stripDepsName;
function filterResolutions(pkg, yarnlock) {
    if (pkg.resolutions) {
        return exportYarnLock(yarnlock, (key, index, array_keys, yarnlock1) => {
            let name = stripDepsName(key)[0];
            return pkg.resolutions[name] != null;
        });
    }
    return null;
}
exports.filterResolutions = filterResolutions;
/**
 *
 * @example ```
 let pkg = readPackageJson('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/package.json');

 let y = readYarnLockfile('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/yarn.lock')

 console.dir(removeResolutions(pkg, y), {
    depth: null,
});
 ```
 */
function removeResolutions(pkg, yarnlock_old) {
    let result = filterResolutions(pkg, yarnlock_old);
    return removeResolutionsCore(result, yarnlock_old);
}
exports.removeResolutions = removeResolutions;
function removeResolutionsCore(result, yarnlock_old) {
    // @ts-ignore
    let yarnlock_new = result.names
        // @ts-ignore
        .reduce(function (a, b) {
        delete a[b];
        return a;
    }, {
        ...yarnlock_old,
    });
    let yarnlock_changed = !!result.names.length;
    return {
        /**
         * 執行前的 yarn.lock
         */
        yarnlock_old,
        /**
         * 執行後的 yarn.lock
         */
        yarnlock_new,
        /**
         * yarn.lock 是否有變動
         */
        yarnlock_changed,
        result,
    };
}
exports.removeResolutionsCore = removeResolutionsCore;
function yarnLockDiff(yarnlock_old, yarnlock_new) {
    let { chalk } = index_1.console;
    let _ok = false;
    const table = table_1.createDependencyTable();
    table.options.colAligns = ['left', 'center', 'center', 'center'];
    table.options.head = [
        chalk.bold.reset('package name'),
        chalk.bold.reset('old version(s)'),
        '',
        chalk.bold.reset('new version(s)'),
    ];
    diff_service_1.DiffService.buildDiff([yarnlock_old], [yarnlock_new])
        .map(function (diff) {
        let formatedDiff = {};
        const NONE = chalk.red('-');
        const ARROW = chalk.gray('→');
        diff
            .map(packageDiff => {
            const path = packageDiff.path.find(() => true);
            _ok = true;
            let _arr;
            switch (packageDiff.kind) {
                case 'A':
                    let diffArray = _diffArray(packageDiff, chalk);
                    _arr = [path, chalk.gray(diffArray[0]), ARROW, chalk.gray(diffArray[1])];
                    break;
                case 'D':
                    _arr = [chalk.red(path), chalk.red(_formatVersion(packageDiff.lhs)), ARROW, NONE];
                    break;
                case 'E':
                    let lhs0 = _formatVersion(packageDiff.lhs);
                    let rhs0 = _formatVersion(packageDiff.rhs);
                    let lhs = chalk.yellow(lhs0);
                    let rhs = chalk.yellow(table_1.colorizeDiff(lhs0, rhs0));
                    _arr = [chalk.yellow(path), lhs, ARROW, rhs];
                    break;
                case 'N':
                    _arr = [chalk.green(path), NONE, ARROW, chalk.green(_formatVersion(packageDiff.rhs))];
                    break;
            }
            _arr && (formatedDiff[path] = _arr);
        });
        table.push(...Object.values(formatedDiff));
    });
    return _ok ? table.toString() : '';
}
exports.yarnLockDiff = yarnLockDiff;
function _diffArray(array, chalk) {
    const item = array.item;
    switch (item.kind) {
        case "N":
            return [`[...]`, `[..., ${chalk.green(_formatVersion(item.rhs))}]`];
        case "D":
            return [`[..., ${chalk.red(_formatVersion(item.lhs))}]`, `[...]`];
        case "E":
            return [
                `[...], ${chalk.yellow(_formatVersion(item.lhs))}]`,
                `[..., ${chalk.yellow(_formatVersion(item.lhs))}]`,
            ];
        default:
            return [`[...]`, `[...]`];
    }
}
exports._diffArray = _diffArray;
/*
export function yarnLockDiff2(yarnlock_old: string, yarnlock_new: string): string
{
    let r2: string[] = [];

    let r = DiffService.buildDiff([yarnlock_old], [yarnlock_new])
        .map(FormatterService.buildDiffTable)
        .map(r => r2.push(r))
    ;

    return r2[0];
}
 */
/*
let ret = fsYarnLock(findRoot({
    cwd: process.cwd(),
}).root);

let ob = parse(ret.yarnlock_old);

let ret2 = removeResolutions({
    resolutions: {
        'semver': '',
        'pkg-dir': '',
        'is-npm': '',
    },
}, ob);

let s = yarnLockDiff(stringify(ob), stringify(ret2.yarnlock_new));

console.log(s);
*/
function filterDuplicateYarnLock(yarnlock) {
    let fy = exportYarnLock(yarnlock);
    let ks = Object.keys(fy.installed)
        .filter(function (value) {
        return fy.installed[value].length > 1;
    });
    return exportYarnLock(yarnlock, (key, index, array_keys, yarnlock1) => {
        let n = stripDepsName(key)[0];
        return ks.includes(n);
    });
}
exports.filterDuplicateYarnLock = filterDuplicateYarnLock;
function exportYarnLock(yarnlock, filter) {
    let ks = Object.keys(yarnlock);
    if (filter) {
        ks = ks
            .filter((value, index, array) => {
            return filter(value, index, array, yarnlock);
        });
    }
    return ks
        .reduce(function (a, k) {
        let n = stripDepsName(k);
        let name = n[0];
        let key = n[1];
        let data = yarnlock[k];
        // @ts-ignore
        (a.deps[name] = a.deps[name] || {})[key] = data;
        a.installed[name] = a.installed[n[0]] || [];
        if (!a.installed[name].includes(data.version)) {
            a.installed[name].push(data.version);
            if (a.max[name] != null) {
                if (semver.lt(a.max[name].value.version, data.version)) {
                    a.max[name] = {
                        key: k,
                        value: data,
                    };
                }
            }
            else {
                a.max[name] = {
                    key: k,
                    value: data,
                };
            }
        }
        return a;
    }, {
        names: ks,
        deps: {},
        installed: {},
        max: {},
    });
}
exports.exportYarnLock = exportYarnLock;
//# sourceMappingURL=yarnlock.js.map