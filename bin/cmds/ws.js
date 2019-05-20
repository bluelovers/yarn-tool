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
                    .strict(false);
            },
            handler(argv) {
                lazyLerna('run', 'run', argv);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBK0c7QUFRL0csMkNBQXVGO0FBR3ZGLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVE7SUFFN0MsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUM7SUFDMUMsUUFBUSxFQUFFLGlCQUFpQjtJQUUzQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLFVBQVUsQ0FBQyx3QkFBYyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLFFBQVEsRUFBRSxxQkFBcUI7WUFDL0IsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLO3FCQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUVoQixDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUk7Z0JBRVgsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDOUIsQ0FBQztTQUNELENBQUM7YUFDRCxPQUFPLENBQUM7WUFDUixPQUFPLEVBQUUsTUFBTTtZQUNmLFFBQVEsRUFBRSw4Q0FBOEM7WUFDeEQsT0FBTyxDQUFDLEtBQUs7Z0JBRVosT0FBTyxLQUFLO3FCQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNoQixDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUk7Z0JBRVgsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDaEMsQ0FBQztTQUNELENBQUM7YUFDRCxNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUUsQ0FDZjtJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtJQUdaLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFJSCxTQUFTLFNBQVMsQ0FBQyxPQUFlLEVBQUUsR0FBVyxFQUFFLElBQW9CO0lBRXBFLElBQUksR0FBRyxHQUFHLHlCQUFpQixDQUFDO1FBQzNCLElBQUksRUFBRSxPQUFPO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLEdBQUcsRUFDUjtRQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7SUFFRCxJQUFJLFFBQVEsR0FBRyx3QkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFOUMsT0FBTyx1QkFBZSxDQUFDLE9BQU8sRUFBRTtRQUUvQixHQUFHO1FBRUgsR0FBRyxRQUFRO0tBQ1gsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNWLENBQUM7QUFyQkQsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjb21tYW5kRGlyU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBjb21tYW5kRGlySm9pbiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHNldHVwV29ya3NwYWNlc0luaXRUb1lhcmdzIH0gZnJvbSAnY3JlYXRlLXlhcm4td29ya3NwYWNlcy95YXJncy1zZXR0aW5nJztcbmltcG9ydCB7IGNoZWNrTW9kaWxlRXhpc3RzLCBjcm9zc1NwYXduT3RoZXIsIHByb2Nlc3NBcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvc3Bhd24nO1xuaW1wb3J0IHsgQXJndW1lbnRzLCBBcmd2IH0gZnJvbSAneWFyZ3MnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgPGNtZD4nLFxuXG5cdGFsaWFzZXM6IFsnd3MnLCAnd29ya3NwYWNlcycsICd3b3Jrc3BhY2UnXSxcblx0ZGVzY3JpYmU6IGB5YXJuIHdvcmtzcGFjZXNgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5jb21tYW5kRGlyKGNvbW1hbmREaXJKb2luKF9fZGlybmFtZSwgX19maWxlbmFtZSkpXG5cdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdGNvbW1hbmQ6ICdydW4nLFxuXHRcdFx0XHRkZXNjcmliZTogYHJ1biBzY3JpcHQgYnkgbGVybmFgLFxuXHRcdFx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdFx0XHQuc3RyaWN0KGZhbHNlKVxuXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhhbmRsZXIoYXJndilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhenlMZXJuYSgncnVuJywgJ3J1bicsIGFyZ3YpXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0LmNvbW1hbmQoe1xuXHRcdFx0XHRjb21tYW5kOiAnZXhlYycsXG5cdFx0XHRcdGRlc2NyaWJlOiBgRXhlY3V0ZSBhbiBhcmJpdHJhcnkgY29tbWFuZCBpbiBlYWNoIHBhY2thZ2VgLFxuXHRcdFx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYXp5TGVybmEoJ2V4ZWMnLCAnZXhlYycsIGFyZ3YpXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0LnN0cmljdCgpXG5cdFx0XHQuZGVtYW5kQ29tbWFuZCgpXG5cdFx0XHQ7XG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG5mdW5jdGlvbiBsYXp5TGVybmEoY29tbWFuZDogc3RyaW5nLCBjbWQ6IHN0cmluZywgYXJndjogQXJndW1lbnRzPGFueT4pXG57XG5cdGxldCByZXQgPSBjaGVja01vZGlsZUV4aXN0cyh7XG5cdFx0bmFtZTogJ2xlcm5hJyxcblx0fSk7XG5cblx0aWYgKCFyZXQpXG5cdHtcblx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdH1cblxuXHRsZXQgY21kX2xpc3QgPSBwcm9jZXNzQXJndlNsaWNlKGNvbW1hbmQpLmFyZ3Y7XG5cblx0cmV0dXJuIGNyb3NzU3Bhd25PdGhlcignbGVybmEnLCBbXG5cblx0XHRjbWQsXG5cblx0XHQuLi5jbWRfbGlzdCxcblx0XSwgYXJndik7XG59XG4iXX0=