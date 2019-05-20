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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ5YXJubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsOENBQStDO0FBQy9DLCtCQUFnQztBQUVoQyxrRUFBOEQ7QUFDOUQsNERBQWdFO0FBR2hFLG1DQUE4RDtBQUM5RCxtQ0FBZ0Q7QUFJaEQsaUNBQWtDO0FBRWxDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyw0QkFBZ0IsQ0FBQztBQWdDNUMsU0FBZ0IsU0FBUyxDQUFDLElBQXFCO0lBRTlDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUN2QyxDQUFDO0FBSEQsOEJBR0M7QUFFRCxTQUFnQixLQUFLLENBQUMsSUFBcUI7SUFFMUMsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFBO0FBQzlCLENBQUM7QUFIRCxzQkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUE4QjtJQUV2RCxPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsQ0FBQztBQUhELDhCQUdDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBWTtJQUU1QyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRWhDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25CLENBQUM7QUFMRCw0Q0FLQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLElBQVksRUFBRSxJQUE4QjtJQUU3RSxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQy9DLENBQUM7QUFIRCw4Q0FHQztBQUVELFNBQWdCLGFBQWEsQ0FBYSxJQUFZO0lBRXJELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMs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LENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFDdEQ7b0JBQ0MsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRzt3QkFDYixHQUFHLEVBQUUsQ0FBQzt3QkFDTixLQUFLLEVBQUUsSUFBSTtxQkFDWCxDQUFDO2lCQUNGO2FBQ0Q7aUJBRUQ7Z0JBQ0MsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRztvQkFDYixHQUFHLEVBQUUsQ0FBQztvQkFDTixLQUFLLEVBQUUsSUFBSTtpQkFDWCxDQUFDO2FBQ0Y7U0FDRDtRQUVELE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxFQUFFO1FBQ0YsS0FBSyxFQUFFLEVBQUU7UUFDVCxJQUFJLEVBQUUsRUFBRTtRQUNSLFNBQVMsRUFBRSxFQUFFO1FBQ2IsR0FBRyxFQUFFLEVBQUU7S0FDa0IsQ0FBQyxDQUMxQjtBQUNILENBQUM7QUExREQsd0NBMERDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE3LlxuICovXG5cbmltcG9ydCBsb2NrZmlsZSA9IHJlcXVpcmUoJ0B5YXJucGtnL2xvY2tmaWxlJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seSwgSVRTVmFsdWVPZkFycmF5IH0gZnJvbSAndHMtdHlwZSc7XG5pbXBvcnQgeyBEaWZmU2VydmljZSB9IGZyb20gJ3lhcm4tbG9jay1kaWZmL2xpYi9kaWZmLXNlcnZpY2UnO1xuaW1wb3J0IHsgRm9ybWF0dGVyU2VydmljZSB9IGZyb20gJ3lhcm4tbG9jay1kaWZmL2xpYi9mb3JtYXR0ZXInO1xuaW1wb3J0IHsgZmluZFJvb3QsIGZzWWFybkxvY2sgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIGRlZXBEaWZmIGZyb20gJ2RlZXAtZGlmZic7XG5pbXBvcnQgeyBjb2xvcml6ZURpZmYsIGNyZWF0ZURlcGVuZGVuY3lUYWJsZSB9IGZyb20gJy4vdGFibGUnO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBjb25zb2xlIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgeyBEaWZmQXJyYXkgfSBmcm9tICdkZWVwLWRpZmYnO1xuaW1wb3J0IHsgQ2hhbGsgfSBmcm9tICdjaGFsayc7XG5pbXBvcnQgeyBJVmVyc2lvblZhbHVlIH0gZnJvbSAnLi9jbGkvbmN1JztcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuY29uc3QgeyBfZm9ybWF0VmVyc2lvbiB9ID0gRm9ybWF0dGVyU2VydmljZTtcblxuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VGdWxsPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT5cbntcblx0dHlwZTogc3RyaW5nO1xuXHRvYmplY3Q6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPlxufVxuXG5leHBvcnQgdHlwZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPiA9IFJlY29yZDxzdHJpbmcsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdzxUPj5cblxuLyoqXG4gKiB5YXJuLmxvY2sg6LOH5paZXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93PFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT5cbntcblx0dmVyc2lvbjogc3RyaW5nO1xuXHQvKipcblx0ICog5a6J6KOd5L6G5rqQ57ay5Z2AXG5cdCAqL1xuXHRyZXNvbHZlZDogc3RyaW5nO1xuXHQvKipcblx0ICogaGFzaCBrZXlcblx0ICovXG5cdGludGVncml0eTogc3RyaW5nO1xuXHQvKipcblx0ICog5L6d6LO05YiX6KGoXG5cdCAqL1xuXHRkZXBlbmRlbmNpZXM/OiBJRGVwZW5kZW5jaWVzPFQ+O1xufVxuXG5leHBvcnQgdHlwZSBJRGVwZW5kZW5jaWVzPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT4gPSBSZWNvcmQ8SVRTVmFsdWVPZkFycmF5PFQ+LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGdWxsKHRleHQ6IHN0cmluZyB8IEJ1ZmZlcik6IElZYXJuTG9ja2ZpbGVQYXJzZUZ1bGxcbntcblx0cmV0dXJuIGxvY2tmaWxlLnBhcnNlKHRleHQudG9TdHJpbmcoKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHRleHQ6IHN0cmluZyB8IEJ1ZmZlcilcbntcblx0cmV0dXJuIHBhcnNlRnVsbCh0ZXh0KS5vYmplY3Rcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShqc29uOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3QpOiBzdHJpbmdcbntcblx0cmV0dXJuIGxvY2tmaWxlLnN0cmluZ2lmeShqc29uKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFlhcm5Mb2NrZmlsZShmaWxlOiBzdHJpbmcpXG57XG5cdGxldCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpXG5cblx0cmV0dXJuIHBhcnNlKGRhdGEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVlhcm5Mb2NrZmlsZShmaWxlOiBzdHJpbmcsIGRhdGE6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdClcbntcblx0cmV0dXJuIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgc3RyaW5naWZ5KGRhdGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBEZXBzTmFtZTxUID0gc3RyaW5nPihuYW1lOiBzdHJpbmcpOiBbVCwgSVZlcnNpb25WYWx1ZV1cbntcblx0bGV0IG0gPSBuYW1lLm1hdGNoKC9eKEA/Lis/KUAoLispJC8pO1xuXG5cdGlmICghbSlcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYG5hbWUgaXMgbm90IGRlcGVuZGVuY2llcywgJHtuYW1lfWApXG5cdH1cblxuXHRsZXQgciA9IG0uc2xpY2UoMSk7XG5cblx0Ly9jb25zb2xlLmRpcihyKTtcblx0Ly9wcm9jZXNzLmV4aXQoKVxuXG5cdHJldHVybiByIGFzIGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElGaWx0ZXJSZXNvbHV0aW9uczxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+Plxue1xuXHQvKipcblx0ICogeWFybi5sb2NrIGtleSDliJfooahcblx0ICovXG5cdG5hbWVzOiBULFxuXHQvKipcblx0ICog6YGO5r++5b6M55qEIHlhcm4gbG9jayBkZXBzXG5cdCAqL1xuXHRkZXBzOiB7XG5cdFx0LyoqXG5cdFx0ICog5qih57WE5ZCN56ixXG5cdFx0ICovXG5cdFx0W1AgaW4gKGtleW9mIElUU1ZhbHVlT2ZBcnJheTxUPiB8IHN0cmluZyldOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIOeJiOacrOizh+aWmVxuXHRcdFx0ICovXG5cdFx0XHRbUCBpbiBJVmVyc2lvblZhbHVlXTogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93PFQ+O1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIOWvpumam+WuieijneeahOeJiOacrOe3qOiZn1xuXHQgKi9cblx0aW5zdGFsbGVkPzoge1xuXHRcdC8qKlxuXHRcdCAqIOWvpumam+WuieijneeahOeJiOacrOe3qOiZn1xuXHRcdCAqL1xuXHRcdFtQIGluIElUU1ZhbHVlT2ZBcnJheTxUPl06IElWZXJzaW9uVmFsdWVbXTtcblx0fSxcblx0LyoqXG5cdCAqIOavj+WAi+aooee1hOacgOWkp+eahOWuieijneeJiOacrFxuXHQgKi9cblx0bWF4Pzoge1xuXHRcdC8qKlxuXHRcdCAqIOavj+WAi+aooee1hOacgOWkp+eahOWuieijneeJiOacrFxuXHRcdCAqL1xuXHRcdFtQIGluIElUU1ZhbHVlT2ZBcnJheTxUPl06IHtcblx0XHRcdGtleTogSVRTVmFsdWVPZkFycmF5PFQ+LFxuXHRcdFx0dmFsdWU6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdzxUPlxuXHRcdH1cblx0fSxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlclJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHBrZzoge1xuXHRyZXNvbHV0aW9ucz86IElEZXBlbmRlbmNpZXM8VD5cbn0sIHlhcm5sb2NrOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pOiBJRmlsdGVyUmVzb2x1dGlvbnM8VD5cbntcblx0aWYgKHBrZy5yZXNvbHV0aW9ucylcblx0e1xuXHRcdHJldHVybiBleHBvcnRZYXJuTG9jayh5YXJubG9jaywgKGtleSwgaW5kZXgsIGFycmF5X2tleXMsIHlhcm5sb2NrMSkgPT4ge1xuXHRcdFx0bGV0IG5hbWUgPSBzdHJpcERlcHNOYW1lKGtleSlbMF07XG5cdFx0XHRyZXR1cm4gcGtnLnJlc29sdXRpb25zW25hbWVdICE9IG51bGxcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlbW92ZVJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+XG57XG5cdC8qKlxuXHQgKiDln7fooYzliY3nmoQgeWFybi5sb2NrXG5cdCAqL1xuXHR5YXJubG9ja19vbGQ6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPjtcblx0LyoqXG5cdCAqIOWft+ihjOW+jOeahCB5YXJuLmxvY2tcblx0ICovXG5cdHlhcm5sb2NrX25ldzogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+O1xuXHQvKipcblx0ICogeWFybi5sb2NrIOaYr+WQpuacieiuiuWLlVxuXHQgKi9cblx0eWFybmxvY2tfY2hhbmdlZDogYm9vbGVhbjtcblx0cmVzdWx0OiBJRmlsdGVyUmVzb2x1dGlvbnM8VD47XG59XG5cbi8qKlxuICpcbiAqIEBleGFtcGxlIGBgYFxuIGxldCBwa2cgPSByZWFkUGFja2FnZUpzb24oJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMvcGFja2FnZS5qc29uJyk7XG5cbiBsZXQgeSA9IHJlYWRZYXJuTG9ja2ZpbGUoJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFybi5sb2NrJylcblxuIGNvbnNvbGUuZGlyKHJlbW92ZVJlc29sdXRpb25zKHBrZywgeSksIHtcblx0ZGVwdGg6IG51bGwsXG59KTtcbiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHBrZzoge1xuXHRyZXNvbHV0aW9ucz86IElEZXBlbmRlbmNpZXM8VD5cbn0sIHlhcm5sb2NrX29sZDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+KTogSVJlbW92ZVJlc29sdXRpb25zPFQ+XG57XG5cdGxldCByZXN1bHQgPSBmaWx0ZXJSZXNvbHV0aW9ucyhwa2csIHlhcm5sb2NrX29sZCk7XG5cblx0cmV0dXJuIHJlbW92ZVJlc29sdXRpb25zQ29yZTxUPihyZXN1bHQsIHlhcm5sb2NrX29sZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVSZXNvbHV0aW9uc0NvcmU8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPj4ocmVzdWx0OiBJRmlsdGVyUmVzb2x1dGlvbnM8VD4sXG5cdHlhcm5sb2NrX29sZDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+LFxuKTogSVJlbW92ZVJlc29sdXRpb25zPFQ+XG57XG5cdGxldCB5YXJubG9ja19uZXc6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPiA9IHJlc3VsdC5uYW1lc1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChhOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4sIGIpXG5cdFx0e1xuXHRcdFx0ZGVsZXRlIGFbYl07XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIHtcblx0XHRcdC4uLnlhcm5sb2NrX29sZCxcblx0XHR9KTtcblxuXHRsZXQgeWFybmxvY2tfY2hhbmdlZCA9ICEhcmVzdWx0Lm5hbWVzLmxlbmd0aDtcblxuXHRyZXR1cm4ge1xuXHRcdC8qKlxuXHRcdCAqIOWft+ihjOWJjeeahCB5YXJuLmxvY2tcblx0XHQgKi9cblx0XHR5YXJubG9ja19vbGQsXG5cdFx0LyoqXG5cdFx0ICog5Z+36KGM5b6M55qEIHlhcm4ubG9ja1xuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX25ldyxcblx0XHQvKipcblx0XHQgKiB5YXJuLmxvY2sg5piv5ZCm5pyJ6K6K5YuVXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfY2hhbmdlZCxcblxuXHRcdHJlc3VsdCxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24geWFybkxvY2tEaWZmKHlhcm5sb2NrX29sZDogc3RyaW5nLCB5YXJubG9ja19uZXc6IHN0cmluZyk6IHN0cmluZ1xue1xuXHRsZXQgeyBjaGFsayB9ID0gY29uc29sZTtcblx0bGV0IF9vayA9IGZhbHNlO1xuXG5cdGNvbnN0IHRhYmxlID0gY3JlYXRlRGVwZW5kZW5jeVRhYmxlKCk7XG5cblx0dGFibGUub3B0aW9ucy5jb2xBbGlnbnMgPSBbJ2xlZnQnLCAnY2VudGVyJywgJ2NlbnRlcicsICdjZW50ZXInXTtcblx0dGFibGUub3B0aW9ucy5oZWFkID0gW1xuXHRcdGNoYWxrLmJvbGQucmVzZXQoJ3BhY2thZ2UgbmFtZScpLFxuXHRcdGNoYWxrLmJvbGQucmVzZXQoJ29sZCB2ZXJzaW9uKHMpJyksXG5cdFx0JycsXG5cdFx0Y2hhbGsuYm9sZC5yZXNldCgnbmV3IHZlcnNpb24ocyknKSxcblx0XTtcblxuXHREaWZmU2VydmljZS5idWlsZERpZmYoW3lhcm5sb2NrX29sZF0sIFt5YXJubG9ja19uZXddKVxuXHRcdC5tYXAoZnVuY3Rpb24gKGRpZmYpXG5cdFx0e1xuXHRcdFx0bGV0IGZvcm1hdGVkRGlmZjoge1xuXHRcdFx0XHRbazogc3RyaW5nXTogW3N0cmluZywgc3RyaW5nLCBzdHJpbmcsIHN0cmluZ107XG5cdFx0XHR9ID0ge307XG5cblx0XHRcdGNvbnN0IE5PTkUgPSBjaGFsay5yZWQoJy0nKTtcblx0XHRcdGNvbnN0IEFSUk9XID0gY2hhbGsuZ3JheSgn4oaSJyk7XG5cblx0XHRcdGRpZmZcblx0XHRcdFx0Lm1hcChwYWNrYWdlRGlmZiA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgcGF0aDogc3RyaW5nID0gcGFja2FnZURpZmYucGF0aC5maW5kKCgpID0+IHRydWUpO1xuXG5cdFx0XHRcdFx0X29rID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGxldCBfYXJyOiBbc3RyaW5nLCBzdHJpbmcsIHN0cmluZywgc3RyaW5nXTtcblxuXHRcdFx0XHRcdHN3aXRjaCAocGFja2FnZURpZmYua2luZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjYXNlICdBJzpcblxuXHRcdFx0XHRcdFx0XHRsZXQgZGlmZkFycmF5ID0gX2RpZmZBcnJheShwYWNrYWdlRGlmZiwgY2hhbGspO1xuXG5cdFx0XHRcdFx0XHRcdF9hcnIgPSBbcGF0aCwgY2hhbGsuZ3JheShkaWZmQXJyYXlbMF0pLCBBUlJPVywgY2hhbGsuZ3JheShkaWZmQXJyYXlbMV0pXTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgJ0QnOlxuXG5cdFx0XHRcdFx0XHRcdF9hcnIgPSBbY2hhbGsucmVkKHBhdGgpLCBjaGFsay5yZWQoX2Zvcm1hdFZlcnNpb24ocGFja2FnZURpZmYubGhzKSksIEFSUk9XLCBOT05FXTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgJ0UnOlxuXG5cdFx0XHRcdFx0XHRcdGxldCBsaHMwID0gX2Zvcm1hdFZlcnNpb24ocGFja2FnZURpZmYubGhzKTtcblx0XHRcdFx0XHRcdFx0bGV0IHJoczAgPSBfZm9ybWF0VmVyc2lvbihwYWNrYWdlRGlmZi5yaHMpO1xuXG5cdFx0XHRcdFx0XHRcdGxldCBsaHMgPSBjaGFsay55ZWxsb3cobGhzMCk7XG5cdFx0XHRcdFx0XHRcdGxldCByaHMgPSBjaGFsay55ZWxsb3coY29sb3JpemVEaWZmKGxoczAsIHJoczApKTtcblxuXHRcdFx0XHRcdFx0XHRfYXJyID0gW2NoYWxrLnllbGxvdyhwYXRoKSwgbGhzLCBBUlJPVywgcmhzXTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgJ04nOlxuXG5cdFx0XHRcdFx0XHRcdF9hcnIgPSBbY2hhbGsuZ3JlZW4ocGF0aCksIE5PTkUsIEFSUk9XLCBjaGFsay5ncmVlbihfZm9ybWF0VmVyc2lvbihwYWNrYWdlRGlmZi5yaHMpKV07XG5cblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0X2FyciAmJiAoZm9ybWF0ZWREaWZmW3BhdGhdID0gX2Fycik7XG5cblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0dGFibGUucHVzaCguLi5PYmplY3QudmFsdWVzKGZvcm1hdGVkRGlmZikpXG5cdFx0fSlcblx0O1xuXG5cdHJldHVybiBfb2sgPyB0YWJsZS50b1N0cmluZygpIDogJyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZGlmZkFycmF5KGFycmF5OiBkZWVwRGlmZi5EaWZmQXJyYXk8e30sIHt9PiwgY2hhbGs6IENoYWxrKVxue1xuXHRjb25zdCBpdGVtID0gYXJyYXkuaXRlbTtcblx0c3dpdGNoIChpdGVtLmtpbmQpXG5cdHtcblx0XHRjYXNlIFwiTlwiOlxuXHRcdFx0cmV0dXJuIFtgWy4uLl1gLCBgWy4uLiwgJHtjaGFsay5ncmVlbihfZm9ybWF0VmVyc2lvbihpdGVtLnJocykpfV1gXTtcblx0XHRjYXNlIFwiRFwiOlxuXHRcdFx0cmV0dXJuIFtgWy4uLiwgJHtjaGFsay5yZWQoX2Zvcm1hdFZlcnNpb24oaXRlbS5saHMpKX1dYCwgYFsuLi5dYF07XG5cdFx0Y2FzZSBcIkVcIjpcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdGBbLi4uXSwgJHtjaGFsay55ZWxsb3coX2Zvcm1hdFZlcnNpb24oaXRlbS5saHMpKX1dYCxcblx0XHRcdFx0YFsuLi4sICR7Y2hhbGsueWVsbG93KF9mb3JtYXRWZXJzaW9uKGl0ZW0ubGhzKSl9XWAsXG5cdFx0XHRdO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gW2BbLi4uXWAsIGBbLi4uXWBdO1xuXHR9XG59XG5cbi8qXG5leHBvcnQgZnVuY3Rpb24geWFybkxvY2tEaWZmMih5YXJubG9ja19vbGQ6IHN0cmluZywgeWFybmxvY2tfbmV3OiBzdHJpbmcpOiBzdHJpbmdcbntcblx0bGV0IHIyOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGxldCByID0gRGlmZlNlcnZpY2UuYnVpbGREaWZmKFt5YXJubG9ja19vbGRdLCBbeWFybmxvY2tfbmV3XSlcblx0XHQubWFwKEZvcm1hdHRlclNlcnZpY2UuYnVpbGREaWZmVGFibGUpXG5cdFx0Lm1hcChyID0+IHIyLnB1c2gocikpXG5cdDtcblxuXHRyZXR1cm4gcjJbMF07XG59XG4gKi9cblxuLypcbmxldCByZXQgPSBmc1lhcm5Mb2NrKGZpbmRSb290KHtcblx0Y3dkOiBwcm9jZXNzLmN3ZCgpLFxufSkucm9vdCk7XG5cbmxldCBvYiA9IHBhcnNlKHJldC55YXJubG9ja19vbGQpO1xuXG5sZXQgcmV0MiA9IHJlbW92ZVJlc29sdXRpb25zKHtcblx0cmVzb2x1dGlvbnM6IHtcblx0XHQnc2VtdmVyJzogJycsXG5cdFx0J3BrZy1kaXInOiAnJyxcblx0XHQnaXMtbnBtJzogJycsXG5cdH0sXG59LCBvYik7XG5cbmxldCBzID0geWFybkxvY2tEaWZmKHN0cmluZ2lmeShvYiksIHN0cmluZ2lmeShyZXQyLnlhcm5sb2NrX25ldykpO1xuXG5jb25zb2xlLmxvZyhzKTtcbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJEdXBsaWNhdGVZYXJuTG9jazxUIGV4dGVuZHMgSVRTQXJyYXlMaXN0TWF5YmVSZWFkb25seTxzdHJpbmc+Pih5YXJubG9jazogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+KVxue1xuXHRsZXQgZnkgPSBleHBvcnRZYXJuTG9jayh5YXJubG9jayk7XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMoZnkuaW5zdGFsbGVkKVxuXHRcdC5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKVxuXHRcdHtcblx0XHRcdHJldHVybiBmeS5pbnN0YWxsZWRbdmFsdWVdLmxlbmd0aCA+IDFcblx0XHR9KVxuXHQ7XG5cblx0cmV0dXJuIGV4cG9ydFlhcm5Mb2NrKHlhcm5sb2NrLCAoa2V5LCBpbmRleCwgYXJyYXlfa2V5cywgeWFybmxvY2sxKSA9PiB7XG5cdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lPElUU1ZhbHVlT2ZBcnJheTxUPj4oa2V5KVswXTtcblxuXHRcdHJldHVybiBrcy5pbmNsdWRlcyhuKVxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFlhcm5Mb2NrPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHlhcm5sb2NrOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4sIGZpbHRlcj86IChrZXk6IGtleW9mIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPiwgaW5kZXg6IG51bWJlciwgYXJyYXlfa2V5czogKGtleW9mIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPilbXSwgeWFybmxvY2s6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPikgPT4gYm9vbGVhbik6IElGaWx0ZXJSZXNvbHV0aW9uczxUPlxue1xuXHRsZXQga3MgPSBPYmplY3Qua2V5cyh5YXJubG9jayk7XG5cblx0aWYgKGZpbHRlcilcblx0e1xuXHRcdGtzID0ga3Ncblx0XHRcdC5maWx0ZXIoKHZhbHVlLCBpbmRleCwgYXJyYXkpID0+IHtcblx0XHRcdFx0cmV0dXJuIGZpbHRlcih2YWx1ZSwgaW5kZXgsIGFycmF5LCB5YXJubG9jaylcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIGtzXG5cdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgaylcblx0XHR7XG5cdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWU8SVRTVmFsdWVPZkFycmF5PFQ+PihrKTtcblxuXHRcdFx0bGV0IG5hbWUgPSBuWzBdO1xuXHRcdFx0bGV0IGtleSA9IG5bMV07XG5cblx0XHRcdGxldCBkYXRhID0geWFybmxvY2tba107XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdChhLmRlcHNbbmFtZV0gPSBhLmRlcHNbbmFtZV0gfHwge30pW2tleV0gPSBkYXRhO1xuXG5cdFx0XHRhLmluc3RhbGxlZFtuYW1lXSA9IGEuaW5zdGFsbGVkW25bMF1dIHx8IFtdO1xuXG5cdFx0XHRpZiAoIWEuaW5zdGFsbGVkW25hbWVdLmluY2x1ZGVzKGRhdGEudmVyc2lvbikpXG5cdFx0XHR7XG5cdFx0XHRcdGEuaW5zdGFsbGVkW25hbWVdLnB1c2goZGF0YS52ZXJzaW9uKTtcblxuXHRcdFx0XHRpZiAoYS5tYXhbbmFtZV0gIT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChzZW12ZXIubHQoYS5tYXhbbmFtZV0udmFsdWUudmVyc2lvbiwgZGF0YS52ZXJzaW9uKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhLm1heFtuYW1lXSA9IHtcblx0XHRcdFx0XHRcdFx0a2V5OiBrLFxuXHRcdFx0XHRcdFx0XHR2YWx1ZTogZGF0YSxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEubWF4W25hbWVdID0ge1xuXHRcdFx0XHRcdFx0a2V5OiBrLFxuXHRcdFx0XHRcdFx0dmFsdWU6IGRhdGEsXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYTtcblx0XHR9LCB7XG5cdFx0XHRuYW1lczoga3MsXG5cdFx0XHRkZXBzOiB7fSxcblx0XHRcdGluc3RhbGxlZDoge30sXG5cdFx0XHRtYXg6IHt9LFxuXHRcdH0gYXMgSUZpbHRlclJlc29sdXRpb25zPFQ+KVxuXHRcdDtcbn1cbiJdfQ==