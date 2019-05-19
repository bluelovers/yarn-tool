"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: ['push'],
    describe: `publish a npm package`,
    builder(yargs) {
        return yargs
            .option('tag', {
            desc: `Registers the published package with the given tag, such that \`npm install @\` will install this version. By default, \`npm publish\` updates and \`npm install\` installs the \`latest\` tag.`,
            string: true,
        })
            .option('access', {
            desc: `Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.`,
            string: true,
        })
            .option('otp', {
            desc: `If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.`,
            string: true,
        })
            .option('dry-run', {
            desc: `As of npm@6, does everything publish would do except actually publishing to the registry. Reports the details of what would have been published.`,
            boolean: true,
        });
    },
    handler(argv) {
        let cmd_list = spawn_1.processArgvSlice(['publish', 'push']).argv;
        spawn_1.crossSpawnOther('npm', [
            'publish',
            ...cmd_list,
        ], argv);
    }
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBTzlFLDJDQUFvRTtBQUdwRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2pCLFFBQVEsRUFBRSx1QkFBdUI7SUFFakMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLGlNQUFpTTtZQUV2TSxNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksRUFBRSx3UEFBd1A7WUFDOVAsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx1TkFBdU47WUFDN04sTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLEVBQUUsa0pBQWtKO1lBQ3hKLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFMUQsdUJBQWUsQ0FBQyxLQUFLLEVBQUU7WUFFdEIsU0FBUztZQUVULEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9zcGF3bic7XG5pbXBvcnQgeyBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0YWxpYXNlczogWydwdXNoJ10sXG5cdGRlc2NyaWJlOiBgcHVibGlzaCBhIG5wbSBwYWNrYWdlYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCd0YWcnLCB7XG5cdFx0XHRcdGRlc2M6IGBSZWdpc3RlcnMgdGhlIHB1Ymxpc2hlZCBwYWNrYWdlIHdpdGggdGhlIGdpdmVuIHRhZywgc3VjaCB0aGF0IFxcYG5wbSBpbnN0YWxsIEBcXGAgd2lsbCBpbnN0YWxsIHRoaXMgdmVyc2lvbi4gQnkgZGVmYXVsdCwgXFxgbnBtIHB1Ymxpc2hcXGAgdXBkYXRlcyBhbmQgXFxgbnBtIGluc3RhbGxcXGAgaW5zdGFsbHMgdGhlIFxcYGxhdGVzdFxcYCB0YWcuYCxcblxuXHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignYWNjZXNzJywge1xuXHRcdFx0XHRkZXNjOiBgVGVsbHMgdGhlIHJlZ2lzdHJ5IHdoZXRoZXIgdGhpcyBwYWNrYWdlIHNob3VsZCBiZSBwdWJsaXNoZWQgYXMgcHVibGljIG9yIHJlc3RyaWN0ZWQuIE9ubHkgYXBwbGllcyB0byBzY29wZWQgcGFja2FnZXMsIHdoaWNoIGRlZmF1bHQgdG8gcmVzdHJpY3RlZC4gSWYgeW91IGRvbuKAmXQgaGF2ZSBhIHBhaWQgYWNjb3VudCwgeW91IG11c3QgcHVibGlzaCB3aXRoIC0tYWNjZXNzIHB1YmxpYyB0byBwdWJsaXNoIHNjb3BlZCBwYWNrYWdlcy5gLFxuXHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignb3RwJywge1xuXHRcdFx0XHRkZXNjOiBgSWYgeW91IGhhdmUgdHdvLWZhY3RvciBhdXRoZW50aWNhdGlvbiBlbmFibGVkIGluIGF1dGgtYW5kLXdyaXRlcyBtb2RlIHRoZW4geW91IGNhbiBwcm92aWRlIGEgY29kZSBmcm9tIHlvdXIgYXV0aGVudGljYXRvciB3aXRoIHRoaXMuIElmIHlvdSBkb27igJl0IGluY2x1ZGUgdGhpcyBhbmQgeW914oCZcmUgcnVubmluZyBmcm9tIGEgVFRZIHRoZW4geW914oCZbGwgYmUgcHJvbXB0ZWQuYCxcblx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2RyeS1ydW4nLCB7XG5cdFx0XHRcdGRlc2M6IGBBcyBvZiBucG1ANiwgZG9lcyBldmVyeXRoaW5nIHB1Ymxpc2ggd291bGQgZG8gZXhjZXB0IGFjdHVhbGx5IHB1Ymxpc2hpbmcgdG8gdGhlIHJlZ2lzdHJ5LiBSZXBvcnRzIHRoZSBkZXRhaWxzIG9mIHdoYXQgd291bGQgaGF2ZSBiZWVuIHB1Ymxpc2hlZC5gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdDtcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgY21kX2xpc3QgPSBwcm9jZXNzQXJndlNsaWNlKFsncHVibGlzaCcsICdwdXNoJ10pLmFyZ3Y7XG5cblx0XHRjcm9zc1NwYXduT3RoZXIoJ25wbScsIFtcblxuXHRcdFx0J3B1Ymxpc2gnLFxuXG5cdFx0XHQuLi5jbWRfbGlzdCxcblx0XHRdLCBhcmd2KTtcblx0fVxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=