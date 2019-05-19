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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVkdXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVkdXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUU5RSwyQ0FBa0U7QUFLbEUsaURBQXVFO0FBR3ZFLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFDN0MsY0FBYztJQUNkLFFBQVEsRUFBRSxrQ0FBa0M7SUFDNUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0lBRWQsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUssQ0FBQTtJQUNiLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztRQUVqQixtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFDbEMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztZQUd0QixDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUN0QjtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7aUJBQ3pDO2dCQUVELGVBQU8sQ0FBQyxHQUFHLENBQUMsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoJ3lhcmdzJyk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbY3dkXScsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgRGF0YSBkZWR1cGxpY2F0aW9uIGZvciB5YXJuLmxvY2tgLFxuXHRhbGlhc2VzOiBbJ2QnXSxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2LCAuLi5hKVxuXHR7XG5cdFx0d3JhcERlZHVwZShyZXF1aXJlKCd5YXJncycpLCBhcmd2LCB7XG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXG5cdFx0XHR9LFxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7Y2FjaGUueWFybmxvY2tfbXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0fSxcblx0XHR9KTtcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19