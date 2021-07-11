#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yargs_1 = (0, tslib_1.__importDefault)(require("yargs"));
const upath2_1 = (0, tslib_1.__importDefault)(require("upath2"));
const os_locale_1 = (0, tslib_1.__importDefault)(require("os-locale"));
const update_notifier_1 = require("@yarn-tool/update-notifier");
if (upath2_1.default.extname(__filename) === '.js' && !process.argv.filter(v => {
    if (typeof v === 'string') {
        return v.includes('ts-node') || v.includes('source-map-support');
    }
}).length) {
    require('source-map-support').install({
        hookRequire: true
    });
}
(0, update_notifier_1.updateNotifier)(upath2_1.default.join(__dirname, '..'));
let cli = yargs_1.default
    .option('cwd', {
    desc: `current working directory or package directory`,
    normalize: true,
    default: process.cwd(),
})
    .option('skipCheckWorkspace', {
    desc: `this options is for search yarn.lock, pkg root, workspace root, not same as --ignore-workspace-root-check`,
    boolean: true,
})
    .option('yt-debug-mode', {
    boolean: true,
})
    .alias('v', 'version')
    .alias('h', 'help')
    .help('help')
    .recommendCommands()
    .locale(os_locale_1.default.sync())
    .commandDir(upath2_1.default.join(__dirname, 'cmds'))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand()
    .scriptName('yt');
cli.argv;
//# sourceMappingURL=yarn-tool.js.map