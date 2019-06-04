"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
const fs = require("fs-extra");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const yarnlock_1 = require("../../lib/yarnlock");
const semver_1 = require("semver");
const dedupe_1 = require("../../lib/cli/dedupe");
const lib_1 = require("synp2/lib");
const COMMAND_KEY = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `show yarn.lock info`,
    builder(yargs) {
        return yargs
            .option('duplicate', {
            alias: ['D'],
            desc: `show duplicate list by yarn.lock`,
            boolean: true,
        })
            .option('npm', {
            desc: `Convert yarn.lock to package-lock.json`,
            boolean: true,
        })
            .option('yarn', {
            desc: `Convert package-lock.json to yarn.lock if yarn.lock not exists`,
            boolean: true,
        })
            .option('overwrite', {
            desc: `overwrite file if exists`,
            boolean: true,
        })
            .conflicts('npm', ['yarn', 'duplicate'])
            .example(`$0 ${COMMAND_KEY} --duplicate`, `show duplicate list by yarn.lock`)
            .example(`$0 ${COMMAND_KEY} --duplicate false`, `show packages list by yarn.lock`);
    },
    handler(argv) {
        const key = COMMAND_KEY;
        //let rootData = findRoot(argv, true);
        //let yl = fsYarnLock(rootData.root);
        if (argv.yarn || argv.npm) {
            let rootData = index_1.findRoot(argv, true);
            let yl = index_1.fsYarnLock(rootData.root);
            let file_package_lock_json = path.join(rootData.pkg, 'package-lock.json');
            let file_package_lock_json_exists = fs.existsSync(file_package_lock_json);
            if (argv.npm) {
                if (!yl.yarnlock_exists) {
                    index_1.yargsProcessExit(new Error(`yarn.lock not exists`));
                }
                if (!argv.overwrite && file_package_lock_json_exists) {
                    index_1.yargsProcessExit(new Error(`package-lock.json is exists, use --overwrite for overwrite file`));
                }
                else if (file_package_lock_json_exists) {
                    index_1.consoleDebug.warn(`package-lock.json is exists, will got overwrite`);
                }
                if (!argv.overwrite) {
                    //yargsProcessExit(new Error(`yarn.lock is exists`))
                }
                let { name, version } = package_dts_1.readPackageJson(path.join(rootData.pkg, 'package.json'));
                let s = yarnToNpm(yl.yarnlock_old, name, version, rootData.pkg);
                if (rootData.hasWorkspace && !rootData.isWorkspace) {
                    let s2 = yarnToNpm(yl.yarnlock_old, name, version, rootData.ws);
                    s.dependencies = {
                        ...s2.dependencies,
                        ...s.dependencies
                    };
                }
                fs.writeJSONSync(file_package_lock_json, s, {
                    spaces: '\t',
                });
                index_1.consoleDebug.info(`package-lock.json updated`);
            }
            else if (argv.yarn) {
                let yarnlock_file_pkg = path.join(rootData.pkg, 'yarn.lock');
                if (fs.existsSync(yarnlock_file_pkg)) {
                    if (!argv.overwrite) {
                        index_1.yargsProcessExit(new Error(`yarn.lock is exists, use --overwrite for overwrite file`));
                    }
                    index_1.consoleDebug.warn(`yarn.lock is exists, will got overwrite`);
                }
                if (!file_package_lock_json_exists) {
                    if (yl.yarnlock_exists && rootData.hasWorkspace && !rootData.isWorkspace) {
                        index_1.consoleDebug.warn(`package-lock.json not exists, but yarn.lock exists in workspaces`);
                        let s = dedupe_1.default(yl.yarnlock_old).yarnlock_new;
                        fs.writeFileSync(yarnlock_file_pkg, s);
                        index_1.consoleDebug.info(`yarn.lock copied`);
                        return;
                    }
                    index_1.yargsProcessExit(new Error(`package-lock.json not exists`));
                }
                let s = npmToYarn(fs.readFileSync(file_package_lock_json).toString(), rootData.root);
                s = dedupe_1.default(s).yarnlock_new;
                fs.writeFileSync(yarnlock_file_pkg, s);
                index_1.consoleDebug.info(`yarn.lock updated`);
            }
        }
        else if (argv.duplicate || !argv.duplicate) {
            _showYarnLockList(argv);
        }
    },
});
function _is(argv) {
    return true;
}
function _fix(argv) {
    return argv;
}
function _showYarnLockList(argv) {
    let rootData = index_1.findRoot(argv, true);
    let yl = index_1.fsYarnLock(rootData.root);
    let yarnlock_old_obj = yarnlock_1.parse(yl.yarnlock_old);
    let fy = yarnlock_1.exportYarnLock(yarnlock_old_obj);
    let ks = Object.keys(fy.installed);
    let max = 0;
    let len = 0;
    let ks2 = ks
        .reduce((a, name) => {
        let arr = fy.installed[name];
        if (!argv.duplicate || arr.length > 1) {
            index_1.console.log(name);
            try {
                arr = arr.sort(semver_1.rcompare).reverse();
            }
            catch (e) {
            }
            let arr2 = arr.slice(0, -1);
            if (arr2.length) {
                index_1.console.log('├─', arr2.join('\n├─ '));
                len += arr2.length;
            }
            index_1.console.log('└─', arr[arr.length - 1]);
            max = Math.max(max, arr.length);
            a.push(name);
        }
        return a;
    }, []);
    let chalk = index_1.console.chalk;
    if (argv.duplicate) {
        // @ts-ignore
        index_1.console.cyan.info(`\nFound duplicate in ${chalk.yellow(ks2.length)} packages, ${chalk.yellow(len)}/${chalk.yellow(len + ks2.length)} installed version, highest is ${max}, in total ${ks.length} packages`);
    }
    else {
        // @ts-ignore
        index_1.console.cyan.info(`\nTotal ${chalk.yellow(ks.length)} packages, with ${chalk.yellow(len)}/${chalk.yellow(len + ks2.length)} installed version`);
    }
    if (len > 0) {
        const terminalLink = require('terminal-link');
        const link = terminalLink('see here', 'https://yarnpkg.com/docs/selective-version-resolutions/', {
            fallback(text, url) {
                return text + ' ' + url;
            }
        });
        index_1.console.cyan.info(`You can try add they to ${index_1.console.chalk.yellow('resolutions')} in package.json, for force package dedupe, ${link}`);
    }
    return true;
}
function npmToYarn(packageLockFileString, packageDir) {
    return lib_1.npmToYarnCore(packageLockFileString, packageDir);
}
function yarnToNpm(yarnlock, name, version, packageDir) {
    return JSON.parse(lib_1.yarnToNpmCore(yarnlock, name, version, packageDir));
}
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBQzFDLG1DQUF5RDtBQUV6RCxNQUFNLFdBQVcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLHFCQUFxQjtJQUUvQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osSUFBSSxFQUFFLGtDQUFrQztZQUN4QyxPQUFPLEVBQUUsSUFBSTtTQUViLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLHdDQUF3QztZQUM5QyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxFQUFFLGdFQUFnRTtZQUN0RSxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzthQUN2QyxPQUFPLENBQUMsTUFBTSxXQUFXLGNBQWMsRUFBRSxrQ0FBa0MsQ0FBQzthQUM1RSxPQUFPLENBQUMsTUFBTSxXQUFXLG9CQUFvQixFQUFFLGlDQUFpQyxDQUFDLENBQUE7SUFDcEYsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDO1FBRXhCLHNDQUFzQztRQUV0QyxxQ0FBcUM7UUFFckMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQ3pCO1lBQ0MsSUFBSSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxFQUFFLEdBQUcsa0JBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbkMsSUFBSSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUUxRSxJQUFJLDZCQUE2QixHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUUxRSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQ1o7Z0JBQ0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQ3ZCO29CQUNDLHdCQUFnQixDQUFDLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtpQkFDbkQ7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksNkJBQTZCLEVBQ3BEO29CQUNDLHdCQUFnQixDQUFDLElBQUksS0FBSyxDQUFDLGlFQUFpRSxDQUFDLENBQUMsQ0FBQTtpQkFDOUY7cUJBQ0ksSUFBSSw2QkFBNkIsRUFDdEM7b0JBQ0Msb0JBQVksQ0FBQyxJQUFJLENBQUMsaURBQWlELENBQUMsQ0FBQztpQkFDckU7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ25CO29CQUNDLG9EQUFvRDtpQkFDcEQ7Z0JBRUQsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyw2QkFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUVqRixJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFaEUsSUFBSSxRQUFRLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFDbEQ7b0JBQ0MsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRWhFLENBQUMsQ0FBQyxZQUFZLEdBQUc7d0JBQ2hCLEdBQUcsRUFBRSxDQUFDLFlBQVk7d0JBQ2xCLEdBQUcsQ0FBQyxDQUFDLFlBQVk7cUJBQ2pCLENBQUE7aUJBQ0Q7Z0JBRUQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLEVBQUU7b0JBQzNDLE1BQU0sRUFBRSxJQUFJO2lCQUNaLENBQUMsQ0FBQztnQkFFSCxvQkFBWSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2FBQy9DO2lCQUNJLElBQUksSUFBSSxDQUFDLElBQUksRUFDbEI7Z0JBQ0MsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBRTdELElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUNwQztvQkFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDbkI7d0JBQ0Msd0JBQWdCLENBQUMsSUFBSSxLQUFLLENBQUMseURBQXlELENBQUMsQ0FBQyxDQUFBO3FCQUN0RjtvQkFFRCxvQkFBWSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO2lCQUM3RDtnQkFFRCxJQUFJLENBQUMsNkJBQTZCLEVBQ2xDO29CQUNDLElBQUksRUFBRSxDQUFDLGVBQWUsSUFBSSxRQUFRLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFDeEU7d0JBQ0Msb0JBQVksQ0FBQyxJQUFJLENBQUMsa0VBQWtFLENBQUMsQ0FBQzt3QkFFdEYsSUFBSSxDQUFDLEdBQUcsZ0JBQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsWUFBWSxDQUFDO3dCQUU3QyxFQUFFLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUV2QyxvQkFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUV0QyxPQUFPO3FCQUNQO29CQUVELHdCQUFnQixDQUFDLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQTtpQkFDM0Q7Z0JBRUQsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXJGLENBQUMsR0FBRyxnQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztnQkFFM0IsRUFBRSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFFdEMsb0JBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUN2QztTQUNEO2FBQ0ksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDMUM7WUFDQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUN2QjtJQUVGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFTSCxTQUFTLEdBQUcsQ0FBQyxJQUFnRDtJQUU1RCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLElBQUksQ0FBQyxJQUFnRDtJQUU3RCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLElBQWdEO0lBRTFFLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXBDLElBQUksRUFBRSxHQUFHLGtCQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5DLElBQUksZ0JBQWdCLEdBQUcsZ0JBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFdEQsSUFBSSxFQUFFLEdBQUcseUJBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTFDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRW5DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUVaLElBQUksR0FBRyxHQUFHLEVBQUU7U0FDVixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFFbkIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDckM7WUFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxCLElBQ0E7Z0JBQ0MsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ25DO1lBQ0QsT0FBTyxDQUFDLEVBQ1I7YUFFQztZQUVELElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUNmO2dCQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFFdEMsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDbkI7WUFFRCxlQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNaO1FBRUQsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQ2xCO0lBRUQsSUFBSSxLQUFLLEdBQUcsZUFBTyxDQUFDLEtBQUssQ0FBQztJQUUxQixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQ2xCO1FBQ0MsYUFBYTtRQUNiLGVBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsa0NBQWtDLEdBQUcsY0FBYyxFQUFFLENBQUMsTUFBTSxXQUFXLENBQUMsQ0FBQztLQUMxTTtTQUVEO1FBQ0MsYUFBYTtRQUNiLGVBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLG1CQUFtQixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUM5STtJQUVELElBQUksR0FBRyxHQUFHLENBQUMsRUFDWDtRQUNDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QyxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLHlEQUF5RCxFQUFFO1lBQ2hHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRztnQkFFakIsT0FBTyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUN6QixDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsZUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLGVBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQywrQ0FBK0MsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN2STtJQUVELE9BQU8sSUFBSSxDQUFBO0FBQ1osQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLFVBQVU7SUFFbkQsT0FBTyxtQkFBYSxDQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVO0lBMkJ0RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQWEsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ3ZFLENBQUM7QUFwSUQsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jaywgeWFyZ3NQcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBleHBvcnRZYXJuTG9jaywgcGFyc2UgYXMgcGFyc2VZYXJuTG9jayB9IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBTZW1WZXIsIHJjb21wYXJlIH0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQ29tbWFuZE1vZHVsZSB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBEZWR1cGUgZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgbnBtVG9ZYXJuQ29yZSwgeWFyblRvTnBtQ29yZSB9IGZyb20gJ3N5bnAyL2xpYic7XG5cbmNvbnN0IENPTU1BTkRfS0VZID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgc2hvdyB5YXJuLmxvY2sgaW5mb2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbignZHVwbGljYXRlJywge1xuXHRcdFx0XHRhbGlhczogWydEJ10sXG5cdFx0XHRcdGRlc2M6IGBzaG93IGR1cGxpY2F0ZSBsaXN0IGJ5IHlhcm4ubG9ja2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRcdC8vZGVmYXVsdDogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCducG0nLCB7XG5cdFx0XHRcdGRlc2M6IGBDb252ZXJ0IHlhcm4ubG9jayB0byBwYWNrYWdlLWxvY2suanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbigneWFybicsIHtcblx0XHRcdFx0ZGVzYzogYENvbnZlcnQgcGFja2FnZS1sb2NrLmpzb24gdG8geWFybi5sb2NrIGlmIHlhcm4ubG9jayBub3QgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdvdmVyd3JpdGUnLCB7XG5cdFx0XHRcdGRlc2M6IGBvdmVyd3JpdGUgZmlsZSBpZiBleGlzdHNgLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5jb25mbGljdHMoJ25wbScsIFsneWFybicsICdkdXBsaWNhdGUnXSlcblx0XHRcdC5leGFtcGxlKGAkMCAke0NPTU1BTkRfS0VZfSAtLWR1cGxpY2F0ZWAsIGBzaG93IGR1cGxpY2F0ZSBsaXN0IGJ5IHlhcm4ubG9ja2ApXG5cdFx0XHQuZXhhbXBsZShgJDAgJHtDT01NQU5EX0tFWX0gLS1kdXBsaWNhdGUgZmFsc2VgLCBgc2hvdyBwYWNrYWdlcyBsaXN0IGJ5IHlhcm4ubG9ja2ApXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gQ09NTUFORF9LRVk7XG5cblx0XHQvL2xldCByb290RGF0YSA9IGZpbmRSb290KGFyZ3YsIHRydWUpO1xuXG5cdFx0Ly9sZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0aWYgKGFyZ3YueWFybiB8fCBhcmd2Lm5wbSlcblx0XHR7XG5cdFx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCBmaWxlX3BhY2thZ2VfbG9ja19qc29uID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UtbG9jay5qc29uJyk7XG5cblx0XHRcdGxldCBmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cyA9IGZzLmV4aXN0c1N5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbik7XG5cblx0XHRcdGlmIChhcmd2Lm5wbSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKCF5bC55YXJubG9ja19leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIG5vdCBleGlzdHNgKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUgJiYgZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgcGFja2FnZS1sb2NrLmpzb24gaXMgZXhpc3RzLCB1c2UgLS1vdmVyd3JpdGUgZm9yIG92ZXJ3cml0ZSBmaWxlYCkpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgcGFja2FnZS1sb2NrLmpzb24gaXMgZXhpc3RzLCB3aWxsIGdvdCBvdmVyd3JpdGVgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL3lhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGB5YXJuLmxvY2sgaXMgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgeyBuYW1lLCB2ZXJzaW9uIH0gPSByZWFkUGFja2FnZUpzb24ocGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpKTtcblxuXHRcdFx0XHRsZXQgcyA9IHlhcm5Ub05wbSh5bC55YXJubG9ja19vbGQsIG5hbWUsIHZlcnNpb24sIHJvb3REYXRhLnBrZyk7XG5cblx0XHRcdFx0aWYgKHJvb3REYXRhLmhhc1dvcmtzcGFjZSAmJiAhcm9vdERhdGEuaXNXb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgczIgPSB5YXJuVG9OcG0oeWwueWFybmxvY2tfb2xkLCBuYW1lLCB2ZXJzaW9uLCByb290RGF0YS53cyk7XG5cblx0XHRcdFx0XHRzLmRlcGVuZGVuY2llcyA9IHtcblx0XHRcdFx0XHRcdC4uLnMyLmRlcGVuZGVuY2llcyxcblx0XHRcdFx0XHRcdC4uLnMuZGVwZW5kZW5jaWVzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnMud3JpdGVKU09OU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uLCBzLCB7XG5cdFx0XHRcdFx0c3BhY2VzOiAnXFx0Jyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UtbG9jay5qc29uIHVwZGF0ZWRgKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGFyZ3YueWFybilcblx0XHRcdHtcblx0XHRcdFx0bGV0IHlhcm5sb2NrX2ZpbGVfcGtnID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3lhcm4ubG9jaycpO1xuXG5cdFx0XHRcdGlmIChmcy5leGlzdHNTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBpcyBleGlzdHMsIHVzZSAtLW92ZXJ3cml0ZSBmb3Igb3ZlcndyaXRlIGZpbGVgKSlcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgeWFybi5sb2NrIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHlsLnlhcm5sb2NrX2V4aXN0cyAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2UgJiYgIXJvb3REYXRhLmlzV29ya3NwYWNlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGBwYWNrYWdlLWxvY2suanNvbiBub3QgZXhpc3RzLCBidXQgeWFybi5sb2NrIGV4aXN0cyBpbiB3b3Jrc3BhY2VzYCk7XG5cblx0XHRcdFx0XHRcdGxldCBzID0gRGVkdXBlKHlsLnlhcm5sb2NrX29sZCkueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnLCBzKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHlhcm4ubG9jayBjb3BpZWRgKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGBwYWNrYWdlLWxvY2suanNvbiBub3QgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgcyA9IG5wbVRvWWFybihmcy5yZWFkRmlsZVN5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbikudG9TdHJpbmcoKSwgcm9vdERhdGEucm9vdCk7XG5cblx0XHRcdFx0cyA9IERlZHVwZShzKS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5YXJubG9ja19maWxlX3BrZywgcylcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgeWFybi5sb2NrIHVwZGF0ZWRgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoYXJndi5kdXBsaWNhdGUgfHwgIWFyZ3YuZHVwbGljYXRlKVxuXHRcdHtcblx0XHRcdF9zaG93WWFybkxvY2tMaXN0KGFyZ3YpXG5cdFx0fVxuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxudHlwZSBJVW5wYWNrQ21kTW9kPFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlLCBEID0gSVVucGFja015WWFyZ3NBcmd2PiA9IFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlPGFueSwgaW5mZXIgVT4gPyBVXG5cdDogVCBleHRlbmRzIENvbW1hbmRNb2R1bGU8aW5mZXIgVSwgYW55PiA/IFVcblx0XHQ6IERcblx0O1xuXG5mdW5jdGlvbiBfaXMoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KTogYXJndiBpcyBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj5cbntcblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIF9maXgoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KVxue1xuXHRyZXR1cm4gYXJndjtcbn1cblxuZnVuY3Rpb24gX3Nob3dZYXJuTG9ja0xpc3QoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KTogYXJndiBpcyBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj5cbntcblx0bGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cblx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWwueWFybmxvY2tfb2xkKTtcblxuXHRsZXQgZnkgPSBleHBvcnRZYXJuTG9jayh5YXJubG9ja19vbGRfb2JqKTtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyhmeS5pbnN0YWxsZWQpO1xuXG5cdGxldCBtYXggPSAwO1xuXHRsZXQgbGVuID0gMDtcblxuXHRsZXQga3MyID0ga3Ncblx0XHQucmVkdWNlKChhLCBuYW1lKSA9PiB7XG5cblx0XHRcdGxldCBhcnIgPSBmeS5pbnN0YWxsZWRbbmFtZV07XG5cblx0XHRcdGlmICghYXJndi5kdXBsaWNhdGUgfHwgYXJyLmxlbmd0aCA+IDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5hbWUpO1xuXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJyID0gYXJyLnNvcnQocmNvbXBhcmUpLnJldmVyc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgYXJyMiA9IGFyci5zbGljZSgwLCAtMSk7XG5cblx0XHRcdFx0aWYgKGFycjIubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFycjIuam9pbignXFxu4pSc4pSAICcpKTtcblxuXHRcdFx0XHRcdGxlbiArPSBhcnIyLmxlbmd0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCBhcnJbYXJyLmxlbmd0aCAtIDFdKTtcblxuXHRcdFx0XHRtYXggPSBNYXRoLm1heChtYXgsIGFyci5sZW5ndGgpO1xuXG5cdFx0XHRcdGEucHVzaChuYW1lKVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYTtcblx0XHR9LCBbXSBhcyBzdHJpbmdbXSlcblx0O1xuXG5cdGxldCBjaGFsayA9IGNvbnNvbGUuY2hhbGs7XG5cblx0aWYgKGFyZ3YuZHVwbGljYXRlKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBcXG5Gb3VuZCBkdXBsaWNhdGUgaW4gJHtjaGFsay55ZWxsb3coa3MyLmxlbmd0aCl9IHBhY2thZ2VzLCAke2NoYWxrLnllbGxvdyhsZW4pfS8ke2NoYWxrLnllbGxvdyhsZW4ra3MyLmxlbmd0aCl9IGluc3RhbGxlZCB2ZXJzaW9uLCBoaWdoZXN0IGlzICR7bWF4fSwgaW4gdG90YWwgJHtrcy5sZW5ndGh9IHBhY2thZ2VzYCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBcXG5Ub3RhbCAke2NoYWxrLnllbGxvdyhrcy5sZW5ndGgpfSBwYWNrYWdlcywgd2l0aCAke2NoYWxrLnllbGxvdyhsZW4pfS8ke2NoYWxrLnllbGxvdyhsZW4ra3MyLmxlbmd0aCl9IGluc3RhbGxlZCB2ZXJzaW9uYCk7XG5cdH1cblxuXHRpZiAobGVuID4gMClcblx0e1xuXHRcdGNvbnN0IHRlcm1pbmFsTGluayA9IHJlcXVpcmUoJ3Rlcm1pbmFsLWxpbmsnKTtcblx0XHRjb25zdCBsaW5rID0gdGVybWluYWxMaW5rKCdzZWUgaGVyZScsICdodHRwczovL3lhcm5wa2cuY29tL2RvY3Mvc2VsZWN0aXZlLXZlcnNpb24tcmVzb2x1dGlvbnMvJywge1xuXHRcdFx0ZmFsbGJhY2sodGV4dCwgdXJsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGV4dCArICcgJyArIHVybDtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBZb3UgY2FuIHRyeSBhZGQgdGhleSB0byAke2NvbnNvbGUuY2hhbGsueWVsbG93KCdyZXNvbHV0aW9ucycpfSBpbiBwYWNrYWdlLmpzb24sIGZvciBmb3JjZSBwYWNrYWdlIGRlZHVwZSwgJHtsaW5rfWApO1xuXHR9XG5cblx0cmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gbnBtVG9ZYXJuKHBhY2thZ2VMb2NrRmlsZVN0cmluZywgcGFja2FnZURpcik6IHN0cmluZ1xue1xuXHRyZXR1cm4gbnBtVG9ZYXJuQ29yZShwYWNrYWdlTG9ja0ZpbGVTdHJpbmcsIHBhY2thZ2VEaXIpO1xufVxuXG5mdW5jdGlvbiB5YXJuVG9OcG0oeWFybmxvY2ssICBuYW1lLCB2ZXJzaW9uLCBwYWNrYWdlRGlyKToge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHZlcnNpb246IHN0cmluZztcblx0bG9ja2ZpbGVWZXJzaW9uOiBudW1iZXI7XG5cdHJlcXVpcmVzOiBib29sZWFuO1xuXHRkZXBlbmRlbmNpZXM6IHtcblx0XHRbbmFtZTogc3RyaW5nXToge1xuXHRcdFx0dmVyc2lvbjogc3RyaW5nO1xuXHRcdFx0cmVzb2x2ZWQ6IHN0cmluZztcblx0XHRcdGludGVncml0eTogc3RyaW5nO1xuXHRcdFx0cmVxdWlyZXM6IHtcblx0XHRcdFx0W25hbWU6IHN0cmluZ106IHN0cmluZztcblx0XHRcdH07XG5cdFx0XHRkZXBlbmRlbmNpZXM/OiB7XG5cdFx0XHRcdFtuYW1lOiBzdHJpbmddOiB7XG5cdFx0XHRcdFx0dmVyc2lvbjogc3RyaW5nO1xuXHRcdFx0XHRcdHJlc29sdmVkOiBzdHJpbmc7XG5cdFx0XHRcdFx0aW50ZWdyaXR5OiBzdHJpbmc7XG5cdFx0XHRcdFx0cmVxdWlyZXM6IHtcblx0XHRcdFx0XHRcdFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fTtcblx0fTtcbn1cbntcblx0cmV0dXJuIEpTT04ucGFyc2UoeWFyblRvTnBtQ29yZSh5YXJubG9jaywgIG5hbWUsIHZlcnNpb24sIHBhY2thZ2VEaXIpKVxufVxuIl19