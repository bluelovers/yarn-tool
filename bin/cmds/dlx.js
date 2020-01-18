"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    //aliases: [],
    describe: `Run a package in a temporary environment. require yarn version >= 2`,
    builder(yargs) {
        return yargs
            .option('package', {
            alias: ['p'],
            string: true,
        })
            .option('quiet', {
            alias: ['q'],
            boolean: true,
        })
            .help(false)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        cmd_dir_1.lazySpawnArgvSlice({
            command,
            bin: 'yarn',
            cmd: command,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGx4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGx4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQU9sRyxNQUFNLE9BQU8sR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU87SUFDUCxjQUFjO0lBQ2QsUUFBUSxFQUFFLHFFQUFxRTtJQUUvRSxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDbEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQzthQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCw0QkFBa0IsQ0FBQztZQUNsQixPQUFPO1lBQ1AsR0FBRyxFQUFFLE1BQU07WUFDWCxHQUFHLEVBQUUsT0FBTztZQUNaLElBQUk7U0FDSixDQUFDLENBQUE7SUFDSCxDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNoYWxrQnlDb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY29tbWFuZCA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYFJ1biBhIHBhY2thZ2UgaW4gYSB0ZW1wb3JhcnkgZW52aXJvbm1lbnQuIHJlcXVpcmUgeWFybiB2ZXJzaW9uID49IDJgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ3BhY2thZ2UnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ3AnXSxcblx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ3F1aWV0Jywge1xuXHRcdFx0XHRhbGlhczogWydxJ10sXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LmhlbHAoZmFsc2UpXG5cdFx0XHQudmVyc2lvbihmYWxzZSlcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdGNtZDogY29tbWFuZCxcblx0XHRcdGFyZ3YsXG5cdFx0fSlcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19