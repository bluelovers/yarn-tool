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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBTzlFLDJDQUFvRTtBQUdwRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2pCLFFBQVEsRUFBRSx1QkFBdUI7SUFFakMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLGlNQUFpTTtZQUV2TSxNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksRUFBRSx3UEFBd1A7WUFDOVAsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx1TkFBdU47WUFDN04sTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLEVBQUUsa0pBQWtKO1lBQ3hKLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFMUQsdUJBQWUsQ0FBQyxLQUFLLEVBQUU7WUFFdEIsU0FBUztZQUVULEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBjcm9zc1NwYXduT3RoZXIsIHByb2Nlc3NBcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvc3Bhd24nO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGFsaWFzZXM6IFsncHVzaCddLFxuXHRkZXNjcmliZTogYHB1Ymxpc2ggYSBucG0gcGFja2FnZWAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbigndGFnJywge1xuXHRcdFx0XHRkZXNjOiBgUmVnaXN0ZXJzIHRoZSBwdWJsaXNoZWQgcGFja2FnZSB3aXRoIHRoZSBnaXZlbiB0YWcsIHN1Y2ggdGhhdCBcXGBucG0gaW5zdGFsbCBAXFxgIHdpbGwgaW5zdGFsbCB0aGlzIHZlcnNpb24uIEJ5IGRlZmF1bHQsIFxcYG5wbSBwdWJsaXNoXFxgIHVwZGF0ZXMgYW5kIFxcYG5wbSBpbnN0YWxsXFxgIGluc3RhbGxzIHRoZSBcXGBsYXRlc3RcXGAgdGFnLmAsXG5cblx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2FjY2VzcycsIHtcblx0XHRcdFx0ZGVzYzogYFRlbGxzIHRoZSByZWdpc3RyeSB3aGV0aGVyIHRoaXMgcGFja2FnZSBzaG91bGQgYmUgcHVibGlzaGVkIGFzIHB1YmxpYyBvciByZXN0cmljdGVkLiBPbmx5IGFwcGxpZXMgdG8gc2NvcGVkIHBhY2thZ2VzLCB3aGljaCBkZWZhdWx0IHRvIHJlc3RyaWN0ZWQuIElmIHlvdSBkb27igJl0IGhhdmUgYSBwYWlkIGFjY291bnQsIHlvdSBtdXN0IHB1Ymxpc2ggd2l0aCAtLWFjY2VzcyBwdWJsaWMgdG8gcHVibGlzaCBzY29wZWQgcGFja2FnZXMuYCxcblx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ290cCcsIHtcblx0XHRcdFx0ZGVzYzogYElmIHlvdSBoYXZlIHR3by1mYWN0b3IgYXV0aGVudGljYXRpb24gZW5hYmxlZCBpbiBhdXRoLWFuZC13cml0ZXMgbW9kZSB0aGVuIHlvdSBjYW4gcHJvdmlkZSBhIGNvZGUgZnJvbSB5b3VyIGF1dGhlbnRpY2F0b3Igd2l0aCB0aGlzLiBJZiB5b3UgZG9u4oCZdCBpbmNsdWRlIHRoaXMgYW5kIHlvdeKAmXJlIHJ1bm5pbmcgZnJvbSBhIFRUWSB0aGVuIHlvdeKAmWxsIGJlIHByb21wdGVkLmAsXG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdkcnktcnVuJywge1xuXHRcdFx0XHRkZXNjOiBgQXMgb2YgbnBtQDYsIGRvZXMgZXZlcnl0aGluZyBwdWJsaXNoIHdvdWxkIGRvIGV4Y2VwdCBhY3R1YWxseSBwdWJsaXNoaW5nIHRvIHRoZSByZWdpc3RyeS4gUmVwb3J0cyB0aGUgZGV0YWlscyBvZiB3aGF0IHdvdWxkIGhhdmUgYmVlbiBwdWJsaXNoZWQuYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZShbJ3B1Ymxpc2gnLCAncHVzaCddKS5hcmd2O1xuXG5cdFx0Y3Jvc3NTcGF3bk90aGVyKCducG0nLCBbXG5cblx0XHRcdCdwdWJsaXNoJyxcblxuXHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XSwgYXJndik7XG5cdH1cblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19