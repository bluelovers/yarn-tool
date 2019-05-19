"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const install_1 = require("../../lib/cli/install");
const dedupe_1 = require("../../lib/cli/dedupe");
const crossSpawn = require("cross-spawn-extra");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [cwd]',
    aliases: ['i'],
    describe: `do dedupe with yarn install`,
    builder(yargs) {
        return install_1.default(yargs);
    },
    handler(argv) {
        const { cwd } = argv;
        let _once = true;
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            before(yarg, argv, cache) {
                let info = dedupe_1.infoFromDedupeCache(cache);
                if (!info.yarnlock_old_exists) {
                    crossSpawn.sync('yarn', [], {
                        cwd,
                        stdio: 'inherit',
                    });
                    _once = false;
                }
                //console.log(1, cache.yarnlock_msg, cache.yarnlock_changed);
            },
            main(yarg, argv, cache) {
                let info = dedupe_1.infoFromDedupeCache(cache);
                if (info.yarnlock_changed) {
                    index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
                }
                if (_once || info.yarnlock_changed) {
                    crossSpawn.sync('yarn', [], {
                        cwd,
                        stdio: 'inherit',
                    });
                    _once = true;
                }
                //console.log(2, cache.yarnlock_msg, cache.yarnlock_changed);
            },
            after(yarg, argv, cache) {
                let info = dedupe_1.infoFromDedupeCache(cache);
                if (_once && info.yarnlock_changed) {
                    index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
                    crossSpawn.sync('yarn', [], {
                        cwd,
                        stdio: 'inherit',
                    });
                    _once = false;
                }
                //console.log(3, cache.yarnlock_msg, cache.yarnlock_changed);
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
                //console.log(4, cache.yarnlock_msg, cache.yarnlock_changed);
                //console.dir(infoFromDedupeCache(cache));
            },
        });
        return;
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBRTlFLDJDQUFrRTtBQUtsRSxtREFBNEQ7QUFDNUQsaURBQXVFO0FBQ3ZFLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRO0lBQzdDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLFFBQVEsRUFBRSw2QkFBNkI7SUFFdkMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLGlCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWpCLG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUV2QixJQUFJLElBQUksR0FBRyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFDN0I7b0JBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtnQkFFRCw2REFBNkQ7WUFDOUQsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXJCLElBQUksSUFBSSxHQUFHLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDekI7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztpQkFDMUQ7Z0JBRUQsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUNsQztvQkFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUc7d0JBQ0gsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztvQkFFSCxLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNiO2dCQUVELDZEQUE2RDtZQUU5RCxDQUFDO1lBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFdEIsSUFBSSxJQUFJLEdBQUcsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXRDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDbEM7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztvQkFFMUQsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtnQkFFRCw2REFBNkQ7WUFDOUQsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBR3BCLElBQUksS0FBSyxDQUFDLFlBQVksRUFDdEI7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO2lCQUN6QztnQkFFRCw2REFBNkQ7Z0JBRTdELDBDQUEwQztZQUMzQyxDQUFDO1NBRUQsQ0FBQyxDQUFDO1FBRUgsT0FBTztJQUNSLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHNldHVwWWFybkluc3RhbGxUb1lhcmdzIGZyb20gJy4uLy4uL2xpYi9jbGkvaW5zdGFsbCc7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgW2N3ZF0nLFxuXHRhbGlhc2VzOiBbJ2knXSxcblx0ZGVzY3JpYmU6IGBkbyBkZWR1cGUgd2l0aCB5YXJuIGluc3RhbGxgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuSW5zdGFsbFRvWWFyZ3MoeWFyZ3MpXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3QgeyBjd2QgfSA9IGFyZ3Y7XG5cblx0XHRsZXQgX29uY2UgPSB0cnVlO1xuXG5cdFx0d3JhcERlZHVwZShyZXF1aXJlKCd5YXJncycpLCBhcmd2LCB7XG5cblx0XHRcdGJlZm9yZSh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGluZm8gPSBpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKTtcblxuXHRcdFx0XHRpZiAoIWluZm8ueWFybmxvY2tfb2xkX2V4aXN0cylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coMSwgY2FjaGUueWFybmxvY2tfbXNnLCBjYWNoZS55YXJubG9ja19jaGFuZ2VkKTtcblx0XHRcdH0sXG5cblx0XHRcdG1haW4oeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0aWYgKGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgeWFybi5sb2NrIGNoYW5nZWQsIGRvIGluc3RhbGwgYWdhaW5gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChfb25jZSB8fCBpbmZvLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0Y3dkLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdF9vbmNlID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coMiwgY2FjaGUueWFybmxvY2tfbXNnLCBjYWNoZS55YXJubG9ja19jaGFuZ2VkKTtcblxuXHRcdFx0fSxcblxuXHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0aWYgKF9vbmNlICYmIGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgeWFybi5sb2NrIGNoYW5nZWQsIGRvIGluc3RhbGwgYWdhaW5gKTtcblxuXHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coMywgY2FjaGUueWFybmxvY2tfbXNnLCBjYWNoZS55YXJubG9ja19jaGFuZ2VkKTtcblx0XHRcdH0sXG5cblx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblxuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7Y2FjaGUueWFybmxvY2tfbXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyg0LCBjYWNoZS55YXJubG9ja19tc2csIGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0fSxcblxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuO1xuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=