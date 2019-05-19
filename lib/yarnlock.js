"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
    let m = name.match(/^(.+)@(.+)$/);
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
        let ks = Object.keys(yarnlock)
            .filter(k => {
            let n = stripDepsName(k)[0];
            return pkg.resolutions[n] != null;
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ5YXJubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsOENBQStDO0FBQy9DLCtCQUFnQztBQUVoQyxrRUFBOEQ7QUFDOUQsNERBQWdFO0FBR2hFLG1DQUE4RDtBQUM5RCxtQ0FBZ0Q7QUFJaEQsaUNBQWtDO0FBRWxDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyw0QkFBZ0IsQ0FBQztBQWdDNUMsU0FBZ0IsU0FBUyxDQUFDLElBQXFCO0lBRTlDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUN2QyxDQUFDO0FBSEQsOEJBR0M7QUFFRCxTQUFnQixLQUFLLENBQUMsSUFBcUI7SUFFMUMsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFBO0FBQzlCLENBQUM7QUFIRCxzQkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUE4QjtJQUV2RCxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsQ0FBQztBQUhELDhCQUdDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBWTtJQUU1QyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRWhDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25CLENBQUM7QUFMRCw0Q0FLQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLElBQVksRUFBRSxJQUE4QjtJQUU3RSxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQy9DLENBQUM7QUFIRCw4Q0FHQztBQUVELFNBQWdCLGFBQWEsQ0FBYSxJQUFZO0lBRXJELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENB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QUFLLEdBQUc7WUFDUCxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JFLEtBQUssR0FBRztZQUNQLE9BQU8sQ0FBQyxTQUFTLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkUsS0FBSyxHQUFHO1lBQ1AsT0FBTztnQkFDTixVQUFVLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO2dCQUNuRCxTQUFTLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO2FBQ2xELENBQUM7UUFDSDtZQUNDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDM0I7QUFDRixDQUFDO0FBakJELGdDQWlCQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrQkUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTcuXG4gKi9cblxuaW1wb3J0IGxvY2tmaWxlID0gcmVxdWlyZSgnQHlhcm5wa2cvbG9ja2ZpbGUnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5LCBJVFNWYWx1ZU9mQXJyYXkgfSBmcm9tICd0cy10eXBlJztcbmltcG9ydCB7IERpZmZTZXJ2aWNlIH0gZnJvbSAneWFybi1sb2NrLWRpZmYvbGliL2RpZmYtc2VydmljZSc7XG5pbXBvcnQgeyBGb3JtYXR0ZXJTZXJ2aWNlIH0gZnJvbSAneWFybi1sb2NrLWRpZmYvbGliL2Zvcm1hdHRlcic7XG5pbXBvcnQgeyBmaW5kUm9vdCwgZnNZYXJuTG9jayB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgZGVlcERpZmYgZnJvbSAnZGVlcC1kaWZmJztcbmltcG9ydCB7IGNvbG9yaXplRGlmZiwgY3JlYXRlRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGNvbnNvbGUgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IERpZmZBcnJheSB9IGZyb20gJ2RlZXAtZGlmZic7XG5pbXBvcnQgeyBDaGFsayB9IGZyb20gJ2NoYWxrJztcbmltcG9ydCB7IElWZXJzaW9uVmFsdWUgfSBmcm9tICcuL2NsaS9uY3UnO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuXG5jb25zdCB7IF9mb3JtYXRWZXJzaW9uIH0gPSBGb3JtYXR0ZXJTZXJ2aWNlO1xuXG5leHBvcnQgaW50ZXJmYWNlIElZYXJuTG9ja2ZpbGVQYXJzZUZ1bGw8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPlxue1xuXHR0eXBlOiBzdHJpbmc7XG5cdG9iamVjdDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+XG59XG5cbmV4cG9ydCB0eXBlIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+ID0gc3RyaW5nW10+ID0gUmVjb3JkPHN0cmluZywgSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93PFQ+PlxuXG4vKipcbiAqIHlhcm4ubG9jayDos4fmlplcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPlxue1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiDlronoo53kvobmupDntrLlnYBcblx0ICovXG5cdHJlc29sdmVkOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBoYXNoIGtleVxuXHQgKi9cblx0aW50ZWdyaXR5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiDkvp3os7TliJfooahcblx0ICovXG5cdGRlcGVuZGVuY2llcz86IElEZXBlbmRlbmNpZXM8VD47XG59XG5cbmV4cG9ydCB0eXBlIElEZXBlbmRlbmNpZXM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPiA9IFJlY29yZDxJVFNWYWx1ZU9mQXJyYXk8VD4sIHN0cmluZz47XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZ1bGwodGV4dDogc3RyaW5nIHwgQnVmZmVyKTogSVlhcm5Mb2NrZmlsZVBhcnNlRnVsbFxue1xuXHRyZXR1cm4gbG9ja2ZpbGUucGFyc2UodGV4dC50b1N0cmluZygpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UodGV4dDogc3RyaW5nIHwgQnVmZmVyKVxue1xuXHRyZXR1cm4gcGFyc2VGdWxsKHRleHQpLm9iamVjdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGpzb246IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdCk6IHN0cmluZ1xue1xuXHRyZXR1cm4gbG9ja2ZpbGUuc3RyaW5naWZ5KGpzb24pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkWWFybkxvY2tmaWxlKGZpbGU6IHN0cmluZylcbntcblx0bGV0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSlcblxuXHRyZXR1cm4gcGFyc2UoZGF0YSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlWWFybkxvY2tmaWxlKGZpbGU6IHN0cmluZywgZGF0YTogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0KVxue1xuXHRyZXR1cm4gZnMud3JpdGVGaWxlU3luYyhmaWxlLCBzdHJpbmdpZnkoZGF0YSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcERlcHNOYW1lPFQgPSBzdHJpbmc+KG5hbWU6IHN0cmluZyk6IFtULCBJVmVyc2lvblZhbHVlXVxue1xuXHRsZXQgbSA9IG5hbWUubWF0Y2goL14oLispQCguKykkLyk7XG5cblx0aWYgKCFtKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbmFtZSBpcyBub3QgZGVwZW5kZW5jaWVzLCAke25hbWV9YClcblx0fVxuXG5cdGxldCByID0gbS5zbGljZSgxKTtcblxuXHQvL2NvbnNvbGUuZGlyKHIpO1xuXHQvL3Byb2Nlc3MuZXhpdCgpXG5cblx0cmV0dXJuIHIgYXMgYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlclJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+XG57XG5cdC8qKlxuXHQgKiB5YXJuLmxvY2sga2V5IOWIl+ihqFxuXHQgKi9cblx0bmFtZXM6IFQsXG5cdC8qKlxuXHQgKiDpgY7mv77lvoznmoQgeWFybiBsb2NrIGRlcHNcblx0ICovXG5cdGRlcHM6IHtcblx0XHQvKipcblx0XHQgKiDmqKHntYTlkI3nqLFcblx0XHQgKi9cblx0XHRbUCBpbiAoa2V5b2YgSVRTVmFsdWVPZkFycmF5PFQ+IHwgc3RyaW5nKV06IHtcblx0XHRcdC8qKlxuXHRcdFx0ICog54mI5pys6LOH5paZXG5cdFx0XHQgKi9cblx0XHRcdFtQIGluIElWZXJzaW9uVmFsdWVdOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c8VD47XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog5a+m6Zqb5a6J6KOd55qE54mI5pys57eo6JmfXG5cdCAqL1xuXHRpbnN0YWxsZWQ/OiB7XG5cdFx0LyoqXG5cdFx0ICog5a+m6Zqb5a6J6KOd55qE54mI5pys57eo6JmfXG5cdFx0ICovXG5cdFx0W1AgaW4gSVRTVmFsdWVPZkFycmF5PFQ+XTogSVZlcnNpb25WYWx1ZVtdO1xuXHR9LFxuXHQvKipcblx0ICog5q+P5YCL5qih57WE5pyA5aSn55qE5a6J6KOd54mI5pysXG5cdCAqL1xuXHRtYXg/OiB7XG5cdFx0LyoqXG5cdFx0ICog5q+P5YCL5qih57WE5pyA5aSn55qE5a6J6KOd54mI5pysXG5cdFx0ICovXG5cdFx0W1AgaW4gSVRTVmFsdWVPZkFycmF5PFQ+XToge1xuXHRcdFx0a2V5OiBJVFNWYWx1ZU9mQXJyYXk8VD4sXG5cdFx0XHR2YWx1ZTogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93PFQ+XG5cdFx0fVxuXHR9LFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyUmVzb2x1dGlvbnM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj4ocGtnOiB7XG5cdHJlc29sdXRpb25zPzogSURlcGVuZGVuY2llczxUPlxufSwgeWFybmxvY2s6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPik6IElGaWx0ZXJSZXNvbHV0aW9uczxUPlxue1xuXHRpZiAocGtnLnJlc29sdXRpb25zKVxuXHR7XG5cdFx0bGV0IGtzID0gT2JqZWN0LmtleXMoeWFybmxvY2spXG5cdFx0XHQuZmlsdGVyKGsgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lKGspWzBdO1xuXHRcdFx0XHRyZXR1cm4gcGtnLnJlc29sdXRpb25zW25dICE9IG51bGxcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIGtzXG5cdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBrKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWU8SVRTVmFsdWVPZkFycmF5PFQ+PihrKTtcblxuXHRcdFx0XHRsZXQgbmFtZSA9IG5bMF07XG5cdFx0XHRcdGxldCBrZXkgPSBuWzFdO1xuXG5cdFx0XHRcdGxldCBkYXRhID0geWFybmxvY2tba107XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQoYS5kZXBzW25hbWVdID0gYS5kZXBzW25hbWVdIHx8IHt9KVtrZXldID0gZGF0YTtcblxuXHRcdFx0XHRhLmluc3RhbGxlZFtuYW1lXSA9IGEuaW5zdGFsbGVkW25bMF1dIHx8IFtdO1xuXG5cdFx0XHRcdGlmICghYS5pbnN0YWxsZWRbbmFtZV0uaW5jbHVkZXMoZGF0YS52ZXJzaW9uKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEuaW5zdGFsbGVkW25hbWVdLnB1c2goZGF0YS52ZXJzaW9uKTtcblxuXHRcdFx0XHRcdGlmIChhLm1heFtuYW1lXSAhPSBudWxsKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChzZW12ZXIubHQoYS5tYXhbbmFtZV0udmFsdWUudmVyc2lvbiwgZGF0YS52ZXJzaW9uKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YS5tYXhbbmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0a2V5OiBrLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBkYXRhLFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YS5tYXhbbmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdGtleTogayxcblx0XHRcdFx0XHRcdFx0dmFsdWU6IGRhdGEsXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fSwge1xuXHRcdFx0XHRuYW1lczoga3MsXG5cdFx0XHRcdGRlcHM6IHt9LFxuXHRcdFx0XHRpbnN0YWxsZWQ6IHt9LFxuXHRcdFx0XHRtYXg6IHt9LFxuXHRcdFx0fSBhcyBJRmlsdGVyUmVzb2x1dGlvbnM8VD4pXG5cdFx0XHQ7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVtb3ZlUmVzb2x1dGlvbnM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj5cbntcblx0LyoqXG5cdCAqIOWft+ihjOWJjeeahCB5YXJuLmxvY2tcblx0ICovXG5cdHlhcm5sb2NrX29sZDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+O1xuXHQvKipcblx0ICog5Z+36KGM5b6M55qEIHlhcm4ubG9ja1xuXHQgKi9cblx0eWFybmxvY2tfbmV3OiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD47XG5cdC8qKlxuXHQgKiB5YXJuLmxvY2sg5piv5ZCm5pyJ6K6K5YuVXG5cdCAqL1xuXHR5YXJubG9ja19jaGFuZ2VkOiBib29sZWFuO1xuXHRyZXN1bHQ6IElGaWx0ZXJSZXNvbHV0aW9uczxUPjtcbn1cblxuLyoqXG4gKlxuICogQGV4YW1wbGUgYGBgXG4gbGV0IHBrZyA9IHJlYWRQYWNrYWdlSnNvbignRzovVXNlcnMvVGhlIFByb2plY3Qvbm9kZWpzLXlhcm4vd3MtY3JlYXRlLXlhcm4td29ya3NwYWNlcy9wYWNrYWdlLmpzb24nKTtcblxuIGxldCB5ID0gcmVhZFlhcm5Mb2NrZmlsZSgnRzovVXNlcnMvVGhlIFByb2plY3Qvbm9kZWpzLXlhcm4vd3MtY3JlYXRlLXlhcm4td29ya3NwYWNlcy95YXJuLmxvY2snKVxuXG4gY29uc29sZS5kaXIocmVtb3ZlUmVzb2x1dGlvbnMocGtnLCB5KSwge1xuXHRkZXB0aDogbnVsbCxcbn0pO1xuIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUmVzb2x1dGlvbnM8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj4ocGtnOiB7XG5cdHJlc29sdXRpb25zPzogSURlcGVuZGVuY2llczxUPlxufSwgeWFybmxvY2tfb2xkOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pOiBJUmVtb3ZlUmVzb2x1dGlvbnM8VD5cbntcblx0bGV0IHJlc3VsdCA9IGZpbHRlclJlc29sdXRpb25zKHBrZywgeWFybmxvY2tfb2xkKTtcblxuXHRyZXR1cm4gcmVtb3ZlUmVzb2x1dGlvbnNDb3JlPFQ+KHJlc3VsdCwgeWFybmxvY2tfb2xkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVJlc29sdXRpb25zQ29yZTxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+PihyZXN1bHQ6IElGaWx0ZXJSZXNvbHV0aW9uczxUPixcblx0eWFybmxvY2tfb2xkOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4sXG4pOiBJUmVtb3ZlUmVzb2x1dGlvbnM8VD5cbntcblx0bGV0IHlhcm5sb2NrX25ldzogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+ID0gcmVzdWx0Lm5hbWVzXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGE6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPiwgYilcblx0XHR7XG5cdFx0XHRkZWxldGUgYVtiXTtcblxuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwge1xuXHRcdFx0Li4ueWFybmxvY2tfb2xkLFxuXHRcdH0pO1xuXG5cdGxldCB5YXJubG9ja19jaGFuZ2VkID0gISFyZXN1bHQubmFtZXMubGVuZ3RoO1xuXG5cdHJldHVybiB7XG5cdFx0LyoqXG5cdFx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9ja1xuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX29sZCxcblx0XHQvKipcblx0XHQgKiDln7fooYzlvoznmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfbmV3LFxuXHRcdC8qKlxuXHRcdCAqIHlhcm4ubG9jayDmmK/lkKbmnInororli5Vcblx0XHQgKi9cblx0XHR5YXJubG9ja19jaGFuZ2VkLFxuXG5cdFx0cmVzdWx0LFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5YXJuTG9ja0RpZmYoeWFybmxvY2tfb2xkOiBzdHJpbmcsIHlhcm5sb2NrX25ldzogc3RyaW5nKTogc3RyaW5nXG57XG5cdGxldCB7IGNoYWxrIH0gPSBjb25zb2xlO1xuXHRsZXQgX29rID0gZmFsc2U7XG5cblx0Y29uc3QgdGFibGUgPSBjcmVhdGVEZXBlbmRlbmN5VGFibGUoKTtcblxuXHR0YWJsZS5vcHRpb25zLmNvbEFsaWducyA9IFsnbGVmdCcsICdjZW50ZXInLCAnY2VudGVyJywgJ2NlbnRlciddO1xuXHR0YWJsZS5vcHRpb25zLmhlYWQgPSBbXG5cdFx0Y2hhbGsuYm9sZC5yZXNldCgncGFja2FnZSBuYW1lJyksXG5cdFx0Y2hhbGsuYm9sZC5yZXNldCgnb2xkIHZlcnNpb24ocyknKSxcblx0XHQnJyxcblx0XHRjaGFsay5ib2xkLnJlc2V0KCduZXcgdmVyc2lvbihzKScpLFxuXHRdO1xuXG5cdERpZmZTZXJ2aWNlLmJ1aWxkRGlmZihbeWFybmxvY2tfb2xkXSwgW3lhcm5sb2NrX25ld10pXG5cdFx0Lm1hcChmdW5jdGlvbiAoZGlmZilcblx0XHR7XG5cdFx0XHRsZXQgZm9ybWF0ZWREaWZmOiB7XG5cdFx0XHRcdFtrOiBzdHJpbmddOiBbc3RyaW5nLCBzdHJpbmcsIHN0cmluZywgc3RyaW5nXTtcblx0XHRcdH0gPSB7fTtcblxuXHRcdFx0Y29uc3QgTk9ORSA9IGNoYWxrLnJlZCgnLScpO1xuXHRcdFx0Y29uc3QgQVJST1cgPSBjaGFsay5ncmF5KCfihpInKTtcblxuXHRcdFx0ZGlmZlxuXHRcdFx0XHQubWFwKHBhY2thZ2VEaWZmID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBwYXRoOiBzdHJpbmcgPSBwYWNrYWdlRGlmZi5wYXRoLmZpbmQoKCkgPT4gdHJ1ZSk7XG5cblx0XHRcdFx0XHRfb2sgPSB0cnVlO1xuXG5cdFx0XHRcdFx0bGV0IF9hcnI6IFtzdHJpbmcsIHN0cmluZywgc3RyaW5nLCBzdHJpbmddO1xuXG5cdFx0XHRcdFx0c3dpdGNoIChwYWNrYWdlRGlmZi5raW5kKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNhc2UgJ0EnOlxuXG5cdFx0XHRcdFx0XHRcdGxldCBkaWZmQXJyYXkgPSBfZGlmZkFycmF5KHBhY2thZ2VEaWZmLCBjaGFsayk7XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtwYXRoLCBjaGFsay5ncmF5KGRpZmZBcnJheVswXSksIEFSUk9XLCBjaGFsay5ncmF5KGRpZmZBcnJheVsxXSldO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAnRCc6XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtjaGFsay5yZWQocGF0aCksIGNoYWxrLnJlZChfZm9ybWF0VmVyc2lvbihwYWNrYWdlRGlmZi5saHMpKSwgQVJST1csIE5PTkVdO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAnRSc6XG5cblx0XHRcdFx0XHRcdFx0bGV0IGxoczAgPSBfZm9ybWF0VmVyc2lvbihwYWNrYWdlRGlmZi5saHMpO1xuXHRcdFx0XHRcdFx0XHRsZXQgcmhzMCA9IF9mb3JtYXRWZXJzaW9uKHBhY2thZ2VEaWZmLnJocyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGxocyA9IGNoYWxrLnllbGxvdyhsaHMwKTtcblx0XHRcdFx0XHRcdFx0bGV0IHJocyA9IGNoYWxrLnllbGxvdyhjb2xvcml6ZURpZmYobGhzMCwgcmhzMCkpO1xuXG5cdFx0XHRcdFx0XHRcdF9hcnIgPSBbY2hhbGsueWVsbG93KHBhdGgpLCBsaHMsIEFSUk9XLCByaHNdO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAnTic6XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtjaGFsay5ncmVlbihwYXRoKSwgTk9ORSwgQVJST1csIGNoYWxrLmdyZWVuKF9mb3JtYXRWZXJzaW9uKHBhY2thZ2VEaWZmLnJocykpXTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRfYXJyICYmIChmb3JtYXRlZERpZmZbcGF0aF0gPSBfYXJyKTtcblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHR0YWJsZS5wdXNoKC4uLk9iamVjdC52YWx1ZXMoZm9ybWF0ZWREaWZmKSlcblx0XHR9KVxuXHQ7XG5cblx0cmV0dXJuIF9vayA/IHRhYmxlLnRvU3RyaW5nKCkgOiAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9kaWZmQXJyYXkoYXJyYXk6IGRlZXBEaWZmLkRpZmZBcnJheTx7fSwge30+LCBjaGFsazogQ2hhbGspXG57XG5cdGNvbnN0IGl0ZW0gPSBhcnJheS5pdGVtO1xuXHRzd2l0Y2ggKGl0ZW0ua2luZClcblx0e1xuXHRcdGNhc2UgXCJOXCI6XG5cdFx0XHRyZXR1cm4gW2BbLi4uXWAsIGBbLi4uLCAke2NoYWxrLmdyZWVuKF9mb3JtYXRWZXJzaW9uKGl0ZW0ucmhzKSl9XWBdO1xuXHRcdGNhc2UgXCJEXCI6XG5cdFx0XHRyZXR1cm4gW2BbLi4uLCAke2NoYWxrLnJlZChfZm9ybWF0VmVyc2lvbihpdGVtLmxocykpfV1gLCBgWy4uLl1gXTtcblx0XHRjYXNlIFwiRVwiOlxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0YFsuLi5dLCAke2NoYWxrLnllbGxvdyhfZm9ybWF0VmVyc2lvbihpdGVtLmxocykpfV1gLFxuXHRcdFx0XHRgWy4uLiwgJHtjaGFsay55ZWxsb3coX2Zvcm1hdFZlcnNpb24oaXRlbS5saHMpKX1dYCxcblx0XHRcdF07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBbYFsuLi5dYCwgYFsuLi5dYF07XG5cdH1cbn1cblxuLypcbmV4cG9ydCBmdW5jdGlvbiB5YXJuTG9ja0RpZmYyKHlhcm5sb2NrX29sZDogc3RyaW5nLCB5YXJubG9ja19uZXc6IHN0cmluZyk6IHN0cmluZ1xue1xuXHRsZXQgcjI6IHN0cmluZ1tdID0gW107XG5cblx0bGV0IHIgPSBEaWZmU2VydmljZS5idWlsZERpZmYoW3lhcm5sb2NrX29sZF0sIFt5YXJubG9ja19uZXddKVxuXHRcdC5tYXAoRm9ybWF0dGVyU2VydmljZS5idWlsZERpZmZUYWJsZSlcblx0XHQubWFwKHIgPT4gcjIucHVzaChyKSlcblx0O1xuXG5cdHJldHVybiByMlswXTtcbn1cbiAqL1xuXG4vKlxubGV0IHJldCA9IGZzWWFybkxvY2soZmluZFJvb3Qoe1xuXHRjd2Q6IHByb2Nlc3MuY3dkKCksXG59KS5yb290KTtcblxubGV0IG9iID0gcGFyc2UocmV0Lnlhcm5sb2NrX29sZCk7XG5cbmxldCByZXQyID0gcmVtb3ZlUmVzb2x1dGlvbnMoe1xuXHRyZXNvbHV0aW9uczoge1xuXHRcdCdzZW12ZXInOiAnJyxcblx0XHQncGtnLWRpcic6ICcnLFxuXHRcdCdpcy1ucG0nOiAnJyxcblx0fSxcbn0sIG9iKTtcblxubGV0IHMgPSB5YXJuTG9ja0RpZmYoc3RyaW5naWZ5KG9iKSwgc3RyaW5naWZ5KHJldDIueWFybmxvY2tfbmV3KSk7XG5cbmNvbnNvbGUubG9nKHMpO1xuKi9cbiJdfQ==