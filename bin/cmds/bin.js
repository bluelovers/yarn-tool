"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    //aliases: [],
    describe: `Get the path to a binary script.`,
    builder(yargs) {
        return yargs
            .option('verbose', {
            alias: ['v'],
        })
            .example(`yt bin`, `List all the available binaries`)
            .example(`yt bin eslint`, `Print the path to a specific binary`)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYmluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQU9sRyxNQUFNLE9BQU8sR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU87SUFDUCxjQUFjO0lBQ2QsUUFBUSxFQUFFLGtDQUFrQztJQUU1QyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDbEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ1osQ0FBQzthQUNELE9BQU8sQ0FBQyxRQUFRLEVBQUUsaUNBQWlDLENBQUM7YUFDcEQsT0FBTyxDQUFDLGVBQWUsRUFBRSxxQ0FBcUMsQ0FBQzthQUMvRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsNEJBQWtCLENBQUM7WUFDbEIsT0FBTztZQUNQLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFLE9BQU87WUFDWixJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNvbW1hbmQgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZCxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBHZXQgdGhlIHBhdGggdG8gYSBiaW5hcnkgc2NyaXB0LmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbigndmVyYm9zZScsIHtcblx0XHRcdFx0YWxpYXM6IFsndiddLFxuXHRcdFx0fSlcblx0XHRcdC5leGFtcGxlKGB5dCBiaW5gLCBgTGlzdCBhbGwgdGhlIGF2YWlsYWJsZSBiaW5hcmllc2ApXG5cdFx0XHQuZXhhbXBsZShgeXQgYmluIGVzbGludGAsIGBQcmludCB0aGUgcGF0aCB0byBhIHNwZWNpZmljIGJpbmFyeWApXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRjbWQ6IGNvbW1hbmQsXG5cdFx0XHRhcmd2LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==