"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [cwd]',
    //aliases: [],
    describe: `package deduplication for yarn.lock`,
    aliases: ['d'],
    builder(yargs) {
        return yargs;
    },
    handler(argv, ...a) {
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUU5RSwyQ0FBa0U7QUFLbEUsaURBQXVFO0FBR3ZFLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFDN0MsY0FBYztJQUNkLFFBQVEsRUFBRSxxQ0FBcUM7SUFDL0MsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBRWQsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUssQ0FBQTtJQUNiLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztRQUVqQixtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFFbEMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztZQUd0QixDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsZUFBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUV4QyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztpQkFDekM7WUFDRixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgW2N3ZF0nLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYHBhY2thZ2UgZGVkdXBsaWNhdGlvbiBmb3IgeWFybi5sb2NrYCxcblx0YWxpYXNlczogWydkJ10sXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndiwgLi4uYSlcblx0e1xuXHRcdHdyYXBEZWR1cGUocmVxdWlyZSgneWFyZ3MnKSwgYXJndiwge1xuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXG5cdFx0XHR9LFxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2NhY2hlLnlhcm5sb2NrX21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KTtcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19