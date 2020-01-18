"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `To remove a symlinked package created with yarn link, yarn unlink can be used.`,
    builder(yargs) {
        return yargs
            .example(`$0 unlink [package]`, ``);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5saW5rLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidW5saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQVFsRyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxnRkFBZ0Y7SUFFMUYsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDckMsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0Qyw0QkFBa0IsQ0FBQztZQUNsQixPQUFPLEVBQUUsR0FBRztZQUNaLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFLEdBQUc7WUFDUixJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgVG8gcmVtb3ZlIGEgc3ltbGlua2VkIHBhY2thZ2UgY3JlYXRlZCB3aXRoIHlhcm4gbGluaywgeWFybiB1bmxpbmsgY2FuIGJlIHVzZWQuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuZXhhbXBsZShgJDAgdW5saW5rIFtwYWNrYWdlXWAsIGBgKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0Y29tbWFuZDoga2V5LFxuXHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRjbWQ6IGtleSxcblx0XHRcdGFyZ3YsXG5cdFx0fSlcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19