"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    //aliases: [],
    describe: `Creates new projects from any create-* starter kits.`,
    builder(yargs) {
        return yargs
            .example(`$0 create <starter-kit-package> [<args>]`, ``)
            .strict(false);
    },
    handler(argv) {
        cmd_dir_1.lazySpawnArgvSlice({
            command,
            bin: 'yarn',
            cmd: [
                command,
            ],
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQUVsRyxNQUFNLE9BQU8sR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU87SUFDUCxjQUFjO0lBQ2QsUUFBUSxFQUFFLHNEQUFzRDtJQUVoRSxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE9BQU8sQ0FBQywwQ0FBMEMsRUFBRSxFQUFFLENBQUM7YUFDdkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNkO0lBQ0YsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsNEJBQWtCLENBQUM7WUFDbEIsT0FBTztZQUNQLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFO2dCQUNKLE9BQU87YUFDUDtZQUNELElBQUk7U0FDSixDQUFDLENBQUE7SUFDSCxDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuXG5jb25zdCBjb21tYW5kID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgQ3JlYXRlcyBuZXcgcHJvamVjdHMgZnJvbSBhbnkgY3JlYXRlLSogc3RhcnRlciBraXRzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0LmV4YW1wbGUoYCQwIGNyZWF0ZSA8c3RhcnRlci1raXQtcGFja2FnZT4gWzxhcmdzPl1gLCBgYClcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdFx0O1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRjbWQ6IFtcblx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdF0sXG5cdFx0XHRhcmd2LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==