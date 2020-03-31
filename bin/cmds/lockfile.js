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
const fixNpmLock_1 = require("../../lib/cli/lockfile/fixNpmLock");
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
            alias: ['O'],
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
                        ...s.dependencies,
                        ...s2.dependencies,
                        ...s.dependencies
                    };
                }
                fs.writeJSONSync(file_package_lock_json, fixNpmLock_1.default(s), {
                    spaces: 2,
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
// @ts-ignore
function _is(argv) {
    return true;
}
// @ts-ignore
function _fix(argv) {
    return argv;
}
// @ts-ignore
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBQzFDLG1DQUF5RDtBQUN6RCxrRUFBMkQ7QUFFM0QsTUFBTSxXQUFXLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUU5QyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxxQkFBcUI7SUFFL0IsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSxrQ0FBa0M7WUFDeEMsT0FBTyxFQUFFLElBQUk7U0FFYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx3Q0FBd0M7WUFDOUMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksRUFBRSxnRUFBZ0U7WUFDdEUsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUNwQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixJQUFJLEVBQUUsMEJBQTBCO1lBQ2hDLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDdkMsT0FBTyxDQUFDLE1BQU0sV0FBVyxjQUFjLEVBQUUsa0NBQWtDLENB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SUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUseURBQXlELEVBQUU7WUFDaEcsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHO2dCQUVqQixPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ3pCLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxlQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsZUFBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLCtDQUErQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZJO0lBRUQsT0FBTyxJQUFJLENBQUE7QUFDWixDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMscUJBQXFCLEVBQUUsVUFBVTtJQUVuRCxPQUFPLG1CQUFhLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLFFBQVEsRUFBRyxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVU7SUEyQnRELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBYSxDQUFDLFFBQVEsRUFBRyxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDdkUsQ0FBQztBQXZJRCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IGNoYWxrQnlDb25zb2xlLCBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrLCB5YXJnc1Byb2Nlc3NFeGl0IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgZXhwb3J0WWFybkxvY2ssIHBhcnNlIGFzIHBhcnNlWWFybkxvY2sgfSBmcm9tICcuLi8uLi9saWIveWFybmxvY2snO1xuaW1wb3J0IHsgU2VtVmVyLCByY29tcGFyZSB9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgeyBBcmd1bWVudHMsIENvbW1hbmRNb2R1bGUgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgRGVkdXBlIGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB7IG5wbVRvWWFybkNvcmUsIHlhcm5Ub05wbUNvcmUgfSBmcm9tICdzeW5wMi9saWInO1xuaW1wb3J0IGZpeE5wbUxvY2sgZnJvbSAnLi4vLi4vbGliL2NsaS9sb2NrZmlsZS9maXhOcG1Mb2NrJztcblxuY29uc3QgQ09NTUFORF9LRVkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBzaG93IHlhcm4ubG9jayBpbmZvYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdkdXBsaWNhdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ0QnXSxcblx0XHRcdFx0ZGVzYzogYHNob3cgZHVwbGljYXRlIGxpc3QgYnkgeWFybi5sb2NrYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdFx0Ly9kZWZhdWx0OiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ25wbScsIHtcblx0XHRcdFx0ZGVzYzogYENvbnZlcnQgeWFybi5sb2NrIHRvIHBhY2thZ2UtbG9jay5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCd5YXJuJywge1xuXHRcdFx0XHRkZXNjOiBgQ29udmVydCBwYWNrYWdlLWxvY2suanNvbiB0byB5YXJuLmxvY2sgaWYgeWFybi5sb2NrIG5vdCBleGlzdHNgLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ292ZXJ3cml0ZScsIHtcblx0XHRcdFx0YWxpYXM6IFsnTyddLFxuXHRcdFx0XHRkZXNjOiBgb3ZlcndyaXRlIGZpbGUgaWYgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuY29uZmxpY3RzKCducG0nLCBbJ3lhcm4nLCAnZHVwbGljYXRlJ10pXG5cdFx0XHQuZXhhbXBsZShgJDAgJHtDT01NQU5EX0tFWX0gLS1kdXBsaWNhdGVgLCBgc2hvdyBkdXBsaWNhdGUgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHRcdFx0LmV4YW1wbGUoYCQwICR7Q09NTUFORF9LRVl9IC0tZHVwbGljYXRlIGZhbHNlYCwgYHNob3cgcGFja2FnZXMgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IENPTU1BTkRfS0VZO1xuXG5cdFx0Ly9sZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRcdC8vbGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdGlmIChhcmd2Lnlhcm4gfHwgYXJndi5ucG0pXG5cdFx0e1xuXHRcdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cdFx0XHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRsZXQgZmlsZV9wYWNrYWdlX2xvY2tfanNvbiA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLWxvY2suanNvbicpO1xuXG5cdFx0XHRsZXQgZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMgPSBmcy5leGlzdHNTeW5jKGZpbGVfcGFja2FnZV9sb2NrX2pzb24pO1xuXG5cdFx0XHRpZiAoYXJndi5ucG0pXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgheWwueWFybmxvY2tfZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBub3QgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlICYmIGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHBhY2thZ2UtbG9jay5qc29uIGlzIGV4aXN0cywgdXNlIC0tb3ZlcndyaXRlIGZvciBvdmVyd3JpdGUgZmlsZWApKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHBhY2thZ2UtbG9jay5qc29uIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly95YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIGlzIGV4aXN0c2ApKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHsgbmFtZSwgdmVyc2lvbiB9ID0gcmVhZFBhY2thZ2VKc29uKHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKSk7XG5cblx0XHRcdFx0bGV0IHMgPSB5YXJuVG9OcG0oeWwueWFybmxvY2tfb2xkLCBuYW1lLCB2ZXJzaW9uLCByb290RGF0YS5wa2cpO1xuXG5cdFx0XHRcdGlmIChyb290RGF0YS5oYXNXb3Jrc3BhY2UgJiYgIXJvb3REYXRhLmlzV29ya3NwYWNlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHMyID0geWFyblRvTnBtKHlsLnlhcm5sb2NrX29sZCwgbmFtZSwgdmVyc2lvbiwgcm9vdERhdGEud3MpO1xuXG5cdFx0XHRcdFx0cy5kZXBlbmRlbmNpZXMgPSB7XG5cdFx0XHRcdFx0XHQuLi5zLmRlcGVuZGVuY2llcyxcblx0XHRcdFx0XHRcdC4uLnMyLmRlcGVuZGVuY2llcyxcblx0XHRcdFx0XHRcdC4uLnMuZGVwZW5kZW5jaWVzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnMud3JpdGVKU09OU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uLCBmaXhOcG1Mb2NrKHMpLCB7XG5cdFx0XHRcdFx0c3BhY2VzOiAyLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgcGFja2FnZS1sb2NrLmpzb24gdXBkYXRlZGApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoYXJndi55YXJuKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgeWFybmxvY2tfZmlsZV9wa2cgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAneWFybi5sb2NrJyk7XG5cblx0XHRcdFx0aWYgKGZzLmV4aXN0c1N5bmMoeWFybmxvY2tfZmlsZV9wa2cpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCFhcmd2Lm92ZXJ3cml0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIGlzIGV4aXN0cywgdXNlIC0tb3ZlcndyaXRlIGZvciBvdmVyd3JpdGUgZmlsZWApKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGB5YXJuLmxvY2sgaXMgZXhpc3RzLCB3aWxsIGdvdCBvdmVyd3JpdGVgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoeWwueWFybmxvY2tfZXhpc3RzICYmIHJvb3REYXRhLmhhc1dvcmtzcGFjZSAmJiAhcm9vdERhdGEuaXNXb3Jrc3BhY2UpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHBhY2thZ2UtbG9jay5qc29uIG5vdCBleGlzdHMsIGJ1dCB5YXJuLmxvY2sgZXhpc3RzIGluIHdvcmtzcGFjZXNgKTtcblxuXHRcdFx0XHRcdFx0bGV0IHMgPSBEZWR1cGUoeWwueWFybmxvY2tfb2xkKS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWFybmxvY2tfZmlsZV9wa2csIHMpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgeWFybi5sb2NrIGNvcGllZGApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHBhY2thZ2UtbG9jay5qc29uIG5vdCBleGlzdHNgKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBzID0gbnBtVG9ZYXJuKGZzLnJlYWRGaWxlU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uKS50b1N0cmluZygpLCByb290RGF0YS5yb290KTtcblxuXHRcdFx0XHRzID0gRGVkdXBlKHMpLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnLCBzKVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGB5YXJuLmxvY2sgdXBkYXRlZGApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChhcmd2LmR1cGxpY2F0ZSB8fCAhYXJndi5kdXBsaWNhdGUpXG5cdFx0e1xuXHRcdFx0X3Nob3dZYXJuTG9ja0xpc3QoYXJndilcblx0XHR9XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG50eXBlIElVbnBhY2tDbWRNb2Q8VCBleHRlbmRzIENvbW1hbmRNb2R1bGUsIEQgPSBJVW5wYWNrTXlZYXJnc0FyZ3Y+ID0gVCBleHRlbmRzIENvbW1hbmRNb2R1bGU8YW55LCBpbmZlciBVPiA/IFVcblx0OiBUIGV4dGVuZHMgQ29tbWFuZE1vZHVsZTxpbmZlciBVLCBhbnk+ID8gVVxuXHRcdDogRFxuXHQ7XG5cbi8vIEB0cy1pZ25vcmVcbmZ1bmN0aW9uIF9pcyhhcmd2OiBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj4pOiBhcmd2IGlzIEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Plxue1xuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuLy8gQHRzLWlnbm9yZVxuZnVuY3Rpb24gX2ZpeChhcmd2OiBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj4pXG57XG5cdHJldHVybiBhcmd2O1xufVxuXG4vLyBAdHMtaWdub3JlXG5mdW5jdGlvbiBfc2hvd1lhcm5Mb2NrTGlzdChhcmd2OiBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj4pOiBhcmd2IGlzIEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Plxue1xuXHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdGxldCB5YXJubG9ja19vbGRfb2JqID0gcGFyc2VZYXJuTG9jayh5bC55YXJubG9ja19vbGQpO1xuXG5cdGxldCBmeSA9IGV4cG9ydFlhcm5Mb2NrKHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKGZ5Lmluc3RhbGxlZCk7XG5cblx0bGV0IG1heCA9IDA7XG5cdGxldCBsZW4gPSAwO1xuXG5cdGxldCBrczIgPSBrc1xuXHRcdC5yZWR1Y2UoKGEsIG5hbWUpID0+IHtcblxuXHRcdFx0bGV0IGFyciA9IGZ5Lmluc3RhbGxlZFtuYW1lXTtcblxuXHRcdFx0aWYgKCFhcmd2LmR1cGxpY2F0ZSB8fCBhcnIubGVuZ3RoID4gMSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcnIgPSBhcnIuc29ydChyY29tcGFyZSkucmV2ZXJzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBhcnIyID0gYXJyLnNsaWNlKDAsIC0xKTtcblxuXHRcdFx0XHRpZiAoYXJyMi5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygn4pSc4pSAJywgYXJyMi5qb2luKCdcXG7ilJzilIAgJykpO1xuXG5cdFx0XHRcdFx0bGVuICs9IGFycjIubGVuZ3RoO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZS5sb2coJ+KUlOKUgCcsIGFyclthcnIubGVuZ3RoIC0gMV0pO1xuXG5cdFx0XHRcdG1heCA9IE1hdGgubWF4KG1heCwgYXJyLmxlbmd0aCk7XG5cblx0XHRcdFx0YS5wdXNoKG5hbWUpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIFtdIGFzIHN0cmluZ1tdKVxuXHQ7XG5cblx0bGV0IGNoYWxrID0gY29uc29sZS5jaGFsaztcblxuXHRpZiAoYXJndi5kdXBsaWNhdGUpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcbkZvdW5kIGR1cGxpY2F0ZSBpbiAke2NoYWxrLnllbGxvdyhrczIubGVuZ3RoKX0gcGFja2FnZXMsICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbitrczIubGVuZ3RoKX0gaW5zdGFsbGVkIHZlcnNpb24sIGhpZ2hlc3QgaXMgJHttYXh9LCBpbiB0b3RhbCAke2tzLmxlbmd0aH0gcGFja2FnZXNgKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcblRvdGFsICR7Y2hhbGsueWVsbG93KGtzLmxlbmd0aCl9IHBhY2thZ2VzLCB3aXRoICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbitrczIubGVuZ3RoKX0gaW5zdGFsbGVkIHZlcnNpb25gKTtcblx0fVxuXG5cdGlmIChsZW4gPiAwKVxuXHR7XG5cdFx0Y29uc3QgdGVybWluYWxMaW5rID0gcmVxdWlyZSgndGVybWluYWwtbGluaycpO1xuXHRcdGNvbnN0IGxpbmsgPSB0ZXJtaW5hbExpbmsoJ3NlZSBoZXJlJywgJ2h0dHBzOi8veWFybnBrZy5jb20vZG9jcy9zZWxlY3RpdmUtdmVyc2lvbi1yZXNvbHV0aW9ucy8nLCB7XG5cdFx0XHRmYWxsYmFjayh0ZXh0LCB1cmwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0ZXh0ICsgJyAnICsgdXJsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFlvdSBjYW4gdHJ5IGFkZCB0aGV5IHRvICR7Y29uc29sZS5jaGFsay55ZWxsb3coJ3Jlc29sdXRpb25zJyl9IGluIHBhY2thZ2UuanNvbiwgZm9yIGZvcmNlIHBhY2thZ2UgZGVkdXBlLCAke2xpbmt9YCk7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBucG1Ub1lhcm4ocGFja2FnZUxvY2tGaWxlU3RyaW5nLCBwYWNrYWdlRGlyKTogc3RyaW5nXG57XG5cdHJldHVybiBucG1Ub1lhcm5Db3JlKHBhY2thZ2VMb2NrRmlsZVN0cmluZywgcGFja2FnZURpcik7XG59XG5cbmZ1bmN0aW9uIHlhcm5Ub05wbSh5YXJubG9jaywgIG5hbWUsIHZlcnNpb24sIHBhY2thZ2VEaXIpOiB7XG5cdG5hbWU6IHN0cmluZztcblx0dmVyc2lvbjogc3RyaW5nO1xuXHRsb2NrZmlsZVZlcnNpb246IG51bWJlcjtcblx0cmVxdWlyZXM6IGJvb2xlYW47XG5cdGRlcGVuZGVuY2llczoge1xuXHRcdFtuYW1lOiBzdHJpbmddOiB7XG5cdFx0XHR2ZXJzaW9uOiBzdHJpbmc7XG5cdFx0XHRyZXNvbHZlZDogc3RyaW5nO1xuXHRcdFx0aW50ZWdyaXR5OiBzdHJpbmc7XG5cdFx0XHRyZXF1aXJlczoge1xuXHRcdFx0XHRbbmFtZTogc3RyaW5nXTogc3RyaW5nO1xuXHRcdFx0fTtcblx0XHRcdGRlcGVuZGVuY2llcz86IHtcblx0XHRcdFx0W25hbWU6IHN0cmluZ106IHtcblx0XHRcdFx0XHR2ZXJzaW9uOiBzdHJpbmc7XG5cdFx0XHRcdFx0cmVzb2x2ZWQ6IHN0cmluZztcblx0XHRcdFx0XHRpbnRlZ3JpdHk6IHN0cmluZztcblx0XHRcdFx0XHRyZXF1aXJlczoge1xuXHRcdFx0XHRcdFx0W25hbWU6IHN0cmluZ106IHN0cmluZztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblx0XHR9O1xuXHR9O1xufVxue1xuXHRyZXR1cm4gSlNPTi5wYXJzZSh5YXJuVG9OcG1Db3JlKHlhcm5sb2NrLCAgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcikpXG59XG4iXX0=