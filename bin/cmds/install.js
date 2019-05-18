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
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_old_exists && cache.yarnlock_msg) {
                    index_1.console.log(cache.yarnlock_msg);
                }
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
            },
        });
        return;
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBRTlFLDJDQUFrRTtBQUtsRSxtREFBNEQ7QUFDNUQsaURBQXVFO0FBQ3ZFLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRO0lBQzdDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLFFBQVEsRUFBRSw2QkFBNkI7SUFFdkMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLGlCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWpCLG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUV2QixJQUFJLElBQUksR0FBRyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFDN0I7b0JBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtZQUNGLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVyQixJQUFJLElBQUksR0FBRyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQ3pCO29CQUNDLG9CQUFZLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7aUJBQzFEO2dCQUVELElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDbEM7b0JBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLElBQUksQ0FBQztpQkFDYjtZQUVGLENBQUM7WUFFRCxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUV0QixJQUFJLElBQUksR0FBRyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUNsQztvQkFDQyxvQkFBWSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO29CQUUxRCxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUc7d0JBQ0gsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztvQkFFSCxLQUFLLEdBQUcsS0FBSyxDQUFDO2lCQUNkO1lBQ0YsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXBCLElBQUksS0FBSyxDQUFDLG1CQUFtQixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ25EO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNoQztnQkFFRCxlQUFPLENBQUMsR0FBRyxDQUFDLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQztTQUVELENBQUMsQ0FBQztRQUVILE9BQU87SUFDUixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgc2V0dXBZYXJuSW5zdGFsbFRvWWFyZ3MgZnJvbSAnLi4vLi4vbGliL2NsaS9pbnN0YWxsJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbY3dkXScsXG5cdGFsaWFzZXM6IFsnaSddLFxuXHRkZXNjcmliZTogYGRvIGRlZHVwZSB3aXRoIHlhcm4gaW5zdGFsbGAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJncyh5YXJncylcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCBfb25jZSA9IHRydWU7XG5cblx0XHR3cmFwRGVkdXBlKHJlcXVpcmUoJ3lhcmdzJyksIGFyZ3YsIHtcblxuXHRcdFx0YmVmb3JlKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmICghaW5mby55YXJubG9ja19vbGRfZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmIChpbmZvLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoX29uY2UgfHwgaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSxcblxuXHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0aWYgKF9vbmNlICYmIGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgeWFybi5sb2NrIGNoYW5nZWQsIGRvIGluc3RhbGwgYWdhaW5gKTtcblxuXHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfb2xkX2V4aXN0cyAmJiBjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhjYWNoZS55YXJubG9ja19tc2cpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0fSxcblxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuO1xuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=