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
        if (argv.yarn || argv.shrinkwrap) {
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
                }
                if (argv.shrinkwrap) {
                    fs.writeJSONSync(file_shrinkwrap_json, lock, {
                        spaces: 2,
                    });
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFDbEcsK0JBQWdDO0FBQ2hDLCtCQUFnQztBQUNoQywyQ0FBZ0g7QUFDaEgsc0RBQXVEO0FBSXZELGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsaURBQTBDO0FBQzFDLG1DQUF5RDtBQUN6RCxrRUFBMkQ7QUFFM0QsTUFBTSxXQUFXLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUU5QyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxxQkFBcUI7SUFFL0IsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSxrQ0FBa0M7WUFDeEMsT0FBTyxFQUFFLElBQUk7U0FFYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx3Q0FBd0M7WUFDOUMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFlBQVksRUFBRTtZQUNyQixJQUFJLEVBQUUsMENBQTBDO1lBQ2hELE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLEVBQUUsZ0VBQWdFO1lBQ3RFLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osSUFBSSxFQUFFLDBCQUEwQjtZQUNoQyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxTQUFTLENBQUMsS0FBSyxF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T0FBTyxJQUFJLENBQUE7QUFDWixDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMscUJBQXFCLEVBQUUsVUFBVTtJQUVuRCxPQUFPLG1CQUFhLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVU7SUEyQnJELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDdEUsQ0FBQztBQXhJRCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IGNoYWxrQnlDb25zb2xlLCBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrLCB5YXJnc1Byb2Nlc3NFeGl0IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgZXhwb3J0WWFybkxvY2ssIHBhcnNlIGFzIHBhcnNlWWFybkxvY2sgfSBmcm9tICcuLi8uLi9saWIveWFybmxvY2snO1xuaW1wb3J0IHsgU2VtVmVyLCByY29tcGFyZSB9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgeyBBcmd1bWVudHMsIENvbW1hbmRNb2R1bGUgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgRGVkdXBlIGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB7IG5wbVRvWWFybkNvcmUsIHlhcm5Ub05wbUNvcmUgfSBmcm9tICdzeW5wMi9saWInO1xuaW1wb3J0IGZpeE5wbUxvY2sgZnJvbSAnLi4vLi4vbGliL2NsaS9sb2NrZmlsZS9maXhOcG1Mb2NrJztcblxuY29uc3QgQ09NTUFORF9LRVkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBzaG93IHlhcm4ubG9jayBpbmZvYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdkdXBsaWNhdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ0QnXSxcblx0XHRcdFx0ZGVzYzogYHNob3cgZHVwbGljYXRlIGxpc3QgYnkgeWFybi5sb2NrYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdFx0Ly9kZWZhdWx0OiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ25wbScsIHtcblx0XHRcdFx0ZGVzYzogYENvbnZlcnQgeWFybi5sb2NrIHRvIHBhY2thZ2UtbG9jay5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdzaHJpbmt3cmFwJywge1xuXHRcdFx0XHRkZXNjOiBgQ29udmVydCB5YXJuLmxvY2sgdG8gbnBtLXNocmlua3dyYXAuanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbigneWFybicsIHtcblx0XHRcdFx0ZGVzYzogYENvbnZlcnQgcGFja2FnZS1sb2NrLmpzb24gdG8geWFybi5sb2NrIGlmIHlhcm4ubG9jayBub3QgZXhpc3RzYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdvdmVyd3JpdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ08nXSxcblx0XHRcdFx0ZGVzYzogYG92ZXJ3cml0ZSBmaWxlIGlmIGV4aXN0c2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LmNvbmZsaWN0cygnbnBtJywgWyd5YXJuJywgJ2R1cGxpY2F0ZSddKVxuXHRcdFx0LmV4YW1wbGUoYCQwICR7Q09NTUFORF9LRVl9IC0tZHVwbGljYXRlYCwgYHNob3cgZHVwbGljYXRlIGxpc3QgYnkgeWFybi5sb2NrYClcblx0XHRcdC5leGFtcGxlKGAkMCAke0NPTU1BTkRfS0VZfSAtLWR1cGxpY2F0ZSBmYWxzZWAsIGBzaG93IHBhY2thZ2VzIGxpc3QgYnkgeWFybi5sb2NrYClcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBDT01NQU5EX0tFWTtcblxuXHRcdC8vbGV0IHJvb3REYXRhID0gZmluZFJvb3QoYXJndiwgdHJ1ZSk7XG5cblx0XHQvL2xldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRpZiAoYXJndi55YXJuIHx8IGFyZ3Yuc2hyaW5rd3JhcClcblx0XHR7XG5cdFx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCBmaWxlX3BhY2thZ2VfbG9ja19qc29uID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UtbG9jay5qc29uJyk7XG5cblx0XHRcdGxldCBmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cyA9IGZzLmV4aXN0c1N5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbik7XG5cblx0XHRcdGlmIChhcmd2Lm5wbSB8fCBhcmd2LnNocmlua3dyYXApXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgheWwueWFybmxvY2tfZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0eWFyZ3NQcm9jZXNzRXhpdChuZXcgRXJyb3IoYHlhcm4ubG9jayBub3QgZXhpc3RzYCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi5ucG0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlICYmIGZpbGVfcGFja2FnZV9sb2NrX2pzb25fZXhpc3RzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGBwYWNrYWdlLWxvY2suanNvbiBpcyBleGlzdHMsIHVzZSAtLW92ZXJ3cml0ZSBmb3Igb3ZlcndyaXRlIGZpbGVgKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoZmlsZV9wYWNrYWdlX2xvY2tfanNvbl9leGlzdHMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHBhY2thZ2UtbG9jay5qc29uIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGZpbGVfc2hyaW5rd3JhcF9qc29uID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ25wbS1zaHJpbmt3cmFwLmpzb24nKTtcblx0XHRcdFx0bGV0IGZpbGVfc2hyaW5rd3JhcF9qc29uX2V4aXN0cyA9IGZzLmV4aXN0c1N5bmMoZmlsZV9zaHJpbmt3cmFwX2pzb24pO1xuXG5cdFx0XHRcdGlmIChhcmd2LnNocmlua3dyYXApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlICYmIGZpbGVfc2hyaW5rd3JhcF9qc29uX2V4aXN0cylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgbnBtLXNocmlua3dyYXAuanNvbiBpcyBleGlzdHMsIHVzZSAtLW92ZXJ3cml0ZSBmb3Igb3ZlcndyaXRlIGZpbGVgKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoZmlsZV9zaHJpbmt3cmFwX2pzb25fZXhpc3RzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGBucG0tc2hyaW5rd3JhcC5qc29uIGlzIGV4aXN0cywgd2lsbCBnb3Qgb3ZlcndyaXRlYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHsgbmFtZSwgdmVyc2lvbiB9ID0gcmVhZFBhY2thZ2VKc29uKHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKSk7XG5cblx0XHRcdFx0bGV0IHMgPSB5YXJuVG9OcG0oeWwueWFybmxvY2tfb2xkLCBuYW1lLCB2ZXJzaW9uLCByb290RGF0YS5wa2cpO1xuXG5cdFx0XHRcdGlmIChyb290RGF0YS5oYXNXb3Jrc3BhY2UgJiYgIXJvb3REYXRhLmlzV29ya3NwYWNlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHMyID0geWFyblRvTnBtKHlsLnlhcm5sb2NrX29sZCwgbmFtZSwgdmVyc2lvbiwgcm9vdERhdGEud3MpO1xuXG5cdFx0XHRcdFx0cy5kZXBlbmRlbmNpZXMgPSB7XG5cdFx0XHRcdFx0XHQuLi5zLmRlcGVuZGVuY2llcyxcblx0XHRcdFx0XHRcdC4uLnMyLmRlcGVuZGVuY2llcyxcblx0XHRcdFx0XHRcdC4uLnMuZGVwZW5kZW5jaWVzLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGxvY2sgPSBmaXhOcG1Mb2NrKHMpO1xuXG5cdFx0XHRcdGlmIChhcmd2Lm5wbSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZzLndyaXRlSlNPTlN5bmMoZmlsZV9wYWNrYWdlX2xvY2tfanNvbiwgbG9jaywge1xuXHRcdFx0XHRcdFx0c3BhY2VzOiAyLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFyZ3Yuc2hyaW5rd3JhcClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZzLndyaXRlSlNPTlN5bmMoZmlsZV9zaHJpbmt3cmFwX2pzb24sIGxvY2ssIHtcblx0XHRcdFx0XHRcdHNwYWNlczogMixcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBwYWNrYWdlLWxvY2suanNvbiB1cGRhdGVkYCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChhcmd2Lnlhcm4pXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB5YXJubG9ja19maWxlX3BrZyA9IHBhdGguam9pbihyb290RGF0YS5wa2csICd5YXJuLmxvY2snKTtcblxuXHRcdFx0XHRpZiAoZnMuZXhpc3RzU3luYyh5YXJubG9ja19maWxlX3BrZykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIWFyZ3Yub3ZlcndyaXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHlhcmdzUHJvY2Vzc0V4aXQobmV3IEVycm9yKGB5YXJuLmxvY2sgaXMgZXhpc3RzLCB1c2UgLS1vdmVyd3JpdGUgZm9yIG92ZXJ3cml0ZSBmaWxlYCkpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYHlhcm4ubG9jayBpcyBleGlzdHMsIHdpbGwgZ290IG92ZXJ3cml0ZWApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFmaWxlX3BhY2thZ2VfbG9ja19qc29uX2V4aXN0cylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICh5bC55YXJubG9ja19leGlzdHMgJiYgcm9vdERhdGEuaGFzV29ya3NwYWNlICYmICFyb290RGF0YS5pc1dvcmtzcGFjZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcud2FybihgcGFja2FnZS1sb2NrLmpzb24gbm90IGV4aXN0cywgYnV0IHlhcm4ubG9jayBleGlzdHMgaW4gd29ya3NwYWNlc2ApO1xuXG5cdFx0XHRcdFx0XHRsZXQgcyA9IERlZHVwZSh5bC55YXJubG9ja19vbGQpLnlhcm5sb2NrX25ldztcblxuXHRcdFx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5YXJubG9ja19maWxlX3BrZywgcyk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGB5YXJuLmxvY2sgY29waWVkYCk7XG5cblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR5YXJnc1Byb2Nlc3NFeGl0KG5ldyBFcnJvcihgcGFja2FnZS1sb2NrLmpzb24gbm90IGV4aXN0c2ApKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHMgPSBucG1Ub1lhcm4oZnMucmVhZEZpbGVTeW5jKGZpbGVfcGFja2FnZV9sb2NrX2pzb24pLnRvU3RyaW5nKCksIHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRcdHMgPSBEZWR1cGUocykueWFybmxvY2tfbmV3O1xuXG5cdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWFybmxvY2tfZmlsZV9wa2csIHMpXG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHlhcm4ubG9jayB1cGRhdGVkYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGFyZ3YuZHVwbGljYXRlIHx8ICFhcmd2LmR1cGxpY2F0ZSlcblx0XHR7XG5cdFx0XHRfc2hvd1lhcm5Mb2NrTGlzdChhcmd2KVxuXHRcdH1cblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG5cbnR5cGUgSVVucGFja0NtZE1vZDxUIGV4dGVuZHMgQ29tbWFuZE1vZHVsZSwgRCA9IElVbnBhY2tNeVlhcmdzQXJndj4gPSBUIGV4dGVuZHMgQ29tbWFuZE1vZHVsZTxhbnksIGluZmVyIFU+ID8gVVxuXHQ6IFQgZXh0ZW5kcyBDb21tYW5kTW9kdWxlPGluZmVyIFUsIGFueT4gPyBVXG5cdFx0OiBEXG5cdDtcblxuLy8gQHRzLWlnbm9yZVxuZnVuY3Rpb24gX2lzKGFyZ3Y6IEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Pik6IGFyZ3YgaXMgQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+XG57XG5cdHJldHVybiB0cnVlO1xufVxuXG4vLyBAdHMtaWdub3JlXG5mdW5jdGlvbiBfZml4KGFyZ3Y6IEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Pilcbntcblx0cmV0dXJuIGFyZ3Y7XG59XG5cbi8vIEB0cy1pZ25vcmVcbmZ1bmN0aW9uIF9zaG93WWFybkxvY2tMaXN0KGFyZ3Y6IEFyZ3VtZW50czxJVW5wYWNrQ21kTW9kPHR5cGVvZiBjbWRNb2R1bGU+Pik6IGFyZ3YgaXMgQXJndW1lbnRzPElVbnBhY2tDbWRNb2Q8dHlwZW9mIGNtZE1vZHVsZT4+XG57XG5cdGxldCByb290RGF0YSA9IGZpbmRSb290KGFyZ3YsIHRydWUpO1xuXG5cdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlsLnlhcm5sb2NrX29sZCk7XG5cblx0bGV0IGZ5ID0gZXhwb3J0WWFybkxvY2soeWFybmxvY2tfb2xkX29iaik7XG5cblx0bGV0IGtzID0gT2JqZWN0LmtleXMoZnkuaW5zdGFsbGVkKTtcblxuXHRsZXQgbWF4ID0gMDtcblx0bGV0IGxlbiA9IDA7XG5cblx0bGV0IGtzMiA9IGtzXG5cdFx0LnJlZHVjZSgoYSwgbmFtZSkgPT5cblx0XHR7XG5cblx0XHRcdGxldCBhcnIgPSBmeS5pbnN0YWxsZWRbbmFtZV07XG5cblx0XHRcdGlmICghYXJndi5kdXBsaWNhdGUgfHwgYXJyLmxlbmd0aCA+IDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG5hbWUpO1xuXG5cdFx0XHRcdHRyeVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXJyID0gYXJyLnNvcnQocmNvbXBhcmUpLnJldmVyc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgYXJyMiA9IGFyci5zbGljZSgwLCAtMSk7XG5cblx0XHRcdFx0aWYgKGFycjIubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFycjIuam9pbignXFxu4pSc4pSAICcpKTtcblxuXHRcdFx0XHRcdGxlbiArPSBhcnIyLmxlbmd0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCBhcnJbYXJyLmxlbmd0aCAtIDFdKTtcblxuXHRcdFx0XHRtYXggPSBNYXRoLm1heChtYXgsIGFyci5sZW5ndGgpO1xuXG5cdFx0XHRcdGEucHVzaChuYW1lKVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYTtcblx0XHR9LCBbXSBhcyBzdHJpbmdbXSlcblx0O1xuXG5cdGxldCBjaGFsayA9IGNvbnNvbGUuY2hhbGs7XG5cblx0aWYgKGFyZ3YuZHVwbGljYXRlKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBcXG5Gb3VuZCBkdXBsaWNhdGUgaW4gJHtjaGFsay55ZWxsb3coa3MyLmxlbmd0aCl9IHBhY2thZ2VzLCAke2NoYWxrLnllbGxvdyhsZW4pfS8ke2NoYWxrLnllbGxvdyhsZW4gKyBrczIubGVuZ3RoKX0gaW5zdGFsbGVkIHZlcnNpb24sIGhpZ2hlc3QgaXMgJHttYXh9LCBpbiB0b3RhbCAke2tzLmxlbmd0aH0gcGFja2FnZXNgKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcblRvdGFsICR7Y2hhbGsueWVsbG93KGtzLmxlbmd0aCl9IHBhY2thZ2VzLCB3aXRoICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbiArIGtzMi5sZW5ndGgpfSBpbnN0YWxsZWQgdmVyc2lvbmApO1xuXHR9XG5cblx0aWYgKGxlbiA+IDApXG5cdHtcblx0XHRjb25zdCB0ZXJtaW5hbExpbmsgPSByZXF1aXJlKCd0ZXJtaW5hbC1saW5rJyk7XG5cdFx0Y29uc3QgbGluayA9IHRlcm1pbmFsTGluaygnc2VlIGhlcmUnLCAnaHR0cHM6Ly95YXJucGtnLmNvbS9kb2NzL3NlbGVjdGl2ZS12ZXJzaW9uLXJlc29sdXRpb25zLycsIHtcblx0XHRcdGZhbGxiYWNrKHRleHQsIHVybClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRleHQgKyAnICcgKyB1cmw7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdFx0Y29uc29sZS5jeWFuLmluZm8oYFlvdSBjYW4gdHJ5IGFkZCB0aGV5IHRvICR7Y29uc29sZS5jaGFsay55ZWxsb3coJ3Jlc29sdXRpb25zJyl9IGluIHBhY2thZ2UuanNvbiwgZm9yIGZvcmNlIHBhY2thZ2UgZGVkdXBlLCAke2xpbmt9YCk7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBucG1Ub1lhcm4ocGFja2FnZUxvY2tGaWxlU3RyaW5nLCBwYWNrYWdlRGlyKTogc3RyaW5nXG57XG5cdHJldHVybiBucG1Ub1lhcm5Db3JlKHBhY2thZ2VMb2NrRmlsZVN0cmluZywgcGFja2FnZURpcik7XG59XG5cbmZ1bmN0aW9uIHlhcm5Ub05wbSh5YXJubG9jaywgbmFtZSwgdmVyc2lvbiwgcGFja2FnZURpcik6IHtcblx0bmFtZTogc3RyaW5nO1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdGxvY2tmaWxlVmVyc2lvbjogbnVtYmVyO1xuXHRyZXF1aXJlczogYm9vbGVhbjtcblx0ZGVwZW5kZW5jaWVzOiB7XG5cdFx0W25hbWU6IHN0cmluZ106IHtcblx0XHRcdHZlcnNpb246IHN0cmluZztcblx0XHRcdHJlc29sdmVkOiBzdHJpbmc7XG5cdFx0XHRpbnRlZ3JpdHk6IHN0cmluZztcblx0XHRcdHJlcXVpcmVzOiB7XG5cdFx0XHRcdFtuYW1lOiBzdHJpbmddOiBzdHJpbmc7XG5cdFx0XHR9O1xuXHRcdFx0ZGVwZW5kZW5jaWVzPzoge1xuXHRcdFx0XHRbbmFtZTogc3RyaW5nXToge1xuXHRcdFx0XHRcdHZlcnNpb246IHN0cmluZztcblx0XHRcdFx0XHRyZXNvbHZlZDogc3RyaW5nO1xuXHRcdFx0XHRcdGludGVncml0eTogc3RyaW5nO1xuXHRcdFx0XHRcdHJlcXVpcmVzOiB7XG5cdFx0XHRcdFx0XHRbbmFtZTogc3RyaW5nXTogc3RyaW5nO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH07XG5cdH07XG59XG57XG5cdHJldHVybiBKU09OLnBhcnNlKHlhcm5Ub05wbUNvcmUoeWFybmxvY2ssIG5hbWUsIHZlcnNpb24sIHBhY2thZ2VEaXIpKVxufVxuIl19