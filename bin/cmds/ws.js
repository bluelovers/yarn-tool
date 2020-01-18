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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBR3ZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFFN0MsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUM7SUFDMUMsUUFBUSxFQUFFLGlCQUFpQjtJQUUzQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLFVBQVUsQ0FBQyx3QkFBYyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLO3FCQUNWLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ2pCLElBQUksRUFBRSwrQ0FBK0M7aUJBQ3JELENBQUM7cUJBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRTtvQkFDbkIsSUFBSSxFQUFFLG1FQUFtRTtpQkFDekUsQ0FBQztxQkFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO29CQUNwQixJQUFJLEVBQUUsaUNBQWlDO2lCQUN2QyxDQUFDO3FCQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNoQixDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUk7Z0JBRVgsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO29CQUM3QixXQUFXLENBQUMsSUFBSTt3QkFFZixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQzFEOzRCQUNDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUNsQztvQkFFRixDQUFDO2lCQUNELENBQUMsQ0FBQTtZQUNILENBQUM7U0FDRCxDQUFDO2FBQ0QsT0FBTyxDQUFDO1lBQ1IsT0FBTyxFQUFFLE1BQU07WUFDZixRQUFRLEVBQUUsOENBQThDO1lBQ3hELE9BQU8sQ0FBQyxLQUFLO2dCQUVaLE9BQU8sS0FBSztxQkFDVixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDaEIsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJO2dCQUVYLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQ2hDLENBQUM7U0FDRCxDQUFDO2FBQ0QsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFLENBQ2Y7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7SUFHWixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBSUgsU0FBUyxTQUFTLENBQTJCLE9BQWUsRUFBRSxHQUFXLEVBQUUsSUFBTyxFQUFFLE9BUWhGLEVBQUU7SUFFTCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztRQUMzQixJQUFJLEVBQUUsT0FBTztLQUNiLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTlDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQzVCO1FBQ0MsSUFBSSxJQUFJLEdBQUc7WUFDVixHQUFHO1lBQ0gsUUFBUTtZQUNSLElBQUksRUFBRSxJQUFXO1NBQ2pCLENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZCLENBQUM7WUFDQSxHQUFHO1lBQ0gsUUFBUTtZQUNSLElBQUk7U0FDSixHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ1Y7SUFFRCxPQUFPLHVCQUFlLENBQUMsT0FBTyxFQUFFO1FBRS9CLEdBQUc7UUFFSCxHQUFHLFFBQVE7S0FDWCxFQUFFLElBQXNCLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBOUNELGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY29tbWFuZERpclN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgY29tbWFuZERpckpvaW4gfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHNldHVwV29ya3NwYWNlc0luaXRUb1lhcmdzIH0gZnJvbSAnY3JlYXRlLXlhcm4td29ya3NwYWNlcy95YXJncy1zZXR0aW5nJztcbmltcG9ydCB7IGNoZWNrTW9kaWxlRXhpc3RzLCBjcm9zc1NwYXduT3RoZXIsIHByb2Nlc3NBcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvc3Bhd24nO1xuaW1wb3J0IHsgQXJndW1lbnRzLCBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgPGNtZD4nLFxuXG5cdGFsaWFzZXM6IFsnd3MnLCAnd29ya3NwYWNlcycsICd3b3Jrc3BhY2UnXSxcblx0ZGVzY3JpYmU6IGB5YXJuIHdvcmtzcGFjZXNgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5jb21tYW5kRGlyKGNvbW1hbmREaXJKb2luKF9fZGlybmFtZSwgX19maWxlbmFtZSkpXG5cdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdGNvbW1hbmQ6ICdydW4nLFxuXHRcdFx0XHRkZXNjcmliZTogYHJ1biBzY3JpcHQgYnkgbGVybmFgLFxuXHRcdFx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdFx0XHQub3B0aW9uKCdzdHJlYW0nLCB7XG5cdFx0XHRcdFx0XHRcdGRlc2M6IGBTdHJlYW0gb3V0cHV0IHdpdGggbGluZXMgcHJlZml4ZWQgYnkgcGFja2FnZS5gLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5vcHRpb24oJ3BhcmFsbGVsJywge1xuXHRcdFx0XHRcdFx0XHRkZXNjOiBgUnVuIHNjcmlwdCB3aXRoIHVubGltaXRlZCBjb25jdXJyZW5jeSwgc3RyZWFtaW5nIHByZWZpeGVkIG91dHB1dC5gLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5vcHRpb24oJ25vLXByZWZpeCcsIHtcblx0XHRcdFx0XHRcdFx0ZGVzYzogYERvIG5vdCBwcmVmaXggc3RyZWFtaW5nIG91dHB1dC5gLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhhbmRsZXIoYXJndilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhenlMZXJuYSgncnVuJywgJ3J1bicsIGFyZ3YsIHtcblx0XHRcdFx0XHRcdGJlZm9yZVNwYXduKGRhdGEpIHtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZGF0YS5hcmd2LnN0cmVhbSA9PSBudWxsICYmIGRhdGEuYXJndi5wYXJhbGxlbCA9PSBudWxsKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5jbWRfbGlzdC51bnNoaWZ0KGAtLXN0cmVhbWApO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHRcdC5jb21tYW5kKHtcblx0XHRcdFx0Y29tbWFuZDogJ2V4ZWMnLFxuXHRcdFx0XHRkZXNjcmliZTogYEV4ZWN1dGUgYW4gYXJiaXRyYXJ5IGNvbW1hbmQgaW4gZWFjaCBwYWNrYWdlYCxcblx0XHRcdFx0YnVpbGRlcih5YXJncylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB5YXJnc1xuXHRcdFx0XHRcdFx0LnN0cmljdChmYWxzZSlcblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGF6eUxlcm5hKCdleGVjJywgJ2V4ZWMnLCBhcmd2KVxuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHRcdC5zdHJpY3QoKVxuXHRcdFx0LmRlbWFuZENvbW1hbmQoKVxuXHRcdFx0O1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxuZnVuY3Rpb24gbGF6eUxlcm5hPEEgZXh0ZW5kcyBBcmd1bWVudHM8YW55Pj4oY29tbWFuZDogc3RyaW5nLCBjbWQ6IHN0cmluZywgYXJndjogQSwgb3B0czoge1xuXHRiZWZvcmVTcGF3bj8oZGF0YToge1xuXHRcdGNtZDogc3RyaW5nLFxuXHRcdGNtZF9saXN0OiBzdHJpbmdbXSxcblx0XHRhcmd2OiBBICYge1xuXHRcdFx0Y3dkOiBzdHJpbmdcblx0XHR9LFxuXHR9KSxcbn0gPSB7fSlcbntcblx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRuYW1lOiAnbGVybmEnLFxuXHR9KTtcblxuXHRpZiAoIXJldClcblx0e1xuXHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0fVxuXG5cdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoY29tbWFuZCkuYXJndjtcblxuXHRpZiAob3B0cyAmJiBvcHRzLmJlZm9yZVNwYXduKVxuXHR7XG5cdFx0bGV0IGRhdGEgPSB7XG5cdFx0XHRjbWQsXG5cdFx0XHRjbWRfbGlzdCxcblx0XHRcdGFyZ3Y6IGFyZ3YgYXMgYW55LFxuXHRcdH07XG5cblx0XHRvcHRzLmJlZm9yZVNwYXduKGRhdGEpO1xuXG5cdFx0KHtcblx0XHRcdGNtZCxcblx0XHRcdGNtZF9saXN0LFxuXHRcdFx0YXJndixcblx0XHR9ID0gZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4gY3Jvc3NTcGF3bk90aGVyKCdsZXJuYScsIFtcblxuXHRcdGNtZCxcblxuXHRcdC4uLmNtZF9saXN0LFxuXHRdLCBhcmd2IGFzIEFyZ3VtZW50czxhbnk+KTtcbn1cbiJdfQ==