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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVwZ3JhZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBRWxHLDJDQUFrRjtBQUtsRixpREFBa0Q7QUFDbEQsMkNBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO0lBQzFCLFFBQVEsRUFBRSw4Q0FBOEM7SUFFeEQsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksRUFBRSxvUUFBb1E7WUFDMVEsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQzthQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUMsQ0FDRjtJQUNGLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUdYLG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNO2dCQUVMLE1BQU0sR0FBRyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXRDLHVCQUFlLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFbEMsNEJBQWtCLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO29CQUMvQixHQUFHLEVBQUUsTUFBTTtvQkFDWCxHQUFHLEVBQUUsR0FBRztvQkFDUixJQUFJO2lCQUNKLENBQUMsQ0FBQTtZQUNILENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO1lBR3RCLENBQUM7WUFFRCxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVwQixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztpQkFDekM7WUFDRixDQUFDO1NBRUQsQ0FBQyxDQUFDO0lBRUosQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeyBjcm9zc1NwYXduT3RoZXIgfSBmcm9tICcuLi8uLi9saWIvc3Bhd24nO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0YWxpYXNlczogWyd1cGdyYWRlJywgJ3VwJ10sXG5cdGRlc2NyaWJlOiBgU3ltbGluayBhIHBhY2thZ2UgZm9sZGVyIGR1cmluZyBkZXZlbG9wbWVudC5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ2xhdGVzdCcsIHtcblx0XHRcdFx0ZGVzYzogJ1RoZSB1cGdyYWRlIC0tbGF0ZXN0IGNvbW1hbmQgdXBncmFkZXMgcGFja2FnZXMgdGhlIHNhbWUgYXMgdGhlIHVwZ3JhZGUgY29tbWFuZCwgYnV0IGlnbm9yZXMgdGhlIHZlcnNpb24gcmFuZ2Ugc3BlY2lmaWVkIGluIHBhY2thZ2UuanNvbi4gSW5zdGVhZCwgdGhlIHZlcnNpb24gc3BlY2lmaWVkIGJ5IHRoZSBsYXRlc3QgdGFnIHdpbGwgYmUgdXNlZCAocG90ZW50aWFsbHkgdXBncmFkaW5nIHRoZSBwYWNrYWdlcyBhY3Jvc3MgbWFqb3IgdmVyc2lvbnMpLicsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignY2FyZXQnLCB7XG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbigndGlsZGUnLCB7XG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignZXhhY3QnLCB7XG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbigncGF0dGVybicsIHtcblx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0fSlcblx0XHQ7XG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cblx0XHR3cmFwRGVkdXBlKHJlcXVpcmUoJ3lhcmdzJyksIGFyZ3YsIHtcblxuXHRcdFx0YmVmb3JlKClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdFx0XHRjcm9zc1NwYXduT3RoZXIoJ3lhcm4nLCBbXSwgYXJndik7XG5cblx0XHRcdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdFx0XHRjb21tYW5kOiBbJ3VwZ3JhZGUnLCAndXAnLCBrZXldLFxuXHRcdFx0XHRcdGJpbjogJ3lhcm4nLFxuXHRcdFx0XHRcdGNtZDoga2V5LFxuXHRcdFx0XHRcdGFyZ3YsXG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHtjYWNoZS55YXJubG9ja19tc2d9XFxuYCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHR9KTtcblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=