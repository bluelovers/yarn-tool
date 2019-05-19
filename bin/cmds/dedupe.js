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
    describe: `Data deduplication for yarn.lock`,
    aliases: ['d'],
    builder(yargs) {
        return yargs;
    },
    handler(argv, ...a) {
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUU5RSwyQ0FBa0U7QUFLbEUsaURBQXVFO0FBR3ZFLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFDN0MsY0FBYztJQUNkLFFBQVEsRUFBRSxrQ0FBa0M7SUFDNUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBRWQsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUssQ0FBQTtJQUNiLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztRQUVqQixtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFFbEMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztZQUd0QixDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUN0QjtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7aUJBQ3pDO2dCQUVELGVBQU8sQ0FBQyxHQUFHLENBQUMsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtjd2RdJyxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBEYXRhIGRlZHVwbGljYXRpb24gZm9yIHlhcm4ubG9ja2AsXG5cdGFsaWFzZXM6IFsnZCddLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YsIC4uLmEpXG5cdHtcblx0XHR3cmFwRGVkdXBlKHJlcXVpcmUoJ3lhcmdzJyksIGFyZ3YsIHtcblxuXHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblxuXHRcdFx0fSxcblx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2NhY2hlLnlhcm5sb2NrX21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==