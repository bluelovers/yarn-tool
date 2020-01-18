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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBQzFDLG1DQUF5RDtBQUV6RCxNQUFNLFdBQVcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLHFCQUFxQjtJQUUvQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osSUFBSSxFQUFFLGtDQUFrQztZQUN4QyxPQUFPLEVBQUUsSUFBSTtTQUViLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLHdDQUF3QztZQUM5QyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxFQUFFLGdFQUFnRTtZQUN0RSxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzthQUN2QyxPQUFPLENBQUMsTUFBTSxXQUFXLGNBQWMsRUFBRSxrQ0FBa0MsQ0FBQzthQUM1RSxPQUFP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QUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUN6QixDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsZUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLGVBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQywrQ0FBK0MsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN2STtJQUVELE9BQU8sSUFBSSxDQUFBO0FBQ1osQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLFVBQVU7SUFFbkQsT0FBTyxtQkFBYSxDQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVO0lBMkJ0RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQWEsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ3ZFLENBQUM7QUFwSUQsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jaywgeWFyZ3NQcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGV4cG9ydFlhcm5Mb2NrLCBwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrIH0gZnJvbSAnLi4vLi4vbGliL3lhcm5sb2NrJztcbmltcG9ydCB7IFNlbVZlciwgcmNvbXBhcmUgfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHsgQXJndW1lbnRzLCBDb21tYW5kTW9kdWxlIH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IERlZHVwZSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeyBucG1Ub1lhcm5Db3JlLCB5YXJuVG9OcG1Db3JlIH0gZnJvbSAnc3lucDIvbGliJztcblxuY29uc3QgQ09NTUFORF9LRVkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBzaG93IHlhcm4ubG9jayBpbmZvYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdkdXBsaWNhdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ0QnXSxcblx0XHRcdFx0ZGVzYzogYHNob3cgZHVwbGljYXRlIGxpc3QgYnkgeWFybi5sb2NrYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdFx0Ly9kZWZhdWx0OiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ25wbScsIHtcblx0XHRcdFx0ZGVzYzogYENvbnZlcnQgeWFybi5sb2NrIHRvIHBhY2thZ2UtbG9jay5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCd5YXJuJywge1xuXHRcdFx0XHRkZXNjOiBgQ29udmVydCBwYWNrYWdlLWxvY2suanNvbiB0byB5YXJuLmxvY2sgaWYgeWFybi5sb2NrIG5vdCBleGlzdHNgLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ292ZXJ3cml0ZScsIHtcblx0XHRcdFx0YWxpYXM6IFsnTyddLFxuXHRcdFx0XHRkZXNjOiBgb3ZlcndyaXRlIGZpbGUgaWYgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuY29uZmxpY3RzKCducG0nLCBbJ3lhcm4nLCAnZHVwbGljYXRlJ10pXG5cdFx0XHQuZXhhbXBsZShgJDAgJHtDT01NQU5EX0tFWX0gLS1kdXBsaWNhdGVgLCBgc2hvdyBkdXBsaWNhdGUgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHRcdFx0LmV4YW1wbGUoYCQwICR7Q09NTUFORF9LRVl9IC0tZHVwbGljYXRlIGZhbHNlYCwgYHNob3cgcGFja2FnZXMgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IENPTU1BTkRfS0VZO1xuXG5cdFx0Ly9sZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRcdC8vbGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdGlmIChhcmd2Lnlhcm4gfHwgYXJndi5ucG0pXG5cdFx0e1xuXHRcdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cdFx0XHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRsZXQgZmlsZV9wYWNrYWdlX2xvY2tfanNvbiA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLWxvY2suanNvbicpO1xuXG5cdFx0XHRsZXQgZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMgPSBmcy5leGlzdHNTeW5jKGZpbGVfcGFja2FnZV9sb2NrX2pzb24pO1xuXG5cdFx0XHRpZiAoYXJndi5ucG0pXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgheWwueWFybmxvY2tfZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBub3QgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlICYmIGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHBhY2thZ2UtbG9jay5qc29uIGlzIGV4aXN0cywgdXNlIC0tb3ZlcndyaXRlIGZvciBvdmVyd3JpdGUgZmlsZWApKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHBhY2thZ2UtbG9jay5qc29uIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly95YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIGlzIGV4aXN0c2ApKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHsgbmFtZSwgdmVyc2lvbiB9ID0gcmVhZFBhY2thZ2VKc29uKHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKSk7XG5cblx0XHRcdFx0bGV0IHMgPSB5YXJuVG9OcG0oeWwueWFybmxvY2tfb2xkLCBuYW1lLCB2ZXJzaW9uLCByb290RGF0YS5wa2cpO1xuXG5cdFx0XHRcdGlmIChyb290RGF0YS5oYXNXb3Jrc3BhY2UgJiYgIXJvb3REYXRhLmlzV29ya3NwYWNlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHMyID0geWFyblRvTnBtKHlsLnlhcm5sb2NrX29sZCwgbmFtZSwgdmVyc2lvbiwgcm9vdERhdGEud3MpO1xuXG5cdFx0XHRcdFx0cy5kZXBlbmRlbmNpZXMgPSB7XG5cdFx0XHRcdFx0XHQuLi5zMi5kZXBlbmRlbmNpZXMsXG5cdFx0XHRcdFx0XHQuLi5zLmRlcGVuZGVuY2llc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZzLndyaXRlSlNPTlN5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbiwgcywge1xuXHRcdFx0XHRcdHNwYWNlczogJ1xcdCcsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBwYWNrYWdlLWxvY2suanNvbiB1cGRhdGVkYCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChhcmd2Lnlhcm4pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB5YXJubG9ja19maWxlX3BrZyA9IHBhdGguam9pbihyb290RGF0YS5wa2csICd5YXJuLmxvY2snKTtcblxuXHRcdFx0XHRpZiAoZnMuZXhpc3RzU3luYyh5YXJubG9ja19maWxlX3BrZykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGB5YXJuLmxvY2sgaXMgZXhpc3RzLCB1c2UgLS1vdmVyd3JpdGUgZm9yIG92ZXJ3cml0ZSBmaWxlYCkpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHlhcm4ubG9jayBpcyBleGlzdHMsIHdpbGwgZ290IG92ZXJ3cml0ZWApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICh5bC55YXJubG9ja19leGlzdHMgJiYgcm9vdERhdGEuaGFzV29ya3NwYWNlICYmICFyb290RGF0YS5pc1dvcmtzcGFjZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgcGFja2FnZS1sb2NrLmpzb24gbm90IGV4aXN0cywgYnV0IHlhcm4ubG9jayBleGlzdHMgaW4gd29ya3NwYWNlc2ApO1xuXG5cdFx0XHRcdFx0XHRsZXQgcyA9IERlZHVwZSh5bC55YXJubG9ja19vbGQpLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5YXJubG9ja19maWxlX3BrZywgcyk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGB5YXJuLmxvY2sgY29waWVkYCk7XG5cblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgcGFja2FnZS1sb2NrLmpzb24gbm90IGV4aXN0c2ApKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHMgPSBucG1Ub1lhcm4oZnMucmVhZEZpbGVTeW5jKGZpbGVfcGFja2FnZV9sb2NrX2pzb24pLnRvU3RyaW5nKCksIHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRcdHMgPSBEZWR1cGUocykueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWFybmxvY2tfZmlsZV9wa2csIHMpXG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHlhcm4ubG9jayB1cGRhdGVkYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGFyZ3YuZHVwbGljYXRlIHx8ICFhcmd2LmR1cGxpY2F0ZSlcblx0XHR7XG5cdFx0XHRfc2hvd1lhcm5Mb2NrTGlzdChhcmd2KVxuXHRcdH1cblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG5cbnR5cGUgSVVucGFja0NtZE1vZDxUIGV4dGVuZHMgQ29tbWFuZE1vZHVsZSwgRCA9IElVbnBhY2tNeVlhcmdzQXJndj4gPSBUIGV4dGVuZHMgQ29tbWFuZE1vZHVsZTxhbnksIGluZmVyIFU+ID8gVVxuXHQ6IFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlPGluZmVyIFUsIGFueT4gPyBVXG5cdFx0OiBEXG5cdDtcblxuZnVuY3Rpb24gX2lzKGFyZ3Y6IEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Pik6IGFyZ3YgaXMgQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+XG57XG5cdHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBfZml4KGFyZ3Y6IEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Pilcbntcblx0cmV0dXJuIGFyZ3Y7XG59XG5cbmZ1bmN0aW9uIF9zaG93WWFybkxvY2tMaXN0KGFyZ3Y6IEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Pik6IGFyZ3YgaXMgQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+XG57XG5cdGxldCByb290RGF0YSA9IGZpbmRSb290KGFyZ3YsIHRydWUpO1xuXG5cdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlsLnlhcm5sb2NrX29sZCk7XG5cblx0bGV0IGZ5ID0gZXhwb3J0WWFybkxvY2soeWFybmxvY2tfb2xkX29iaik7XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMoZnkuaW5zdGFsbGVkKTtcblxuXHRsZXQgbWF4ID0gMDtcblx0bGV0IGxlbiA9IDA7XG5cblx0bGV0IGtzMiA9IGtzXG5cdFx0LnJlZHVjZSgoYSwgbmFtZSkgPT4ge1xuXG5cdFx0XHRsZXQgYXJyID0gZnkuaW5zdGFsbGVkW25hbWVdO1xuXG5cdFx0XHRpZiAoIWFyZ3YuZHVwbGljYXRlIHx8IGFyci5sZW5ndGggPiAxKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmxvZyhuYW1lKTtcblxuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFyciA9IGFyci5zb3J0KHJjb21wYXJlKS5yZXZlcnNlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGFycjIgPSBhcnIuc2xpY2UoMCwgLTEpO1xuXG5cdFx0XHRcdGlmIChhcnIyLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCfilJzilIAnLCBhcnIyLmpvaW4oJ1xcbuKUnOKUgCAnKSk7XG5cblx0XHRcdFx0XHRsZW4gKz0gYXJyMi5sZW5ndGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zb2xlLmxvZygn4pSU4pSAJywgYXJyW2Fyci5sZW5ndGggLSAxXSk7XG5cblx0XHRcdFx0bWF4ID0gTWF0aC5tYXgobWF4LCBhcnIubGVuZ3RoKTtcblxuXHRcdFx0XHRhLnB1c2gobmFtZSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGE7XG5cdFx0fSwgW10gYXMgc3RyaW5nW10pXG5cdDtcblxuXHRsZXQgY2hhbGsgPSBjb25zb2xlLmNoYWxrO1xuXG5cdGlmIChhcmd2LmR1cGxpY2F0ZSlcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjb25zb2xlLmN5YW4uaW5mbyhgXFxuRm91bmQgZHVwbGljYXRlIGluICR7Y2hhbGsueWVsbG93KGtzMi5sZW5ndGgpfSBwYWNrYWdlcywgJHtjaGFsay55ZWxsb3cobGVuKX0vJHtjaGFsay55ZWxsb3cobGVuK2tzMi5sZW5ndGgpfSBpbnN0YWxsZWQgdmVyc2lvbiwgaGlnaGVzdCBpcyAke21heH0sIGluIHRvdGFsICR7a3MubGVuZ3RofSBwYWNrYWdlc2ApO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjb25zb2xlLmN5YW4uaW5mbyhgXFxuVG90YWwgJHtjaGFsay55ZWxsb3coa3MubGVuZ3RoKX0gcGFja2FnZXMsIHdpdGggJHtjaGFsay55ZWxsb3cobGVuKX0vJHtjaGFsay55ZWxsb3cobGVuK2tzMi5sZW5ndGgpfSBpbnN0YWxsZWQgdmVyc2lvbmApO1xuXHR9XG5cblx0aWYgKGxlbiA+IDApXG5cdHtcblx0XHRjb25zdCB0ZXJtaW5hbExpbmsgPSByZXF1aXJlKCd0ZXJtaW5hbC1saW5rJyk7XG5cdFx0Y29uc3QgbGluayA9IHRlcm1pbmFsTGluaygnc2VlIGhlcmUnLCAnaHR0cHM6Ly95YXJucGtnLmNvbS9kb2NzL3NlbGVjdGl2ZS12ZXJzaW9uLXJlc29sdXRpb25zLycsIHtcblx0XHRcdGZhbGxiYWNrKHRleHQsIHVybClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRleHQgKyAnICcgKyB1cmw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRjb25zb2xlLmN5YW4uaW5mbyhgWW91IGNhbiB0cnkgYWRkIHRoZXkgdG8gJHtjb25zb2xlLmNoYWxrLnllbGxvdygncmVzb2x1dGlvbnMnKX0gaW4gcGFja2FnZS5qc29uLCBmb3IgZm9yY2UgcGFja2FnZSBkZWR1cGUsICR7bGlua31gKTtcblx0fVxuXG5cdHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIG5wbVRvWWFybihwYWNrYWdlTG9ja0ZpbGVTdHJpbmcsIHBhY2thZ2VEaXIpOiBzdHJpbmdcbntcblx0cmV0dXJuIG5wbVRvWWFybkNvcmUocGFja2FnZUxvY2tGaWxlU3RyaW5nLCBwYWNrYWdlRGlyKTtcbn1cblxuZnVuY3Rpb24geWFyblRvTnBtKHlhcm5sb2NrLCAgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcik6IHtcblx0bmFtZTogc3RyaW5nO1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdGxvY2tmaWxlVmVyc2lvbjogbnVtYmVyO1xuXHRyZXF1aXJlczogYm9vbGVhbjtcblx0ZGVwZW5kZW5jaWVzOiB7XG5cdFx0W25hbWU6IHN0cmluZ106IHtcblx0XHRcdHZlcnNpb246IHN0cmluZztcblx0XHRcdHJlc29sdmVkOiBzdHJpbmc7XG5cdFx0XHRpbnRlZ3JpdHk6IHN0cmluZztcblx0XHRcdHJlcXVpcmVzOiB7XG5cdFx0XHRcdFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7XG5cdFx0XHR9O1xuXHRcdFx0ZGVwZW5kZW5jaWVzPzoge1xuXHRcdFx0XHRbbmFtZTogc3RyaW5nXToge1xuXHRcdFx0XHRcdHZlcnNpb246IHN0cmluZztcblx0XHRcdFx0XHRyZXNvbHZlZDogc3RyaW5nO1xuXHRcdFx0XHRcdGludGVncml0eTogc3RyaW5nO1xuXHRcdFx0XHRcdHJlcXVpcmVzOiB7XG5cdFx0XHRcdFx0XHRbbmFtZTogc3RyaW5nXTogc3RyaW5nO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH07XG5cdH07XG59XG57XG5cdHJldHVybiBKU09OLnBhcnNlKHlhcm5Ub05wbUNvcmUoeWFybmxvY2ssICBuYW1lLCB2ZXJzaW9uLCBwYWNrYWdlRGlyKSlcbn1cbiJdfQ==