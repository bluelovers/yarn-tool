"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBR3ZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUVsQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQztJQUMxQyxRQUFRLEVBQUUsaUJBQWlCO0lBRTNCLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsVUFBVSxDQUFDLHdCQUFjLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2pELE9BQU8sQ0FBQztZQUNSLE9BQU8sRUFBRSxLQUFLO1lBQ2QsUUFBUSxFQUFFLHFCQUFxQjtZQUMvQixPQUFPLENBQUMsS0FBSztnQkFFWixPQUFPLEtBQUssQ0FBQTtZQUNiLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSTtnQkFFWCxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUM5QixDQUFDO1NBQ0QsQ0FBQzthQUNELE9BQU8sQ0FBQztZQUNSLE9BQU8sRUFBRSxNQUFNO1lBQ2YsUUFBUSxFQUFFLDhDQUE4QztZQUN4RCxPQUFPLENBQUMsS0FBSztnQkFFWixPQUFPLEtBQUssQ0FBQTtZQUNiLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSTtnQkFFWCxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUNoQyxDQUFDO1NBQ0QsQ0FBQzthQUNELE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRSxDQUNmO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO0lBR1osQ0FBQztDQUVELENBQUMsQ0FBQztBQUlILFNBQVMsU0FBUyxDQUFDLE9BQWUsRUFBRSxHQUFXLEVBQUUsSUFBZTtJQUUvRCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztRQUMzQixJQUFJLEVBQUUsT0FBTztLQUNiLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTlDLE9BQU8sdUJBQWUsQ0FBQyxPQUFPLEVBQUU7UUFFL0IsR0FBRztRQUVILEdBQUcsUUFBUTtLQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDVixDQUFDO0FBckJELGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY29tbWFuZERpclN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgY29tbWFuZERpckpvaW4gfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyB9IGZyb20gJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcbmltcG9ydCB7IEFyZ3VtZW50cywgQXJndiB9IGZyb20gJ3lhcmdzJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cblx0YWxpYXNlczogWyd3cycsICd3b3Jrc3BhY2VzJywgJ3dvcmtzcGFjZSddLFxuXHRkZXNjcmliZTogYHlhcm4gd29ya3NwYWNlc2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0LmNvbW1hbmREaXIoY29tbWFuZERpckpvaW4oX19kaXJuYW1lLCBfX2ZpbGVuYW1lKSlcblx0XHRcdC5jb21tYW5kKHtcblx0XHRcdFx0Y29tbWFuZDogJ3J1bicsXG5cdFx0XHRcdGRlc2NyaWJlOiBgcnVuIHNjcmlwdCBieSBsZXJuYWAsXG5cdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGF6eUxlcm5hKCdydW4nLCAncnVuJywgYXJndilcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdGNvbW1hbmQ6ICdleGVjJyxcblx0XHRcdFx0ZGVzY3JpYmU6IGBFeGVjdXRlIGFuIGFyYml0cmFyeSBjb21tYW5kIGluIGVhY2ggcGFja2FnZWAsXG5cdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGF6eUxlcm5hKCdleGVjJywgJ2V4ZWMnLCBhcmd2KVxuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHRcdC5zdHJpY3QoKVxuXHRcdFx0LmRlbWFuZENvbW1hbmQoKVxuXHRcdFx0O1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxuZnVuY3Rpb24gbGF6eUxlcm5hKGNvbW1hbmQ6IHN0cmluZywgY21kOiBzdHJpbmcsIGFyZ3Y6IEFyZ3VtZW50cylcbntcblx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRuYW1lOiAnbGVybmEnLFxuXHR9KTtcblxuXHRpZiAoIXJldClcblx0e1xuXHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0fVxuXG5cdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoY29tbWFuZCkuYXJndjtcblxuXHRyZXR1cm4gY3Jvc3NTcGF3bk90aGVyKCdsZXJuYScsIFtcblxuXHRcdGNtZCxcblxuXHRcdC4uLmNtZF9saXN0LFxuXHRdLCBhcmd2KTtcbn1cbiJdfQ==