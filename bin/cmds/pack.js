"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = (0, cmd_dir_1.createCommandModuleExports)({
    command: (0, cmd_dir_1.basenameStrip)(__filename),
    //aliases: [],
    describe: `創建套件依賴項的壓縮 gzip 歸檔 / Creates a compressed gzip archive of package dependencies.`,
    builder(yargs) {
        return yargs
            .option('dry-run', {
            boolean: true,
            desc: `模擬運行，不實際執行 / Simulate running without actually executing`,
        })
            .option('filename', {
            string: true,
            desc: `指定輸出文件名 / Specify output filename`,
        });
    },
    handler(argv) {
        const key = (0, cmd_dir_1.basenameStrip)(__filename);
        (0, cmd_dir_1.lazySpawnArgvSlice)({
            command: key,
            bin: 'npm',
            cmd: key,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=pack.js.map