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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBR3ZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFFN0MsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUM7SUFDMUMsUUFBUSxFQUFFLGlCQUFpQjtJQUUzQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLFVBQVUsQ0FBQyx3QkFBYyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLO3FCQUNWLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ2pCLElBQUksRUFBRSwrQ0FBK0M7aUJBQ3JELENBQUM7cUJBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRTtvQkFDbkIsSUFBSSxFQUFFLG1FQUFtRTtpQkFDekUsQ0FBQztxQkFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO29CQUNwQixJQUFJLEVBQUUsaUNBQWlDO2lCQUN2QyxDQUFDO3FCQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNoQixDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUk7Z0JBRVgsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO29CQUM3QixXQUFXLENBQUMsSUFBSTt3QkFFZixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQzFEOzRCQUNDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUNsQztvQkFFRixDQUFDO2lCQUNELENBQUMsQ0FBQTtZQUNILENBQUM7U0FDRCxDQUFDO2FBQ0QsT0FBTyxDQUFDO1lBQ1IsT0FBTyxFQUFFLE1BQU07WUFDZixRQUFRLEVBQUUsOENBQThDO1lBQ3hELE9BQU8sQ0FBQyxLQUFLO2dCQUVaLE9BQU8sS0FBSztxQkFDVixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDaEIsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJO2dCQUVYLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQ2hDLENBQUM7U0FDRCxDQUFDO2FBQ0QsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFLENBQ2Y7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7SUFHWixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBSUgsU0FBUyxTQUFTLENBQTJCLE9BQWUsRUFBRSxHQUFXLEVBQUUsSUFBTyxFQUFFLE9BUWhGLEVBQUU7SUFFTCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztRQUMzQixJQUFJLEVBQUUsT0FBTztLQUNiLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTlDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQzVCO1FBQ0MsSUFBSSxJQUFJLEdBQUc7WUFDVixHQUFHO1lBQ0gsUUFBUTtZQUNSLElBQUksRUFBRSxJQUFXO1NBQ2pCLENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZCLENBQUM7WUFDQSxHQUFHO1lBQ0gsUUFBUTtZQUNSLElBQUk7U0FDSixHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ1Y7SUFFRCxPQUFPLHVCQUFlLENBQUMsT0FBTyxFQUFFO1FBRS9CLEdBQUc7UUFFSCxHQUFHLFFBQVE7S0FDWCxFQUFFLElBQXNCLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBOUNELGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY29tbWFuZERpclN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgY29tbWFuZERpckpvaW4gfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyB9IGZyb20gJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQXJndiB9IGZyb20gJ3lhcmdzJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIDxjbWQ+JyxcblxuXHRhbGlhc2VzOiBbJ3dzJywgJ3dvcmtzcGFjZXMnLCAnd29ya3NwYWNlJ10sXG5cdGRlc2NyaWJlOiBgeWFybiB3b3Jrc3BhY2VzYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuY29tbWFuZERpcihjb21tYW5kRGlySm9pbihfX2Rpcm5hbWUsIF9fZmlsZW5hbWUpKVxuXHRcdFx0LmNvbW1hbmQoe1xuXHRcdFx0XHRjb21tYW5kOiAncnVuJyxcblx0XHRcdFx0ZGVzY3JpYmU6IGBydW4gc2NyaXB0IGJ5IGxlcm5hYCxcblx0XHRcdFx0YnVpbGRlcih5YXJncylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB5YXJnc1xuXHRcdFx0XHRcdFx0Lm9wdGlvbignc3RyZWFtJywge1xuXHRcdFx0XHRcdFx0XHRkZXNjOiBgU3RyZWFtIG91dHB1dCB3aXRoIGxpbmVzIHByZWZpeGVkIGJ5IHBhY2thZ2UuYCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQub3B0aW9uKCdwYXJhbGxlbCcsIHtcblx0XHRcdFx0XHRcdFx0ZGVzYzogYFJ1biBzY3JpcHQgd2l0aCB1bmxpbWl0ZWQgY29uY3VycmVuY3ksIHN0cmVhbWluZyBwcmVmaXhlZCBvdXRwdXQuYCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQub3B0aW9uKCduby1wcmVmaXgnLCB7XG5cdFx0XHRcdFx0XHRcdGRlc2M6IGBEbyBub3QgcHJlZml4IHN0cmVhbWluZyBvdXRwdXQuYCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYXp5TGVybmEoJ3J1bicsICdydW4nLCBhcmd2LCB7XG5cdFx0XHRcdFx0XHRiZWZvcmVTcGF3bihkYXRhKSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGRhdGEuYXJndi5zdHJlYW0gPT0gbnVsbCAmJiBkYXRhLmFyZ3YucGFyYWxsZWwgPT0gbnVsbClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGRhdGEuY21kX2xpc3QudW5zaGlmdChgLS1zdHJlYW1gKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdGNvbW1hbmQ6ICdleGVjJyxcblx0XHRcdFx0ZGVzY3JpYmU6IGBFeGVjdXRlIGFuIGFyYml0cmFyeSBjb21tYW5kIGluIGVhY2ggcGFja2FnZWAsXG5cdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhhbmRsZXIoYXJndilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhenlMZXJuYSgnZXhlYycsICdleGVjJywgYXJndilcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHQuc3RyaWN0KClcblx0XHRcdC5kZW1hbmRDb21tYW5kKClcblx0XHRcdDtcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG5cbmZ1bmN0aW9uIGxhenlMZXJuYTxBIGV4dGVuZHMgQXJndW1lbnRzPGFueT4+KGNvbW1hbmQ6IHN0cmluZywgY21kOiBzdHJpbmcsIGFyZ3Y6IEEsIG9wdHM6IHtcblx0YmVmb3JlU3Bhd24/KGRhdGE6IHtcblx0XHRjbWQ6IHN0cmluZyxcblx0XHRjbWRfbGlzdDogc3RyaW5nW10sXG5cdFx0YXJndjogQSAmIHtcblx0XHRcdGN3ZDogc3RyaW5nXG5cdFx0fSxcblx0fSksXG59ID0ge30pXG57XG5cdGxldCByZXQgPSBjaGVja01vZGlsZUV4aXN0cyh7XG5cdFx0bmFtZTogJ2xlcm5hJyxcblx0fSk7XG5cblx0aWYgKCFyZXQpXG5cdHtcblx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdH1cblxuXHRsZXQgY21kX2xpc3QgPSBwcm9jZXNzQXJndlNsaWNlKGNvbW1hbmQpLmFyZ3Y7XG5cblx0aWYgKG9wdHMgJiYgb3B0cy5iZWZvcmVTcGF3bilcblx0e1xuXHRcdGxldCBkYXRhID0ge1xuXHRcdFx0Y21kLFxuXHRcdFx0Y21kX2xpc3QsXG5cdFx0XHRhcmd2OiBhcmd2IGFzIGFueSxcblx0XHR9O1xuXG5cdFx0b3B0cy5iZWZvcmVTcGF3bihkYXRhKTtcblxuXHRcdCh7XG5cdFx0XHRjbWQsXG5cdFx0XHRjbWRfbGlzdCxcblx0XHRcdGFyZ3YsXG5cdFx0fSA9IGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIGNyb3NzU3Bhd25PdGhlcignbGVybmEnLCBbXG5cblx0XHRjbWQsXG5cblx0XHQuLi5jbWRfbGlzdCxcblx0XSwgYXJndiBhcyBBcmd1bWVudHM8YW55Pik7XG59XG4iXX0=