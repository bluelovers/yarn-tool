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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ5YXJubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILDhDQUErQztBQUMvQywrQkFBZ0M7QUFFaEMsa0VBQThEO0FBQzlELDREQUFnRTtBQUdoRSxtQ0FBOEQ7QUFDOUQsbUNBQWdEO0FBSWhELGlDQUFrQztBQUVsQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsNEJBQWdCLENBQUM7QUFnQzVDLFNBQWdCLFNBQVMsQ0FBQyxJQUFxQjtJQUU5QyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDdkMsQ0FBQztBQUhELDhCQUdDO0FBRUQsU0FBZ0IsS0FBSyxDQUFDLElBQXFCO0lBRTFDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQTtBQUM5QixDQUFDO0FBSEQsc0JBR0M7QUFFRCxTQUFnQixTQUFTLENBQUMsSUFBOEI7SUFFdkQsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLENBQUM7QUFIRCw4QkFHQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLElBQVk7SUFFNUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVoQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNuQixDQUFDO0FBTEQsNENBS0M7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsSUFBOEI7SUFFN0UsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUMvQyxDQUFDO0FBSEQsOENBR0M7QUFFRCxTQUFnQixhQUFhLENBQWEsSUFBWTtJQUVyRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFD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QyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUN0RDtvQkFDQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHO3dCQUNiLEdBQUcsRUFBRSxDQUFDO3dCQUNOLEtBQUssRUFBRSxJQUFJO3FCQUNYLENBQUM7aUJBQ0Y7YUFDRDtpQkFFRDtnQkFDQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHO29CQUNiLEdBQUcsRUFBRSxDQUFDO29CQUNOLEtBQUssRUFBRSxJQUFJO2lCQUNYLENBQUM7YUFDRjtTQUNEO1FBRUQsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDLEVBQUU7UUFDRixLQUFLLEVBQUUsRUFBRTtRQUNULElBQUksRUFBRSxFQUFFO1FBQ1IsU0FBUyxFQUFFLEVBQUU7UUFDYixHQUFHLEVBQUUsRUFBRTtLQUNrQixDQUFDLENBQzFCO0FBQ0gsQ0FBQztBQTFERCx3Q0EwREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTcuXG4gKi9cblxuaW1wb3J0IGxvY2tmaWxlID0gcmVxdWlyZSgnQHlhcm5wa2cvbG9ja2ZpbGUnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5LCBJVFNWYWx1ZU9mQXJyYXkgfSBmcm9tICd0cy10eXBlJztcbmltcG9ydCB7IERpZmZTZXJ2aWNlIH0gZnJvbSAneWFybi1sb2NrLWRpZmYvbGliL2RpZmYtc2VydmljZSc7XG5pbXBvcnQgeyBGb3JtYXR0ZXJTZXJ2aWNlIH0gZnJvbSAneWFybi1sb2NrLWRpZmYvbGliL2Zvcm1hdHRlcic7XG5pbXBvcnQgeyBmaW5kUm9vdCwgZnNZYXJuTG9jayB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgZGVlcERpZmYgZnJvbSAnZGVlcC1kaWZmJztcbmltcG9ydCB7IGNvbG9yaXplRGlmZiwgY3JlYXRlRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGNvbnNvbGUgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IERpZmZBcnJheSB9IGZyb20gJ2RlZXAtZGlmZic7XG5pbXBvcnQgeyBDaGFsayB9IGZyb20gJ2NoYWxrJztcbmltcG9ydCB7IElWZXJzaW9uVmFsdWUgfSBmcm9tICcuL2NsaS9uY3UnO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuXG5jb25zdCB7IF9mb3JtYXRWZXJzaW9uIH0gPSBGb3JtYXR0ZXJTZXJ2aWNlO1xuXG5leHBvcnQgaW50ZXJmYWNlIElZYXJuTG9ja2ZpbGVQYXJzZUZ1bGw8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPlxue1xuXHR0eXBlOiBzdHJpbmc7XG5cdG9iamVjdDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+XG59XG5cbmV4cG9ydCB0eXBlIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+ID0gc3RyaW5nW10+ID0gUmVjb3JkPHN0cmluZywgSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93PFQ+PlxuXG4vKipcbiAqIHlhcm4ubG9jayDos4fmlplcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPlxue1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiDlronoo53kvobmupDntrLlnYBcblx0ICovXG5cdHJlc29sdmVkOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBoYXNoIGtleVxuXHQgKi9cblx0aW50ZWdyaXR5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiDkvp3os7TliJfooahcblx0ICovXG5cdGRlcGVuZGVuY2llcz86IElEZXBlbmRlbmNpZXM8VD47XG59XG5cbmV4cG9ydCB0eXBlIElEZXBlbmRlbmNpZXM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPiA9IFJlY29yZDxJVFNWYWx1ZU9mQXJyYXk8VD4sIHN0cmluZz47XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZ1bGwodGV4dDogc3RyaW5nIHwgQnVmZmVyKTogSVlhcm5Mb2NrZmlsZVBhcnNlRnVsbFxue1xuXHRyZXR1cm4gbG9ja2ZpbGUucGFyc2UodGV4dC50b1N0cmluZygpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UodGV4dDogc3RyaW5nIHwgQnVmZmVyKVxue1xuXHRyZXR1cm4gcGFyc2VGdWxsKHRleHQpLm9iamVjdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGpzb246IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCk6IHN0cmluZ1xue1xuXHRyZXR1cm4gbG9ja2ZpbGUuc3RyaW5naWZ5KGpzb24pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkWWFybkxvY2tmaWxlKGZpbGU6IHN0cmluZylcbntcblx0bGV0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSlcblxuXHRyZXR1cm4gcGFyc2UoZGF0YSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlWWFybkxvY2tmaWxlKGZpbGU6IHN0cmluZywgZGF0YTogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0KVxue1xuXHRyZXR1cm4gZnMud3JpdGVGaWxlU3luYyhmaWxlLCBzdHJpbmdpZnkoZGF0YSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcERlcHNOYW1lPFQgPSBzdHJpbmc+KG5hbWU6IHN0cmluZyk6IFtULCBJVmVyc2lvblZhbHVlXVxue1xuXHRsZXQgbSA9IG5hbWUubWF0Y2goL14oQD8uKz8pQCguKykkLyk7XG5cblx0aWYgKCFtKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbmFtZSBpcyBub3QgZGVwZW5kZW5jaWVzLCAke25hbWV9YClcblx0fVxuXG5cdGxldCByID0gbS5zbGljZSgxKTtcblxuXHQvL2NvbnNvbGUuZGlyKHIpO1xuXHQvL3Byb2Nlc3MuZXhpdCgpXG5cblx0cmV0dXJuIHIgYXMgYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlclJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+XG57XG5cdC8qKlxuXHQgKiB5YXJuLmxvY2sga2V5IOWIl+ihqFxuXHQgKi9cblx0bmFtZXM6IFQsXG5cdC8qKlxuXHQgKiDpgY7mv77lvoznmoQgeWFybiBsb2NrIGRlcHNcblx0ICovXG5cdGRlcHM6IHtcblx0XHQvKipcblx0XHQgKiDmqKHntYTlkI3nqLFcblx0XHQgKi9cblx0XHRbUCBpbiAoa2V5b2YgSVRTVmFsdWVPZkFycmF5PFQ+IHwgc3RyaW5nKV06IHtcblx0XHRcdC8qKlxuXHRcdFx0ICog54mI5pys6LOH5paZXG5cdFx0XHQgKi9cblx0XHRcdFtQIGluIElWZXJzaW9uVmFsdWVdOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c8VD47XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog5a+m6Zqb5a6J6KOd55qE54mI5pys57eo6JmfXG5cdCAqL1xuXHRpbnN0YWxsZWQ/OiB7XG5cdFx0LyoqXG5cdFx0ICog5a+m6Zqb5a6J6KOd55qE54mI5pys57eo6JmfXG5cdFx0ICovXG5cdFx0W1AgaW4gSVRTVmFsdWVPZkFycmF5PFQ+XTogSVZlcnNpb25WYWx1ZVtdO1xuXHR9LFxuXHQvKipcblx0ICog5q+P5YCL5qih57WE5pyA5aSn55qE5a6J6KOd54mI5pysXG5cdCAqL1xuXHRtYXg/OiB7XG5cdFx0LyoqXG5cdFx0ICog5q+P5YCL5qih57WE5pyA5aSn55qE5a6J6KOd54mI5pysXG5cdFx0ICovXG5cdFx0W1AgaW4gSVRTVmFsdWVPZkFycmF5PFQ+XToge1xuXHRcdFx0a2V5OiBJVFNWYWx1ZU9mQXJyYXk8VD4sXG5cdFx0XHR2YWx1ZTogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93PFQ+XG5cdFx0fVxuXHR9LFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyUmVzb2x1dGlvbnM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj4ocGtnOiB7XG5cdHJlc29sdXRpb25zPzogSURlcGVuZGVuY2llczxUPlxufSwgeWFybmxvY2s6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPik6IElGaWx0ZXJSZXNvbHV0aW9uczxUPlxue1xuXHRpZiAocGtnLnJlc29sdXRpb25zKVxuXHR7XG5cdFx0cmV0dXJuIGV4cG9ydFlhcm5Mb2NrKHlhcm5sb2NrLCAoa2V5LCBpbmRleCwgYXJyYXlfa2V5cywgeWFybmxvY2sxKSA9PiB7XG5cdFx0XHRsZXQgbmFtZSA9IHN0cmlwRGVwc05hbWUoa2V5KVswXTtcblx0XHRcdHJldHVybiBwa2cucmVzb2x1dGlvbnNbbmFtZV0gIT0gbnVsbFxuXHRcdH0pXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVtb3ZlUmVzb2x1dGlvbnM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj5cbntcblx0LyoqXG5cdCAqIOWft+ihjOWJjeeahCB5YXJuLmxvY2tcblx0ICovXG5cdHlhcm5sb2NrX29sZDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+O1xuXHQvKipcblx0ICog5Z+36KGM5b6M55qEIHlhcm4ubG9ja1xuXHQgKi9cblx0eWFybmxvY2tfbmV3OiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD47XG5cdC8qKlxuXHQgKiB5YXJuLmxvY2sg5piv5ZCm5pyJ6K6K5YuVXG5cdCAqL1xuXHR5YXJubG9ja19jaGFuZ2VkOiBib29sZWFuO1xuXHRyZXN1bHQ6IElGaWx0ZXJSZXNvbHV0aW9uczxUPjtcbn1cblxuLyoqXG4gKlxuICogQGV4YW1wbGUgYGBgXG4gbGV0IHBrZyA9IHJlYWRQYWNrYWdlSnNvbignRzovVXNlcnMvVGhlIFByb2plY3Qvbm9kZWpzLXlhcm4vd3MtY3JlYXRlLXlhcm4td29ya3NwYWNlcy9wYWNrYWdlLmpzb24nKTtcblxuIGxldCB5ID0gcmVhZFlhcm5Mb2NrZmlsZSgnRzovVXNlcnMvVGhlIFByb2plY3Qvbm9kZWpzLXlhcm4vd3MtY3JlYXRlLXlhcm4td29ya3NwYWNlcy95YXJuLmxvY2snKVxuXG4gY29uc29sZS5kaXIocmVtb3ZlUmVzb2x1dGlvbnMocGtnLCB5KSwge1xuXHRkZXB0aDogbnVsbCxcbn0pO1xuIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUmVzb2x1dGlvbnM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj4ocGtnOiB7XG5cdHJlc29sdXRpb25zPzogSURlcGVuZGVuY2llczxUPlxufSwgeWFybmxvY2tfb2xkOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pOiBJUmVtb3ZlUmVzb2x1dGlvbnM8VD5cbntcblx0bGV0IHJlc3VsdCA9IGZpbHRlclJlc29sdXRpb25zKHBrZywgeWFybmxvY2tfb2xkKTtcblxuXHRyZXR1cm4gcmVtb3ZlUmVzb2x1dGlvbnNDb3JlPFQ+KHJlc3VsdCwgeWFybmxvY2tfb2xkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVJlc29sdXRpb25zQ29yZTxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+PihyZXN1bHQ6IElGaWx0ZXJSZXNvbHV0aW9uczxUPixcblx0eWFybmxvY2tfb2xkOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4sXG4pOiBJUmVtb3ZlUmVzb2x1dGlvbnM8VD5cbntcblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgeWFybmxvY2tfbmV3OiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4gPSByZXN1bHQubmFtZXNcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0LnJlZHVjZShmdW5jdGlvbiAoYTogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+LCBiKVxuXHRcdHtcblx0XHRcdGRlbGV0ZSBhW2JdO1xuXG5cdFx0XHRyZXR1cm4gYTtcblx0XHR9LCB7XG5cdFx0XHQuLi55YXJubG9ja19vbGQsXG5cdFx0fSk7XG5cblx0bGV0IHlhcm5sb2NrX2NoYW5nZWQgPSAhIXJlc3VsdC5uYW1lcy5sZW5ndGg7XG5cblx0cmV0dXJuIHtcblx0XHQvKipcblx0XHQgKiDln7fooYzliY3nmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfb2xkLFxuXHRcdC8qKlxuXHRcdCAqIOWft+ihjOW+jOeahCB5YXJuLmxvY2tcblx0XHQgKi9cblx0XHR5YXJubG9ja19uZXcsXG5cdFx0LyoqXG5cdFx0ICogeWFybi5sb2NrIOaYr+WQpuacieiuiuWLlVxuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX2NoYW5nZWQsXG5cblx0XHRyZXN1bHQsXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHlhcm5Mb2NrRGlmZih5YXJubG9ja19vbGQ6IHN0cmluZywgeWFybmxvY2tfbmV3OiBzdHJpbmcpOiBzdHJpbmdcbntcblx0bGV0IHsgY2hhbGsgfSA9IGNvbnNvbGU7XG5cdGxldCBfb2sgPSBmYWxzZTtcblxuXHRjb25zdCB0YWJsZSA9IGNyZWF0ZURlcGVuZGVuY3lUYWJsZSgpO1xuXG5cdHRhYmxlLm9wdGlvbnMuY29sQWxpZ25zID0gWydsZWZ0JywgJ2NlbnRlcicsICdjZW50ZXInLCAnY2VudGVyJ107XG5cdHRhYmxlLm9wdGlvbnMuaGVhZCA9IFtcblx0XHRjaGFsay5ib2xkLnJlc2V0KCdwYWNrYWdlIG5hbWUnKSxcblx0XHRjaGFsay5ib2xkLnJlc2V0KCdvbGQgdmVyc2lvbihzKScpLFxuXHRcdCcnLFxuXHRcdGNoYWxrLmJvbGQucmVzZXQoJ25ldyB2ZXJzaW9uKHMpJyksXG5cdF07XG5cblx0RGlmZlNlcnZpY2UuYnVpbGREaWZmKFt5YXJubG9ja19vbGRdLCBbeWFybmxvY2tfbmV3XSlcblx0XHQubWFwKGZ1bmN0aW9uIChkaWZmKVxuXHRcdHtcblx0XHRcdGxldCBmb3JtYXRlZERpZmY6IHtcblx0XHRcdFx0W2s6IHN0cmluZ106IFtzdHJpbmcsIHN0cmluZywgc3RyaW5nLCBzdHJpbmddO1xuXHRcdFx0fSA9IHt9O1xuXG5cdFx0XHRjb25zdCBOT05FID0gY2hhbGsucmVkKCctJyk7XG5cdFx0XHRjb25zdCBBUlJPVyA9IGNoYWxrLmdyYXkoJ+KGkicpO1xuXG5cdFx0XHRkaWZmXG5cdFx0XHRcdC5tYXAocGFja2FnZURpZmYgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHBhdGg6IHN0cmluZyA9IHBhY2thZ2VEaWZmLnBhdGguZmluZCgoKSA9PiB0cnVlKTtcblxuXHRcdFx0XHRcdF9vayA9IHRydWU7XG5cblx0XHRcdFx0XHRsZXQgX2FycjogW3N0cmluZywgc3RyaW5nLCBzdHJpbmcsIHN0cmluZ107XG5cblx0XHRcdFx0XHRzd2l0Y2ggKHBhY2thZ2VEaWZmLmtpbmQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2FzZSAnQSc6XG5cblx0XHRcdFx0XHRcdFx0bGV0IGRpZmZBcnJheSA9IF9kaWZmQXJyYXkocGFja2FnZURpZmYsIGNoYWxrKTtcblxuXHRcdFx0XHRcdFx0XHRfYXJyID0gW3BhdGgsIGNoYWxrLmdyYXkoZGlmZkFycmF5WzBdKSwgQVJST1csIGNoYWxrLmdyYXkoZGlmZkFycmF5WzFdKV07XG5cblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlICdEJzpcblxuXHRcdFx0XHRcdFx0XHRfYXJyID0gW2NoYWxrLnJlZChwYXRoKSwgY2hhbGsucmVkKF9mb3JtYXRWZXJzaW9uKHBhY2thZ2VEaWZmLmxocykpLCBBUlJPVywgTk9ORV07XG5cblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlICdFJzpcblxuXHRcdFx0XHRcdFx0XHRsZXQgbGhzMCA9IF9mb3JtYXRWZXJzaW9uKHBhY2thZ2VEaWZmLmxocyk7XG5cdFx0XHRcdFx0XHRcdGxldCByaHMwID0gX2Zvcm1hdFZlcnNpb24ocGFja2FnZURpZmYucmhzKTtcblxuXHRcdFx0XHRcdFx0XHRsZXQgbGhzID0gY2hhbGsueWVsbG93KGxoczApO1xuXHRcdFx0XHRcdFx0XHRsZXQgcmhzID0gY2hhbGsueWVsbG93KGNvbG9yaXplRGlmZihsaHMwLCByaHMwKSk7XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtjaGFsay55ZWxsb3cocGF0aCksIGxocywgQVJST1csIHJoc107XG5cblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlICdOJzpcblxuXHRcdFx0XHRcdFx0XHRfYXJyID0gW2NoYWxrLmdyZWVuKHBhdGgpLCBOT05FLCBBUlJPVywgY2hhbGsuZ3JlZW4oX2Zvcm1hdFZlcnNpb24ocGFja2FnZURpZmYucmhzKSldO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF9hcnIgJiYgKGZvcm1hdGVkRGlmZltwYXRoXSA9IF9hcnIpO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdHRhYmxlLnB1c2goLi4uT2JqZWN0LnZhbHVlcyhmb3JtYXRlZERpZmYpKVxuXHRcdH0pXG5cdDtcblxuXHRyZXR1cm4gX29rID8gdGFibGUudG9TdHJpbmcoKSA6ICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2RpZmZBcnJheShhcnJheTogZGVlcERpZmYuRGlmZkFycmF5PHt9LCB7fT4sIGNoYWxrOiBDaGFsaylcbntcblx0Y29uc3QgaXRlbSA9IGFycmF5Lml0ZW07XG5cdHN3aXRjaCAoaXRlbS5raW5kKVxuXHR7XG5cdFx0Y2FzZSBcIk5cIjpcblx0XHRcdHJldHVybiBbYFsuLi5dYCwgYFsuLi4sICR7Y2hhbGsuZ3JlZW4oX2Zvcm1hdFZlcnNpb24oaXRlbS5yaHMpKX1dYF07XG5cdFx0Y2FzZSBcIkRcIjpcblx0XHRcdHJldHVybiBbYFsuLi4sICR7Y2hhbGsucmVkKF9mb3JtYXRWZXJzaW9uKGl0ZW0ubGhzKSl9XWAsIGBbLi4uXWBdO1xuXHRcdGNhc2UgXCJFXCI6XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRgWy4uLl0sICR7Y2hhbGsueWVsbG93KF9mb3JtYXRWZXJzaW9uKGl0ZW0ubGhzKSl9XWAsXG5cdFx0XHRcdGBbLi4uLCAke2NoYWxrLnllbGxvdyhfZm9ybWF0VmVyc2lvbihpdGVtLmxocykpfV1gLFxuXHRcdFx0XTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIFtgWy4uLl1gLCBgWy4uLl1gXTtcblx0fVxufVxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIHlhcm5Mb2NrRGlmZjIoeWFybmxvY2tfb2xkOiBzdHJpbmcsIHlhcm5sb2NrX25ldzogc3RyaW5nKTogc3RyaW5nXG57XG5cdGxldCByMjogc3RyaW5nW10gPSBbXTtcblxuXHRsZXQgciA9IERpZmZTZXJ2aWNlLmJ1aWxkRGlmZihbeWFybmxvY2tfb2xkXSwgW3lhcm5sb2NrX25ld10pXG5cdFx0Lm1hcChGb3JtYXR0ZXJTZXJ2aWNlLmJ1aWxkRGlmZlRhYmxlKVxuXHRcdC5tYXAociA9PiByMi5wdXNoKHIpKVxuXHQ7XG5cblx0cmV0dXJuIHIyWzBdO1xufVxuICovXG5cbi8qXG5sZXQgcmV0ID0gZnNZYXJuTG9jayhmaW5kUm9vdCh7XG5cdGN3ZDogcHJvY2Vzcy5jd2QoKSxcbn0pLnJvb3QpO1xuXG5sZXQgb2IgPSBwYXJzZShyZXQueWFybmxvY2tfb2xkKTtcblxubGV0IHJldDIgPSByZW1vdmVSZXNvbHV0aW9ucyh7XG5cdHJlc29sdXRpb25zOiB7XG5cdFx0J3NlbXZlcic6ICcnLFxuXHRcdCdwa2ctZGlyJzogJycsXG5cdFx0J2lzLW5wbSc6ICcnLFxuXHR9LFxufSwgb2IpO1xuXG5sZXQgcyA9IHlhcm5Mb2NrRGlmZihzdHJpbmdpZnkob2IpLCBzdHJpbmdpZnkocmV0Mi55YXJubG9ja19uZXcpKTtcblxuY29uc29sZS5sb2cocyk7XG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyRHVwbGljYXRlWWFybkxvY2s8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj4oeWFybmxvY2s6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPilcbntcblx0bGV0IGZ5ID0gZXhwb3J0WWFybkxvY2soeWFybmxvY2spO1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKGZ5Lmluc3RhbGxlZClcblx0XHQuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gZnkuaW5zdGFsbGVkW3ZhbHVlXS5sZW5ndGggPiAxXG5cdFx0fSlcblx0O1xuXG5cdHJldHVybiBleHBvcnRZYXJuTG9jayh5YXJubG9jaywgKGtleSwgaW5kZXgsIGFycmF5X2tleXMsIHlhcm5sb2NrMSkgPT4ge1xuXHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZTxJVFNWYWx1ZU9mQXJyYXk8VD4+KGtleSlbMF07XG5cblx0XHRyZXR1cm4ga3MuaW5jbHVkZXMobilcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRZYXJuTG9jazxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+Pih5YXJubG9jazogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+LCBmaWx0ZXI/OiAoa2V5OiBrZXlvZiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4sIGluZGV4OiBudW1iZXIsIGFycmF5X2tleXM6IChrZXlvZiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pW10sIHlhcm5sb2NrOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pID0+IGJvb2xlYW4pOiBJRmlsdGVyUmVzb2x1dGlvbnM8VD5cbntcblx0bGV0IGtzID0gT2JqZWN0LmtleXMoeWFybmxvY2spO1xuXG5cdGlmIChmaWx0ZXIpXG5cdHtcblx0XHRrcyA9IGtzXG5cdFx0XHQuZmlsdGVyKCh2YWx1ZSwgaW5kZXgsIGFycmF5KSA9PiB7XG5cdFx0XHRcdHJldHVybiBmaWx0ZXIodmFsdWUsIGluZGV4LCBhcnJheSwgeWFybmxvY2spXG5cdFx0fSlcblx0fVxuXG5cdHJldHVybiBrc1xuXHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGspXG5cdFx0e1xuXHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lPElUU1ZhbHVlT2ZBcnJheTxUPj4oayk7XG5cblx0XHRcdGxldCBuYW1lID0gblswXTtcblx0XHRcdGxldCBrZXkgPSBuWzFdO1xuXG5cdFx0XHRsZXQgZGF0YSA9IHlhcm5sb2NrW2tdO1xuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHQoYS5kZXBzW25hbWVdID0gYS5kZXBzW25hbWVdIHx8IHt9KVtrZXldID0gZGF0YTtcblxuXHRcdFx0YS5pbnN0YWxsZWRbbmFtZV0gPSBhLmluc3RhbGxlZFtuWzBdXSB8fCBbXTtcblxuXHRcdFx0aWYgKCFhLmluc3RhbGxlZFtuYW1lXS5pbmNsdWRlcyhkYXRhLnZlcnNpb24pKVxuXHRcdFx0e1xuXHRcdFx0XHRhLmluc3RhbGxlZFtuYW1lXS5wdXNoKGRhdGEudmVyc2lvbik7XG5cblx0XHRcdFx0aWYgKGEubWF4W25hbWVdICE9IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoc2VtdmVyLmx0KGEubWF4W25hbWVdLnZhbHVlLnZlcnNpb24sIGRhdGEudmVyc2lvbikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YS5tYXhbbmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdGtleTogayxcblx0XHRcdFx0XHRcdFx0dmFsdWU6IGRhdGEsXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLm1heFtuYW1lXSA9IHtcblx0XHRcdFx0XHRcdGtleTogayxcblx0XHRcdFx0XHRcdHZhbHVlOiBkYXRhLFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwge1xuXHRcdFx0bmFtZXM6IGtzLFxuXHRcdFx0ZGVwczoge30sXG5cdFx0XHRpbnN0YWxsZWQ6IHt9LFxuXHRcdFx0bWF4OiB7fSxcblx0XHR9IGFzIElGaWx0ZXJSZXNvbHV0aW9uczxUPilcblx0XHQ7XG59XG4iXX0=