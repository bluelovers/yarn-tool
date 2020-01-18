"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const dedupe_1 = require("../../lib/cli/dedupe");
const add_1 = require("../../lib/cli/add");
const crossSpawn = require("cross-spawn-extra");
const index_2 = require("../../index");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs a package`,
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        })
            .strict(false);
    },
    handler(argv) {
        let args = argv._.slice();
        if (args[0] === 'add') {
            args.shift();
        }
        if (argv.name) {
            // @ts-ignore
            args.unshift(argv.name);
        }
        //console.dir(argv);
        if (!args.length) {
            //			yargs.showHelp();
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
        }
        dedupe_1.wrapDedupe(require('yargs'), argv, {
            before(yarg, argv, cache) {
                index_1.printRootData(cache.rootData, argv);
            },
            main(yarg, argv, cache) {
                // @ts-ignore
                let flags = add_1.flagsYarnAdd(argv).filter(v => v != null);
                let cmd_argv = [
                    'add',
                    ...args,
                    ...flags,
                ].filter(v => v != null);
                index_1.consoleDebug.debug(cmd_argv);
                let cp = crossSpawn.sync('yarn', cmd_argv, {
                    cwd: argv.cwd,
                    stdio: 'inherit',
                });
                if (cp.error) {
                    throw cp.error;
                }
                if (argv.types) {
                    let cp = crossSpawn.sync('node', [
                        require.resolve(index_2.YT_BIN),
                        'types',
                        ...args,
                        ...flags,
                    ], {
                        cwd: argv.cwd,
                        stdio: 'inherit',
                    });
                }
            },
            after(yarg, argv, cache) {
                if (!cache.rootData.isWorkspace && cache.rootData.hasWorkspace) {
                    crossSpawn.sync('yarn', [], {
                        cwd: cache.rootData.ws,
                        stdio: 'inherit',
                    });
                }
            },
            end(yarg, argv, cache) {
                //console.dir(infoFromDedupeCache(cache));
                if (cache.yarnlock_msg) {
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUU5RSwyQ0FBaUY7QUFLakYsaURBQXVFO0FBRXZFLDJDQUF1RztBQUN2RyxnREFBaUQ7QUFDakQsdUNBQXFDO0FBRXJDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSxvQkFBb0I7SUFFOUIsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLElBQUksRUFBRSwrQkFBK0I7WUFDckMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUNyQjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNiO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUNiO1lBQ0MsYUFBYTtZQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsb0JBQW9CO1FBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUNoQjtZQUNGLHNCQUFzQjtZQUVuQixvQkFBWSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1lBRXZFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QjtRQUVELG1CQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRTtZQUVsQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUV2QixxQkFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckMsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXJCLGFBQWE7Z0JBQ2IsSUFBSSxLQUFLLEdBQUcsa0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBRXRELElBQUksUUFBUSxHQUFHO29CQUNkLEtBQUs7b0JBRUwsR0FBRyxJQUFJO29CQUVQLEdBQUcsS0FBSztpQkFFUixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFFekIsb0JBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTdCLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtvQkFDMUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO29CQUNiLEtBQUssRUFBRSxTQUFTO2lCQUNoQixDQUFDLENBQUM7Z0JBRUgsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUNaO29CQUNDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQTtpQkFDZDtnQkFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQ2Q7b0JBQ0MsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ2hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBTSxDQUFDO3dCQUV2QixPQUFPO3dCQUVQLEdBQUcsSUFBSTt3QkFFUCxHQUFHLEtBQUs7cUJBQ1IsRUFBRTt3QkFDRixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7d0JBQ2IsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQTtpQkFDRjtZQUNGLENBQUM7WUFFRCxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUd0QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQzlEO29CQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRTt3QkFDM0IsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDdEIsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztpQkFDSDtZQUVGLENBQUM7WUFFRCxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVwQiwwQ0FBMEM7Z0JBRTFDLElBQUksS0FBSyxDQUFDLFlBQVksRUFDdEI7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO2lCQUN6QztZQUNGLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBwcmludFJvb3REYXRhIH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoJ3lhcmdzJyk7XG5pbXBvcnQgeyBleGlzdHNEZXBlbmRlbmNpZXMsIGZsYWdzWWFybkFkZCwgbGlzdFRvVHlwZXMsIHNldHVwWWFybkFkZFRvWWFyZ3MgfSBmcm9tICcuLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBZVF9CSU4gfSBmcm9tICcuLi8uLi9pbmRleCc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbbmFtZV0nLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYEluc3RhbGxzIGEgcGFja2FnZWAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzKVxuXHRcdFx0Lm9wdGlvbigndHlwZXMnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ3R5cGUnXSxcblx0XHRcdFx0ZGVzYzogYHRyeSBhdXRvIGluc3RhbGwgQHR5cGVzLyogdG9vYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCBhcmdzID0gYXJndi5fLnNsaWNlKCk7XG5cblx0XHRpZiAoYXJnc1swXSA9PT0gJ2FkZCcpXG5cdFx0e1xuXHRcdFx0YXJncy5zaGlmdCgpO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2Lm5hbWUpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0YXJncy51bnNoaWZ0KGFyZ3YubmFtZSk7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihhcmd2KTtcblxuXHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0e1xuLy9cdFx0XHR5YXJncy5zaG93SGVscCgpO1xuXG5cdFx0XHRjb25zb2xlRGVidWcuZXJyb3IoYE1pc3NpbmcgbGlzdCBvZiBwYWNrYWdlcyB0byBhZGQgdG8geW91ciBwcm9qZWN0LmApO1xuXG5cdFx0XHRyZXR1cm4gcHJvY2Vzcy5leGl0KDEpO1xuXHRcdH1cblxuXHRcdHdyYXBEZWR1cGUocmVxdWlyZSgneWFyZ3MnKSwgYXJndiwge1xuXG5cdFx0XHRiZWZvcmUoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdHByaW50Um9vdERhdGEoY2FjaGUucm9vdERhdGEsIGFyZ3YpO1xuXHRcdFx0fSxcblxuXHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHQuLi5hcmdzLFxuXG5cdFx0XHRcdFx0Li4uZmxhZ3MsXG5cblx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhjbWRfYXJndik7XG5cblx0XHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi50eXBlcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygnbm9kZScsIFtcblx0XHRcdFx0XHRcdHJlcXVpcmUucmVzb2x2ZShZVF9CSU4pLFxuXG5cdFx0XHRcdFx0XHQndHlwZXMnLFxuXG5cdFx0XHRcdFx0XHQuLi5hcmdzLFxuXG5cdFx0XHRcdFx0XHQuLi5mbGFncyxcblx0XHRcdFx0XHRdLCB7XG5cdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRhZnRlcih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblxuXHRcdFx0XHRpZiAoIWNhY2hlLnJvb3REYXRhLmlzV29ya3NwYWNlICYmIGNhY2hlLnJvb3REYXRhLmhhc1dvcmtzcGFjZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRjd2Q6IGNhY2hlLnJvb3REYXRhLndzLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9LFxuXG5cdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXG5cdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHtjYWNoZS55YXJubG9ja19tc2d9XFxuYCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==