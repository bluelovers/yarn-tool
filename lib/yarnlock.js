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
            a.deps[n[0]] = a.deps[n[1]] || [];
            a.deps[n[0]][n[1]] = yarnlock[k];
            return a;
        }, {
            names: ks,
            deps: {},
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ5YXJubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsOENBQStDO0FBQy9DLCtCQUFnQztBQUVoQyxrRUFBOEQ7QUFDOUQsNERBQWdFO0FBR2hFLG1DQUE4RDtBQUM5RCxtQ0FBZ0Q7QUFJaEQsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLDRCQUFnQixDQUFDO0FBb0I1QyxTQUFnQixTQUFTLENBQUMsSUFBcUI7SUFFOUMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZDLENBQUM7QUFIRCw4QkFHQztBQUVELFNBQWdCLEtBQUssQ0FBQyxJQUFxQjtJQUUxQyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUE7QUFDOUIsQ0FBQztBQUhELHNCQUdDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQVk7SUFFckMsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLENBQUM7QUFIRCw4QkFHQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLElBQVk7SUFFNUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVoQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNuQixDQUFDO0FBTEQsNENBS0M7QUFFRCxTQUFnQixhQUFhLENBQUMsSUFBWTtJQUV6QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRWxDLElBQUksQ0FBQyxDQUFDLEVBQ047UUFDQyxNQUFNLElBQUksU0FBUyxDQUFDLDZCQUE2QixJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQ3hEO0lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQXFCLENBQUM7SUFF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LElBQUksRUFDakI7UUFDQyxLQUFLLEdBQUc7WUFDUCxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JFLEtBQUssR0FBRztZQUNQLE9BQU8sQ0FBQyxTQUFTLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkUsS0FBSyxHQUFHO1lBQ1AsT0FBTztnQkFDTixVQUFVLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO2dCQUNuRCxTQUFTLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO2FBQ2xELENBQUM7UUFDSDtZQUNDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDM0I7QUFDRixDQUFDO0FBakJELGdDQWlCQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrQkUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTcuXG4gKi9cblxuaW1wb3J0IGxvY2tmaWxlID0gcmVxdWlyZSgnQHlhcm5wa2cvbG9ja2ZpbGUnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5LCBJVFNWYWx1ZU9mQXJyYXkgfSBmcm9tICd0cy10eXBlJztcbmltcG9ydCB7IERpZmZTZXJ2aWNlIH0gZnJvbSAneWFybi1sb2NrLWRpZmYvbGliL2RpZmYtc2VydmljZSc7XG5pbXBvcnQgeyBGb3JtYXR0ZXJTZXJ2aWNlIH0gZnJvbSAneWFybi1sb2NrLWRpZmYvbGliL2Zvcm1hdHRlcic7XG5pbXBvcnQgeyBmaW5kUm9vdCwgZnNZYXJuTG9jayB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgZGVlcERpZmYgZnJvbSAnZGVlcC1kaWZmJztcbmltcG9ydCB7IGNvbG9yaXplRGlmZiwgY3JlYXRlRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGNvbnNvbGUgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IERpZmZBcnJheSB9IGZyb20gJ2RlZXAtZGlmZic7XG5pbXBvcnQgeyBDaGFsayB9IGZyb20gJ2NoYWxrJztcblxuY29uc3QgeyBfZm9ybWF0VmVyc2lvbiB9ID0gRm9ybWF0dGVyU2VydmljZTtcblxuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VGdWxsPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT5cbntcblx0dHlwZTogc3RyaW5nO1xuXHRvYmplY3Q6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPlxufVxuXG5leHBvcnQgdHlwZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPiA9IFJlY29yZDxzdHJpbmcsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdzxUPj5cblxuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPlxue1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdHJlc29sdmVkOiBzdHJpbmc7XG5cdGludGVncml0eTogc3RyaW5nO1xuXHRkZXBlbmRlbmNpZXM/OiBJRGVwZW5kZW5jaWVzPFQ+O1xufVxuXG5leHBvcnQgdHlwZSBJRGVwZW5kZW5jaWVzPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT4gPSBSZWNvcmQ8SVRTVmFsdWVPZkFycmF5PFQ+LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGdWxsKHRleHQ6IHN0cmluZyB8IEJ1ZmZlcik6IElZYXJuTG9ja2ZpbGVQYXJzZUZ1bGxcbntcblx0cmV0dXJuIGxvY2tmaWxlLnBhcnNlKHRleHQudG9TdHJpbmcoKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHRleHQ6IHN0cmluZyB8IEJ1ZmZlcilcbntcblx0cmV0dXJuIHBhcnNlRnVsbCh0ZXh0KS5vYmplY3Rcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShqc29uOiBvYmplY3QpOiBzdHJpbmdcbntcblx0cmV0dXJuIGxvY2tmaWxlLnN0cmluZ2lmeShqc29uKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFlhcm5Mb2NrZmlsZShmaWxlOiBzdHJpbmcpXG57XG5cdGxldCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpXG5cblx0cmV0dXJuIHBhcnNlKGRhdGEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcERlcHNOYW1lKG5hbWU6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ11cbntcblx0bGV0IG0gPSBuYW1lLm1hdGNoKC9eKC4rKUAoLispJC8pO1xuXG5cdGlmICghbSlcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYG5hbWUgaXMgbm90IGRlcGVuZGVuY2llcywgJHtuYW1lfWApXG5cdH1cblxuXHRsZXQgciA9IG0uc2xpY2UoMSkgYXMgW3N0cmluZywgc3RyaW5nXTtcblxuXHQvL2NvbnNvbGUuZGlyKHIpO1xuXHQvL3Byb2Nlc3MuZXhpdCgpXG5cblx0cmV0dXJuIHJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlclJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHBrZzoge1xuXHRyZXNvbHV0aW9ucz86IElEZXBlbmRlbmNpZXM8VD5cbn0sIHlhcm5sb2NrOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pXG57XG5cdGlmIChwa2cucmVzb2x1dGlvbnMpXG5cdHtcblx0XHRsZXQga3MgPSBPYmplY3Qua2V5cyh5YXJubG9jaylcblx0XHRcdC5maWx0ZXIoayA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWUoaylbMF07XG5cdFx0XHRcdHJldHVybiBwa2cucmVzb2x1dGlvbnNbbl0gIT0gbnVsbFxuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4ga3Ncblx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGspXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZShrKTtcblxuXHRcdFx0XHRhLmRlcHNbblswXV0gPSBhLmRlcHNbblsxXV0gfHwgW107XG5cblx0XHRcdFx0YS5kZXBzW25bMF1dW25bMV1dID0geWFybmxvY2tba107XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCB7XG5cdFx0XHRcdG5hbWVzOiBrcyxcblx0XHRcdFx0ZGVwczoge30sXG5cdFx0XHR9IGFzIHtcblx0XHRcdFx0bmFtZXM6IFQsXG5cdFx0XHRcdGRlcHM6IFJlY29yZDxJVFNWYWx1ZU9mQXJyYXk8VD4sIFJlY29yZDxzdHJpbmcgfCAnKicsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdz4+XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICpcbiAqIEBleGFtcGxlIGBgYFxuIGxldCBwa2cgPSByZWFkUGFja2FnZUpzb24oJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMvcGFja2FnZS5qc29uJyk7XG5cbiBsZXQgeSA9IHJlYWRZYXJuTG9ja2ZpbGUoJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFybi5sb2NrJylcblxuIGNvbnNvbGUuZGlyKHJlbW92ZVJlc29sdXRpb25zKHBrZywgeSksIHtcblx0ZGVwdGg6IG51bGwsXG59KTtcbiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHBrZzoge1xuXHRyZXNvbHV0aW9ucz86IElEZXBlbmRlbmNpZXM8VD5cbn0sIHlhcm5sb2NrX29sZDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+KVxue1xuXHRsZXQgcmVzdWx0ID0gZmlsdGVyUmVzb2x1dGlvbnMocGtnLCB5YXJubG9ja19vbGQpO1xuXG5cdHJldHVybiByZW1vdmVSZXNvbHV0aW9uc0NvcmUocmVzdWx0LCB5YXJubG9ja19vbGQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUmVzb2x1dGlvbnNDb3JlPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHJlc3VsdDogUmV0dXJuVHlwZTx0eXBlb2YgZmlsdGVyUmVzb2x1dGlvbnM+LFxuXHR5YXJubG9ja19vbGQ6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPixcbilcbntcblx0bGV0IHlhcm5sb2NrX25ldzogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+ID0gcmVzdWx0Lm5hbWVzXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGE6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPiwgYilcblx0XHR7XG5cdFx0XHRkZWxldGUgYVtiXTtcblxuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwge1xuXHRcdFx0Li4ueWFybmxvY2tfb2xkLFxuXHRcdH0pO1xuXG5cdGxldCB5YXJubG9ja19jaGFuZ2VkID0gISFyZXN1bHQubmFtZXMubGVuZ3RoO1xuXG5cdHJldHVybiB7XG5cdFx0LyoqXG5cdFx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9ja1xuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX29sZCxcblx0XHQvKipcblx0XHQgKiDln7fooYzlvoznmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfbmV3LFxuXHRcdC8qKlxuXHRcdCAqIHlhcm4ubG9jayDmmK/lkKbmnInororli5Vcblx0XHQgKi9cblx0XHR5YXJubG9ja19jaGFuZ2VkLFxuXG5cdFx0cmVzdWx0LFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5YXJuTG9ja0RpZmYoeWFybmxvY2tfb2xkOiBzdHJpbmcsIHlhcm5sb2NrX25ldzogc3RyaW5nKTogc3RyaW5nXG57XG5cdGxldCB7IGNoYWxrIH0gPSBjb25zb2xlO1xuXHRsZXQgX29rID0gZmFsc2U7XG5cblx0Y29uc3QgdGFibGUgPSBjcmVhdGVEZXBlbmRlbmN5VGFibGUoKTtcblxuXHR0YWJsZS5vcHRpb25zLmNvbEFsaWducyA9IFsnbGVmdCcsICdjZW50ZXInLCAnY2VudGVyJywgJ2NlbnRlciddO1xuXHR0YWJsZS5vcHRpb25zLmhlYWQgPSBbXG5cdFx0Y2hhbGsuYm9sZC5yZXNldCgncGFja2FnZSBuYW1lJyksXG5cdFx0Y2hhbGsuYm9sZC5yZXNldCgnb2xkIHZlcnNpb24ocyknKSxcblx0XHQnJyxcblx0XHRjaGFsay5ib2xkLnJlc2V0KCduZXcgdmVyc2lvbihzKScpLFxuXHRdO1xuXG5cdERpZmZTZXJ2aWNlLmJ1aWxkRGlmZihbeWFybmxvY2tfb2xkXSwgW3lhcm5sb2NrX25ld10pXG5cdFx0Lm1hcChmdW5jdGlvbiAoZGlmZilcblx0XHR7XG5cdFx0XHRsZXQgZm9ybWF0ZWREaWZmOiB7XG5cdFx0XHRcdFtrOiBzdHJpbmddOiBbc3RyaW5nLCBzdHJpbmcsIHN0cmluZywgc3RyaW5nXTtcblx0XHRcdH0gPSB7fTtcblxuXHRcdFx0Y29uc3QgTk9ORSA9IGNoYWxrLnJlZCgnLScpO1xuXHRcdFx0Y29uc3QgQVJST1cgPSBjaGFsay5ncmF5KCfihpInKTtcblxuXHRcdFx0ZGlmZlxuXHRcdFx0XHQubWFwKHBhY2thZ2VEaWZmID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBwYXRoOiBzdHJpbmcgPSBwYWNrYWdlRGlmZi5wYXRoLmZpbmQoKCkgPT4gdHJ1ZSk7XG5cblx0XHRcdFx0XHRfb2sgPSB0cnVlO1xuXG5cdFx0XHRcdFx0bGV0IF9hcnI6IFtzdHJpbmcsIHN0cmluZywgc3RyaW5nLCBzdHJpbmddO1xuXG5cdFx0XHRcdFx0c3dpdGNoIChwYWNrYWdlRGlmZi5raW5kKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNhc2UgJ0EnOlxuXG5cdFx0XHRcdFx0XHRcdGxldCBkaWZmQXJyYXkgPSBfZGlmZkFycmF5KHBhY2thZ2VEaWZmLCBjaGFsayk7XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtwYXRoLCBjaGFsay5ncmF5KGRpZmZBcnJheVswXSksIEFSUk9XLCBjaGFsay5ncmF5KGRpZmZBcnJheVsxXSldO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAnRCc6XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtjaGFsay5yZWQocGF0aCksIGNoYWxrLnJlZChfZm9ybWF0VmVyc2lvbihwYWNrYWdlRGlmZi5saHMpKSwgQVJST1csIE5PTkVdO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAnRSc6XG5cblx0XHRcdFx0XHRcdFx0bGV0IGxoczAgPSBfZm9ybWF0VmVyc2lvbihwYWNrYWdlRGlmZi5saHMpO1xuXHRcdFx0XHRcdFx0XHRsZXQgcmhzMCA9IF9mb3JtYXRWZXJzaW9uKHBhY2thZ2VEaWZmLnJocyk7XG5cblx0XHRcdFx0XHRcdFx0bGV0IGxocyA9IGNoYWxrLnllbGxvdyhsaHMwKTtcblx0XHRcdFx0XHRcdFx0bGV0IHJocyA9IGNoYWxrLnllbGxvdyhjb2xvcml6ZURpZmYobGhzMCwgcmhzMCkpO1xuXG5cdFx0XHRcdFx0XHRcdF9hcnIgPSBbY2hhbGsueWVsbG93KHBhdGgpLCBsaHMsIEFSUk9XLCByaHNdO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAnTic6XG5cblx0XHRcdFx0XHRcdFx0X2FyciA9IFtjaGFsay5ncmVlbihwYXRoKSwgTk9ORSwgQVJST1csIGNoYWxrLmdyZWVuKF9mb3JtYXRWZXJzaW9uKHBhY2thZ2VEaWZmLnJocykpXTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRfYXJyICYmIChmb3JtYXRlZERpZmZbcGF0aF0gPSBfYXJyKTtcblxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHR0YWJsZS5wdXNoKC4uLk9iamVjdC52YWx1ZXMoZm9ybWF0ZWREaWZmKSlcblx0XHR9KVxuXHQ7XG5cblx0cmV0dXJuIF9vayA/IHRhYmxlLnRvU3RyaW5nKCkgOiAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9kaWZmQXJyYXkoYXJyYXk6IGRlZXBEaWZmLkRpZmZBcnJheTx7fSwge30+LCBjaGFsazogQ2hhbGspXG57XG5cdGNvbnN0IGl0ZW0gPSBhcnJheS5pdGVtO1xuXHRzd2l0Y2ggKGl0ZW0ua2luZClcblx0e1xuXHRcdGNhc2UgXCJOXCI6XG5cdFx0XHRyZXR1cm4gW2BbLi4uXWAsIGBbLi4uLCAke2NoYWxrLmdyZWVuKF9mb3JtYXRWZXJzaW9uKGl0ZW0ucmhzKSl9XWBdO1xuXHRcdGNhc2UgXCJEXCI6XG5cdFx0XHRyZXR1cm4gW2BbLi4uLCAke2NoYWxrLnJlZChfZm9ybWF0VmVyc2lvbihpdGVtLmxocykpfV1gLCBgWy4uLl1gXTtcblx0XHRjYXNlIFwiRVwiOlxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0YFsuLi5dLCAke2NoYWxrLnllbGxvdyhfZm9ybWF0VmVyc2lvbihpdGVtLmxocykpfV1gLFxuXHRcdFx0XHRgWy4uLiwgJHtjaGFsay55ZWxsb3coX2Zvcm1hdFZlcnNpb24oaXRlbS5saHMpKX1dYCxcblx0XHRcdF07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBbYFsuLi5dYCwgYFsuLi5dYF07XG5cdH1cbn1cblxuLypcbmV4cG9ydCBmdW5jdGlvbiB5YXJuTG9ja0RpZmYyKHlhcm5sb2NrX29sZDogc3RyaW5nLCB5YXJubG9ja19uZXc6IHN0cmluZyk6IHN0cmluZ1xue1xuXHRsZXQgcjI6IHN0cmluZ1tdID0gW107XG5cblx0bGV0IHIgPSBEaWZmU2VydmljZS5idWlsZERpZmYoW3lhcm5sb2NrX29sZF0sIFt5YXJubG9ja19uZXddKVxuXHRcdC5tYXAoRm9ybWF0dGVyU2VydmljZS5idWlsZERpZmZUYWJsZSlcblx0XHQubWFwKHIgPT4gcjIucHVzaChyKSlcblx0O1xuXG5cdHJldHVybiByMlswXTtcbn1cbiAqL1xuXG4vKlxubGV0IHJldCA9IGZzWWFybkxvY2soZmluZFJvb3Qoe1xuXHRjd2Q6IHByb2Nlc3MuY3dkKCksXG59KS5yb290KTtcblxubGV0IG9iID0gcGFyc2UocmV0Lnlhcm5sb2NrX29sZCk7XG5cbmxldCByZXQyID0gcmVtb3ZlUmVzb2x1dGlvbnMoe1xuXHRyZXNvbHV0aW9uczoge1xuXHRcdCdzZW12ZXInOiAnJyxcblx0XHQncGtnLWRpcic6ICcnLFxuXHRcdCdpcy1ucG0nOiAnJyxcblx0fSxcbn0sIG9iKTtcblxubGV0IHMgPSB5YXJuTG9ja0RpZmYoc3RyaW5naWZ5KG9iKSwgc3RyaW5naWZ5KHJldDIueWFybmxvY2tfbmV3KSk7XG5cbmNvbnNvbGUubG9nKHMpO1xuKi9cbiJdfQ==