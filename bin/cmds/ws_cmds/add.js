"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const add_1 = require("../../../lib/cli/add");
const index_1 = require("../../../index");
const index_2 = require("../../../lib/index");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Installs a package in workspaces.`,
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        })
            .strict(false);
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        let rootData = index_2.findRoot({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return index_2.yargsProcessExit(`workspace not exists`);
        }
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'node',
            cmd: [
                require.resolve(index_1.YT_BIN),
                'add',
                '-W',
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILGtEQUFxRztBQUNyRyw4Q0FBMkQ7QUFDM0QsMENBQXdDO0FBQ3hDLDhDQUFnRTtBQUVoRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxtQ0FBbUM7SUFFN0MsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLElBQUksRUFBRSwrQkFBK0I7WUFDckMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sR0FBRyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEMsSUFBSSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQztZQUN2QixHQUFHLElBQUk7U0FDUCxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQzFCO1lBQ0MsT0FBTyx3QkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1NBQy9DO1FBRUQsNEJBQWtCLENBQUM7WUFDbEIsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRTtnQkFDSixPQUFPLENBQUMsT0FBTyxDQUFDLGNBQU0sQ0FBQztnQkFDdkIsS0FBSztnQkFDTCxJQUFJO2FBQ0o7WUFDRCxhQUFhO1lBQ2IsSUFBSSxFQUFFO2dCQUNMLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBRTthQUNoQjtTQUNELENBQUMsQ0FBQTtJQUNILENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IHsgWVRfQklOIH0gZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgZmluZFJvb3QsIHlhcmdzUHJvY2Vzc0V4aXQgfSBmcm9tICcuLi8uLi8uLi9saWIvaW5kZXgnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBJbnN0YWxscyBhIHBhY2thZ2UgaW4gd29ya3NwYWNlcy5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuQWRkVG9ZYXJncyh5YXJncylcblx0XHRcdC5vcHRpb24oJ3R5cGVzJywge1xuXHRcdFx0XHRhbGlhczogWyd0eXBlJ10sXG5cdFx0XHRcdGRlc2M6IGB0cnkgYXV0byBpbnN0YWxsIEB0eXBlcy8qIHRvb2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHR9LCB0cnVlKTtcblxuXHRcdGlmICghcm9vdERhdGEuaGFzV29ya3NwYWNlKVxuXHRcdHtcblx0XHRcdHJldHVybiB5YXJnc1Byb2Nlc3NFeGl0KGB3b3Jrc3BhY2Ugbm90IGV4aXN0c2ApXG5cdFx0fVxuXG5cdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdGNvbW1hbmQ6IGtleSxcblx0XHRcdGJpbjogJ25vZGUnLFxuXHRcdFx0Y21kOiBbXG5cdFx0XHRcdHJlcXVpcmUucmVzb2x2ZShZVF9CSU4pLFxuXHRcdFx0XHQnYWRkJyxcblx0XHRcdFx0Jy1XJyxcblx0XHRcdF0sXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmd2OiB7XG5cdFx0XHRcdGN3ZDogcm9vdERhdGEud3MsXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==