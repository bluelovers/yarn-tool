"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' <cmd>',
    aliases: ['ws', 'workspaces', 'workspace'],
    describe: `yarn workspaces`,
    builder(yargs) {
        return yargs
            .commandDir(cmd_dir_1.commandDirJoin(__dirname, __filename))
            .command({
            command: 'run',
            describe: `run script by lerna`,
            builder(yargs) {
                return yargs
                    .option('stream', {
                    desc: `Stream output with lines prefixed by package.`,
                })
                    .option('parallel', {
                    desc: `Run script with unlimited concurrency, streaming prefixed output.`,
                })
                    .option('no-prefix', {
                    desc: `Do not prefix streaming output.`,
                })
                    .help(false)
                    .version(false)
                    .strict(false);
            },
            handler(argv) {
                lazyLerna('run', 'run', argv, {
                    beforeSpawn(data) {
                        if (data.argv.stream == null && data.argv.parallel == null) {
                            data.cmd_list.unshift(`--stream`);
                        }
                    }
                });
            },
        })
            .command({
            command: 'exec',
            describe: `Execute an arbitrary command in each package`,
            builder(yargs) {
                return yargs
                    .strict(false);
            },
            handler(argv) {
                lazyLerna('exec', 'exec', argv);
            },
        })
            .strict()
            .demandCommand();
    },
    handler(argv) {
    },
});
function lazyLerna(command, cmd, argv, opts = {}) {
    let ret = spawn_1.checkModileExists({
        name: 'lerna',
    });
    if (!ret) {
        process.exit(1);
    }
    let cmd_list = spawn_1.processArgvSlice(command).argv;
    if (opts && opts.beforeSpawn) {
        let data = {
            cmd,
            cmd_list,
            argv: argv,
        };
        opts.beforeSpawn(data);
        ({
            cmd,
            cmd_list,
            argv,
        } = data);
    }
    return spawn_1.crossSpawnOther('lerna', [
        cmd,
        ...cmd_list,
    ], argv);
}
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBR3ZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFFN0MsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUM7SUFDMUMsUUFBUSxFQUFFLGlCQUFpQjtJQUUzQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLFVBQVUsQ0FBQyx3QkFBYyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLO3FCQUNWLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ2pCLElBQUksRUFBRSwrQ0FBK0M7aUJBQ3JELENBQUM7cUJBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRTtvQkFDbkIsSUFBSSxFQUFFLG1FQUFtRTtpQkFDekUsQ0FBQztxQkFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO29CQUNwQixJQUFJLEVBQUUsaUNBQWlDO2lCQUN2QyxDQUFDO3FCQUNELElBQUksQ0FBQyxLQUFLLENBQUM7cUJBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQztxQkFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDaEIsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJO2dCQUVYLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtvQkFDN0IsV0FBVyxDQUFDLElBQUk7d0JBRWYsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUMxRDs0QkFDQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDbEM7b0JBRUYsQ0FBQztpQkFDRCxDQUFDLENBQUE7WUFDSCxDQUFDO1NBQ0QsQ0FBQzthQUNELE9BQU8sQ0FBQztZQUNSLE9BQU8sRUFBRSxNQUFNO1lBQ2YsUUFBUSxFQUFFLDhDQUE4QztZQUN4RCxPQUFPLENBQUMsS0FBSztnQkFFWixPQUFPLEtBQUs7cUJBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2hCLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSTtnQkFFWCxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUNoQyxDQUFDO1NBQ0QsQ0FBQzthQUNELE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRSxDQUNmO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO0lBR1osQ0FBQztDQUVELENBQUMsQ0FBQztBQUlILFNBQVMsU0FBUyxDQUEyQixPQUFlLEVBQUUsR0FBVyxFQUFFLElBQU8sRUFBRSxPQVFoRixFQUFFO0lBRUwsSUFBSSxHQUFHLEdBQUcseUJBQWlCLENBQUM7UUFDM0IsSUFBSSxFQUFFLE9BQU87S0FDYixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsR0FBRyxFQUNSO1FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtJQUVELElBQUksUUFBUSxHQUFHLHdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztJQUU5QyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUM1QjtRQUNDLElBQUksSUFBSSxHQUFHO1lBQ1YsR0FBRztZQUNILFFBQVE7WUFDUixJQUFJLEVBQUUsSUFBVztTQUNqQixDQUFDO1FBRUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2QixDQUFDO1lBQ0EsR0FBRztZQUNILFFBQVE7WUFDUixJQUFJO1NBQ0osR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNWO0lBRUQsT0FBTyx1QkFBZSxDQUFDLE9BQU8sRUFBRTtRQUUvQixHQUFHO1FBRUgsR0FBRyxRQUFRO0tBQ1gsRUFBRSxJQUFzQixDQUFDLENBQUM7QUFDNUIsQ0FBQztBQTlDRCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNvbW1hbmREaXJTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGNvbW1hbmREaXJKb2luIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyB9IGZyb20gJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQXJndiB9IGZyb20gJ3lhcmdzJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIDxjbWQ+JyxcblxuXHRhbGlhc2VzOiBbJ3dzJywgJ3dvcmtzcGFjZXMnLCAnd29ya3NwYWNlJ10sXG5cdGRlc2NyaWJlOiBgeWFybiB3b3Jrc3BhY2VzYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuY29tbWFuZERpcihjb21tYW5kRGlySm9pbihfX2Rpcm5hbWUsIF9fZmlsZW5hbWUpKVxuXHRcdFx0LmNvbW1hbmQoe1xuXHRcdFx0XHRjb21tYW5kOiAncnVuJyxcblx0XHRcdFx0ZGVzY3JpYmU6IGBydW4gc2NyaXB0IGJ5IGxlcm5hYCxcblx0XHRcdFx0YnVpbGRlcih5YXJncylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB5YXJnc1xuXHRcdFx0XHRcdFx0Lm9wdGlvbignc3RyZWFtJywge1xuXHRcdFx0XHRcdFx0XHRkZXNjOiBgU3RyZWFtIG91dHB1dCB3aXRoIGxpbmVzIHByZWZpeGVkIGJ5IHBhY2thZ2UuYCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQub3B0aW9uKCdwYXJhbGxlbCcsIHtcblx0XHRcdFx0XHRcdFx0ZGVzYzogYFJ1biBzY3JpcHQgd2l0aCB1bmxpbWl0ZWQgY29uY3VycmVuY3ksIHN0cmVhbWluZyBwcmVmaXhlZCBvdXRwdXQuYCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQub3B0aW9uKCduby1wcmVmaXgnLCB7XG5cdFx0XHRcdFx0XHRcdGRlc2M6IGBEbyBub3QgcHJlZml4IHN0cmVhbWluZyBvdXRwdXQuYCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuaGVscChmYWxzZSlcblx0XHRcdFx0XHRcdC52ZXJzaW9uKGZhbHNlKVxuXHRcdFx0XHRcdFx0LnN0cmljdChmYWxzZSlcblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGF6eUxlcm5hKCdydW4nLCAncnVuJywgYXJndiwge1xuXHRcdFx0XHRcdFx0YmVmb3JlU3Bhd24oZGF0YSkge1xuXG5cdFx0XHRcdFx0XHRcdGlmIChkYXRhLmFyZ3Yuc3RyZWFtID09IG51bGwgJiYgZGF0YS5hcmd2LnBhcmFsbGVsID09IG51bGwpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhLmNtZF9saXN0LnVuc2hpZnQoYC0tc3RyZWFtYCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0LmNvbW1hbmQoe1xuXHRcdFx0XHRjb21tYW5kOiAnZXhlYycsXG5cdFx0XHRcdGRlc2NyaWJlOiBgRXhlY3V0ZSBhbiBhcmJpdHJhcnkgY29tbWFuZCBpbiBlYWNoIHBhY2thZ2VgLFxuXHRcdFx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYXp5TGVybmEoJ2V4ZWMnLCAnZXhlYycsIGFyZ3YpXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0LnN0cmljdCgpXG5cdFx0XHQuZGVtYW5kQ29tbWFuZCgpXG5cdFx0XHQ7XG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG5mdW5jdGlvbiBsYXp5TGVybmE8QSBleHRlbmRzIEFyZ3VtZW50czxhbnk+Pihjb21tYW5kOiBzdHJpbmcsIGNtZDogc3RyaW5nLCBhcmd2OiBBLCBvcHRzOiB7XG5cdGJlZm9yZVNwYXduPyhkYXRhOiB7XG5cdFx0Y21kOiBzdHJpbmcsXG5cdFx0Y21kX2xpc3Q6IHN0cmluZ1tdLFxuXHRcdGFyZ3Y6IEEgJiB7XG5cdFx0XHRjd2Q6IHN0cmluZ1xuXHRcdH0sXG5cdH0pLFxufSA9IHt9KVxue1xuXHRsZXQgcmV0ID0gY2hlY2tNb2RpbGVFeGlzdHMoe1xuXHRcdG5hbWU6ICdsZXJuYScsXG5cdH0pO1xuXG5cdGlmICghcmV0KVxuXHR7XG5cdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHR9XG5cblx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZShjb21tYW5kKS5hcmd2O1xuXG5cdGlmIChvcHRzICYmIG9wdHMuYmVmb3JlU3Bhd24pXG5cdHtcblx0XHRsZXQgZGF0YSA9IHtcblx0XHRcdGNtZCxcblx0XHRcdGNtZF9saXN0LFxuXHRcdFx0YXJndjogYXJndiBhcyBhbnksXG5cdFx0fTtcblxuXHRcdG9wdHMuYmVmb3JlU3Bhd24oZGF0YSk7XG5cblx0XHQoe1xuXHRcdFx0Y21kLFxuXHRcdFx0Y21kX2xpc3QsXG5cdFx0XHRhcmd2LFxuXHRcdH0gPSBkYXRhKTtcblx0fVxuXG5cdHJldHVybiBjcm9zc1NwYXduT3RoZXIoJ2xlcm5hJywgW1xuXG5cdFx0Y21kLFxuXG5cdFx0Li4uY21kX2xpc3QsXG5cdF0sIGFyZ3YgYXMgQXJndW1lbnRzPGFueT4pO1xufVxuIl19