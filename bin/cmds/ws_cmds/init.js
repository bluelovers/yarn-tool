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
        return yargs_setting_1.setupWorkspacesInitToYargs(yargs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsa0RBQWlGO0FBT2pGLHdFQUFrRjtBQUNsRiw4Q0FBMEY7QUFFMUYsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsd0JBQXdCO0lBRWxDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTywwQ0FBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztZQUMzQixJQUFJLEVBQUUsd0JBQXdCO1lBQzlCLFdBQVcsRUFBRSx5Q0FBeUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsRUFDUjtZQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7UUFFRCxJQUFJLFFBQVEsR0FBRyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0MsdUJBQWUsQ0FBQyxNQUFNLEVBQUU7WUFFdkIsR0FBRztZQUVILE9BQU87WUFFUCxHQUFHLFFBQVE7U0FDWCxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyB9IGZyb20gJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vLi4vbGliL3NwYXduJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgY3JlYXRlIHlhcm4gd29ya3NwYWNlc2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyh5YXJncylcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgcmV0ID0gY2hlY2tNb2RpbGVFeGlzdHMoe1xuXHRcdFx0bmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMnLFxuXHRcdFx0cmVxdWlyZU5hbWU6ICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL2Jpbi95YXJuLXdzLWluaXQnLFxuXHRcdH0pO1xuXG5cdFx0aWYgKCFyZXQpXG5cdFx0e1xuXHRcdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHRcdH1cblxuXHRcdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoJ2luaXQnKS5hcmd2O1xuXG5cdFx0Y3Jvc3NTcGF3bk90aGVyKCdub2RlJywgW1xuXG5cdFx0XHRyZXQsXG5cblx0XHRcdC8vJy0tJyxcblxuXHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XSwgYXJndik7XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==