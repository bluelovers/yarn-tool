"use strict";
/**
 * yarn-tool workspaces 命令模組
 * yarn-tool workspaces command module
 *
 * @author user
 * @created 2019/5/19
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const pm_1 = require("../../lib/pm");
/**
 * 創建 workspaces 命令模組
 * Create workspaces command module
 */
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename) + ' <cmd>',
    aliases: ['ws', 'workspaces', 'workspace'],
    describe: `yarn 工作區域 / yarn workspaces`,
    builder(yargs) {
        return yargs
            .commandDir((0, cmd_dir_1.commandDirJoin)(__dirname, __filename))
            .command({
            command: 'run',
            describe: `使用 lerna 執行腳本 / Run script by lerna`,
            builder(yargs) {
                return yargs
                    .option('stream', {
                    desc: `以行為單位輸出，並以套件名稱作為前綴 / Stream output with lines prefixed by package.`,
                })
                    .option('parallel', {
                    desc: `以無限並行執行腳本，並輸出帶前綴的結果 / Run script with unlimited concurrency, streaming prefixed output.`,
                })
                    .option('no-prefix', {
                    desc: `不對輸出添加前綴 / Do not prefix streaming output.`,
                })
                    .help(false)
                    .version(false)
                    .strict(false);
            },
            handler(argv) {
                lazyLerna('run', 'run', argv, {
                    beforeSpawn(data) {
                        // @ts-ignore
                        if (data.argv.stream == null && data.argv.parallel == null) {
                            data.cmd_list.unshift(`--stream`);
                        }
                    }
                });
            },
        })
            .command({
            command: 'exec',
            describe: `在每個套件中執行任意命令 / Execute an arbitrary command in each package`,
            builder(yargs) {
                return yargs
                    .strict(false);
            },
            handler(argv) {
                lazyLerna('exec', 'exec', argv);
            },
        })
            .strict()
            .demandCommand();
    },
    handler(argv) {
    },
});
/**
 * 懶加載 lerna 命令
 * Lazy load lerna command
 * @param command 命令名稱
 * @param cmd 子命令
 * @param argv 參數對象
 * @param opts 選項配置
 * @returns 子進程執行結果
 */
function lazyLerna(command, cmd, argv, opts = {}) {
    let ret = (0, pm_1.detectPackageManager)(null).pmMap['lerna'] || (0, spawn_1.checkModileExists)({
        name: 'lerna',
    });
    if (!ret) {
        process.exit(1);
    }
    let cmd_list = (0, spawn_1.processArgvSlice)(command).argv;
    if (opts && opts.beforeSpawn) {
        let data = {
            cmd,
            cmd_list,
            argv: argv,
        };
        opts.beforeSpawn(data);
        ({
            cmd,
            cmd_list,
            argv,
        } = data);
    }
    return (0, spawn_1.crossSpawnOther)('lerna', [
        cmd,
        ...cmd_list,
    ], argv, {
        env: {
            ...process.env,
            NO_UPDATE_NOTIFIER: 1,
        }
    });
}
module.exports = cmdModule;
//# sourceMappingURL=ws.js.map