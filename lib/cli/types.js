"use strict";
/**
 * Created by user on 2019/7/1.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackageJsonInfo = void 0;
const packageJson = require("package-json");
const package_json_1 = require("package-json");
const add_1 = require("./add");
const Bluebird = require("bluebird");
async function fetchPackageJsonInfo(packageName, excludeVersion) {
    let m = (typeof packageName === 'string') ? add_1.parseArgvPkgName(packageName) : packageName;
    if (!m) {
        return null;
    }
    let { version, name, namespace } = m;
    if (excludeVersion || version === '') {
        version = undefined;
    }
    if (namespace) {
        name = namespace + '/' + name;
    }
    let pkg = await Bluebird.resolve(packageJson(name, {
        version: (version == null ? 'latest' : version),
        fullMetadata: true,
    }))
        .catch(package_json_1.VersionNotFoundError, err => {
        if (version != null) {
            return packageJson(`${m.namespace}${m.name}`, {
                version: 'latest',
                fullMetadata: true,
            });
        }
        return null;
    })
        .catch(package_json_1.PackageNotFoundError, err => null);
    return pkg;
}
exports.fetchPackageJsonInfo = fetchPackageJsonInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILDRDQUE2QztBQUM3QywrQ0FBcUc7QUFDckcsK0JBQXlDO0FBQ3pDLHFDQUFzQztBQUUvQixLQUFLLFVBQVUsb0JBQW9CLENBQUMsV0FBeUQsRUFBRSxjQUF3QjtJQUU3SCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxzQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBRXhGLElBQUksQ0FBQyxDQUFDLEVBQ047UUFDQyxPQUFPLElBQUksQ0FBQztLQUNaO0lBRUQsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXJDLElBQUksY0FBYyxJQUFJLE9BQU8sS0FBSyxFQUFFLEVBQ3BDO1FBQ0MsT0FBTyxHQUFHLFNBQVMsQ0FBQztLQUNwQjtJQUVELElBQUksU0FBUyxFQUNiO1FBQ0MsSUFBSSxHQUFHLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQzlCO0lBRUQsSUFBSSxHQUFHLEdBQWdCLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO1FBQzlELE9BQU8sRUFBRSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQy9DLFlBQVksRUFBRSxJQUFJO0tBQ2xCLENBQUMsQ0FBQztTQUNGLEtBQUssQ0FBQyxtQ0FBb0IsRUFBRSxHQUFHLENBQUMsRUFBRTtRQUVsQyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQ25CO1lBQ0MsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDN0MsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLFlBQVksRUFBRSxJQUFJO2FBQ2xCLENBQUMsQ0FBQTtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsbUNBQW9CLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FDekM7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUF6Q0Qsb0RBeUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS83LzEuXG4gKi9cblxuaW1wb3J0IHBhY2thZ2VKc29uID0gcmVxdWlyZSgncGFja2FnZS1qc29uJyk7XG5pbXBvcnQgeyBQYWNrYWdlTm90Rm91bmRFcnJvciwgVmVyc2lvbk5vdEZvdW5kRXJyb3IsIEZ1bGxNZXRhZGF0YSwgRnVsbFZlcnNpb24gfSBmcm9tICdwYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgcGFyc2VBcmd2UGtnTmFtZSB9IGZyb20gJy4vYWRkJztcbmltcG9ydCBCbHVlYmlyZCA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFBhY2thZ2VKc29uSW5mbyhwYWNrYWdlTmFtZTogc3RyaW5nIHwgUmV0dXJuVHlwZTx0eXBlb2YgcGFyc2VBcmd2UGtnTmFtZT4sIGV4Y2x1ZGVWZXJzaW9uPzogYm9vbGVhbilcbntcblx0bGV0IG0gPSAodHlwZW9mIHBhY2thZ2VOYW1lID09PSAnc3RyaW5nJykgPyBwYXJzZUFyZ3ZQa2dOYW1lKHBhY2thZ2VOYW1lKSA6IHBhY2thZ2VOYW1lO1xuXG5cdGlmICghbSlcblx0e1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0bGV0IHsgdmVyc2lvbiwgbmFtZSwgbmFtZXNwYWNlIH0gPSBtO1xuXG5cdGlmIChleGNsdWRlVmVyc2lvbiB8fCB2ZXJzaW9uID09PSAnJylcblx0e1xuXHRcdHZlcnNpb24gPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRpZiAobmFtZXNwYWNlKVxuXHR7XG5cdFx0bmFtZSA9IG5hbWVzcGFjZSArICcvJyArIG5hbWU7XG5cdH1cblxuXHRsZXQgcGtnOiBGdWxsVmVyc2lvbiA9IGF3YWl0IEJsdWViaXJkLnJlc29sdmUocGFja2FnZUpzb24obmFtZSwge1xuXHRcdFx0dmVyc2lvbjogKHZlcnNpb24gPT0gbnVsbCA/ICdsYXRlc3QnIDogdmVyc2lvbiksXG5cdFx0XHRmdWxsTWV0YWRhdGE6IHRydWUsXG5cdFx0fSkpXG5cdFx0LmNhdGNoKFZlcnNpb25Ob3RGb3VuZEVycm9yLCBlcnIgPT5cblx0XHR7XG5cdFx0XHRpZiAodmVyc2lvbiAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcGFja2FnZUpzb24oYCR7bS5uYW1lc3BhY2V9JHttLm5hbWV9YCwge1xuXHRcdFx0XHRcdHZlcnNpb246ICdsYXRlc3QnLFxuXHRcdFx0XHRcdGZ1bGxNZXRhZGF0YTogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSlcblx0XHQuY2F0Y2goUGFja2FnZU5vdEZvdW5kRXJyb3IsIGVyciA9PiBudWxsKVxuXHQ7XG5cblx0cmV0dXJuIHBrZztcbn1cbiJdfQ==