"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const ncu_1 = require("../../lib/cli/ncu");
const yarnlock_1 = require("../../lib/yarnlock");
const table_1 = require("../../lib/table");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [-u]',
    aliases: ['update'],
    describe: `Find newer versions of dependencies than what your package.json or bower.json allows`,
    builder(yargs) {
        return ncu_1.default(yargs)
            .option('resolutions', {
            alias: ['R'],
            desc: 'do with resolutions only',
            boolean: true,
        })
            .option('safe', {
            boolean: true,
        });
    },
    async handler(argv) {
        const { cwd } = argv;
        let rootData = index_1.findRoot({
            ...argv,
            cwd,
        }, true);
        //console.dir(rootData);
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
        if (argv.resolutions) {
            if (!resolutions || !Object.keys(resolutions).length) {
                return index_1.yarnProcessExit(`resolutions is not exists in package.json`);
            }
            let yl = index_1.fsYarnLock(rootData.root);
            let ret = await ncu_1.checkResolutionsUpdate(resolutions, yl.yarnlock_old);
            if (ret.yarnlock_changed) {
                yarnlock_1.writeYarnLockfile(yl.yarnlock_file, ret.yarnlock_new_obj);
                index_1.chalkByConsole((chalk, console) => {
                    let p = chalk.cyan(path.relative(argv.cwd, yl.yarnlock_file));
                    console.log(`${p} is updated!`);
                }, index_1.console);
                let msg = yarnlock_1.yarnLockDiff(yarnlock_1.stringify(ret.yarnlock_old_obj), yarnlock_1.stringify(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            if (ret.update_list) {
                let ls = ret.update_list
                    .filter(name => !ncu_1.isBadVersion(resolutions[name]));
                if (ls.length) {
                    let fromto = ls
                        .reduce((a, name) => {
                        a.from[name] = resolutions[name];
                        a.to[name] = ret.deps2[name];
                        resolutions[name] = ret.deps2[name];
                        return a;
                    }, {});
                    let msg = table_1.toDependencyTable(fromto);
                    index_1.console.log(`\n${msg}\n`);
                    if (argv.upgrade) {
                        if (doWorkspace) {
                            pkg_data_ws.resolutions = resolutions;
                            pkg_1.writePackageJson(pkg_file_ws, pkg_data_ws);
                            index_1.chalkByConsole((chalk, console) => {
                                let p = chalk.cyan(path.relative(argv.cwd, pkg_file_ws));
                                console.log(`${p} is updated!`);
                            }, index_1.console);
                        }
                        else {
                            pkg_data.resolutions = resolutions;
                            pkg_1.writePackageJson(pkg_file, pkg_data);
                            index_1.chalkByConsole((chalk, console) => {
                                let p = chalk.cyan(path.relative(rootData.ws || rootData.pkg, pkg_file));
                                console.log(`${p} is updated!`);
                            }, index_1.console);
                        }
                    }
                }
            }
            return;
        }
        index_1.printRootData(rootData, argv);
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
            let ls = Object.entries(pkgNcu.json_new.dependencies || {})
                .concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))
                .reduce(function (a, [name, ver_new]) {
                let ver_old = resolutions[name];
                if (ver_old) {
                    if (ver_new === 'latest') {
                        ver_new = '*';
                    }
                    // @ts-ignore
                    a[name] = ver_new;
                }
                return a;
            }, {});
            let yl = index_1.fsYarnLock(rootData.root);
            let ret = await ncu_1.checkResolutionsUpdate(resolutions, yl.yarnlock_old);
            if (ret.yarnlock_changed) {
                let msg = yarnlock_1.yarnLockDiff(yarnlock_1.stringify(ret.yarnlock_old_obj), yarnlock_1.stringify(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
                if (!argv.upgrade) {
                    index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                    index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
                }
                else {
                    yarnlock_1.writeYarnLockfile(yl.yarnlock_file, ret.yarnlock_new_obj);
                    index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                    index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
                }
            }
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSwrQkFBZ0M7QUFDaEMsMkNBUXlCO0FBQ3pCLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBQTJHO0FBQzNHLGlEQU00QjtBQUk1QiwyQ0FBb0Q7QUFFcEQsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTztJQUM1QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsUUFBUSxFQUFFLHNGQUFzRjtJQUVoRyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sYUFBZSxDQUFDLEtBQUssQ0FBQzthQUMzQixNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ3RCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUVqQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXJCLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1lBQ1AsR0FBRztTQUNILEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVCx3QkFBd0I7UUFFeEIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRTdELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN2RCxJQUFJLFFBQVEsR0FBRyw2QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpDLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFFdkMsSUFBSSxXQUFtQixDQUFDO1FBQ3hCLElBQUksV0FBeUIsQ0FBQztRQUU5QixJQUFJLFdBQVcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQztRQUVqRSxJQUFJLFdBQVcsRUFDZjtZQUNDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDckQsV0FBVyxHQUFHLDZCQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFM0MsV0FBVyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7U0FDdEM7UUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQ3BCO1lBQ0MsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUNwRDtnQkFDQyxPQUFPLHVCQUFlLENBQUMsMkNBQTJDLENBQUMsQ0FBQTthQUNuRTtZQUVELElBQUksRUFBRSxHQUFHLGtCQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRW5DLElBQUksR0FBRyxHQUFHLE1BQU0sNEJBQXNCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVyRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFDeEI7Z0JBQ0MsNEJBQWlCLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFFMUQsc0JBQWMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFFakMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBRTlELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUVqQyxDQUFDLEVBQUUsZUFBTyxDQUFDLENBQUM7Z0JBRVosSUFBSSxHQUFHLEdBQUcsdUJBQVksQ0FBQyxvQkFBaUIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBaUIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUV6RyxJQUFJLEdBQUcsRUFDUDtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztpQkFDMUI7YUFDRDtZQUVELElBQUksR0FBRyxDQUFDLFdBQVcsRUFDbkI7Z0JBQ0MsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLFdBQVc7cUJBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsa0JBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNqRDtnQkFFRCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQ2I7b0JBQ0MsSUFBSSxNQUFNLEdBQUcsRUFBRTt5QkFDYixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7d0JBR25CLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNqQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUVwQyxPQUFPLENBQUMsQ0FBQztvQkFDVixDQUFDLEVBQUUsRUFBNkMsQ0FBQyxDQUNqRDtvQkFFRCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFcEMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBRTFCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFDaEI7d0JBQ0MsSUFBSSxXQUFXLEVBQ2Y7NEJBQ0MsV0FBVyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7NEJBRXRDLHNCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzs0QkFFM0Msc0JBQWMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtnQ0FFakMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztnQ0FFekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7NEJBRWpDLENBQUMsRUFBRSxlQUFPLENBQUMsQ0FBQzt5QkFDWjs2QkFFRDs0QkFDQyxRQUFRLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs0QkFFbkMsc0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUVyQyxzQkFBYyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dDQUdqQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0NBRXpFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUVqQyxDQUFDLEVBQUUsZUFBTyxDQUFDLENBQUM7eUJBQ1o7cUJBQ0Q7aUJBRUQ7YUFDRDtZQUVELE9BQU87U0FDUDtRQUVELHFCQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTlCLElBQUksTUFBTSxHQUFHLE1BQU0scUJBQWUsQ0FBQztZQUNsQyxHQUFHO1lBQ0gsUUFBUTtTQUVSLEVBQUU7WUFDRixHQUFHLElBQUk7WUFDUCxRQUFRLEVBQUUsUUFBUTtTQUNsQixDQUFDLENBQUM7UUFFSCxJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sRUFDdkM7WUFDQyxtQkFBYSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsb0JBQVksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDbEQ7WUFFQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztpQkFDekQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLG9CQUFvQixJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUV6SCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2dCQUVuQyxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWhDLElBQUksT0FBTyxFQUNYO29CQUNDLElBQUksT0FBTyxLQUFLLFFBQVEsRUFDeEI7d0JBQ0MsT0FBTyxHQUFHLEdBQUcsQ0FBQztxQkFDZDtvQkFFRCxhQUFhO29CQUNiLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7aUJBQ2xCO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxFQUFFLEVBQW1CLENBQUMsQ0FDdkI7WUFFRCxJQUFJLEVBQUUsR0FBRyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxJQUFJLEdBQUcsR0FBRyxNQUFNLDRCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFckUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEVBQ3hCO2dCQUNDLElBQUksR0FBRyxHQUFHLHVCQUFZLENBQUMsb0JBQWlCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsb0JBQWlCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFFekcsSUFBSSxHQUFHLEVBQ1A7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7aUJBQzFCO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUNqQjtvQkFDQyxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaURBQWlELENBQUMsQ0FBQztvQkFDN0Usb0JBQVksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGVBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO2lCQUNwRztxQkFFRDtvQkFDQyw0QkFBaUIsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUUxRCxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDckQsb0JBQVksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGVBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO2lCQUMxRzthQUVEO1NBQ0Q7SUFFRixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQge1xuXHRjaGFsa0J5Q29uc29sZSxcblx0Y29uc29sZSxcblx0Y29uc29sZURlYnVnLFxuXHRmaW5kUm9vdCxcblx0ZnNZYXJuTG9jayxcblx0cHJpbnRSb290RGF0YSxcblx0eWFyblByb2Nlc3NFeGl0LFxufSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiwgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZUpTT05TeW5jLCB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IGNoZWNrUmVzb2x1dGlvbnNVcGRhdGUsIGlzQmFkVmVyc2lvbiwgbnBtQ2hlY2tVcGRhdGVzIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9uY3UnO1xuaW1wb3J0IHtcblx0ZmlsdGVyUmVzb2x1dGlvbnMsXG5cdElEZXBlbmRlbmNpZXMsXG5cdElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdyxcblx0cGFyc2UgYXMgcGFyc2VZYXJuTG9jaywgcmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpbmdpZnkgYXMgc3RyaW5naWZ5WWFybkxvY2ssXG5cdHN0cmlwRGVwc05hbWUsIHdyaXRlWWFybkxvY2tmaWxlLCB5YXJuTG9ja0RpZmYsXG59IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IHRvRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi4vLi4vbGliL3RhYmxlJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFstdV0nLFxuXHRhbGlhc2VzOiBbJ3VwZGF0ZSddLFxuXHRkZXNjcmliZTogYEZpbmQgbmV3ZXIgdmVyc2lvbnMgb2YgZGVwZW5kZW5jaWVzIHRoYW4gd2hhdCB5b3VyIHBhY2thZ2UuanNvbiBvciBib3dlci5qc29uIGFsbG93c2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cE5jdVRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQub3B0aW9uKCdyZXNvbHV0aW9ucycsIHtcblx0XHRcdFx0YWxpYXM6IFsnUiddLFxuXHRcdFx0XHRkZXNjOiAnZG8gd2l0aCByZXNvbHV0aW9ucyBvbmx5Jyxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdzYWZlJywge1xuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRjd2QsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHQvL2NvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdGxldCBwa2dfZmlsZV9yb290ID0gcGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0bGV0IHJlc29sdXRpb25zID0gcGtnX2RhdGEucmVzb2x1dGlvbnM7XG5cblx0XHRsZXQgcGtnX2ZpbGVfd3M6IHN0cmluZztcblx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdGxldCBkb1dvcmtzcGFjZSA9ICFyb290RGF0YS5pc1dvcmtzcGFjZSAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2U7XG5cblx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cGtnX2ZpbGVfd3MgPSBwYXRoLmpvaW4ocm9vdERhdGEud3MsICdwYWNrYWdlLmpzb24nKTtcblx0XHRcdHBrZ19kYXRhX3dzID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlX3dzKTtcblxuXHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHR9XG5cblx0XHRpZiAoYXJndi5yZXNvbHV0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAoIXJlc29sdXRpb25zIHx8ICFPYmplY3Qua2V5cyhyZXNvbHV0aW9ucykubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4geWFyblByb2Nlc3NFeGl0KGByZXNvbHV0aW9ucyBpcyBub3QgZXhpc3RzIGluIHBhY2thZ2UuanNvbmApXG5cdFx0XHR9XG5cblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zLCB5bC55YXJubG9ja19vbGQpO1xuXG5cdFx0XHRpZiAocmV0Lnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdHdyaXRlWWFybkxvY2tmaWxlKHlsLnlhcm5sb2NrX2ZpbGUsIHJldC55YXJubG9ja19uZXdfb2JqKTtcblxuXHRcdFx0XHRjaGFsa0J5Q29uc29sZSgoY2hhbGssIGNvbnNvbGUpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgcCA9IGNoYWxrLmN5YW4ocGF0aC5yZWxhdGl2ZShhcmd2LmN3ZCwgeWwueWFybmxvY2tfZmlsZSkpO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYCR7cH0gaXMgdXBkYXRlZCFgKTtcblxuXHRcdFx0XHR9LCBjb25zb2xlKTtcblxuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHN0cmluZ2lmeVlhcm5Mb2NrKHJldC55YXJubG9ja19vbGRfb2JqKSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ld19vYmopKTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7bXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyZXQudXBkYXRlX2xpc3QpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBscyA9IHJldC51cGRhdGVfbGlzdFxuXHRcdFx0XHRcdC5maWx0ZXIobmFtZSA9PiAhaXNCYWRWZXJzaW9uKHJlc29sdXRpb25zW25hbWVdKSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGlmIChscy5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgZnJvbXRvID0gbHNcblx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIG5hbWUpID0+XG5cdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0YS5mcm9tW25hbWVdID0gcmVzb2x1dGlvbnNbbmFtZV07XG5cdFx0XHRcdFx0XHRcdGEudG9bbmFtZV0gPSByZXQuZGVwczJbbmFtZV07XG5cblx0XHRcdFx0XHRcdFx0cmVzb2x1dGlvbnNbbmFtZV0gPSByZXQuZGVwczJbbmFtZV07XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdFx0XHR9LCB7fSBhcyBQYXJhbWV0ZXJzPHR5cGVvZiB0b0RlcGVuZGVuY3lUYWJsZT5bMF0pXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0bGV0IG1zZyA9IHRvRGVwZW5kZW5jeVRhYmxlKGZyb210byk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHttc2d9XFxuYCk7XG5cblx0XHRcdFx0XHRpZiAoYXJndi51cGdyYWRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChkb1dvcmtzcGFjZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cGtnX2RhdGFfd3MucmVzb2x1dGlvbnMgPSByZXNvbHV0aW9ucztcblxuXHRcdFx0XHRcdFx0XHR3cml0ZVBhY2thZ2VKc29uKHBrZ19maWxlX3dzLCBwa2dfZGF0YV93cyk7XG5cblx0XHRcdFx0XHRcdFx0Y2hhbGtCeUNvbnNvbGUoKGNoYWxrLCBjb25zb2xlKSA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHAgPSBjaGFsay5jeWFuKHBhdGgucmVsYXRpdmUoYXJndi5jd2QsIHBrZ19maWxlX3dzKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhgJHtwfSBpcyB1cGRhdGVkIWApO1xuXG5cdFx0XHRcdFx0XHRcdH0sIGNvbnNvbGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRwa2dfZGF0YS5yZXNvbHV0aW9ucyA9IHJlc29sdXRpb25zO1xuXG5cdFx0XHRcdFx0XHRcdHdyaXRlUGFja2FnZUpzb24ocGtnX2ZpbGUsIHBrZ19kYXRhKTtcblxuXHRcdFx0XHRcdFx0XHRjaGFsa0J5Q29uc29sZSgoY2hhbGssIGNvbnNvbGUpID0+XG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKHJvb3REYXRhLndzIHx8IHJvb3REYXRhLnBrZywgcGtnX2ZpbGUpKTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGAke3B9IGlzIHVwZGF0ZWQhYCk7XG5cblx0XHRcdFx0XHRcdFx0fSwgY29uc29sZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHByaW50Um9vdERhdGEocm9vdERhdGEsIGFyZ3YpO1xuXG5cdFx0bGV0IHBrZ05jdSA9IGF3YWl0IG5wbUNoZWNrVXBkYXRlcyh7XG5cdFx0XHRjd2QsXG5cdFx0XHRyb290RGF0YSxcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHR9LCB7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdFx0anNvbl9vbGQ6IHBrZ19kYXRhLFxuXHRcdH0pO1xuXG5cdFx0aWYgKHBrZ05jdS5qc29uX2NoYW5nZWQgJiYgYXJndi51cGdyYWRlKVxuXHRcdHtcblx0XHRcdHdyaXRlSlNPTlN5bmMocGtnX2ZpbGUsIHBrZ05jdS5qc29uX25ldyk7XG5cdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgcGFja2FnZS5qc29uIHVwZGF0ZWRgKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5kZWR1cGUgJiYgT2JqZWN0LmtleXMocmVzb2x1dGlvbnMpLmxlbmd0aClcblx0XHR7XG5cblx0XHRcdGxldCBscyA9IE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXBlbmRlbmNpZXMgfHwge30pXG5cdFx0XHRcdC5jb25jYXQoT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3LmRldkRlcGVuZGVuY2llcyB8fCB7fSksIE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5vcHRpb25hbERlcGVuZGVuY2llcyB8fCB7fSkpXG5cblx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgW25hbWUsIHZlcl9uZXddKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZlcl9vbGQgPSByZXNvbHV0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHRcdGlmICh2ZXJfb2xkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh2ZXJfbmV3ID09PSAnbGF0ZXN0Jylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dmVyX25ldyA9ICcqJztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0YVtuYW1lXSA9IHZlcl9uZXc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHt9IGFzIElEZXBlbmRlbmNpZXMpXG5cdFx0XHQ7XG5cblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zLCB5bC55YXJubG9ja19vbGQpO1xuXG5cdFx0XHRpZiAocmV0Lnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYoc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX29sZF9vYmopLCBzdHJpbmdpZnlZYXJuTG9jayhyZXQueWFybmxvY2tfbmV3X29iaikpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHttc2d9XFxuYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWFyZ3YudXBncmFkZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYHlvdXIgZGVwZW5kZW5jaWVzIHZlcnNpb24gaGlnaCB0aGFuIHJlc29sdXRpb25zYCk7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkbyBgLCBjb25zb2xlLmJvbGQuY3lhbi5jaGFsayhgeXQgbmN1IC11YCksIGAgLCBmb3IgdXBkYXRlIHBhY2thZ2UuanNvbmApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHdyaXRlWWFybkxvY2tmaWxlKHlsLnlhcm5sb2NrX2ZpbGUsIHJldC55YXJubG9ja19uZXdfb2JqKTtcblxuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkbyBgLCBjb25zb2xlLmJvbGQuY3lhbi5jaGFsayhgeXQgaW5zdGFsbGApLCBgICwgZm9yIHVwZ3JhZGUgZGVwZW5kZW5jaWVzIG5vd2ApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19