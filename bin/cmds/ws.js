"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' <cmd>',
    aliases: ['ws', 'workspaces', 'workspace'],
    describe: `yarn workspaces`,
    builder(yargs) {
        return yargs
            .commandDir(cmd_dir_1.commandDirJoin(__dirname, __filename))
            .command({
            command: 'run',
            describe: `run script by lerna`,
            builder(yargs) {
                return yargs
                    .option('stream', {
                    desc: `Stream output with lines prefixed by package.`,
                })
                    .option('parallel', {
                    desc: `Run script with unlimited concurrency, streaming prefixed output.`,
                })
                    .option('no-prefix', {
                    desc: `Do not prefix streaming output.`,
                })
                    .help(false)
                    .version(false)
                    .strict(false);
            },
            handler(argv) {
                lazyLerna('run', 'run', argv, {
                    beforeSpawn(data) {
                        if (data.argv.stream == null && data.argv.parallel == null) {
                            data.cmd_list.unshift(`--stream`);
                        }
                    }
                });
            },
        })
            .command({
            command: 'exec',
            describe: `Execute an arbitrary command in each package`,
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
function lazyLerna(command, cmd, argv, opts = {}) {
    let ret = spawn_1.checkModileExists({
        name: 'lerna',
    });
    if (!ret) {
        process.exit(1);
    }
    let cmd_list = spawn_1.processArgvSlice(command).argv;
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
    return spawn_1.crossSpawnOther('lerna', [
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