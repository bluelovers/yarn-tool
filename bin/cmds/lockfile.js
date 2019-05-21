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
            const { npmToYarnCore, yarnToNpmCore } = require('synp/lib');
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
    const { npmToYarnCore, yarnToNpmCore } = require('synp/lib');
    return npmToYarnCore(packageLockFileString, packageDir);
}
function yarnToNpm(yarnlock, name, version, packageDir) {
    const { npmToYarnCore, yarnToNpmCore } = require('synp/lib');
    return JSON.parse(yarnToNpmCore(yarnlock, name, version, packageDir));
}
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBRTFDLE1BQU0sV0FBVyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFOUMsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUscUJBQXFCO0lBRS9CLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUNwQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixJQUFJLEVBQUUsa0NBQWtDO1lBQ3hDLE9BQU8sRUFBRSxJQUFJO1NBRWIsQ0FBQzthQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLEVBQUUsd0NBQXdDO1lBQzlDLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLEVBQUUsZ0VBQWdFO1lBQ3RFLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxFQUFFLDBCQUEwQjtZQUNoQyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ3ZDLE9BQU8sQ0FBQyxNQUFNLFdBQVcsY0FBYyxFQUFFLGtDQUFrQyxDQUFDO2FBQzVFLE9BQU8sQ0FBQyxNQUFNLFdBQVcsb0JBQW9CLEVBQUUsaUNBQWlDLENBQUMsQ0FB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RUFBRSxHQUFHO2dCQUVqQixPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ3pCLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxlQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsZUFBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLCtDQUErQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZJO0lBRUQsT0FBTyxJQUFJLENBQUE7QUFDWixDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMscUJBQXFCLEVBQUUsVUFBVTtJQUVuRCxNQUFNLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUU3RCxPQUFPLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsUUFBUSxFQUFHLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVTtJQTJCdEQsTUFBTSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFN0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ3ZFLENBQUM7QUF4SUQsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jaywgeWFyZ3NQcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBleHBvcnRZYXJuTG9jaywgcGFyc2UgYXMgcGFyc2VZYXJuTG9jayB9IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBTZW1WZXIsIHJjb21wYXJlIH0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQ29tbWFuZE1vZHVsZSB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBEZWR1cGUgZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuXG5jb25zdCBDT01NQU5EX0tFWSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYHNob3cgeWFybi5sb2NrIGluZm9gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ2R1cGxpY2F0ZScsIHtcblx0XHRcdFx0YWxpYXM6IFsnRCddLFxuXHRcdFx0XHRkZXNjOiBgc2hvdyBkdXBsaWNhdGUgbGlzdCBieSB5YXJuLmxvY2tgLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0XHQvL2RlZmF1bHQ6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignbnBtJywge1xuXHRcdFx0XHRkZXNjOiBgQ29udmVydCB5YXJuLmxvY2sgdG8gcGFja2FnZS1sb2NrLmpzb25gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ3lhcm4nLCB7XG5cdFx0XHRcdGRlc2M6IGBDb252ZXJ0IHBhY2thZ2UtbG9jay5qc29uIHRvIHlhcm4ubG9jayBpZiB5YXJuLmxvY2sgbm90IGV4aXN0c2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignb3ZlcndyaXRlJywge1xuXHRcdFx0XHRkZXNjOiBgb3ZlcndyaXRlIGZpbGUgaWYgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuY29uZmxpY3RzKCducG0nLCBbJ3lhcm4nLCAnZHVwbGljYXRlJ10pXG5cdFx0XHQuZXhhbXBsZShgJDAgJHtDT01NQU5EX0tFWX0gLS1kdXBsaWNhdGVgLCBgc2hvdyBkdXBsaWNhdGUgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHRcdFx0LmV4YW1wbGUoYCQwICR7Q09NTUFORF9LRVl9IC0tZHVwbGljYXRlIGZhbHNlYCwgYHNob3cgcGFja2FnZXMgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IENPTU1BTkRfS0VZO1xuXG5cdFx0Ly9sZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRcdC8vbGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdGlmIChhcmd2Lnlhcm4gfHwgYXJndi5ucG0pXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBucG1Ub1lhcm5Db3JlLCB5YXJuVG9OcG1Db3JlIH0gPSByZXF1aXJlKCdzeW5wL2xpYicpO1xuXG5cdFx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCBmaWxlX3BhY2thZ2VfbG9ja19qc29uID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UtbG9jay5qc29uJyk7XG5cblx0XHRcdGxldCBmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cyA9IGZzLmV4aXN0c1N5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbik7XG5cblx0XHRcdGlmIChhcmd2Lm5wbSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKCF5bC55YXJubG9ja19leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIG5vdCBleGlzdHNgKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUgJiYgZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgcGFja2FnZS1sb2NrLmpzb24gaXMgZXhpc3RzLCB1c2UgLS1vdmVyd3JpdGUgZm9yIG92ZXJ3cml0ZSBmaWxlYCkpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgcGFja2FnZS1sb2NrLmpzb24gaXMgZXhpc3RzLCB3aWxsIGdvdCBvdmVyd3JpdGVgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL3lhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGB5YXJuLmxvY2sgaXMgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgeyBuYW1lLCB2ZXJzaW9uIH0gPSByZWFkUGFja2FnZUpzb24ocGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpKTtcblxuXHRcdFx0XHRsZXQgcyA9IHlhcm5Ub05wbSh5bC55YXJubG9ja19vbGQsIG5hbWUsIHZlcnNpb24sIHJvb3REYXRhLnBrZyk7XG5cblx0XHRcdFx0aWYgKHJvb3REYXRhLmhhc1dvcmtzcGFjZSAmJiAhcm9vdERhdGEuaXNXb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgczIgPSB5YXJuVG9OcG0oeWwueWFybmxvY2tfb2xkLCBuYW1lLCB2ZXJzaW9uLCByb290RGF0YS53cyk7XG5cblx0XHRcdFx0XHRzLmRlcGVuZGVuY2llcyA9IHtcblx0XHRcdFx0XHRcdC4uLnMyLmRlcGVuZGVuY2llcyxcblx0XHRcdFx0XHRcdC4uLnMuZGVwZW5kZW5jaWVzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnMud3JpdGVKU09OU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uLCBzLCB7XG5cdFx0XHRcdFx0c3BhY2VzOiAnXFx0Jyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UtbG9jay5qc29uIHVwZGF0ZWRgKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGFyZ3YueWFybilcblx0XHRcdHtcblx0XHRcdFx0bGV0IHlhcm5sb2NrX2ZpbGVfcGtnID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3lhcm4ubG9jaycpO1xuXG5cdFx0XHRcdGlmIChmcy5leGlzdHNTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBpcyBleGlzdHMsIHVzZSAtLW92ZXJ3cml0ZSBmb3Igb3ZlcndyaXRlIGZpbGVgKSlcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgeWFybi5sb2NrIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHlsLnlhcm5sb2NrX2V4aXN0cyAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2UgJiYgIXJvb3REYXRhLmlzV29ya3NwYWNlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGBwYWNrYWdlLWxvY2suanNvbiBub3QgZXhpc3RzLCBidXQgeWFybi5sb2NrIGV4aXN0cyBpbiB3b3Jrc3BhY2VzYCk7XG5cblx0XHRcdFx0XHRcdGxldCBzID0gRGVkdXBlKHlsLnlhcm5sb2NrX29sZCkueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnLCBzKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHlhcm4ubG9jayBjb3BpZWRgKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGBwYWNrYWdlLWxvY2suanNvbiBub3QgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgcyA9IG5wbVRvWWFybihmcy5yZWFkRmlsZVN5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbikudG9TdHJpbmcoKSwgcm9vdERhdGEucm9vdCk7XG5cblx0XHRcdFx0cyA9IERlZHVwZShzKS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5YXJubG9ja19maWxlX3BrZywgcylcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgeWFybi5sb2NrIHVwZGF0ZWRgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoYXJndi5kdXBsaWNhdGUgfHwgIWFyZ3YuZHVwbGljYXRlKVxuXHRcdHtcblx0XHRcdF9zaG93WWFybkxvY2tMaXN0KGFyZ3YpXG5cdFx0fVxuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxudHlwZSBJVW5wYWNrQ21kTW9kPFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlLCBEID0gSVVucGFja015WWFyZ3NBcmd2PiA9IFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlPGFueSwgaW5mZXIgVT4gPyBVXG5cdDogVCBleHRlbmRzIENvbW1hbmRNb2R1bGU8aW5mZXIgVSwgYW55PiA/IFVcblx0XHQ6IERcblx0O1xuXG5mdW5jdGlvbiBfaXMoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KTogYXJndiBpcyBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj5cbntcblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIF9maXgoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KVxue1xuXHRyZXR1cm4gYXJndjtcbn1cblxuZnVuY3Rpb24gX3Nob3dZYXJuTG9ja0xpc3QoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KTogYXJndiBpcyBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj5cbntcblx0bGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cblx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWwueWFybmxvY2tfb2xkKTtcblxuXHRsZXQgZnkgPSBleHBvcnRZYXJuTG9jayh5YXJubG9ja19vbGRfb2JqKTtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyhmeS5pbnN0YWxsZWQpO1xuXG5cdGxldCBtYXggPSAwO1xuXHRsZXQgbGVuID0gMDtcblxuXHRsZXQga3MyID0ga3Ncblx0XHQucmVkdWNlKChhLCBuYW1lKSA9PiB7XG5cblx0XHRcdGxldCBhcnIgPSBmeS5pbnN0YWxsZWRbbmFtZV07XG5cblx0XHRcdGlmICghYXJndi5kdXBsaWNhdGUgfHwgYXJyLmxlbmd0aCA+IDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5hbWUpO1xuXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJyID0gYXJyLnNvcnQocmNvbXBhcmUpLnJldmVyc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgYXJyMiA9IGFyci5zbGljZSgwLCAtMSk7XG5cblx0XHRcdFx0aWYgKGFycjIubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFycjIuam9pbignXFxu4pSc4pSAICcpKTtcblxuXHRcdFx0XHRcdGxlbiArPSBhcnIyLmxlbmd0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCBhcnJbYXJyLmxlbmd0aCAtIDFdKTtcblxuXHRcdFx0XHRtYXggPSBNYXRoLm1heChtYXgsIGFyci5sZW5ndGgpO1xuXG5cdFx0XHRcdGEucHVzaChuYW1lKVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYTtcblx0XHR9LCBbXSBhcyBzdHJpbmdbXSlcblx0O1xuXG5cdGxldCBjaGFsayA9IGNvbnNvbGUuY2hhbGs7XG5cblx0aWYgKGFyZ3YuZHVwbGljYXRlKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBcXG5Gb3VuZCBkdXBsaWNhdGUgaW4gJHtjaGFsay55ZWxsb3coa3MyLmxlbmd0aCl9IHBhY2thZ2VzLCAke2NoYWxrLnllbGxvdyhsZW4pfS8ke2NoYWxrLnllbGxvdyhsZW4ra3MyLmxlbmd0aCl9IGluc3RhbGxlZCB2ZXJzaW9uLCBoaWdoZXN0IGlzICR7bWF4fSwgaW4gdG90YWwgJHtrcy5sZW5ndGh9IHBhY2thZ2VzYCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBcXG5Ub3RhbCAke2NoYWxrLnllbGxvdyhrcy5sZW5ndGgpfSBwYWNrYWdlcywgd2l0aCAke2NoYWxrLnllbGxvdyhsZW4pfS8ke2NoYWxrLnllbGxvdyhsZW4ra3MyLmxlbmd0aCl9IGluc3RhbGxlZCB2ZXJzaW9uYCk7XG5cdH1cblxuXHRpZiAobGVuID4gMClcblx0e1xuXHRcdGNvbnN0IHRlcm1pbmFsTGluayA9IHJlcXVpcmUoJ3Rlcm1pbmFsLWxpbmsnKTtcblx0XHRjb25zdCBsaW5rID0gdGVybWluYWxMaW5rKCdzZWUgaGVyZScsICdodHRwczovL3lhcm5wa2cuY29tL2RvY3Mvc2VsZWN0aXZlLXZlcnNpb24tcmVzb2x1dGlvbnMvJywge1xuXHRcdFx0ZmFsbGJhY2sodGV4dCwgdXJsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGV4dCArICcgJyArIHVybDtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBZb3UgY2FuIHRyeSBhZGQgdGhleSB0byAke2NvbnNvbGUuY2hhbGsueWVsbG93KCdyZXNvbHV0aW9ucycpfSBpbiBwYWNrYWdlLmpzb24sIGZvciBmb3JjZSBwYWNrYWdlIGRlZHVwZSwgJHtsaW5rfWApO1xuXHR9XG5cblx0cmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gbnBtVG9ZYXJuKHBhY2thZ2VMb2NrRmlsZVN0cmluZywgcGFja2FnZURpcik6IHN0cmluZ1xue1xuXHRjb25zdCB7IG5wbVRvWWFybkNvcmUsIHlhcm5Ub05wbUNvcmUgfSA9IHJlcXVpcmUoJ3N5bnAvbGliJyk7XG5cblx0cmV0dXJuIG5wbVRvWWFybkNvcmUocGFja2FnZUxvY2tGaWxlU3RyaW5nLCBwYWNrYWdlRGlyKTtcbn1cblxuZnVuY3Rpb24geWFyblRvTnBtKHlhcm5sb2NrLCAgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcik6IHtcblx0bmFtZTogc3RyaW5nO1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdGxvY2tmaWxlVmVyc2lvbjogbnVtYmVyO1xuXHRyZXF1aXJlczogYm9vbGVhbjtcblx0ZGVwZW5kZW5jaWVzOiB7XG5cdFx0W25hbWU6IHN0cmluZ106IHtcblx0XHRcdHZlcnNpb246IHN0cmluZztcblx0XHRcdHJlc29sdmVkOiBzdHJpbmc7XG5cdFx0XHRpbnRlZ3JpdHk6IHN0cmluZztcblx0XHRcdHJlcXVpcmVzOiB7XG5cdFx0XHRcdFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7XG5cdFx0XHR9O1xuXHRcdFx0ZGVwZW5kZW5jaWVzPzoge1xuXHRcdFx0XHRbbmFtZTogc3RyaW5nXToge1xuXHRcdFx0XHRcdHZlcnNpb246IHN0cmluZztcblx0XHRcdFx0XHRyZXNvbHZlZDogc3RyaW5nO1xuXHRcdFx0XHRcdGludGVncml0eTogc3RyaW5nO1xuXHRcdFx0XHRcdHJlcXVpcmVzOiB7XG5cdFx0XHRcdFx0XHRbbmFtZTogc3RyaW5nXTogc3RyaW5nO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH07XG5cdH07XG59XG57XG5cdGNvbnN0IHsgbnBtVG9ZYXJuQ29yZSwgeWFyblRvTnBtQ29yZSB9ID0gcmVxdWlyZSgnc3lucC9saWInKTtcblxuXHRyZXR1cm4gSlNPTi5wYXJzZSh5YXJuVG9OcG1Db3JlKHlhcm5sb2NrLCAgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcikpXG59XG4iXX0=