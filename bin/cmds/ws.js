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
                let ret = spawn_1.checkModileExists({
                    name: 'lerna',
                });
                if (!ret) {
                    process.exit(1);
                }
                let cmd_list = spawn_1.processArgvSlice('run').argv;
                spawn_1.crossSpawnOther('lerna', [
                    'run',
                    ...cmd_list,
                ], argv);
            },
        })
            .strict()
            .demandCommand();
    },
    handler(argv) {
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBRXZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUVsQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQztJQUMxQyxRQUFRLEVBQUUsaUJBQWlCO0lBRTNCLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsVUFBVSxDQUFDLHdCQUFjLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2pELE9BQU8sQ0FBQztZQUNSLE9BQU8sRUFBRSxLQUFLO1lBQ2QsUUFBUSxFQUFFLHFCQUFxQjtZQUMvQixPQUFPLENBQUMsS0FBSztnQkFFWixPQUFPLEtBQUssQ0FBQTtZQUNiLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSTtnQkFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztvQkFDM0IsSUFBSSxFQUFFLE9BQU87aUJBQ2IsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxHQUFHLEVBQ1I7b0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEI7Z0JBRUQsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUU1Qyx1QkFBZSxDQUFDLE9BQU8sRUFBRTtvQkFFeEIsS0FBSztvQkFFTCxHQUFHLFFBQVE7aUJBQ1gsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUM7U0FDRCxDQUFDO2FBQ0QsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFLENBQ2Y7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7SUFHWixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjb21tYW5kRGlyU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBjb21tYW5kRGlySm9pbiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IHsgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyB9IGZyb20gJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cblx0YWxpYXNlczogWyd3cycsICd3b3Jrc3BhY2VzJywgJ3dvcmtzcGFjZSddLFxuXHRkZXNjcmliZTogYHlhcm4gd29ya3NwYWNlc2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0LmNvbW1hbmREaXIoY29tbWFuZERpckpvaW4oX19kaXJuYW1lLCBfX2ZpbGVuYW1lKSlcblx0XHRcdC5jb21tYW5kKHtcblx0XHRcdFx0Y29tbWFuZDogJ3J1bicsXG5cdFx0XHRcdGRlc2NyaWJlOiBgcnVuIHNjcmlwdCBieSBsZXJuYWAsXG5cdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0fSxcblx0XHRcdFx0aGFuZGxlcihhcmd2KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdFx0XHRcdG5hbWU6ICdsZXJuYScsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRpZiAoIXJldClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZSgncnVuJykuYXJndjtcblxuXHRcdFx0XHRcdGNyb3NzU3Bhd25PdGhlcignbGVybmEnLCBbXG5cblx0XHRcdFx0XHRcdCdydW4nLFxuXG5cdFx0XHRcdFx0XHQuLi5jbWRfbGlzdCxcblx0XHRcdFx0XHRdLCBhcmd2KTtcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHQuc3RyaWN0KClcblx0XHRcdC5kZW1hbmRDb21tYW5kKClcblx0XHRcdDtcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=