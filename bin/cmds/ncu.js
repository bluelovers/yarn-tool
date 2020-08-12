"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const ncu_1 = __importStar(require("../../lib/cli/ncu"));
const yarnlock_1 = require("../../lib/yarnlock");
const table_1 = require("../../lib/table");
const fsYarnLock_1 = require("../../lib/fsYarnLock");
const index_2 = require("@yarn-tool/yarnlock-ncu/index");
const fs_1 = require("fs");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [-u]',
    aliases: ['update'],
    describe: `Find newer versions of dependencies than what your package.json allows`,
    builder(yargs) {
        return ncu_1.default(yargs)
            .option('resolutions', {
            alias: ['R'],
            desc: 'do with resolutions only',
            boolean: true,
        })
            .option('no-safe', {
            boolean: true,
        })
            .example(`$0 ncu -u`, `check new version and update package.json`)
            .example(`$0 ncu -R`, `check new version of resolutions in package.json`)
            .example(`$0 ncu -u -R`, `check new version of resolutions in package.json and update package.json`);
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
                return index_1.yargsProcessExit(`resolutions is not exists in package.json`);
            }
            let yl = fsYarnLock_1.fsYarnLock(rootData.root);
            if (!yl.yarnlock_old) {
                // 防止 yarn.lock 不存在
                return;
            }
            let ret = await ncu_1.checkResolutionsUpdate(resolutions, yl.yarnlock_old, argv);
            //console.log(ret);
            if (ret.yarnlock_changed) {
                yarnlock_1.writeYarnLockFile(yl.yarnlock_file, ret.yarnlock_new_obj);
                index_1.chalkByConsole((chalk, console) => {
                    let p = chalk.cyan(path.relative(argv.cwd, yl.yarnlock_file));
                    console.log(`${p} is updated!`);
                }, index_1.console);
                let msg = yarnlock_1.yarnLockDiff(yarnlock_1.stringify(ret.yarnlock_old_obj), yarnlock_1.stringify(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            let ls2 = Object.values(ret.deps)
                .filter(data => {
                let { name, version_old, version_new } = data;
                return ncu_1.isUpgradeable(version_old, version_new);
            });
            let ncuOptions = ncu_1.npmCheckUpdatesOptions(argv);
            let fromto = ls2
                .reduce((a, data) => {
                let { name, version_old, version_new } = data;
                let new_semver = ncu_1.updateSemver(version_old, version_new, ncuOptions);
                a.from[name] = version_old;
                a.to[name] = new_semver;
                resolutions[name] = new_semver;
                return a;
            }, {
                from: {},
                to: {},
            });
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
            let yl = fsYarnLock_1.fsYarnLock(rootData.root);
            if (!yl.yarnlock_old) {
                // 防止 yarn.lock 不存在
                return;
            }
            let ret = await ncu_1.checkResolutionsUpdate(resolutions, yl.yarnlock_old, argv);
            if (ret.yarnlock_changed) {
                let msg = yarnlock_1.yarnLockDiff(yarnlock_1.stringify(ret.yarnlock_old_obj), yarnlock_1.stringify(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            if (pkgNcu.json_changed && !argv.upgrade) {
                ret.yarnlock_changed && index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
            }
            if (ret.yarnlock_changed && argv.upgrade) {
                yarnlock_1.writeYarnLockFile(yl.yarnlock_file, ret.yarnlock_new_obj);
                index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
            }
        }
        let yl = fsYarnLock_1.fsYarnLock(rootData.root);
        if (!yl.yarnlock_exists) {
            let ret = await index_2.updateYarnLockTag(yl.yarnlock_old);
            if (ret.yarnlock_changed) {
                index_1.consoleDebug.magenta.info(`higher versions exists on registry`);
                let s = index_2.printReport(ret.report);
                (s === null || s === void 0 ? void 0 : s.length) > 0 && index_1.console.log(s);
                if (argv.upgrade) {
                    fs_1.writeFileSync(yl.yarnlock_file, ret.yarnlock_new);
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