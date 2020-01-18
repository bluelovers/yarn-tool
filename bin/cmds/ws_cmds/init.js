"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const yargs_setting_1 = require("create-yarn-workspaces/yargs-setting");
const spawn_1 = require("../../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `create yarn workspaces`,
    builder(yargs) {
        return yargs_setting_1.setupWorkspacesInitToYargs(yargs)
            .strict(false);
    },
    handler(argv) {
        let ret = spawn_1.checkModileExists({
            name: 'create-yarn-workspaces',
            requireName: 'create-yarn-workspaces/bin/yarn-ws-init',
        });
        if (!ret) {
            process.exit(1);
        }
        let cmd_list = spawn_1.processArgvSlice('init').argv;
        spawn_1.crossSpawnOther('node', [
            ret,
            //'--',
            ...cmd_list,
        ], argv);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsa0RBQWlGO0FBT2pGLHdFQUFrRjtBQUNsRiw4Q0FBMEY7QUFFMUYsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsd0JBQXdCO0lBRWxDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTywwQ0FBMEIsQ0FBQyxLQUFLLENBQUM7YUFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLElBQUksR0FBRyxHQUFHLHlCQUFpQixDQUFDO1lBQzNCLElBQUksRUFBRSx3QkFBd0I7WUFDOUIsV0FBVyxFQUFFLHlDQUF5QztTQUN0RCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsR0FBRyxFQUNSO1lBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksUUFBUSxHQUFHLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3Qyx1QkFBZSxDQUFDLE1BQU0sRUFBRTtZQUV2QixHQUFHO1lBRUgsT0FBTztZQUVQLEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MgfSBmcm9tICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgY2hlY2tNb2RpbGVFeGlzdHMsIGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9zcGF3bic7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYGNyZWF0ZSB5YXJuIHdvcmtzcGFjZXNgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCByZXQgPSBjaGVja01vZGlsZUV4aXN0cyh7XG5cdFx0XHRuYW1lOiAnY3JlYXRlLXlhcm4td29ya3NwYWNlcycsXG5cdFx0XHRyZXF1aXJlTmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMvYmluL3lhcm4td3MtaW5pdCcsXG5cdFx0fSk7XG5cblx0XHRpZiAoIXJldClcblx0XHR7XG5cdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXG5cdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZSgnaW5pdCcpLmFyZ3Y7XG5cblx0XHRjcm9zc1NwYXduT3RoZXIoJ25vZGUnLCBbXG5cblx0XHRcdHJldCxcblxuXHRcdFx0Ly8nLS0nLFxuXG5cdFx0XHQuLi5jbWRfbGlzdCxcblx0XHRdLCBhcmd2KTtcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19