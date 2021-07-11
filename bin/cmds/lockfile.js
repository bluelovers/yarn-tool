"use strict";
const tslib_1 = require("tslib");
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
const dedupe_1 = (0, tslib_1.__importDefault)(require("../../lib/cli/dedupe"));
const lib_1 = require("synp2/lib");
const fixNpmLock_1 = (0, tslib_1.__importDefault)(require("../../lib/cli/lockfile/fixNpmLock"));
const fsYarnLock_1 = require("../../lib/fsYarnLock");
const COMMAND_KEY = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `show yarn.lock info`,
    builder(yargs) {
        return yargs
            .option('duplicate', {
            alias: ['D'],
            desc: `show duplicate list by yarn.lock`,
            boolean: true,
            //default: true,
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
            let rootData = (0, index_1.findRoot)(argv, true);
            let yl = (0, fsYarnLock_1.fsYarnLock)(rootData.root);
            let file_package_lock_json = path.join(rootData.pkg, 'package-lock.json');
            let file_package_lock_json_exists = fs.existsSync(file_package_lock_json);
            if (argv.npm || argv.shrinkwrap) {
                if (!yl.yarnlock_exists) {
                    (0, index_1.yargsProcessExit)(new Error(`yarn.lock not exists`));
                }
                if (argv.npm) {
                    if (!argv.overwrite && file_package_lock_json_exists) {
                        (0, index_1.yargsProcessExit)(new Error(`package-lock.json is exists, use --overwrite for overwrite file`));
                    }
                    else if (file_package_lock_json_exists) {
                        index_1.consoleDebug.warn(`package-lock.json is exists, will got overwrite`);
                    }
                }
                let file_shrinkwrap_json = path.join(rootData.pkg, 'npm-shrinkwrap.json');
                let file_shrinkwrap_json_exists = fs.existsSync(file_shrinkwrap_json);
                if (argv.shrinkwrap) {
                    if (!argv.overwrite && file_shrinkwrap_json_exists) {
                        (0, index_1.yargsProcessExit)(new Error(`npm-shrinkwrap.json is exists, use --overwrite for overwrite file`));
                    }
                    else if (file_shrinkwrap_json_exists) {
                        index_1.consoleDebug.warn(`npm-shrinkwrap.json is exists, will got overwrite`);
                    }
                }
                let { name, version } = (0, package_dts_1.readPackageJson)(path.join(rootData.pkg, 'package.json'));
                let s = yarnToNpm(yl.yarnlock_old, name, version, rootData.pkg);
                if (rootData.hasWorkspace && !rootData.isWorkspace) {
                    let s2 = yarnToNpm(yl.yarnlock_old, name, version, rootData.ws);
                    s.dependencies = {
                        ...s.dependencies,
                        ...s2.dependencies,
                        ...s.dependencies,
                    };
                }
                const lock = (0, fixNpmLock_1.default)(s);
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
                        (0, index_1.yargsProcessExit)(new Error(`yarn.lock is exists, use --overwrite for overwrite file`));
                    }
                    index_1.consoleDebug.warn(`yarn.lock is exists, will got overwrite`);
                }
                if (!file_package_lock_json_exists) {
                    if (yl.yarnlock_exists && rootData.hasWorkspace && !rootData.isWorkspace) {
                        index_1.consoleDebug.warn(`package-lock.json not exists, but yarn.lock exists in workspaces`);
                        let s = (0, dedupe_1.default)(yl.yarnlock_old).yarnlock_new;
                        fs.writeFileSync(yarnlock_file_pkg, s);
                        index_1.consoleDebug.info(`yarn.lock copied`);
                        return;
                    }
                    (0, index_1.yargsProcessExit)(new Error(`package-lock.json not exists`));
                }
                let s = npmToYarn(fs.readFileSync(file_package_lock_json).toString(), rootData.root);
                s = (0, dedupe_1.default)(s).yarnlock_new;
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
    let rootData = (0, index_1.findRoot)(argv, true);
    let yl = (0, fsYarnLock_1.fsYarnLock)(rootData.root);
    let yarnlock_old_obj = (0, yarnlock_1.parse)(yl.yarnlock_old);
    let fy = (0, yarnlock_1.exportYarnLock)(yarnlock_old_obj);
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
    return (0, lib_1.npmToYarnCore)(packageLockFileString, packageDir);
}
function yarnToNpm(yarnlock, name, version, packageDir) {
    return JSON.parse((0, lib_1.yarnToNpmCore)(yarnlock, name, version, packageDir));
}
module.exports = cmdModule;
//# sourceMappingURL=lockfile.js.map