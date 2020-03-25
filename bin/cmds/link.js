"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Symlink a package folder during development.`,
    builder(yargs) {
        return yargs
            .example(`$0 link`, `in package you want to link`)
            .example(`$0 link [package]`, `Use yarn link [package] to link another package that you’d like to test into your current project. To follow the above example, in the react-relay project, you’d run yarn link react to use your local version of react that you previously linked.`)
            .strict(false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBUWxHLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLDhDQUE4QztJQUV4RCxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE9BQU8sQ0FBQyxTQUFTLEVBQUUsNkJBQTZCLENBQUM7YUFDakQsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHNQQUFzUCxDQUFDO2FBQ3BSLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLDRCQUFrQixDQUFDO1lBQ2xCLE9BQU8sRUFBRSxHQUFHO1lBQ1osR0FBRyxFQUFFLE1BQU07WUFDWCxHQUFHLEVBQUUsR0FBRztZQUNSLElBQUk7U0FDSixDQUFDLENBQUE7SUFDSCxDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNoYWxrQnlDb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBTeW1saW5rIGEgcGFja2FnZSBmb2xkZXIgZHVyaW5nIGRldmVsb3BtZW50LmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0LmV4YW1wbGUoYCQwIGxpbmtgLCBgaW4gcGFja2FnZSB5b3Ugd2FudCB0byBsaW5rYClcblx0XHRcdC5leGFtcGxlKGAkMCBsaW5rIFtwYWNrYWdlXWAsIGBVc2UgeWFybiBsaW5rIFtwYWNrYWdlXSB0byBsaW5rIGFub3RoZXIgcGFja2FnZSB0aGF0IHlvdeKAmWQgbGlrZSB0byB0ZXN0IGludG8geW91ciBjdXJyZW50IHByb2plY3QuIFRvIGZvbGxvdyB0aGUgYWJvdmUgZXhhbXBsZSwgaW4gdGhlIHJlYWN0LXJlbGF5IHByb2plY3QsIHlvdeKAmWQgcnVuIHlhcm4gbGluayByZWFjdCB0byB1c2UgeW91ciBsb2NhbCB2ZXJzaW9uIG9mIHJlYWN0IHRoYXQgeW91IHByZXZpb3VzbHkgbGlua2VkLmApXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0Y29tbWFuZDoga2V5LFxuXHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRjbWQ6IGtleSxcblx0XHRcdGFyZ3YsXG5cdFx0fSlcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19