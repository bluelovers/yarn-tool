#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("v8-compile-cache");
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const upath2_1 = require("upath2");
const update_notifier_1 = require("@yarn-tool/update-notifier");
const osLocaleSync_1 = require("../lib/osLocaleSync");
if ((0, upath2_1.extname)(__filename) === '.js' && !process.argv.filter(v => {
    if (typeof v === 'string') {
        return v.includes('ts-node') || v.includes('source-map-support');
    }
}).length) {
    require('source-map-support').install({
        hookRequire: true
    });
}
(0, update_notifier_1.updateNotifier)((0, upath2_1.join)(__dirname, '..'));
let cli = yargs_1.default
    .option('cwd', {
    desc: `current working directory or package directory`,
    normalize: true,
    default: process.cwd(),
})
    .option('skipCheckWorkspace', {
    alias: ['W'],
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
    .locale((0, osLocaleSync_1.osLocaleSync)())
    .commandDir((0, upath2_1.join)(__dirname, 'cmds'))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand()
    .scriptName('yt');
cli.argv;
//# sourceMappingURL=yarn-tool.js.map