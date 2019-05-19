"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: ['upgrade', 'up'],
    describe: `Symlink a package folder during development.`,
    builder(yargs) {
        return yargs
            .option('latest', {
            desc: 'The upgrade --latest command upgrades packages the same as the upgrade command, but ignores the version range specified in package.json. Instead, the version specified by the latest tag will be used (potentially upgrading the packages across major versions).',
            boolean: true,
        })
            .option('caret', {
            boolean: true,
        })
            .option('tilde', {
            boolean: true,
        })
            .option('exact', {
            boolean: true,
        })
            .option('pattern', {
            string: true,
        });
    },
    handler(argv) {
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            before() {
                const key = cmd_dir_1.basenameStrip(__filename);
                spawn_1.crossSpawnOther('yarn', [], argv);
                cmd_dir_1.lazySpawnArgvSlice({
                    command: ['upgrade', 'up', key],
                    bin: 'yarn',
                    cmd: key,
                    argv,
                });
            },
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVwZ3JhZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBRWxHLDJDQUFrRjtBQUtsRixpREFBa0Q7QUFDbEQsMkNBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO0lBQzFCLFFBQVEsRUFBRSw4Q0FBOEM7SUFFeEQsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksRUFBRSxvUUFBb1E7WUFDMVEsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUMsQ0FDRjtJQUNGLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUdYLG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNO2dCQUVMLE1BQU0sR0FBRyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXRDLHVCQUFlLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFbEMsNEJBQWtCLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO29CQUMvQixHQUFHLEVBQUUsTUFBTTtvQkFDWCxHQUFHLEVBQUUsR0FBRztvQkFDUixJQUFJO2lCQUNKLENBQUMsQ0FBQTtZQUNILENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO1lBR3RCLENBQUM7WUFFRCxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVwQixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztpQkFDekM7WUFDRixDQUFDO1NBRUQsQ0FBQyxDQUFDO0lBRUosQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgY3Jvc3NTcGF3bk90aGVyIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGFsaWFzZXM6IFsndXBncmFkZScsICd1cCddLFxuXHRkZXNjcmliZTogYFN5bWxpbmsgYSBwYWNrYWdlIGZvbGRlciBkdXJpbmcgZGV2ZWxvcG1lbnQuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdsYXRlc3QnLCB7XG5cdFx0XHRcdGRlc2M6ICdUaGUgdXBncmFkZSAtLWxhdGVzdCBjb21tYW5kIHVwZ3JhZGVzIHBhY2thZ2VzIHRoZSBzYW1lIGFzIHRoZSB1cGdyYWRlIGNvbW1hbmQsIGJ1dCBpZ25vcmVzIHRoZSB2ZXJzaW9uIHJhbmdlIHNwZWNpZmllZCBpbiBwYWNrYWdlLmpzb24uIEluc3RlYWQsIHRoZSB2ZXJzaW9uIHNwZWNpZmllZCBieSB0aGUgbGF0ZXN0IHRhZyB3aWxsIGJlIHVzZWQgKHBvdGVudGlhbGx5IHVwZ3JhZGluZyB0aGUgcGFja2FnZXMgYWNyb3NzIG1ham9yIHZlcnNpb25zKS4nLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2NhcmV0Jywge1xuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ3RpbGRlJywge1xuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2V4YWN0Jywge1xuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ3BhdHRlcm4nLCB7XG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0O1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXG5cdFx0d3JhcERlZHVwZShyZXF1aXJlKCd5YXJncycpLCBhcmd2LCB7XG5cblx0XHRcdGJlZm9yZSgpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRcdFx0Y3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW10sIGFyZ3YpO1xuXG5cdFx0XHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRcdFx0Y29tbWFuZDogWyd1cGdyYWRlJywgJ3VwJywga2V5XSxcblx0XHRcdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdFx0XHRjbWQ6IGtleSxcblx0XHRcdFx0XHRhcmd2LFxuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7Y2FjaGUueWFybmxvY2tfbXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0fSk7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19