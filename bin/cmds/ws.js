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
                return yargs;
            },
            handler(argv) {
                lazyLerna('run', 'run', argv);
            },
        })
            .command({
            command: 'exec',
            describe: `Execute an arbitrary command in each package`,
            builder(yargs) {
                return yargs;
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
function lazyLerna(command, cmd, argv) {
    let ret = spawn_1.checkModileExists({
        name: 'lerna',
    });
    if (!ret) {
        process.exit(1);
    }
    let cmd_list = spawn_1.processArgvSlice(command).argv;
    return spawn_1.crossSpawnOther('lerna', [
        cmd,
        ...cmd_list,
    ], argv);
}
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBR3ZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFFN0MsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUM7SUFDMUMsUUFBUSxFQUFFLGlCQUFpQjtJQUUzQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLFVBQVUsQ0FBQyx3QkFBYyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLLENBQUE7WUFDYixDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUk7Z0JBRVgsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDOUIsQ0FBQztTQUNELENBQUM7YUFDRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsTUFBTTtZQUNmLFFBQVEsRUFBRSw4Q0FBOEM7WUFDeEQsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLLENBQUE7WUFDYixDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUk7Z0JBRVgsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDaEMsQ0FBQztTQUNELENBQUM7YUFDRCxNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUUsQ0FDZjtJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtJQUdaLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFJSCxTQUFTLFNBQVMsQ0FBQyxPQUFlLEVBQUUsR0FBVyxFQUFFLElBQWU7SUFFL0QsSUFBSSxHQUFHLEdBQUcseUJBQWlCLENBQUM7UUFDM0IsSUFBSSxFQUFFLE9BQU87S0FDYixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsR0FBRyxFQUNSO1FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtJQUVELElBQUksUUFBUSxHQUFHLHdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztJQUU5QyxPQUFPLHVCQUFlLENBQUMsT0FBTyxFQUFFO1FBRS9CLEdBQUc7UUFFSCxHQUFHLFFBQVE7S0FDWCxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQXJCRCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNvbW1hbmREaXJTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGNvbW1hbmREaXJKb2luIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MgfSBmcm9tICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgY2hlY2tNb2RpbGVFeGlzdHMsIGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9zcGF3bic7XG5pbXBvcnQgeyBBcmd1bWVudHMsIEFyZ3YgfSBmcm9tICd5YXJncyc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyA8Y21kPicsXG5cblx0YWxpYXNlczogWyd3cycsICd3b3Jrc3BhY2VzJywgJ3dvcmtzcGFjZSddLFxuXHRkZXNjcmliZTogYHlhcm4gd29ya3NwYWNlc2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0LmNvbW1hbmREaXIoY29tbWFuZERpckpvaW4oX19kaXJuYW1lLCBfX2ZpbGVuYW1lKSlcblx0XHRcdC5jb21tYW5kKHtcblx0XHRcdFx0Y29tbWFuZDogJ3J1bicsXG5cdFx0XHRcdGRlc2NyaWJlOiBgcnVuIHNjcmlwdCBieSBsZXJuYWAsXG5cdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGF6eUxlcm5hKCdydW4nLCAncnVuJywgYXJndilcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdGNvbW1hbmQ6ICdleGVjJyxcblx0XHRcdFx0ZGVzY3JpYmU6IGBFeGVjdXRlIGFuIGFyYml0cmFyeSBjb21tYW5kIGluIGVhY2ggcGFja2FnZWAsXG5cdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGF6eUxlcm5hKCdleGVjJywgJ2V4ZWMnLCBhcmd2KVxuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHRcdC5zdHJpY3QoKVxuXHRcdFx0LmRlbWFuZENvbW1hbmQoKVxuXHRcdFx0O1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxuZnVuY3Rpb24gbGF6eUxlcm5hKGNvbW1hbmQ6IHN0cmluZywgY21kOiBzdHJpbmcsIGFyZ3Y6IEFyZ3VtZW50cylcbntcblx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRuYW1lOiAnbGVybmEnLFxuXHR9KTtcblxuXHRpZiAoIXJldClcblx0e1xuXHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0fVxuXG5cdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoY29tbWFuZCkuYXJndjtcblxuXHRyZXR1cm4gY3Jvc3NTcGF3bk90aGVyKCdsZXJuYScsIFtcblxuXHRcdGNtZCxcblxuXHRcdC4uLmNtZF9saXN0LFxuXHRdLCBhcmd2KTtcbn1cbiJdfQ==