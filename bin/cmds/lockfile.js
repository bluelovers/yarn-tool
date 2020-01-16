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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBQzFDLG1DQUF5RDtBQUV6RCxNQUFNLFdBQVcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLHFCQUFxQjtJQUUvQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osSUFBSSxFQUFFLGtDQUFrQztZQUN4QyxPQUFPLEVBQUUsSUFBSTtTQUViLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLHdDQUF3QztZQUM5QyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxFQUFFLGdFQUFnRTtZQUN0RSxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzthQUN2QyxPQUFPLENBQUMsTUFBTSxXQUFXLGNBQWMsRUFBRSxrQ0FBa0MsQ0FBQzthQUM1RSxPQUFP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QUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUN6QixDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsZUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLGVBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQywrQ0FBK0MsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN2STtJQUVELE9BQU8sSUFBSSxDQUFBO0FBQ1osQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLFVBQVU7SUFFbkQsT0FBTyxtQkFBYSxDQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVO0lBMkJ0RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQWEsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ3ZFLENBQUM7QUFwSUQsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jaywgeWFyZ3NQcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBleHBvcnRZYXJuTG9jaywgcGFyc2UgYXMgcGFyc2VZYXJuTG9jayB9IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBTZW1WZXIsIHJjb21wYXJlIH0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQ29tbWFuZE1vZHVsZSB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBEZWR1cGUgZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgbnBtVG9ZYXJuQ29yZSwgeWFyblRvTnBtQ29yZSB9IGZyb20gJ3N5bnAyL2xpYic7XG5cbmNvbnN0IENPTU1BTkRfS0VZID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgc2hvdyB5YXJuLmxvY2sgaW5mb2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbignZHVwbGljYXRlJywge1xuXHRcdFx0XHRhbGlhczogWydEJ10sXG5cdFx0XHRcdGRlc2M6IGBzaG93IGR1cGxpY2F0ZSBsaXN0IGJ5IHlhcm4ubG9ja2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRcdC8vZGVmYXVsdDogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCducG0nLCB7XG5cdFx0XHRcdGRlc2M6IGBDb252ZXJ0IHlhcm4ubG9jayB0byBwYWNrYWdlLWxvY2suanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbigneWFybicsIHtcblx0XHRcdFx0ZGVzYzogYENvbnZlcnQgcGFja2FnZS1sb2NrLmpzb24gdG8geWFybi5sb2NrIGlmIHlhcm4ubG9jayBub3QgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdvdmVyd3JpdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ08nXSxcblx0XHRcdFx0ZGVzYzogYG92ZXJ3cml0ZSBmaWxlIGlmIGV4aXN0c2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LmNvbmZsaWN0cygnbnBtJywgWyd5YXJuJywgJ2R1cGxpY2F0ZSddKVxuXHRcdFx0LmV4YW1wbGUoYCQwICR7Q09NTUFORF9LRVl9IC0tZHVwbGljYXRlYCwgYHNob3cgZHVwbGljYXRlIGxpc3QgYnkgeWFybi5sb2NrYClcblx0XHRcdC5leGFtcGxlKGAkMCAke0NPTU1BTkRfS0VZfSAtLWR1cGxpY2F0ZSBmYWxzZWAsIGBzaG93IHBhY2thZ2VzIGxpc3QgYnkgeWFybi5sb2NrYClcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBDT01NQU5EX0tFWTtcblxuXHRcdC8vbGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cblx0XHQvL2xldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRpZiAoYXJndi55YXJuIHx8IGFyZ3YubnBtKVxuXHRcdHtcblx0XHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KGFyZ3YsIHRydWUpO1xuXHRcdFx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdFx0bGV0IGZpbGVfcGFja2FnZV9sb2NrX2pzb24gPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS1sb2NrLmpzb24nKTtcblxuXHRcdFx0bGV0IGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzID0gZnMuZXhpc3RzU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uKTtcblxuXHRcdFx0aWYgKGFyZ3YubnBtKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIXlsLnlhcm5sb2NrX2V4aXN0cylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGB5YXJuLmxvY2sgbm90IGV4aXN0c2ApKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFhcmd2Lm92ZXJ3cml0ZSAmJiBmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGBwYWNrYWdlLWxvY2suanNvbiBpcyBleGlzdHMsIHVzZSAtLW92ZXJ3cml0ZSBmb3Igb3ZlcndyaXRlIGZpbGVgKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGBwYWNrYWdlLWxvY2suanNvbiBpcyBleGlzdHMsIHdpbGwgZ290IG92ZXJ3cml0ZWApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFhcmd2Lm92ZXJ3cml0ZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8veWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBpcyBleGlzdHNgKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCB7IG5hbWUsIHZlcnNpb24gfSA9IHJlYWRQYWNrYWdlSnNvbihwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJykpO1xuXG5cdFx0XHRcdGxldCBzID0geWFyblRvTnBtKHlsLnlhcm5sb2NrX29sZCwgbmFtZSwgdmVyc2lvbiwgcm9vdERhdGEucGtnKTtcblxuXHRcdFx0XHRpZiAocm9vdERhdGEuaGFzV29ya3NwYWNlICYmICFyb290RGF0YS5pc1dvcmtzcGFjZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBzMiA9IHlhcm5Ub05wbSh5bC55YXJubG9ja19vbGQsIG5hbWUsIHZlcnNpb24sIHJvb3REYXRhLndzKTtcblxuXHRcdFx0XHRcdHMuZGVwZW5kZW5jaWVzID0ge1xuXHRcdFx0XHRcdFx0Li4uczIuZGVwZW5kZW5jaWVzLFxuXHRcdFx0XHRcdFx0Li4ucy5kZXBlbmRlbmNpZXNcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmcy53cml0ZUpTT05TeW5jKGZpbGVfcGFja2FnZV9sb2NrX2pzb24sIHMsIHtcblx0XHRcdFx0XHRzcGFjZXM6ICdcXHQnLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgcGFja2FnZS1sb2NrLmpzb24gdXBkYXRlZGApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoYXJndi55YXJuKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgeWFybmxvY2tfZmlsZV9wa2cgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAneWFybi5sb2NrJyk7XG5cblx0XHRcdFx0aWYgKGZzLmV4aXN0c1N5bmMoeWFybmxvY2tfZmlsZV9wa2cpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCFhcmd2Lm92ZXJ3cml0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIGlzIGV4aXN0cywgdXNlIC0tb3ZlcndyaXRlIGZvciBvdmVyd3JpdGUgZmlsZWApKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGB5YXJuLmxvY2sgaXMgZXhpc3RzLCB3aWxsIGdvdCBvdmVyd3JpdGVgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoeWwueWFybmxvY2tfZXhpc3RzICYmIHJvb3REYXRhLmhhc1dvcmtzcGFjZSAmJiAhcm9vdERhdGEuaXNXb3Jrc3BhY2UpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHBhY2thZ2UtbG9jay5qc29uIG5vdCBleGlzdHMsIGJ1dCB5YXJuLmxvY2sgZXhpc3RzIGluIHdvcmtzcGFjZXNgKTtcblxuXHRcdFx0XHRcdFx0bGV0IHMgPSBEZWR1cGUoeWwueWFybmxvY2tfb2xkKS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWFybmxvY2tfZmlsZV9wa2csIHMpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgeWFybi5sb2NrIGNvcGllZGApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHBhY2thZ2UtbG9jay5qc29uIG5vdCBleGlzdHNgKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBzID0gbnBtVG9ZYXJuKGZzLnJlYWRGaWxlU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uKS50b1N0cmluZygpLCByb290RGF0YS5yb290KTtcblxuXHRcdFx0XHRzID0gRGVkdXBlKHMpLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnLCBzKVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGB5YXJuLmxvY2sgdXBkYXRlZGApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChhcmd2LmR1cGxpY2F0ZSB8fCAhYXJndi5kdXBsaWNhdGUpXG5cdFx0e1xuXHRcdFx0X3Nob3dZYXJuTG9ja0xpc3QoYXJndilcblx0XHR9XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG50eXBlIElVbnBhY2tDbWRNb2Q8VCBleHRlbmRzIENvbW1hbmRNb2R1bGUsIEQgPSBJVW5wYWNrTXlZYXJnc0FyZ3Y+ID0gVCBleHRlbmRzIENvbW1hbmRNb2R1bGU8YW55LCBpbmZlciBVPiA/IFVcblx0OiBUIGV4dGVuZHMgQ29tbWFuZE1vZHVsZTxpbmZlciBVLCBhbnk+ID8gVVxuXHRcdDogRFxuXHQ7XG5cbmZ1bmN0aW9uIF9pcyhhcmd2OiBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj4pOiBhcmd2IGlzIEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Plxue1xuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gX2ZpeChhcmd2OiBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj4pXG57XG5cdHJldHVybiBhcmd2O1xufVxuXG5mdW5jdGlvbiBfc2hvd1lhcm5Mb2NrTGlzdChhcmd2OiBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj4pOiBhcmd2IGlzIEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Plxue1xuXHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdGxldCB5YXJubG9ja19vbGRfb2JqID0gcGFyc2VZYXJuTG9jayh5bC55YXJubG9ja19vbGQpO1xuXG5cdGxldCBmeSA9IGV4cG9ydFlhcm5Mb2NrKHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdGxldCBrcyA9IE9iamVjdC5rZXlzKGZ5Lmluc3RhbGxlZCk7XG5cblx0bGV0IG1heCA9IDA7XG5cdGxldCBsZW4gPSAwO1xuXG5cdGxldCBrczIgPSBrc1xuXHRcdC5yZWR1Y2UoKGEsIG5hbWUpID0+IHtcblxuXHRcdFx0bGV0IGFyciA9IGZ5Lmluc3RhbGxlZFtuYW1lXTtcblxuXHRcdFx0aWYgKCFhcmd2LmR1cGxpY2F0ZSB8fCBhcnIubGVuZ3RoID4gMSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcnIgPSBhcnIuc29ydChyY29tcGFyZSkucmV2ZXJzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBhcnIyID0gYXJyLnNsaWNlKDAsIC0xKTtcblxuXHRcdFx0XHRpZiAoYXJyMi5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygn4pSc4pSAJywgYXJyMi5qb2luKCdcXG7ilJzilIAgJykpO1xuXG5cdFx0XHRcdFx0bGVuICs9IGFycjIubGVuZ3RoO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZS5sb2coJ+KUlOKUgCcsIGFyclthcnIubGVuZ3RoIC0gMV0pO1xuXG5cdFx0XHRcdG1heCA9IE1hdGgubWF4KG1heCwgYXJyLmxlbmd0aCk7XG5cblx0XHRcdFx0YS5wdXNoKG5hbWUpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIFtdIGFzIHN0cmluZ1tdKVxuXHQ7XG5cblx0bGV0IGNoYWxrID0gY29uc29sZS5jaGFsaztcblxuXHRpZiAoYXJndi5kdXBsaWNhdGUpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcbkZvdW5kIGR1cGxpY2F0ZSBpbiAke2NoYWxrLnllbGxvdyhrczIubGVuZ3RoKX0gcGFja2FnZXMsICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbitrczIubGVuZ3RoKX0gaW5zdGFsbGVkIHZlcnNpb24sIGhpZ2hlc3QgaXMgJHttYXh9LCBpbiB0b3RhbCAke2tzLmxlbmd0aH0gcGFja2FnZXNgKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcblRvdGFsICR7Y2hhbGsueWVsbG93KGtzLmxlbmd0aCl9IHBhY2thZ2VzLCB3aXRoICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbitrczIubGVuZ3RoKX0gaW5zdGFsbGVkIHZlcnNpb25gKTtcblx0fVxuXG5cdGlmIChsZW4gPiAwKVxuXHR7XG5cdFx0Y29uc3QgdGVybWluYWxMaW5rID0gcmVxdWlyZSgndGVybWluYWwtbGluaycpO1xuXHRcdGNvbnN0IGxpbmsgPSB0ZXJtaW5hbExpbmsoJ3NlZSBoZXJlJywgJ2h0dHBzOi8veWFybnBrZy5jb20vZG9jcy9zZWxlY3RpdmUtdmVyc2lvbi1yZXNvbHV0aW9ucy8nLCB7XG5cdFx0XHRmYWxsYmFjayh0ZXh0LCB1cmwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0ZXh0ICsgJyAnICsgdXJsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFlvdSBjYW4gdHJ5IGFkZCB0aGV5IHRvICR7Y29uc29sZS5jaGFsay55ZWxsb3coJ3Jlc29sdXRpb25zJyl9IGluIHBhY2thZ2UuanNvbiwgZm9yIGZvcmNlIHBhY2thZ2UgZGVkdXBlLCAke2xpbmt9YCk7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBucG1Ub1lhcm4ocGFja2FnZUxvY2tGaWxlU3RyaW5nLCBwYWNrYWdlRGlyKTogc3RyaW5nXG57XG5cdHJldHVybiBucG1Ub1lhcm5Db3JlKHBhY2thZ2VMb2NrRmlsZVN0cmluZywgcGFja2FnZURpcik7XG59XG5cbmZ1bmN0aW9uIHlhcm5Ub05wbSh5YXJubG9jaywgIG5hbWUsIHZlcnNpb24sIHBhY2thZ2VEaXIpOiB7XG5cdG5hbWU6IHN0cmluZztcblx0dmVyc2lvbjogc3RyaW5nO1xuXHRsb2NrZmlsZVZlcnNpb246IG51bWJlcjtcblx0cmVxdWlyZXM6IGJvb2xlYW47XG5cdGRlcGVuZGVuY2llczoge1xuXHRcdFtuYW1lOiBzdHJpbmddOiB7XG5cdFx0XHR2ZXJzaW9uOiBzdHJpbmc7XG5cdFx0XHRyZXNvbHZlZDogc3RyaW5nO1xuXHRcdFx0aW50ZWdyaXR5OiBzdHJpbmc7XG5cdFx0XHRyZXF1aXJlczoge1xuXHRcdFx0XHRbbmFtZTogc3RyaW5nXTogc3RyaW5nO1xuXHRcdFx0fTtcblx0XHRcdGRlcGVuZGVuY2llcz86IHtcblx0XHRcdFx0W25hbWU6IHN0cmluZ106IHtcblx0XHRcdFx0XHR2ZXJzaW9uOiBzdHJpbmc7XG5cdFx0XHRcdFx0cmVzb2x2ZWQ6IHN0cmluZztcblx0XHRcdFx0XHRpbnRlZ3JpdHk6IHN0cmluZztcblx0XHRcdFx0XHRyZXF1aXJlczoge1xuXHRcdFx0XHRcdFx0W25hbWU6IHN0cmluZ106IHN0cmluZztcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblx0XHR9O1xuXHR9O1xufVxue1xuXHRyZXR1cm4gSlNPTi5wYXJzZSh5YXJuVG9OcG1Db3JlKHlhcm5sb2NrLCAgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcikpXG59XG4iXX0=