"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const lockfile = require("@yarnpkg/lockfile");
const fs = require("fs-extra");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ5YXJubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsOENBQStDO0FBQy9DLCtCQUFnQztBQXNCaEMsU0FBZ0IsU0FBUyxDQUFDLElBQXFCO0lBRTlDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUN2QyxDQUFDO0FBSEQsOEJBR0M7QUFFRCxTQUFnQixLQUFLLENBQUMsSUFBcUI7SUFFMUMsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFBO0FBQzlCLENBQUM7QUFIRCxzQkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFZO0lBRXJDLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBSEQsOEJBR0M7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFZO0lBRTVDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFaEMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbkIsQ0FBQztBQUxELDRDQUtDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQVk7SUFFekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVsQyxJQUFJLENBQUMsQ0FBQyxFQUNOO1FBQ0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyw2QkFBNkIsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUN4RDtJQUVELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFxQixDQUFDO0lBRXZDLGlCQUFpQjtJQUNqQixnQkFBZ0I7SUFFaEIsT0FBTyxDQUFDLENBQUE7QUFDVCxDQUFDO0FBZkQsc0NBZUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBOEMsR0FFOUUsRUFBRSxRQUFxQztJQUV2QyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQ25CO1FBQ0MsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBRVgsSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUE7UUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFFSixPQUFPLEVBQUU7YUFDUCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVsQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUMsRUFBRTtZQUNGLEtBQUssRUFBRSxFQUFFO1lBQ1QsSUFBSSxFQUFFLEVBQUU7U0FJUixDQUFDLENBQ0Q7S0FDRjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQWxDRCw4Q0FrQ0M7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQWdCLGlCQUFpQixDQUE4QyxHQUU5RSxFQUFFLFlBQXlDO0lBRTNDLElBQUksTUFBTSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUVsRCxPQUFPLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBUEQsOENBT0M7QUFFRCxTQUFnQixxQkFBcUIsQ0FBOEMsTUFBNEMsRUFBRSxZQUF5QztJQUV6SyxJQUFJLFlBQVksR0FBZ0MsTUFBTSxDQUFDLEtBQUs7UUFDM0QsYUFBYTtTQUNaLE1BQU0sQ0FBQyxVQUFVLENBQThCLEVBQUUsQ0FBQztRQUVsRCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVaLE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxFQUFFO1FBQ0YsR0FBRyxZQUFZO0tBQ2YsQ0FBQyxDQUFDO0lBRUosSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFFN0MsT0FBTztRQUNOOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsZ0JBQWdCO1FBRWhCLE1BQU07S0FDTixDQUFBO0FBQ0YsQ0FBQztBQS9CRCxzREErQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTcuXG4gKi9cblxuaW1wb3J0IGxvY2tmaWxlID0gcmVxdWlyZSgnQHlhcm5wa2cvbG9ja2ZpbGUnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBJVFNWYWx1ZU9mQXJyYXksIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHkgfSBmcm9tICd0cy10eXBlJztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJy4vcGtnJztcblxuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VGdWxsPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT5cbntcblx0dHlwZTogc3RyaW5nO1xuXHRvYmplY3Q6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPlxufVxuXG5leHBvcnQgdHlwZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPiA9IFJlY29yZDxzdHJpbmcsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdzxUPj5cblxuZXhwb3J0IGludGVyZmFjZSBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c8VCBleHRlbmRzIElUU0FycmF5TGlzdE1heWJlUmVhZG9ubHk8c3RyaW5nPiA9IHN0cmluZ1tdPlxue1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdHJlc29sdmVkOiBzdHJpbmc7XG5cdGludGVncml0eTogc3RyaW5nO1xuXHRkZXBlbmRlbmNpZXM/OiBJRGVwZW5kZW5jaWVzPFQ+O1xufVxuXG5leHBvcnQgdHlwZSBJRGVwZW5kZW5jaWVzPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4gPSBzdHJpbmdbXT4gPSBSZWNvcmQ8SVRTVmFsdWVPZkFycmF5PFQ+LCBzdHJpbmc+O1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGdWxsKHRleHQ6IHN0cmluZyB8IEJ1ZmZlcik6IElZYXJuTG9ja2ZpbGVQYXJzZUZ1bGxcbntcblx0cmV0dXJuIGxvY2tmaWxlLnBhcnNlKHRleHQudG9TdHJpbmcoKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHRleHQ6IHN0cmluZyB8IEJ1ZmZlcilcbntcblx0cmV0dXJuIHBhcnNlRnVsbCh0ZXh0KS5vYmplY3Rcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShqc29uOiBvYmplY3QpOiBzdHJpbmdcbntcblx0cmV0dXJuIGxvY2tmaWxlLnN0cmluZ2lmeShqc29uKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFlhcm5Mb2NrZmlsZShmaWxlOiBzdHJpbmcpXG57XG5cdGxldCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpXG5cblx0cmV0dXJuIHBhcnNlKGRhdGEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcERlcHNOYW1lKG5hbWU6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ11cbntcblx0bGV0IG0gPSBuYW1lLm1hdGNoKC9eKC4rKUAoLispJC8pO1xuXG5cdGlmICghbSlcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYG5hbWUgaXMgbm90IGRlcGVuZGVuY2llcywgJHtuYW1lfWApXG5cdH1cblxuXHRsZXQgciA9IG0uc2xpY2UoMSkgYXMgW3N0cmluZywgc3RyaW5nXTtcblxuXHQvL2NvbnNvbGUuZGlyKHIpO1xuXHQvL3Byb2Nlc3MuZXhpdCgpXG5cblx0cmV0dXJuIHJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlclJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHBrZzoge1xuXHRyZXNvbHV0aW9ucz86IElEZXBlbmRlbmNpZXM8VD5cbn0sIHlhcm5sb2NrOiBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3Q8VD4pXG57XG5cdGlmIChwa2cucmVzb2x1dGlvbnMpXG5cdHtcblx0XHRsZXQga3MgPSBPYmplY3Qua2V5cyh5YXJubG9jaylcblx0XHRcdC5maWx0ZXIoayA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWUoaylbMF07XG5cdFx0XHRcdHJldHVybiBwa2cucmVzb2x1dGlvbnNbbl0gIT0gbnVsbFxuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4ga3Ncblx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGspXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZShrKTtcblxuXHRcdFx0XHRhLmRlcHNbblswXV0gPSBhLmRlcHNbblsxXV0gfHwgW107XG5cblx0XHRcdFx0YS5kZXBzW25bMF1dW25bMV1dID0geWFybmxvY2tba107XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCB7XG5cdFx0XHRcdG5hbWVzOiBrcyxcblx0XHRcdFx0ZGVwczoge30sXG5cdFx0XHR9IGFzIHtcblx0XHRcdFx0bmFtZXM6IFQsXG5cdFx0XHRcdGRlcHM6IFJlY29yZDxJVFNWYWx1ZU9mQXJyYXk8VD4sIFJlY29yZDxzdHJpbmcgfCAnKicsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdz4+XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICpcbiAqIEBleGFtcGxlIGBgYFxuIGxldCBwa2cgPSByZWFkUGFja2FnZUpzb24oJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMvcGFja2FnZS5qc29uJyk7XG5cbiBsZXQgeSA9IHJlYWRZYXJuTG9ja2ZpbGUoJ0c6L1VzZXJzL1RoZSBQcm9qZWN0L25vZGVqcy15YXJuL3dzLWNyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFybi5sb2NrJylcblxuIGNvbnNvbGUuZGlyKHJlbW92ZVJlc29sdXRpb25zKHBrZywgeSksIHtcblx0ZGVwdGg6IG51bGwsXG59KTtcbiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVJlc29sdXRpb25zPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHBrZzoge1xuXHRyZXNvbHV0aW9ucz86IElEZXBlbmRlbmNpZXM8VD5cbn0sIHlhcm5sb2NrX29sZDogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+KVxue1xuXHRsZXQgcmVzdWx0ID0gZmlsdGVyUmVzb2x1dGlvbnMocGtnLCB5YXJubG9ja19vbGQpO1xuXG5cdHJldHVybiByZW1vdmVSZXNvbHV0aW9uc0NvcmUocmVzdWx0LCB5YXJubG9ja19vbGQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUmVzb2x1dGlvbnNDb3JlPFQgZXh0ZW5kcyBJVFNBcnJheUxpc3RNYXliZVJlYWRvbmx5PHN0cmluZz4+KHJlc3VsdDogUmV0dXJuVHlwZTx0eXBlb2YgZmlsdGVyUmVzb2x1dGlvbnM+LCB5YXJubG9ja19vbGQ6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPilcbntcblx0bGV0IHlhcm5sb2NrX25ldzogSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0PFQ+ID0gcmVzdWx0Lm5hbWVzXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGE6IElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdDxUPiwgYilcblx0XHR7XG5cdFx0XHRkZWxldGUgYVtiXTtcblxuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwge1xuXHRcdFx0Li4ueWFybmxvY2tfb2xkLFxuXHRcdH0pO1xuXG5cdGxldCB5YXJubG9ja19jaGFuZ2VkID0gISFyZXN1bHQubmFtZXMubGVuZ3RoO1xuXG5cdHJldHVybiB7XG5cdFx0LyoqXG5cdFx0ICog5Z+36KGM5YmN55qEIHlhcm4ubG9ja1xuXHRcdCAqL1xuXHRcdHlhcm5sb2NrX29sZCxcblx0XHQvKipcblx0XHQgKiDln7fooYzlvoznmoQgeWFybi5sb2NrXG5cdFx0ICovXG5cdFx0eWFybmxvY2tfbmV3LFxuXHRcdC8qKlxuXHRcdCAqIHlhcm4ubG9jayDmmK/lkKbmnInororli5Vcblx0XHQgKi9cblx0XHR5YXJubG9ja19jaGFuZ2VkLFxuXG5cdFx0cmVzdWx0LFxuXHR9XG59XG4iXX0=