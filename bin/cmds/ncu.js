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
const fsYarnLock_1 = require("../../lib/fsYarnLock");
const yarnlock_ncu_1 = require("@yarn-tool/yarnlock-ncu");
const fs_1 = require("fs");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' [-u]',
    aliases: ['update'],
    describe: `Find newer versions of dependencies than what your package.json allows`,
    builder(yargs) {
        return (0, ncu_1.setupNcuToYargs2)(yargs);
    },
    async handler(argv) {
        const { cwd } = argv;
        let rootData = (0, index_1.findRoot)({
            ...argv,
            cwd,
        }, true);
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg_data = (0, package_dts_1.readPackageJson)(pkg_file);
        let resolutions = pkg_data.resolutions;
        let pkg_file_ws;
        let pkg_data_ws;
        let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;
        if (doWorkspace) {
            pkg_file_ws = path.join(rootData.ws, 'package.json');
            pkg_data_ws = (0, package_dts_1.readPackageJson)(pkg_file_ws);
            resolutions = pkg_data_ws.resolutions;
        }
        if (argv.resolutions) {
            if (!resolutions || !Object.keys(resolutions).length) {
                return (0, index_1.yargsProcessExit)(`resolutions is not exists in package.json`);
            }
            let yl = (0, fsYarnLock_1.fsYarnLock)(rootData.root);
            if (!yl.yarnlock_old) {
                // 防止 yarn.lock 不存在
                return;
            }
            let ret = await (0, ncu_1.checkResolutionsUpdate)(resolutions, yl.yarnlock_old, argv);
            //console.log(ret);
            if (ret.yarnlock_changed) {
                (0, yarnlock_1.writeYarnLockFile)(yl.yarnlock_file, ret.yarnlock_new_obj);
                (0, index_1.chalkByConsole)((chalk, console) => {
                    let p = chalk.cyan(path.relative(argv.cwd, yl.yarnlock_file));
                    console.log(`${p} is updated!`);
                }, index_1.console);
                let msg = (0, yarnlock_1.yarnLockDiff)((0, yarnlock_1.stringify)(ret.yarnlock_old_obj), (0, yarnlock_1.stringify)(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            let ls2 = Object.values(ret.deps)
                .filter(data => {
                let { name, version_old, version_new } = data;
                return (0, ncu_1.isUpgradeable)(version_old, version_new);
            });
            let ncuOptions = (0, ncu_1.npmCheckUpdatesOptions)(argv);
            let fromto = ls2
                .reduce((a, data) => {
                let { name, version_old, version_new } = data;
                let new_semver = (0, ncu_1.updateSemver)(version_old, version_new, ncuOptions);
                a.from[name] = version_old;
                a.to[name] = new_semver;
                resolutions[name] = new_semver;
                return a;
            }, {
                from: {},
                to: {},
            });
            let msg = (0, table_1.toDependencyTable)(fromto);
            index_1.console.log(`\n${msg}\n`);
            if (argv.upgrade) {
                if (doWorkspace) {
                    pkg_data_ws.resolutions = resolutions;
                    (0, pkg_1.writePackageJson)(pkg_file_ws, pkg_data_ws);
                    (0, index_1.chalkByConsole)((chalk, console) => {
                        let p = chalk.cyan(path.relative(argv.cwd, pkg_file_ws));
                        console.log(`${p} is updated!`);
                    }, index_1.console);
                }
                else {
                    pkg_data.resolutions = resolutions;
                    (0, pkg_1.writePackageJson)(pkg_file, pkg_data);
                    (0, index_1.chalkByConsole)((chalk, console) => {
                        let p = chalk.cyan(path.relative(rootData.ws || rootData.pkg, pkg_file));
                        console.log(`${p} is updated!`);
                    }, index_1.console);
                }
            }
            return;
        }
        (0, index_1.printRootData)(rootData, argv);
        let pkgNcu = await (0, ncu_1.npmCheckUpdates)({
            cwd,
            rootData,
            // @ts-ignore
        }, {
            ...argv,
            json_old: pkg_data,
        });
        if (pkgNcu.json_changed && argv.upgrade) {
            (0, pkg_1.writeJSONSync)(pkg_file, pkgNcu.json_new);
            index_1.consoleDebug.info(`package.json updated`);
        }
        if (argv.dedupe && resolutions && Object.keys(resolutions).length) {
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
            let yl = (0, fsYarnLock_1.fsYarnLock)(rootData.root);
            if (!yl.yarnlock_old) {
                // 防止 yarn.lock 不存在
                return;
            }
            let ret = await (0, ncu_1.checkResolutionsUpdate)(resolutions, yl.yarnlock_old, argv);
            if (ret.yarnlock_changed) {
                let msg = (0, yarnlock_1.yarnLockDiff)((0, yarnlock_1.stringify)(ret.yarnlock_old_obj), (0, yarnlock_1.stringify)(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            if (pkgNcu.json_changed && !argv.upgrade) {
                ret.yarnlock_changed && index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
            }
            if (ret.yarnlock_changed && argv.upgrade) {
                (0, yarnlock_1.writeYarnLockFile)(yl.yarnlock_file, ret.yarnlock_new_obj);
                index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
            }
        }
        let yl = (0, fsYarnLock_1.fsYarnLock)(rootData.root);
        if (yl.yarnlock_exists) {
            let ret = await (0, yarnlock_ncu_1.updateYarnLockTag)(yl.yarnlock_old);
            if (ret.yarnlock_changed) {
                index_1.consoleDebug.magenta.info(`higher versions exists on registry`);
                let s = (0, yarnlock_ncu_1.printReport)(ret.report);
                (s === null || s === void 0 ? void 0 : s.length) > 0 && index_1.console.log(s);
                if (argv.upgrade) {
                    (0, fs_1.writeFileSync)(yl.yarnlock_file, ret.yarnlock_new);
                    index_1.consoleDebug.magenta.info(`yarn.lock updated`);
                    index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
                }
                else {
                    index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt ncu -u`), ` , for update yarn.lock`);
                }
            }
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=ncu.js.map