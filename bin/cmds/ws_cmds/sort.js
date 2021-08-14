"use strict";
const tslib_1 = require("tslib");
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const listable_1 = require("ws-pkg-list/lib/listable");
const index_1 = require("../../../lib/index");
const sort_package_json3_1 = (0, tslib_1.__importDefault)(require("sort-package-json3"));
const fs_1 = require("fs");
const upath2_1 = require("upath2");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `sort each package.json file in workspaces`,
    builder(yargs) {
        return yargs
            .option('silent', {
            alias: ['S'],
            boolean: true,
        });
    },
    handler(argv) {
        let rootData = (0, index_1.findRoot)({
            ...argv,
            cwd: argv.cwd,
        }, true);
        const listable = (0, listable_1.wsPkgListable)(rootData.root);
        listable.forEach(entry => {
            let old = (0, fs_1.readFileSync)(entry.manifestLocation).toString();
            const json = (0, sort_package_json3_1.default)(JSON.parse(old));
            const json_new = JSON.stringify(json);
            let changed = old !== json_new;
            if (changed) {
                (0, fs_1.writeFileSync)(entry.manifestLocation, json_new);
            }
            !argv.silent && (0, index_1.chalkByConsole)((chalk, console) => {
                let p = chalk.cyan((0, upath2_1.relative)(rootData.root, entry.manifestLocation));
                console.log(`[${chalk.cyan(json.name)}]`, `${p} is sorted!`);
            }, index_1.consoleDebug);
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=sort.js.map