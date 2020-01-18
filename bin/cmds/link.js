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
            .example(`$0 link [package]`, `Use yarn link [package] to link another package that you’d like to test into your current project. To follow the above example, in the react-relay project, you’d run yarn link react to use your local version of react that you previously linked.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBUWxHLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLDhDQUE4QztJQUV4RCxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE9BQU8sQ0FBQyxTQUFTLEVBQUUsNkJBQTZCLENBQUM7YUFDakQsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHNQQUFzUCxDQUFDLENBQUE7SUFDdlIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0Qyw0QkFBa0IsQ0FBQztZQUNsQixPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFLEdBQUc7WUFDUixJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgU3ltbGluayBhIHBhY2thZ2UgZm9sZGVyIGR1cmluZyBkZXZlbG9wbWVudC5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5leGFtcGxlKGAkMCBsaW5rYCwgYGluIHBhY2thZ2UgeW91IHdhbnQgdG8gbGlua2ApXG5cdFx0XHQuZXhhbXBsZShgJDAgbGluayBbcGFja2FnZV1gLCBgVXNlIHlhcm4gbGluayBbcGFja2FnZV0gdG8gbGluayBhbm90aGVyIHBhY2thZ2UgdGhhdCB5b3XigJlkIGxpa2UgdG8gdGVzdCBpbnRvIHlvdXIgY3VycmVudCBwcm9qZWN0LiBUbyBmb2xsb3cgdGhlIGFib3ZlIGV4YW1wbGUsIGluIHRoZSByZWFjdC1yZWxheSBwcm9qZWN0LCB5b3XigJlkIHJ1biB5YXJuIGxpbmsgcmVhY3QgdG8gdXNlIHlvdXIgbG9jYWwgdmVyc2lvbiBvZiByZWFjdCB0aGF0IHlvdSBwcmV2aW91c2x5IGxpbmtlZC5gKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0Y29tbWFuZDoga2V5LFxuXHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRjbWQ6IGtleSxcblx0XHRcdGFyZ3YsXG5cdFx0fSlcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19