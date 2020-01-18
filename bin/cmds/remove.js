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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQUVsRywyQ0FBa0Y7QUFLbEYsaURBQXVFO0FBRXZFLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLHdKQUF3SjtJQUVsSyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSyxDQUFBO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0QyxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFFbEMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFckIsNEJBQWtCLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxHQUFHO29CQUNaLEdBQUcsRUFBRSxNQUFNO29CQUNYLEdBQUcsRUFBRSxHQUFHO29CQUNSLElBQUk7aUJBQ0osQ0FBQyxDQUFBO1lBQ0gsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXBCLDBDQUEwQztnQkFFMUMsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUN0QjtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7aUJBQ3pDO1lBQ0YsQ0FBQztTQUVELENBQUMsQ0FBQztJQUVKLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBSdW5uaW5nIHlhcm4gcmVtb3ZlIGZvbyB3aWxsIHJlbW92ZSB0aGUgcGFja2FnZSBuYW1lZCBmb28gZnJvbSB5b3VyIGRpcmVjdCBkZXBlbmRlbmNpZXMgdXBkYXRpbmcgeW91ciBwYWNrYWdlLmpzb24gYW5kIHlhcm4ubG9jayBmaWxlcyBpbiB0aGUgcHJvY2Vzcy5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5cdFx0d3JhcERlZHVwZShyZXF1aXJlKCd5YXJncycpLCBhcmd2LCB7XG5cblx0XHRcdG1haW4oeWFyZywgYXJndiwgY2FjaGUpOiBib29sZWFuIHwgdm9pZFxuXHRcdFx0e1xuXHRcdFx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0XHRcdGNvbW1hbmQ6IGtleSxcblx0XHRcdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdFx0XHRjbWQ6IGtleSxcblx0XHRcdFx0XHRhcmd2LFxuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblxuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7Y2FjaGUueWFybmxvY2tfbXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0fSk7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19