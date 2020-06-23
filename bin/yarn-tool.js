#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
//import updateNotifier = require('update-notifier');
//import pkg = require('../package.json');
const path = require("upath2");
const osLocale = require("os-locale");
const update_notifier_1 = require("@yarn-tool/update-notifier");
if (path.extname(__filename) === '.js' && !process.argv.filter(v => {
    if (typeof v === 'string') {
        return v.includes('ts-node') || v.includes('source-map-support');
    }
}).length) {
    require('source-map-support').install({
        hookRequire: true
    });
}
update_notifier_1.updateNotifier(path.join(__dirname, '..'));
let cli = yargs
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
    .locale(osLocale.sync())
    .commandDir(path.join(__dirname, 'cmds'))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand()
    .scriptName('yt');
cli.argv;
//# sourceMappingURL=yarn-tool.js.map