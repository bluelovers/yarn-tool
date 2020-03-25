"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../lib/index");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: [
        'push',
    ],
    describe: `publish packages in workspaces.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        let rootData = index_1.findRoot({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return index_1.yargsProcessExit(`workspace not exists`);
        }
        cmd_dir_1.lazySpawnArgvSlice({
            command: [key, ...cmdModule.aliases],
            bin: 'lerna',
            cmd: [
                key,
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsa0RBQXFHO0FBR3JHLDhDQUFnRTtBQUdoRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsT0FBTyxFQUFFO1FBQ1IsTUFBTTtLQUNOO0lBQ0QsUUFBUSxFQUFFLGlDQUFpQztJQUUzQyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1NBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUMxQjtZQUNDLE9BQU8sd0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtTQUMvQztRQUVELDRCQUFrQixDQUFDO1lBQ2xCLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFDcEMsR0FBRyxFQUFFLE9BQU87WUFDWixHQUFHLEVBQUU7Z0JBQ0osR0FBRzthQUNIO1lBQ0QsYUFBYTtZQUNiLElBQUksRUFBRTtnQkFDTCxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUU7YUFDaEI7U0FDRCxDQUFDLENBQUE7SUFDSCxDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgc2V0dXBZYXJuQWRkVG9ZYXJncyB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCB7IFlUX0JJTiB9IGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IGZpbmRSb290LCB5YXJnc1Byb2Nlc3NFeGl0IH0gZnJvbSAnLi4vLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHByb2Nlc3NBcmd2U2xpY2UgfSBmcm9tICcuLi8uLi8uLi9saWIvc3Bhd24nO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0YWxpYXNlczogW1xuXHRcdCdwdXNoJyxcblx0XSxcblx0ZGVzY3JpYmU6IGBwdWJsaXNoIHBhY2thZ2VzIGluIHdvcmtzcGFjZXMuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdH0sIHRydWUpO1xuXG5cdFx0aWYgKCFyb290RGF0YS5oYXNXb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHlhcmdzUHJvY2Vzc0V4aXQoYHdvcmtzcGFjZSBub3QgZXhpc3RzYClcblx0XHR9XG5cblx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0Y29tbWFuZDogW2tleSwgLi4uY21kTW9kdWxlLmFsaWFzZXNdLFxuXHRcdFx0YmluOiAnbGVybmEnLFxuXHRcdFx0Y21kOiBbXG5cdFx0XHRcdGtleSxcblx0XHRcdF0sXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmd2OiB7XG5cdFx0XHRcdGN3ZDogcm9vdERhdGEud3MsXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==