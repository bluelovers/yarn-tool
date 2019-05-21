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
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILGtEQUFxRztBQUNyRyw4Q0FBMkQ7QUFDM0QsMENBQXdDO0FBQ3hDLDhDQUFnRTtBQUVoRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxtQ0FBbUM7SUFFN0MsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLElBQUksRUFBRSwrQkFBK0I7WUFDckMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1NBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUMxQjtZQUNDLE9BQU8sd0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtTQUMvQztRQUVELDRCQUFrQixDQUFDO1lBQ2xCLE9BQU8sRUFBRSxHQUFHO1lBQ1osR0FBRyxFQUFFLE1BQU07WUFDWCxHQUFHLEVBQUU7Z0JBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFNLENBQUM7Z0JBQ3ZCLEtBQUs7Z0JBQ0wsSUFBSTthQUNKO1lBQ0QsYUFBYTtZQUNiLElBQUksRUFBRTtnQkFDTCxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUU7YUFDaEI7U0FDRCxDQUFDLENBQUE7SUFDSCxDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgc2V0dXBZYXJuQWRkVG9ZYXJncyB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCB7IFlUX0JJTiB9IGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IGZpbmRSb290LCB5YXJnc1Byb2Nlc3NFeGl0IH0gZnJvbSAnLi4vLi4vLi4vbGliL2luZGV4JztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgSW5zdGFsbHMgYSBwYWNrYWdlIGluIHdvcmtzcGFjZXMuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwWWFybkFkZFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQub3B0aW9uKCd0eXBlcycsIHtcblx0XHRcdFx0YWxpYXM6IFsndHlwZSddLFxuXHRcdFx0XHRkZXNjOiBgdHJ5IGF1dG8gaW5zdGFsbCBAdHlwZXMvKiB0b29gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHR9LCB0cnVlKTtcblxuXHRcdGlmICghcm9vdERhdGEuaGFzV29ya3NwYWNlKVxuXHRcdHtcblx0XHRcdHJldHVybiB5YXJnc1Byb2Nlc3NFeGl0KGB3b3Jrc3BhY2Ugbm90IGV4aXN0c2ApXG5cdFx0fVxuXG5cdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdGNvbW1hbmQ6IGtleSxcblx0XHRcdGJpbjogJ25vZGUnLFxuXHRcdFx0Y21kOiBbXG5cdFx0XHRcdHJlcXVpcmUucmVzb2x2ZShZVF9CSU4pLFxuXHRcdFx0XHQnYWRkJyxcblx0XHRcdFx0Jy1XJyxcblx0XHRcdF0sXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmd2OiB7XG5cdFx0XHRcdGN3ZDogcm9vdERhdGEud3MsXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==