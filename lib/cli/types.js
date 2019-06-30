"use strict";
/**
 * Created by user on 2019/7/1.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsNENBQTZDO0FBQzdDLCtDQUFxRztBQUNyRywrQkFBeUM7QUFDekMscUNBQXNDO0FBRS9CLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxXQUF5RCxFQUFFLGNBQXdCO0lBRTdILElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFFeEYsSUFBSSxDQUFDLENBQUMsRUFDTjtRQUNDLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFFRCxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFckMsSUFBSSxjQUFjLElBQUksT0FBTyxLQUFLLEVBQUUsRUFDcEM7UUFDQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0tBQ3BCO0lBRUQsSUFBSSxTQUFTLEVBQ2I7UUFDQyxJQUFJLEdBQUcsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7S0FDOUI7SUFFRCxJQUFJLEdBQUcsR0FBZ0IsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDOUQsT0FBTyxFQUFFLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDL0MsWUFBWSxFQUFFLElBQUk7S0FDbEIsQ0FBQyxDQUFDO1NBQ0YsS0FBSyxDQUFDLG1DQUFvQixFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBRWxDLElBQUksT0FBTyxJQUFJLElBQUksRUFDbkI7WUFDQyxPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUM3QyxPQUFPLEVBQUUsUUFBUTtnQkFDakIsWUFBWSxFQUFFLElBQUk7YUFDbEIsQ0FBQyxDQUFBO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxtQ0FBb0IsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUN6QztJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQXpDRCxvREF5Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzcvMS5cbiAqL1xuXG5pbXBvcnQgcGFja2FnZUpzb24gPSByZXF1aXJlKCdwYWNrYWdlLWpzb24nKTtcbmltcG9ydCB7IFBhY2thZ2VOb3RGb3VuZEVycm9yLCBWZXJzaW9uTm90Rm91bmRFcnJvciwgRnVsbE1ldGFkYXRhLCBGdWxsVmVyc2lvbiB9IGZyb20gJ3BhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBwYXJzZUFyZ3ZQa2dOYW1lIH0gZnJvbSAnLi9hZGQnO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUGFja2FnZUpzb25JbmZvKHBhY2thZ2VOYW1lOiBzdHJpbmcgfCBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZUFyZ3ZQa2dOYW1lPiwgZXhjbHVkZVZlcnNpb24/OiBib29sZWFuKVxue1xuXHRsZXQgbSA9ICh0eXBlb2YgcGFja2FnZU5hbWUgPT09ICdzdHJpbmcnKSA/IHBhcnNlQXJndlBrZ05hbWUocGFja2FnZU5hbWUpIDogcGFja2FnZU5hbWU7XG5cblx0aWYgKCFtKVxuXHR7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRsZXQgeyB2ZXJzaW9uLCBuYW1lLCBuYW1lc3BhY2UgfSA9IG07XG5cblx0aWYgKGV4Y2x1ZGVWZXJzaW9uIHx8IHZlcnNpb24gPT09ICcnKVxuXHR7XG5cdFx0dmVyc2lvbiA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmIChuYW1lc3BhY2UpXG5cdHtcblx0XHRuYW1lID0gbmFtZXNwYWNlICsgJy8nICsgbmFtZTtcblx0fVxuXG5cdGxldCBwa2c6IEZ1bGxWZXJzaW9uID0gYXdhaXQgQmx1ZWJpcmQucmVzb2x2ZShwYWNrYWdlSnNvbihuYW1lLCB7XG5cdFx0XHR2ZXJzaW9uOiAodmVyc2lvbiA9PSBudWxsID8gJ2xhdGVzdCcgOiB2ZXJzaW9uKSxcblx0XHRcdGZ1bGxNZXRhZGF0YTogdHJ1ZSxcblx0XHR9KSlcblx0XHQuY2F0Y2goVmVyc2lvbk5vdEZvdW5kRXJyb3IsIGVyciA9PlxuXHRcdHtcblx0XHRcdGlmICh2ZXJzaW9uICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBwYWNrYWdlSnNvbihgJHttLm5hbWVzcGFjZX0ke20ubmFtZX1gLCB7XG5cdFx0XHRcdFx0dmVyc2lvbjogJ2xhdGVzdCcsXG5cdFx0XHRcdFx0ZnVsbE1ldGFkYXRhOiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KVxuXHRcdC5jYXRjaChQYWNrYWdlTm90Rm91bmRFcnJvciwgZXJyID0+IG51bGwpXG5cdDtcblxuXHRyZXR1cm4gcGtnO1xufVxuIl19