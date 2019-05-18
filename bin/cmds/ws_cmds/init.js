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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsa0RBQWlGO0FBT2pGLHdFQUFrRjtBQUNsRiw4Q0FBMEY7QUFFMUYsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsd0JBQXdCO0lBRWxDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTywwQ0FBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztZQUMzQixJQUFJLEVBQUUsd0JBQXdCO1lBQzlCLFdBQVcsRUFBRSx5Q0FBeUM7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsRUFDUjtZQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7UUFFRCxJQUFJLFFBQVEsR0FBRyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0MsdUJBQWUsQ0FBQyxNQUFNLEVBQUU7WUFFdkIsR0FBRztZQUVILE9BQU87WUFFUCxHQUFHLFFBQVE7U0FDWCxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCB7IGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MgfSBmcm9tICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgY2hlY2tNb2RpbGVFeGlzdHMsIGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9zcGF3bic7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYGNyZWF0ZSB5YXJuIHdvcmtzcGFjZXNgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MoeWFyZ3MpXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdG5hbWU6ICdjcmVhdGUteWFybi13b3Jrc3BhY2VzJyxcblx0XHRcdHJlcXVpcmVOYW1lOiAnY3JlYXRlLXlhcm4td29ya3NwYWNlcy9iaW4veWFybi13cy1pbml0Jyxcblx0XHR9KTtcblxuXHRcdGlmICghcmV0KVxuXHRcdHtcblx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHRsZXQgY21kX2xpc3QgPSBwcm9jZXNzQXJndlNsaWNlKCdpbml0JykuYXJndjtcblxuXHRcdGNyb3NzU3Bhd25PdGhlcignbm9kZScsIFtcblxuXHRcdFx0cmV0LFxuXG5cdFx0XHQvLyctLScsXG5cblx0XHRcdC4uLmNtZF9saXN0LFxuXHRcdF0sIGFyZ3YpO1xuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=