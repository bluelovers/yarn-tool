"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Running yarn remove foo will remove the package named foo from your direct dependencies updating your package.json and yarn.lock files in the process.`,
    builder(yargs) {
        return yargs;
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            main(yarg, argv, cache) {
                cmd_dir_1.lazySpawnArgvSlice({
                    command: key,
                    bin: 'yarn',
                    cmd: key,
                    argv,
                });
            },
            end(yarg, argv, cache) {
                //console.dir(infoFromDedupeCache(cache));
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQUVsRywyQ0FBa0Y7QUFLbEYsaURBQXVFO0FBRXZFLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLHdKQUF3SjtJQUVsSyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSyxDQUFBO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0QyxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFFbEMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFckIsNEJBQWtCLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxHQUFHO29CQUNaLEdBQUcsRUFBRSxNQUFNO29CQUNYLEdBQUcsRUFBRSxHQUFHO29CQUNSLElBQUk7aUJBQ0osQ0FBQyxDQUFBO1lBQ0gsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXBCLDBDQUEwQztnQkFFMUMsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUN0QjtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7aUJBQ3pDO1lBQ0YsQ0FBQztTQUVELENBQUMsQ0FBQztJQUVKLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgUnVubmluZyB5YXJuIHJlbW92ZSBmb28gd2lsbCByZW1vdmUgdGhlIHBhY2thZ2UgbmFtZWQgZm9vIGZyb20geW91ciBkaXJlY3QgZGVwZW5kZW5jaWVzIHVwZGF0aW5nIHlvdXIgcGFja2FnZS5qc29uIGFuZCB5YXJuLmxvY2sgZmlsZXMgaW4gdGhlIHByb2Nlc3MuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdHdyYXBEZWR1cGUocmVxdWlyZSgneWFyZ3MnKSwgYXJndiwge1xuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKTogYm9vbGVhbiB8IHZvaWRcblx0XHRcdHtcblx0XHRcdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdFx0XHRjb21tYW5kOiBrZXksXG5cdFx0XHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRcdFx0Y21kOiBrZXksXG5cdFx0XHRcdFx0YXJndixcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2NhY2hlLnlhcm5sb2NrX21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdH0pO1xuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==