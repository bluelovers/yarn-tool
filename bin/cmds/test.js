"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Runs the test script defined by the package.`,
    builder(yargs) {
        return yargs;
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'yarn',
            cmd: key,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBUWxHLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLDhDQUE4QztJQUV4RCxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSyxDQUFBO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0Qyw0QkFBa0IsQ0FBQztZQUNsQixPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFLEdBQUc7WUFDUixJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgUnVucyB0aGUgdGVzdCBzY3JpcHQgZGVmaW5lZCBieSB0aGUgcGFja2FnZS5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5cdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdGNvbW1hbmQ6IGtleSxcblx0XHRcdGJpbjogJ3lhcm4nLFxuXHRcdFx0Y21kOiBrZXksXG5cdFx0XHRhcmd2LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==