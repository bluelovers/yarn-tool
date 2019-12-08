"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    describe: `create a npm package or update package.json file`,
    builder(yargs) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2/lib/yargs-setting',
            processExit: true,
        });
        return require(ret)
            .setupToYargs(yargs)
            .strict(false);
    },
    handler(argv) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2',
            processExit: true,
        });
        let cmd_list = spawn_1.processArgvSlice('init').argv;
        spawn_1.crossSpawnOther('node', [
            ret,
            //'--',
            ...cmd_list,
        ], argv);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBQzlFLDJDQUF1RjtBQUl2RixNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsUUFBUSxFQUFFLGtEQUFrRDtJQUU1RCxPQUFPLENBQUMsS0FBSztRQUVaLElBQUksR0FBRyxHQUFHLHlCQUFpQixDQUFDO1lBQzNCLElBQUksRUFBRSxXQUFXO1lBQ2pCLFdBQVcsRUFBRSw2QkFBNkI7WUFDMUMsV0FBVyxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBRUgsT0FBUSxPQUFPLENBQUMsR0FBRyxDQUFrRDthQUNuRSxZQUFZLENBQUMsS0FBSyxDQUFDO2FBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztZQUMzQixJQUFJLEVBQUUsV0FBVztZQUNqQixXQUFXLEVBQUUsV0FBVztZQUN4QixXQUFXLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsR0FBRyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0MsdUJBQWUsQ0FBQyxNQUFNLEVBQUU7WUFFdkIsR0FBRztZQUVILE9BQU87WUFFUCxHQUFHLFFBQVE7U0FDWCxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRVYsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcbmltcG9ydCB7IHNldHVwVG9ZYXJncyBhcyBzZXR1cEluaXRUb1lhcmdzIH0gZnJvbSAnbnBtLWluaXQyL2xpYi95YXJncy1zZXR0aW5nJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGRlc2NyaWJlOiBgY3JlYXRlIGEgbnBtIHBhY2thZ2Ugb3IgdXBkYXRlIHBhY2thZ2UuanNvbiBmaWxlYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdG5hbWU6ICducG0taW5pdDInLFxuXHRcdFx0cmVxdWlyZU5hbWU6ICducG0taW5pdDIvbGliL3lhcmdzLXNldHRpbmcnLFxuXHRcdFx0cHJvY2Vzc0V4aXQ6IHRydWUsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gKHJlcXVpcmUocmV0KSBhcyB0eXBlb2YgaW1wb3J0KCducG0taW5pdDIvbGliL3lhcmdzLXNldHRpbmcnKSlcblx0XHRcdC5zZXR1cFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCByZXQgPSBjaGVja01vZGlsZUV4aXN0cyh7XG5cdFx0XHRuYW1lOiAnbnBtLWluaXQyJyxcblx0XHRcdHJlcXVpcmVOYW1lOiAnbnBtLWluaXQyJyxcblx0XHRcdHByb2Nlc3NFeGl0OiB0cnVlLFxuXHRcdH0pO1xuXG5cdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZSgnaW5pdCcpLmFyZ3Y7XG5cblx0XHRjcm9zc1NwYXduT3RoZXIoJ25vZGUnLCBbXG5cblx0XHRcdHJldCxcblxuXHRcdFx0Ly8nLS0nLFxuXG5cdFx0XHQuLi5jbWRfbGlzdCxcblx0XHRdLCBhcmd2KTtcblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=