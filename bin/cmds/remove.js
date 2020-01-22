"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    aliases: ['rm'],
    describe: `Running yarn remove foo will remove the package named foo from your direct dependencies updating your package.json and yarn.lock files in the process.`,
    builder(yargs) {
        return yargs
            .strict(false);
    },
    handler(argv) {
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            main(yarg, argv, cache) {
                cmd_dir_1.lazySpawnArgvSlice({
                    command,
                    bin: 'yarn',
                    cmd: command,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQUVsRywyQ0FBa0Y7QUFLbEYsaURBQXVFO0FBRXZFLE1BQU0sT0FBTyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFMUMsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTztJQUNQLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztJQUNmLFFBQVEsRUFBRSx3SkFBd0o7SUFFbEssT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsS0FBSyxDQUFDLENBQ2Q7SUFDRixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFFbEMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFckIsNEJBQWtCLENBQUM7b0JBQ2xCLE9BQU87b0JBQ1AsR0FBRyxFQUFFLE1BQU07b0JBQ1gsR0FBRyxFQUFFLE9BQU87b0JBQ1osSUFBSTtpQkFDSixDQUFDLENBQUE7WUFDSCxDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsMENBQTBDO2dCQUUxQyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztpQkFDekM7WUFDRixDQUFDO1NBRUQsQ0FBQyxDQUFDO0lBRUosQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5cbmNvbnN0IGNvbW1hbmQgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZCxcblx0YWxpYXNlczogWydybSddLFxuXHRkZXNjcmliZTogYFJ1bm5pbmcgeWFybiByZW1vdmUgZm9vIHdpbGwgcmVtb3ZlIHRoZSBwYWNrYWdlIG5hbWVkIGZvbyBmcm9tIHlvdXIgZGlyZWN0IGRlcGVuZGVuY2llcyB1cGRhdGluZyB5b3VyIHBhY2thZ2UuanNvbiBhbmQgeWFybi5sb2NrIGZpbGVzIGluIHRoZSBwcm9jZXNzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0XHQ7XG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0d3JhcERlZHVwZShyZXF1aXJlKCd5YXJncycpLCBhcmd2LCB7XG5cblx0XHRcdG1haW4oeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdFx0XHRjbWQ6IGNvbW1hbmQsXG5cdFx0XHRcdFx0YXJndixcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2NhY2hlLnlhcm5sb2NrX21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdH0pO1xuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==