"use strict";
const tslib_1 = require("tslib");
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const install_1 = tslib_1.__importDefault(require("../../lib/cli/install"));
const infoFromDedupeCache_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/infoFromDedupeCache");
const wrapDedupe_1 = require("@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe");
const cross_spawn_extra_1 = tslib_1.__importDefault(require("cross-spawn-extra"));
const fs_extra_1 = require("fs-extra");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' [cwd]',
    aliases: ['i'],
    describe: `do dedupe with yarn install`,
    builder(yargs) {
        return (0, install_1.default)(yargs)
            .option('reset-lockfile', {
            alias: ['L'],
            desc: `ignore and reset yarn.lock lockfile.`,
            boolean: true,
        });
    },
    handler(argv) {
        const { cwd } = argv;
        let _once = true;
        (0, wrapDedupe_1.wrapDedupe)(require('yargs'), argv, {
            consoleDebug: index_1.consoleDebug,
            before(yarg, argv, cache) {
                var _a, _b;
                let info = (0, infoFromDedupeCache_1.infoFromDedupeCache)(cache);
                if (!info.yarnlock_old_exists || !((_a = cache.yarnlock_old) === null || _a === void 0 ? void 0 : _a.length) || argv.resetLockfile) {
                    if (argv.resetLockfile && (info.yarnlock_old_exists || ((_b = cache.yarnlock_old) === null || _b === void 0 ? void 0 : _b.length))) {
                        index_1.consoleDebug.red.info(`'--reset-lockfile' mode is enabled, reset current lockfile.\n${info.yarnlock_file}`);
                        (0, fs_extra_1.truncateSync)(info.yarnlock_file);
                    }
                    cross_spawn_extra_1.default.sync('yarn', [], {
                        cwd,
                        stdio: 'inherit',
                    });
                    _once = false;
                }
                //console.log(1, cache.yarnlock_msg, cache.yarnlock_changed);
            },
            main(yarg, argv, cache) {
                let info = (0, infoFromDedupeCache_1.infoFromDedupeCache)(cache);
                if (info.yarnlock_changed) {
                    index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
                }
                if (_once || info.yarnlock_changed) {
                    cross_spawn_extra_1.default.sync('yarn', [], {
                        cwd,
                        stdio: 'inherit',
                    });
                    _once = true;
                }
                //console.log(2, cache.yarnlock_msg, cache.yarnlock_changed);
            },
            after(yarg, argv, cache) {
                let info = (0, infoFromDedupeCache_1.infoFromDedupeCache)(cache);
                if (_once && info.yarnlock_changed) {
                    index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
                    cross_spawn_extra_1.default.sync('yarn', [], {
                        cwd,
                        stdio: 'inherit',
                    });
                    _once = false;
                }
                //console.log(3, cache.yarnlock_msg, cache.yarnlock_changed);
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
                //console.log(4, cache.yarnlock_msg, cache.yarnlock_changed);
                //console.dir(infoFromDedupeCache(cache));
            },
        });
        return;
    },
});
module.exports = cmdModule;
//# sourceMappingURL=install.js.map