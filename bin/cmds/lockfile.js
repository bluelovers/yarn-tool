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
            .option('shrinkwrap', {
            desc: `Convert yarn.lock to npm-shrinkwrap.json`,
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
        if (argv.yarn || argv.npm || argv.shrinkwrap) {
            let rootData = index_1.findRoot(argv, true);
            let yl = index_1.fsYarnLock(rootData.root);
            let file_package_lock_json = path.join(rootData.pkg, 'package-lock.json');
            let file_package_lock_json_exists = fs.existsSync(file_package_lock_json);
            if (argv.npm || argv.shrinkwrap) {
                if (!yl.yarnlock_exists) {
                    index_1.yargsProcessExit(new Error(`yarn.lock not exists`));
                }
                if (argv.npm) {
                    if (!argv.overwrite && file_package_lock_json_exists) {
                        index_1.yargsProcessExit(new Error(`package-lock.json is exists, use --overwrite for overwrite file`));
                    }
                    else if (file_package_lock_json_exists) {
                        index_1.consoleDebug.warn(`package-lock.json is exists, will got overwrite`);
                    }
                }
                let file_shrinkwrap_json = path.join(rootData.pkg, 'npm-shrinkwrap.json');
                let file_shrinkwrap_json_exists = fs.existsSync(file_shrinkwrap_json);
                if (argv.shrinkwrap) {
                    if (!argv.overwrite && file_shrinkwrap_json_exists) {
                        index_1.yargsProcessExit(new Error(`npm-shrinkwrap.json is exists, use --overwrite for overwrite file`));
                    }
                    else if (file_shrinkwrap_json_exists) {
                        index_1.consoleDebug.warn(`npm-shrinkwrap.json is exists, will got overwrite`);
                    }
                }
                let { name, version } = package_dts_1.readPackageJson(path.join(rootData.pkg, 'package.json'));
                let s = yarnToNpm(yl.yarnlock_old, name, version, rootData.pkg);
                if (rootData.hasWorkspace && !rootData.isWorkspace) {
                    let s2 = yarnToNpm(yl.yarnlock_old, name, version, rootData.ws);
                    s.dependencies = {
                        ...s.dependencies,
                        ...s2.dependencies,
                        ...s.dependencies,
                    };
                }
                const lock = fixNpmLock_1.default(s);
                if (argv.npm) {
                    fs.writeJSONSync(file_package_lock_json, lock, {
                        spaces: 2,
                    });
                    index_1.consoleDebug.info(`package-lock.json updated`);
                }
                if (argv.shrinkwrap) {
                    fs.writeJSONSync(file_shrinkwrap_json, lock, {
                        spaces: 2,
                    });
                    index_1.consoleDebug.info(`npm-shrinkwrap.json updated`);
                }
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
            },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBQzFDLG1DQUF5RDtBQUN6RCxrRUFBMkQ7QUFFM0QsTUFBTSxXQUFXLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUU5QyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxxQkFBcUI7SUFFL0IsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSxrQ0FBa0M7WUFDeEMsT0FBTyxFQUFFLElBQUk7U0FFYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx3Q0FBd0M7WUFDOUMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFlBQVksRUFBRTtZQUNyQixJQUFJLEVBQUUsMENBQTBDO1lBQ2hELE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLEVBQUUsZ0VBQWdFO1lBQ3RFLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osSUFBSSxFQUFFLDBCQUEwQjtZQUNoQyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxTQUFTLENBQUMsS0FBSyxF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SyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsK0NBQStDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDdkk7SUFFRCxPQUFPLElBQUksQ0FBQTtBQUNaLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVO0lBRW5ELE9BQU8sbUJBQWEsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVTtJQTJCckQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQTtBQUN0RSxDQUFDO0FBeElELGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIGZzWWFybkxvY2ssIHlhcmdzUHJvY2Vzc0V4aXQgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBleHBvcnRZYXJuTG9jaywgcGFyc2UgYXMgcGFyc2VZYXJuTG9jayB9IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBTZW1WZXIsIHJjb21wYXJlIH0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQ29tbWFuZE1vZHVsZSB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBEZWR1cGUgZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgbnBtVG9ZYXJuQ29yZSwgeWFyblRvTnBtQ29yZSB9IGZyb20gJ3N5bnAyL2xpYic7XG5pbXBvcnQgZml4TnBtTG9jayBmcm9tICcuLi8uLi9saWIvY2xpL2xvY2tmaWxlL2ZpeE5wbUxvY2snO1xuXG5jb25zdCBDT01NQU5EX0tFWSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYHNob3cgeWFybi5sb2NrIGluZm9gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ2R1cGxpY2F0ZScsIHtcblx0XHRcdFx0YWxpYXM6IFsnRCddLFxuXHRcdFx0XHRkZXNjOiBgc2hvdyBkdXBsaWNhdGUgbGlzdCBieSB5YXJuLmxvY2tgLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0XHQvL2RlZmF1bHQ6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignbnBtJywge1xuXHRcdFx0XHRkZXNjOiBgQ29udmVydCB5YXJuLmxvY2sgdG8gcGFja2FnZS1sb2NrLmpzb25gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ3Nocmlua3dyYXAnLCB7XG5cdFx0XHRcdGRlc2M6IGBDb252ZXJ0IHlhcm4ubG9jayB0byBucG0tc2hyaW5rd3JhcC5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCd5YXJuJywge1xuXHRcdFx0XHRkZXNjOiBgQ29udmVydCBwYWNrYWdlLWxvY2suanNvbiB0byB5YXJuLmxvY2sgaWYgeWFybi5sb2NrIG5vdCBleGlzdHNgLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ292ZXJ3cml0ZScsIHtcblx0XHRcdFx0YWxpYXM6IFsnTyddLFxuXHRcdFx0XHRkZXNjOiBgb3ZlcndyaXRlIGZpbGUgaWYgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuY29uZmxpY3RzKCducG0nLCBbJ3lhcm4nLCAnZHVwbGljYXRlJ10pXG5cdFx0XHQuZXhhbXBsZShgJDAgJHtDT01NQU5EX0tFWX0gLS1kdXBsaWNhdGVgLCBgc2hvdyBkdXBsaWNhdGUgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHRcdFx0LmV4YW1wbGUoYCQwICR7Q09NTUFORF9LRVl9IC0tZHVwbGljYXRlIGZhbHNlYCwgYHNob3cgcGFja2FnZXMgbGlzdCBieSB5YXJuLmxvY2tgKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IENPTU1BTkRfS0VZO1xuXG5cdFx0Ly9sZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRcdC8vbGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdGlmIChhcmd2Lnlhcm4gfHwgYXJndi5ucG0gfHwgYXJndi5zaHJpbmt3cmFwKVxuXHRcdHtcblx0XHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KGFyZ3YsIHRydWUpO1xuXHRcdFx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdFx0bGV0IGZpbGVfcGFja2FnZV9sb2NrX2pzb24gPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS1sb2NrLmpzb24nKTtcblxuXHRcdFx0bGV0IGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzID0gZnMuZXhpc3RzU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uKTtcblxuXHRcdFx0aWYgKGFyZ3YubnBtIHx8IGFyZ3Yuc2hyaW5rd3JhcClcblx0XHRcdHtcblx0XHRcdFx0aWYgKCF5bC55YXJubG9ja19leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgeWFybi5sb2NrIG5vdCBleGlzdHNgKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhcmd2Lm5wbSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUgJiYgZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHBhY2thZ2UtbG9jay5qc29uIGlzIGV4aXN0cywgdXNlIC0tb3ZlcndyaXRlIGZvciBvdmVyd3JpdGUgZmlsZWApKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgcGFja2FnZS1sb2NrLmpzb24gaXMgZXhpc3RzLCB3aWxsIGdvdCBvdmVyd3JpdGVgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgZmlsZV9zaHJpbmt3cmFwX2pzb24gPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAnbnBtLXNocmlua3dyYXAuanNvbicpO1xuXHRcdFx0XHRsZXQgZmlsZV9zaHJpbmt3cmFwX2pzb25fZXhpc3RzID0gZnMuZXhpc3RzU3luYyhmaWxlX3Nocmlua3dyYXBfanNvbik7XG5cblx0XHRcdFx0aWYgKGFyZ3Yuc2hyaW5rd3JhcClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUgJiYgZmlsZV9zaHJpbmt3cmFwX2pzb25fZXhpc3RzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGBucG0tc2hyaW5rd3JhcC5qc29uIGlzIGV4aXN0cywgdXNlIC0tb3ZlcndyaXRlIGZvciBvdmVyd3JpdGUgZmlsZWApKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChmaWxlX3Nocmlua3dyYXBfanNvbl9leGlzdHMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYG5wbS1zaHJpbmt3cmFwLmpzb24gaXMgZXhpc3RzLCB3aWxsIGdvdCBvdmVyd3JpdGVgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgeyBuYW1lLCB2ZXJzaW9uIH0gPSByZWFkUGFja2FnZUpzb24ocGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpKTtcblxuXHRcdFx0XHRsZXQgcyA9IHlhcm5Ub05wbSh5bC55YXJubG9ja19vbGQsIG5hbWUsIHZlcnNpb24sIHJvb3REYXRhLnBrZyk7XG5cblx0XHRcdFx0aWYgKHJvb3REYXRhLmhhc1dvcmtzcGFjZSAmJiAhcm9vdERhdGEuaXNXb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgczIgPSB5YXJuVG9OcG0oeWwueWFybmxvY2tfb2xkLCBuYW1lLCB2ZXJzaW9uLCByb290RGF0YS53cyk7XG5cblx0XHRcdFx0XHRzLmRlcGVuZGVuY2llcyA9IHtcblx0XHRcdFx0XHRcdC4uLnMuZGVwZW5kZW5jaWVzLFxuXHRcdFx0XHRcdFx0Li4uczIuZGVwZW5kZW5jaWVzLFxuXHRcdFx0XHRcdFx0Li4ucy5kZXBlbmRlbmNpZXMsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgbG9jayA9IGZpeE5wbUxvY2socyk7XG5cblx0XHRcdFx0aWYgKGFyZ3YubnBtKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZnMud3JpdGVKU09OU3luYyhmaWxlX3BhY2thZ2VfbG9ja19qc29uLCBsb2NrLCB7XG5cdFx0XHRcdFx0XHRzcGFjZXM6IDIsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UtbG9jay5qc29uIHVwZGF0ZWRgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhcmd2LnNocmlua3dyYXApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmcy53cml0ZUpTT05TeW5jKGZpbGVfc2hyaW5rd3JhcF9qc29uLCBsb2NrLCB7XG5cdFx0XHRcdFx0XHRzcGFjZXM6IDIsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYG5wbS1zaHJpbmt3cmFwLmpzb24gdXBkYXRlZGApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGFyZ3YueWFybilcblx0XHRcdHtcblx0XHRcdFx0bGV0IHlhcm5sb2NrX2ZpbGVfcGtnID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3lhcm4ubG9jaycpO1xuXG5cdFx0XHRcdGlmIChmcy5leGlzdHNTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghYXJndi5vdmVyd3JpdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBpcyBleGlzdHMsIHVzZSAtLW92ZXJ3cml0ZSBmb3Igb3ZlcndyaXRlIGZpbGVgKSlcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgeWFybi5sb2NrIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHlsLnlhcm5sb2NrX2V4aXN0cyAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2UgJiYgIXJvb3REYXRhLmlzV29ya3NwYWNlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGBwYWNrYWdlLWxvY2suanNvbiBub3QgZXhpc3RzLCBidXQgeWFybi5sb2NrIGV4aXN0cyBpbiB3b3Jrc3BhY2VzYCk7XG5cblx0XHRcdFx0XHRcdGxldCBzID0gRGVkdXBlKHlsLnlhcm5sb2NrX29sZCkueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKHlhcm5sb2NrX2ZpbGVfcGtnLCBzKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHlhcm4ubG9jayBjb3BpZWRgKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGBwYWNrYWdlLWxvY2suanNvbiBub3QgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgcyA9IG5wbVRvWWFybihmcy5yZWFkRmlsZVN5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbikudG9TdHJpbmcoKSwgcm9vdERhdGEucm9vdCk7XG5cblx0XHRcdFx0cyA9IERlZHVwZShzKS55YXJubG9ja19uZXc7XG5cblx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5YXJubG9ja19maWxlX3BrZywgcylcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgeWFybi5sb2NrIHVwZGF0ZWRgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoYXJndi5kdXBsaWNhdGUgfHwgIWFyZ3YuZHVwbGljYXRlKVxuXHRcdHtcblx0XHRcdF9zaG93WWFybkxvY2tMaXN0KGFyZ3YpXG5cdFx0fVxuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxudHlwZSBJVW5wYWNrQ21kTW9kPFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlLCBEID0gSVVucGFja015WWFyZ3NBcmd2PiA9IFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlPGFueSwgaW5mZXIgVT4gPyBVXG5cdDogVCBleHRlbmRzIENvbW1hbmRNb2R1bGU8aW5mZXIgVSwgYW55PiA/IFVcblx0XHQ6IERcblx0O1xuXG4vLyBAdHMtaWdub3JlXG5mdW5jdGlvbiBfaXMoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KTogYXJndiBpcyBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj5cbntcblx0cmV0dXJuIHRydWU7XG59XG5cbi8vIEB0cy1pZ25vcmVcbmZ1bmN0aW9uIF9maXgoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KVxue1xuXHRyZXR1cm4gYXJndjtcbn1cblxuLy8gQHRzLWlnbm9yZVxuZnVuY3Rpb24gX3Nob3dZYXJuTG9ja0xpc3QoYXJndjogQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+KTogYXJndiBpcyBBcmd1bWVudHM8SVVucGFja0NtZE1vZDx0eXBlb2YgY21kTW9kdWxlPj5cbntcblx0bGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cblx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWwueWFybmxvY2tfb2xkKTtcblxuXHRsZXQgZnkgPSBleHBvcnRZYXJuTG9jayh5YXJubG9ja19vbGRfb2JqKTtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyhmeS5pbnN0YWxsZWQpO1xuXG5cdGxldCBtYXggPSAwO1xuXHRsZXQgbGVuID0gMDtcblxuXHRsZXQga3MyID0ga3Ncblx0XHQucmVkdWNlKChhLCBuYW1lKSA9PlxuXHRcdHtcblxuXHRcdFx0bGV0IGFyciA9IGZ5Lmluc3RhbGxlZFtuYW1lXTtcblxuXHRcdFx0aWYgKCFhcmd2LmR1cGxpY2F0ZSB8fCBhcnIubGVuZ3RoID4gMSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcnIgPSBhcnIuc29ydChyY29tcGFyZSkucmV2ZXJzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBhcnIyID0gYXJyLnNsaWNlKDAsIC0xKTtcblxuXHRcdFx0XHRpZiAoYXJyMi5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygn4pSc4pSAJywgYXJyMi5qb2luKCdcXG7ilJzilIAgJykpO1xuXG5cdFx0XHRcdFx0bGVuICs9IGFycjIubGVuZ3RoO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZS5sb2coJ+KUlOKUgCcsIGFyclthcnIubGVuZ3RoIC0gMV0pO1xuXG5cdFx0XHRcdG1heCA9IE1hdGgubWF4KG1heCwgYXJyLmxlbmd0aCk7XG5cblx0XHRcdFx0YS5wdXNoKG5hbWUpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIFtdIGFzIHN0cmluZ1tdKVxuXHQ7XG5cblx0bGV0IGNoYWxrID0gY29uc29sZS5jaGFsaztcblxuXHRpZiAoYXJndi5kdXBsaWNhdGUpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcbkZvdW5kIGR1cGxpY2F0ZSBpbiAke2NoYWxrLnllbGxvdyhrczIubGVuZ3RoKX0gcGFja2FnZXMsICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbiArIGtzMi5sZW5ndGgpfSBpbnN0YWxsZWQgdmVyc2lvbiwgaGlnaGVzdCBpcyAke21heH0sIGluIHRvdGFsICR7a3MubGVuZ3RofSBwYWNrYWdlc2ApO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjb25zb2xlLmN5YW4uaW5mbyhgXFxuVG90YWwgJHtjaGFsay55ZWxsb3coa3MubGVuZ3RoKX0gcGFja2FnZXMsIHdpdGggJHtjaGFsay55ZWxsb3cobGVuKX0vJHtjaGFsay55ZWxsb3cobGVuICsga3MyLmxlbmd0aCl9IGluc3RhbGxlZCB2ZXJzaW9uYCk7XG5cdH1cblxuXHRpZiAobGVuID4gMClcblx0e1xuXHRcdGNvbnN0IHRlcm1pbmFsTGluayA9IHJlcXVpcmUoJ3Rlcm1pbmFsLWxpbmsnKTtcblx0XHRjb25zdCBsaW5rID0gdGVybWluYWxMaW5rKCdzZWUgaGVyZScsICdodHRwczovL3lhcm5wa2cuY29tL2RvY3Mvc2VsZWN0aXZlLXZlcnNpb24tcmVzb2x1dGlvbnMvJywge1xuXHRcdFx0ZmFsbGJhY2sodGV4dCwgdXJsKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGV4dCArICcgJyArIHVybDtcblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHRjb25zb2xlLmN5YW4uaW5mbyhgWW91IGNhbiB0cnkgYWRkIHRoZXkgdG8gJHtjb25zb2xlLmNoYWxrLnllbGxvdygncmVzb2x1dGlvbnMnKX0gaW4gcGFja2FnZS5qc29uLCBmb3IgZm9yY2UgcGFja2FnZSBkZWR1cGUsICR7bGlua31gKTtcblx0fVxuXG5cdHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIG5wbVRvWWFybihwYWNrYWdlTG9ja0ZpbGVTdHJpbmcsIHBhY2thZ2VEaXIpOiBzdHJpbmdcbntcblx0cmV0dXJuIG5wbVRvWWFybkNvcmUocGFja2FnZUxvY2tGaWxlU3RyaW5nLCBwYWNrYWdlRGlyKTtcbn1cblxuZnVuY3Rpb24geWFyblRvTnBtKHlhcm5sb2NrLCBuYW1lLCB2ZXJzaW9uLCBwYWNrYWdlRGlyKToge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHZlcnNpb246IHN0cmluZztcblx0bG9ja2ZpbGVWZXJzaW9uOiBudW1iZXI7XG5cdHJlcXVpcmVzOiBib29sZWFuO1xuXHRkZXBlbmRlbmNpZXM6IHtcblx0XHRbbmFtZTogc3RyaW5nXToge1xuXHRcdFx0dmVyc2lvbjogc3RyaW5nO1xuXHRcdFx0cmVzb2x2ZWQ6IHN0cmluZztcblx0XHRcdGludGVncml0eTogc3RyaW5nO1xuXHRcdFx0cmVxdWlyZXM6IHtcblx0XHRcdFx0W25hbWU6IHN0cmluZ106IHN0cmluZztcblx0XHRcdH07XG5cdFx0XHRkZXBlbmRlbmNpZXM/OiB7XG5cdFx0XHRcdFtuYW1lOiBzdHJpbmddOiB7XG5cdFx0XHRcdFx0dmVyc2lvbjogc3RyaW5nO1xuXHRcdFx0XHRcdHJlc29sdmVkOiBzdHJpbmc7XG5cdFx0XHRcdFx0aW50ZWdyaXR5OiBzdHJpbmc7XG5cdFx0XHRcdFx0cmVxdWlyZXM6IHtcblx0XHRcdFx0XHRcdFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fTtcblx0fTtcbn1cbntcblx0cmV0dXJuIEpTT04ucGFyc2UoeWFyblRvTnBtQ29yZSh5YXJubG9jaywgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcikpXG59XG4iXX0=