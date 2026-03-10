"use strict";
const tslib_1 = require("tslib");
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const upath2_1 = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const write_package_json_1 = require("@yarn-tool/write-package-json");
const sort_package_json3_1 = tslib_1.__importDefault(require("sort-package-json3"));
const find_root_1 = tslib_1.__importDefault(require("@yarn-tool/find-root"));
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `排序 package.json 文件 / sort package.json file`,
    builder(yargs) {
        return yargs
            .option('silent', {
            alias: ['S'],
            boolean: true,
        });
    },
    handler(argv) {
        let rootData = (0, find_root_1.default)({
            ...argv,
            cwd: argv.cwd,
        }, true);
        let json_file = (0, upath2_1.join)(rootData.pkg, 'package.json');
        let json = (0, package_dts_1.readPackageJson)(json_file);
        // @ts-ignore
        json = (0, sort_package_json3_1.default)(json);
        (0, write_package_json_1.writePackageJSONSync)(json_file, json);
        !argv.silent && (0, index_1.chalkByConsole)((chalk, console) => {
            let p = chalk.cyan((0, upath2_1.relative)(argv.cwd, json_file));
            console.log(`[${chalk.cyan(json.name)}]`, `${p} is sorted!`);
        }, index_1.consoleDebug);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=sort.js.map