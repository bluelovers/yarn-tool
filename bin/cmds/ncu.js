"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("path");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const ncu_1 = require("../../lib/cli/ncu");
const yarnlock_1 = require("../../lib/yarnlock");
const fs = require("fs-extra");
const semver = require("semver");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: ['update', 'upgrade', 'up'],
    describe: `Find newer versions of dependencies than what your package.json or bower.json allows`,
    builder(yargs) {
        return ncu_1.default(yargs);
    },
    async handler(argv) {
        const { cwd } = argv;
        let rootData = index_1.findRoot({
            ...argv,
            cwd,
        }, true);
        index_1.console.dir(rootData);
        let pkg_file_root = path.join(rootData.root, 'package.json');
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg_data = package_dts_1.readPackageJson(pkg_file);
        let resolutions = pkg_data.resolutions;
        let pkg_file_ws;
        let pkg_data_ws;
        let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;
        if (doWorkspace) {
            pkg_file_ws = path.join(rootData.ws, 'package.json');
            pkg_data_ws = package_dts_1.readPackageJson(pkg_file_ws);
            resolutions = pkg_data_ws.resolutions;
        }
        let pkgNcu = await ncu_1.npmCheckUpdates({
            cwd,
            rootData,
        }, {
            ...argv,
            json_old: pkg_data,
        });
        if (pkgNcu.json_changed && argv.upgrade) {
            pkg_1.writeJSONSync(pkg_file, pkgNcu.json_new);
            index_1.consoleDebug.info(`package.json updated`);
        }
        if (argv.dedupe && Object.keys(resolutions).length) {
            let ls = Object.entries(pkgNcu.json_new.dependencies)
                .concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))
                .reduce(function (a, [name, ver_new]) {
                let ver_old = resolutions[name];
                if (ver_old) {
                    // @ts-ignore
                    a[name] = ver_new;
                }
                return a;
            }, {});
            let yl = index_1.fsYarnLock(rootData.root);
            let yarnlock_old_obj = yarnlock_1.parse(yl.yarnlock_old);
            let result = yarnlock_1.filterResolutions({
                resolutions: ls
            }, yarnlock_old_obj);
            let r2 = result.names
                .filter(name => {
                let n = yarnlock_1.stripDepsName(name);
                let da = result.deps[n[0]];
                if (!da) {
                    return false;
                }
                if (da['*'] || ls[n[0]] == '*') {
                    return true;
                }
                return Object.values(da).some(dr => {
                    if (ls[name] == null) {
                        return true;
                    }
                    let bool = semver.lt(dr.version, ls[name]);
                    return bool;
                });
            })
                .reduce((a, name) => {
                let n = yarnlock_1.stripDepsName(name);
                a.names.push(name);
                a.deps[n[0]] = result.deps[n[0]];
                return a;
            }, {
                names: [],
                deps: {},
            });
            let ret = yarnlock_1.removeResolutionsCore(r2, yarnlock_old_obj);
            if (ret.yarnlock_changed) {
                if (!argv.upgrade) {
                    index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                    index_1.consoleDebug.log(`you can do`, index_1.console.cyan.chalk(`yt ncu -u`));
                }
                else {
                    fs.writeFileSync(yl.yarnlock_file, yarnlock_1.stringify(ret.yarnlock_new));
                    index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                    index_1.consoleDebug.log(`you can do`, index_1.console.cyan.chalk(`yt install`));
                    index_1.consoleDebug.log(`for upgrade dependencies now`);
                }
            }
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSw2QkFBOEI7QUFDOUIsMkNBQThFO0FBQzlFLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBQXFFO0FBQ3JFLGlEQU00QjtBQUM1QiwrQkFBZ0M7QUFDaEMsaUNBQWtDO0FBRWxDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQztJQUNwQyxRQUFRLEVBQUUsc0ZBQXNGO0lBRWhHLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxhQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDOUIsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUVqQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXJCLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1lBQ1AsR0FBRztTQUNILEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVCxlQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU3RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkQsSUFBSSxRQUFRLEdBQUcsNkJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRXZDLElBQUksV0FBbUIsQ0FBQztRQUN4QixJQUFJLFdBQXlCLENBQUM7UUFFOUIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFFakUsSUFBSSxXQUFXLEVBQ2Y7WUFDQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JELFdBQVcsR0FBRyw2QkFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTNDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxNQUFNLEdBQUcsTUFBTSxxQkFBZSxDQUFDO1lBQ2xDLEdBQUc7WUFDSCxRQUFRO1NBRVIsRUFBRTtZQUNGLEdBQUcsSUFBSTtZQUNQLFFBQVEsRUFBRSxRQUFRO1NBQ2xCLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUN2QztZQUNDLG1CQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUN4QyxvQkFBWSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUNsRDtZQUVDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7aUJBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFFekgsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztnQkFFbkMsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoQyxJQUFJLE9BQU8sRUFDWDtvQkFDQyxhQUFhO29CQUNiLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7aUJBQ2xCO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxFQUFFLEVBQW1CLENBQUMsQ0FDdkI7WUFFRCxJQUFJLEVBQUUsR0FBRyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxJQUFJLGdCQUFnQixHQUFHLGdCQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXRELElBQUksTUFBTSxHQUFHLDRCQUFpQixDQUFDO2dCQUM5QixXQUFXLEVBQUUsRUFBRTthQUNmLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVyQixJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSztpQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUVkLElBQUksQ0FBQyxHQUFHLHdCQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTVCLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLElBQUksQ0FBQyxFQUFFLEVBQ1A7b0JBQ0MsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFDOUI7b0JBQ0MsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFFbEMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUNwQjt3QkFDQyxPQUFPLElBQUksQ0FBQztxQkFDWjtvQkFFRCxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRTNDLE9BQU8sSUFBSSxDQUFBO2dCQUNaLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO2lCQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFFbkIsSUFBSSxDQUFDLEdBQUcsd0JBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFNUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFakMsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDLEVBQUU7Z0JBQ0YsS0FBSyxFQUFFLEVBQWM7Z0JBQ3JCLElBQUksRUFBRSxFQUF1RTthQUM3RSxDQUFDLENBQ0Y7WUFFRCxJQUFJLEdBQUcsR0FBRyxnQ0FBcUIsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUV0RCxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFDeEI7Z0JBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQ2pCO29CQUNDLG9CQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO29CQUM3RSxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsZUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztpQkFDaEU7cUJBRUQ7b0JBQ0MsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLG9CQUFpQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUV4RSxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDckQsb0JBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGVBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLG9CQUFZLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7aUJBQ2pEO2FBQ0Q7U0FDRDtJQUVGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrIH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCBJUGFja2FnZUpzb24sIHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVKU09OU3luYywgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHNldHVwTmN1VG9ZYXJncywgeyBucG1DaGVja1VwZGF0ZXMgfSBmcm9tICcuLi8uLi9saWIvY2xpL25jdSc7XG5pbXBvcnQge1xuXHRmaWx0ZXJSZXNvbHV0aW9ucyxcblx0SURlcGVuZGVuY2llcyxcblx0SVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93LFxuXHRwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrLCByZW1vdmVSZXNvbHV0aW9uc0NvcmUsIHN0cmluZ2lmeSBhcyBzdHJpbmdpZnlZYXJuTG9jayxcblx0c3RyaXBEZXBzTmFtZSxcbn0gZnJvbSAnLi4vLi4vbGliL3lhcm5sb2NrJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHRhbGlhc2VzOiBbJ3VwZGF0ZScsICd1cGdyYWRlJywgJ3VwJ10sXG5cdGRlc2NyaWJlOiBgRmluZCBuZXdlciB2ZXJzaW9ucyBvZiBkZXBlbmRlbmNpZXMgdGhhbiB3aGF0IHlvdXIgcGFja2FnZS5qc29uIG9yIGJvd2VyLmpzb24gYWxsb3dzYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwTmN1VG9ZYXJncyh5YXJncylcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRjd2QsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHRjb25zb2xlLmRpcihyb290RGF0YSk7XG5cblx0XHRsZXQgcGtnX2ZpbGVfcm9vdCA9IHBhdGguam9pbihyb290RGF0YS5yb290LCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cdFx0bGV0IHBrZ19kYXRhID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdGxldCByZXNvbHV0aW9ucyA9IHBrZ19kYXRhLnJlc29sdXRpb25zO1xuXG5cdFx0bGV0IHBrZ19maWxlX3dzOiBzdHJpbmc7XG5cdFx0bGV0IHBrZ19kYXRhX3dzOiBJUGFja2FnZUpzb247XG5cblx0XHRsZXQgZG9Xb3Jrc3BhY2UgPSAhcm9vdERhdGEuaXNXb3Jrc3BhY2UgJiYgcm9vdERhdGEuaGFzV29ya3NwYWNlO1xuXG5cdFx0aWYgKGRvV29ya3NwYWNlKVxuXHRcdHtcblx0XHRcdHBrZ19maWxlX3dzID0gcGF0aC5qb2luKHJvb3REYXRhLndzLCAncGFja2FnZS5qc29uJyk7XG5cdFx0XHRwa2dfZGF0YV93cyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZV93cyk7XG5cblx0XHRcdHJlc29sdXRpb25zID0gcGtnX2RhdGFfd3MucmVzb2x1dGlvbnM7XG5cdFx0fVxuXG5cdFx0bGV0IHBrZ05jdSA9IGF3YWl0IG5wbUNoZWNrVXBkYXRlcyh7XG5cdFx0XHRjd2QsXG5cdFx0XHRyb290RGF0YSxcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHR9LCB7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdFx0anNvbl9vbGQ6IHBrZ19kYXRhLFxuXHRcdH0pO1xuXG5cdFx0aWYgKHBrZ05jdS5qc29uX2NoYW5nZWQgJiYgYXJndi51cGdyYWRlKVxuXHRcdHtcblx0XHRcdHdyaXRlSlNPTlN5bmMocGtnX2ZpbGUsIHBrZ05jdS5qc29uX25ldylcblx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBwYWNrYWdlLmpzb24gdXBkYXRlZGApO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2LmRlZHVwZSAmJiBPYmplY3Qua2V5cyhyZXNvbHV0aW9ucykubGVuZ3RoKVxuXHRcdHtcblxuXHRcdFx0bGV0IGxzID0gT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3LmRlcGVuZGVuY2llcylcblx0XHRcdFx0LmNvbmNhdChPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcuZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSwgT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3Lm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IHt9KSlcblxuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBbbmFtZSwgdmVyX25ld10pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdmVyX29sZCA9IHJlc29sdXRpb25zW25hbWVdO1xuXG5cdFx0XHRcdFx0aWYgKHZlcl9vbGQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0YVtuYW1lXSA9IHZlcl9uZXc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHt9IGFzIElEZXBlbmRlbmNpZXMpXG5cdFx0XHQ7XG5cblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCB5YXJubG9ja19vbGRfb2JqID0gcGFyc2VZYXJuTG9jayh5bC55YXJubG9ja19vbGQpO1xuXG5cdFx0XHRsZXQgcmVzdWx0ID0gZmlsdGVyUmVzb2x1dGlvbnMoe1xuXHRcdFx0XHRyZXNvbHV0aW9uczogbHNcblx0XHRcdH0sIHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdFx0XHRsZXQgcjIgPSByZXN1bHQubmFtZXNcblx0XHRcdFx0LmZpbHRlcihuYW1lID0+IHtcblxuXHRcdFx0XHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZShuYW1lKTtcblxuXHRcdFx0XHRcdGxldCBkYSA9IHJlc3VsdC5kZXBzW25bMF1dO1xuXG5cdFx0XHRcdFx0aWYgKCFkYSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGRhWycqJ10gfHwgbHNbblswXV0gPT0gJyonKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBPYmplY3QudmFsdWVzKGRhKS5zb21lKGRyID0+IHtcblxuXHRcdFx0XHRcdFx0aWYgKGxzW25hbWVdID09IG51bGwpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgYm9vbCA9IHNlbXZlci5sdChkci52ZXJzaW9uLCBsc1tuYW1lXSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBib29sXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5yZWR1Y2UoKGEsIG5hbWUpID0+IHtcblxuXHRcdFx0XHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZShuYW1lKTtcblxuXHRcdFx0XHRcdGEubmFtZXMucHVzaChuYW1lKTtcblx0XHRcdFx0XHRhLmRlcHNbblswXV0gPSByZXN1bHQuZGVwc1tuWzBdXTtcblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0bmFtZXM6IFtdIGFzIHN0cmluZ1tdLFxuXHRcdFx0XHRcdGRlcHM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcgfCAnKicsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdz4+LFxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgcmV0ID0gcmVtb3ZlUmVzb2x1dGlvbnNDb3JlKHIyLCB5YXJubG9ja19vbGRfb2JqKTtcblxuXHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIWFyZ3YudXBncmFkZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYHlvdXIgZGVwZW5kZW5jaWVzIHZlcnNpb24gaGlnaCB0aGFuIHJlc29sdXRpb25zYCk7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkb2AsIGNvbnNvbGUuY3lhbi5jaGFsayhgeXQgbmN1IC11YCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWwueWFybmxvY2tfZmlsZSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ldykpO1xuXG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLm1hZ2VudGEuaW5mbyhgRGVkdXBsaWNhdGlvbiB5YXJuLmxvY2tgKTtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcubG9nKGB5b3UgY2FuIGRvYCwgY29uc29sZS5jeWFuLmNoYWxrKGB5dCBpbnN0YWxsYCkpO1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYGZvciB1cGdyYWRlIGRlcGVuZGVuY2llcyBub3dgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=