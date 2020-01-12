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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsa0RBQWlGO0FBT2pGLHdFQUFrRjtBQUNsRiw4Q0FBMEY7QUFFMUYsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsd0JBQXdCO0lBRWxDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTywwQ0FBMEIsQ0FBQyxLQUFLLENBQUM7YUFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLElBQUksR0FBRyxHQUFHLHlCQUFpQixDQUFDO1lBQzNCLElBQUksRUFBRSx3QkFBd0I7WUFDOUIsV0FBVyxFQUFFLHlDQUF5QztTQUN0RCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsR0FBRyxFQUNSO1lBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksUUFBUSxHQUFHLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3Qyx1QkFBZSxDQUFDLE1BQU0sRUFBRTtZQUV2QixHQUFHO1lBRUgsT0FBTztZQUVQLEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHNldHVwV29ya3NwYWNlc0luaXRUb1lhcmdzIH0gZnJvbSAnY3JlYXRlLXlhcm4td29ya3NwYWNlcy95YXJncy1zZXR0aW5nJztcbmltcG9ydCB7IGNoZWNrTW9kaWxlRXhpc3RzLCBjcm9zc1NwYXduT3RoZXIsIHByb2Nlc3NBcmd2U2xpY2UgfSBmcm9tICcuLi8uLi8uLi9saWIvc3Bhd24nO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBjcmVhdGUgeWFybiB3b3Jrc3BhY2VzYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwV29ya3NwYWNlc0luaXRUb1lhcmdzKHlhcmdzKVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgcmV0ID0gY2hlY2tNb2RpbGVFeGlzdHMoe1xuXHRcdFx0bmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMnLFxuXHRcdFx0cmVxdWlyZU5hbWU6ICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL2Jpbi95YXJuLXdzLWluaXQnLFxuXHRcdH0pO1xuXG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHRcdH1cblxuXHRcdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoJ2luaXQnKS5hcmd2O1xuXG5cdFx0Y3Jvc3NTcGF3bk90aGVyKCdub2RlJywgW1xuXG5cdFx0XHRyZXQsXG5cblx0XHRcdC8vJy0tJyxcblxuXHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XSwgYXJndik7XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==