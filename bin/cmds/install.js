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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBRTlFLDJDQUFrRTtBQUtsRSxtREFBNEQ7QUFDNUQsaURBQXVFO0FBQ3ZFLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRO0lBQzdDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLFFBQVEsRUFBRSw2QkFBNkI7SUFFdkMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLGlCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWpCLG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUV2QixJQUFJLElBQUksR0FBRyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFDN0I7b0JBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtnQkFFRCw2REFBNkQ7WUFDOUQsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXJCLElBQUksSUFBSSxHQUFHLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDekI7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztpQkFDMUQ7Z0JBRUQsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUNsQztvQkFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUc7d0JBQ0gsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztvQkFFSCxLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNiO2dCQUVELDZEQUE2RDtZQUU5RCxDQUFDO1lBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFdEIsSUFBSSxJQUFJLEdBQUcsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXRDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDbEM7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztvQkFFMUQsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtnQkFFRCw2REFBNkQ7WUFDOUQsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBR3BCLElBQUksS0FBSyxDQUFDLFlBQVksRUFDdEI7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO2lCQUN6QztnQkFFRCw2REFBNkQ7Z0JBRTdELDBDQUEwQztZQUMzQyxDQUFDO1NBRUQsQ0FBQyxDQUFDO1FBRUgsT0FBTztJQUNSLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgc2V0dXBZYXJuSW5zdGFsbFRvWWFyZ3MgZnJvbSAnLi4vLi4vbGliL2NsaS9pbnN0YWxsJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbY3dkXScsXG5cdGFsaWFzZXM6IFsnaSddLFxuXHRkZXNjcmliZTogYGRvIGRlZHVwZSB3aXRoIHlhcm4gaW5zdGFsbGAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJncyh5YXJncylcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCBfb25jZSA9IHRydWU7XG5cblx0XHR3cmFwRGVkdXBlKHJlcXVpcmUoJ3lhcmdzJyksIGFyZ3YsIHtcblxuXHRcdFx0YmVmb3JlKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmICghaW5mby55YXJubG9ja19vbGRfZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZygxLCBjYWNoZS55YXJubG9ja19tc2csIGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpO1xuXHRcdFx0fSxcblxuXHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGluZm8gPSBpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKTtcblxuXHRcdFx0XHRpZiAoaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGB5YXJuLmxvY2sgY2hhbmdlZCwgZG8gaW5zdGFsbCBhZ2FpbmApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKF9vbmNlIHx8IGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0X29uY2UgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZygyLCBjYWNoZS55YXJubG9ja19tc2csIGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpO1xuXG5cdFx0XHR9LFxuXG5cdFx0XHRhZnRlcih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGluZm8gPSBpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKTtcblxuXHRcdFx0XHRpZiAoX29uY2UgJiYgaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGB5YXJuLmxvY2sgY2hhbmdlZCwgZG8gaW5zdGFsbCBhZ2FpbmApO1xuXG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZygzLCBjYWNoZS55YXJubG9ja19tc2csIGNhY2hlLnlhcm5sb2NrX2NoYW5nZWQpO1xuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXG5cdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHtjYWNoZS55YXJubG9ja19tc2d9XFxuYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKDQsIGNhY2hlLnlhcm5sb2NrX21zZywgY2FjaGUueWFybmxvY2tfY2hhbmdlZCk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cdFx0XHR9LFxuXG5cdFx0fSk7XG5cblx0XHRyZXR1cm47XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==