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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBRTlFLDJDQUFrRTtBQUtsRSxtREFBNEQ7QUFDNUQsaURBQXVFO0FBQ3ZFLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRO0lBQzdDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLFFBQVEsRUFBRSw2QkFBNkI7SUFFdkMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLGlCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWpCLG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUV2QixJQUFJLElBQUksR0FBRyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFDN0I7b0JBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtnQkFFRCw2REFBNkQ7WUFDOUQsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXJCLElBQUksSUFBSSxHQUFHLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDekI7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztpQkFDMUQ7Z0JBRUQsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUNsQztvQkFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUc7d0JBQ0gsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztvQkFFSCxLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNiO2dCQUVELDZEQUE2RDtZQUU5RCxDQUFDO1lBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFdEIsSUFBSSxJQUFJLEdBQUcsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXRDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDbEM7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztvQkFFMUQsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHO3dCQUNILEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7b0JBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQztpQkFDZDtnQkFFRCw2REFBNkQ7WUFDOUQsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBR3BCLElBQUksS0FBSyxDQUFDLFlBQVksRUFDdEI7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO2lCQUN6QztnQkFFRCw2REFBNkQ7Z0JBRTdELDBDQUEwQztZQUMzQyxDQUFDO1NBRUQsQ0FBQyxDQUFDO1FBRUgsT0FBTztJQUNSLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJncyBmcm9tICcuLi8uLi9saWIvY2xpL2luc3RhbGwnO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtjd2RdJyxcblx0YWxpYXNlczogWydpJ10sXG5cdGRlc2NyaWJlOiBgZG8gZGVkdXBlIHdpdGggeWFybiBpbnN0YWxsYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwWWFybkluc3RhbGxUb1lhcmdzKHlhcmdzKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IHsgY3dkIH0gPSBhcmd2O1xuXG5cdFx0bGV0IF9vbmNlID0gdHJ1ZTtcblxuXHRcdHdyYXBEZWR1cGUocmVxdWlyZSgneWFyZ3MnKSwgYXJndiwge1xuXG5cdFx0XHRiZWZvcmUoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0aWYgKCFpbmZvLnlhcm5sb2NrX29sZF9leGlzdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0Y3dkLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdF9vbmNlID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKDEsIGNhY2hlLnlhcm5sb2NrX21zZywgY2FjaGUueWFybmxvY2tfY2hhbmdlZCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmIChpbmZvLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoX29uY2UgfHwgaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKDIsIGNhY2hlLnlhcm5sb2NrX21zZywgY2FjaGUueWFybmxvY2tfY2hhbmdlZCk7XG5cblx0XHRcdH0sXG5cblx0XHRcdGFmdGVyKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmIChfb25jZSAmJiBpbmZvLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cblx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0Y3dkLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdF9vbmNlID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKDMsIGNhY2hlLnlhcm5sb2NrX21zZywgY2FjaGUueWFybmxvY2tfY2hhbmdlZCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2NhY2hlLnlhcm5sb2NrX21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5sb2coNCwgY2FjaGUueWFybmxvY2tfbXNnLCBjYWNoZS55YXJubG9ja19jaGFuZ2VkKTtcblxuXHRcdFx0XHQvL2NvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdH0sXG5cblx0XHR9KTtcblxuXHRcdHJldHVybjtcblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19