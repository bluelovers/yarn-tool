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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBTzlFLDJDQUFvRTtBQUdwRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2pCLFFBQVEsRUFBRSx1QkFBdUI7SUFFakMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLGlNQUFpTTtZQUV2TSxNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksRUFBRSx3UEFBd1A7WUFDOVAsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx1TkFBdU47WUFDN04sTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLEVBQUUsa0pBQWtKO1lBQ3hKLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFMUQsdUJBQWUsQ0FBQyxLQUFLLEVBQUU7WUFFdEIsU0FBUztZQUVULEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcbmltcG9ydCB7IEFyZ3YgfSBmcm9tICd5YXJncyc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHRhbGlhc2VzOiBbJ3B1c2gnXSxcblx0ZGVzY3JpYmU6IGBwdWJsaXNoIGEgbnBtIHBhY2thZ2VgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ3RhZycsIHtcblx0XHRcdFx0ZGVzYzogYFJlZ2lzdGVycyB0aGUgcHVibGlzaGVkIHBhY2thZ2Ugd2l0aCB0aGUgZ2l2ZW4gdGFnLCBzdWNoIHRoYXQgXFxgbnBtIGluc3RhbGwgQFxcYCB3aWxsIGluc3RhbGwgdGhpcyB2ZXJzaW9uLiBCeSBkZWZhdWx0LCBcXGBucG0gcHVibGlzaFxcYCB1cGRhdGVzIGFuZCBcXGBucG0gaW5zdGFsbFxcYCBpbnN0YWxscyB0aGUgXFxgbGF0ZXN0XFxgIHRhZy5gLFxuXG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdhY2Nlc3MnLCB7XG5cdFx0XHRcdGRlc2M6IGBUZWxscyB0aGUgcmVnaXN0cnkgd2hldGhlciB0aGlzIHBhY2thZ2Ugc2hvdWxkIGJlIHB1Ymxpc2hlZCBhcyBwdWJsaWMgb3IgcmVzdHJpY3RlZC4gT25seSBhcHBsaWVzIHRvIHNjb3BlZCBwYWNrYWdlcywgd2hpY2ggZGVmYXVsdCB0byByZXN0cmljdGVkLiBJZiB5b3UgZG9u4oCZdCBoYXZlIGEgcGFpZCBhY2NvdW50LCB5b3UgbXVzdCBwdWJsaXNoIHdpdGggLS1hY2Nlc3MgcHVibGljIHRvIHB1Ymxpc2ggc2NvcGVkIHBhY2thZ2VzLmAsXG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdvdHAnLCB7XG5cdFx0XHRcdGRlc2M6IGBJZiB5b3UgaGF2ZSB0d28tZmFjdG9yIGF1dGhlbnRpY2F0aW9uIGVuYWJsZWQgaW4gYXV0aC1hbmQtd3JpdGVzIG1vZGUgdGhlbiB5b3UgY2FuIHByb3ZpZGUgYSBjb2RlIGZyb20geW91ciBhdXRoZW50aWNhdG9yIHdpdGggdGhpcy4gSWYgeW91IGRvbuKAmXQgaW5jbHVkZSB0aGlzIGFuZCB5b3XigJlyZSBydW5uaW5nIGZyb20gYSBUVFkgdGhlbiB5b3XigJlsbCBiZSBwcm9tcHRlZC5gLFxuXHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignZHJ5LXJ1bicsIHtcblx0XHRcdFx0ZGVzYzogYEFzIG9mIG5wbUA2LCBkb2VzIGV2ZXJ5dGhpbmcgcHVibGlzaCB3b3VsZCBkbyBleGNlcHQgYWN0dWFsbHkgcHVibGlzaGluZyB0byB0aGUgcmVnaXN0cnkuIFJlcG9ydHMgdGhlIGRldGFpbHMgb2Ygd2hhdCB3b3VsZCBoYXZlIGJlZW4gcHVibGlzaGVkLmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoWydwdWJsaXNoJywgJ3B1c2gnXSkuYXJndjtcblxuXHRcdGNyb3NzU3Bhd25PdGhlcignbnBtJywgW1xuXG5cdFx0XHQncHVibGlzaCcsXG5cblx0XHRcdC4uLmNtZF9saXN0LFxuXHRcdF0sIGFyZ3YpO1xuXHR9XG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==