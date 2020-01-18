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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGx4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGx4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQU9sRyxNQUFNLE9BQU8sR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU87SUFDUCxjQUFjO0lBQ2QsUUFBUSxFQUFFLHFFQUFxRTtJQUUvRSxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDbEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsNEJBQWtCLENBQUM7WUFDbEIsT0FBTztZQUNQLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFLE9BQU87WUFDWixJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNvbW1hbmQgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZCxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBSdW4gYSBwYWNrYWdlIGluIGEgdGVtcG9yYXJ5IGVudmlyb25tZW50LiByZXF1aXJlIHlhcm4gdmVyc2lvbiA+PSAyYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdwYWNrYWdlJywge1xuXHRcdFx0XHRhbGlhczogWydwJ10sXG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdxdWlldCcsIHtcblx0XHRcdFx0YWxpYXM6IFsncSddLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdGNtZDogY29tbWFuZCxcblx0XHRcdGFyZ3YsXG5cdFx0fSlcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19