"use strict";
const tslib_1 = require("tslib");
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const spawn_1 = require("../../lib/spawn");
const ws_root_spawn_1 = require("ws-root-spawn");
const core_1 = (0, tslib_1.__importDefault)(require("find-yarn-workspace-root2/core"));
const command = (0, cmd_dir_1.basenameStrip)(__filename);
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command,
    //aliases: [],
    describe: `run/exec in workspaces root`,
    builder(yargs) {
        return yargs
            .option('silent', {
            alias: ['s'],
            description: `skip Yarn console logs, other types of logs (script output) will be
printed`,
            boolean: true,
        })
            .example(`yarn-tool root run test`, `run in workspaces root`)
            .example(`yarn-tool root exec node -v`, `exec in workspaces root`)
            .help(true)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        let cmd_list = (0, spawn_1.processArgvSlice)(command).argv;
        let cmd = cmd_list[0];
        let cwd = argv.cwd;
        let root = (0, core_1.default)(cwd);
        if (!argv.silent) {
            if (cwd) {
                index_1.consoleDebug.info(`cwd: ${cwd}`);
            }
            if (cwd !== root) {
                index_1.consoleDebug.info(`root: ${root}`);
            }
        }
        if (cmd === 'run') {
            let cp = (0, ws_root_spawn_1.spawnWsRootRunSync)(cmd_list.slice(1), {
                cwd: root,
            });
            if (cp.status) {
                !argv.silent && index_1.consoleDebug.error(`Command failed with exit code ${cp.status}.`);
                process.exit(cp.status);
            }
        }
        else if (cmd === 'exec') {
            let cp = (0, ws_root_spawn_1.spawnWsRootExecSync)(cmd_list.slice(1), {
                cwd: root,
            });
            if (cp.status) {
                !argv.silent && index_1.consoleDebug.error(`Command failed with exit code ${cp.status}.`);
                process.exit(cp.status);
            }
        }
        else {
            index_1.consoleDebug.error(`not support this command: ${cmd}`);
            process.exit(1);
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=root.js.map