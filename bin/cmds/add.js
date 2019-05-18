"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("path");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const dedupe_1 = require("../../lib/cli/dedupe");
const add_1 = require("../../lib/cli/add");
const crossSpawn = require("cross-spawn-extra");
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
        });
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
                    let { rootData } = cache;
                    let pkg_file = path.join(rootData.pkg, 'package.json');
                    let pkg = package_dts_1.readPackageJson(pkg_file);
                    let args_types = add_1.listToTypes(args);
                    if (args_types.length) {
                        let flags2 = flags.slice();
                        if (!argv.optional && !argv.peer && !argv.dev) {
                            flags2.push('-D');
                        }
                        args_types
                            .forEach(name => {
                            if (add_1.existsDependencies(name, pkg)) {
                                return;
                            }
                            let cmd_argv = [
                                'add',
                                name,
                                ...flags2,
                            ].filter(v => v != null);
                            index_1.consoleDebug.debug(cmd_argv);
                            let cp = crossSpawn.sync('yarn', cmd_argv, {
                                cwd: argv.cwd,
                            });
                        });
                    }
                }
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(cache.yarnlock_msg);
                }
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSw2QkFBOEI7QUFDOUIsMkNBQWtFO0FBQ2xFLHNEQUF1RDtBQUl2RCxpREFBdUU7QUFFdkUsMkNBQXVHO0FBQ3ZHLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTO0lBQzlDLGNBQWM7SUFDZCxRQUFRLEVBQUUsb0JBQW9CO0lBRTlCLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyx5QkFBbUIsQ0FBQyxLQUFLLENBQUM7YUFDL0IsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDZixJQUFJLEVBQUUsK0JBQStCO1lBQ3JDLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQ3JCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxvQkFBb0I7UUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCO1lBQ0Ysc0JBQXNCO1lBRW5CLG9CQUFZLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFFdkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsbUJBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFO1lBRWxDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXJCLGFBQWE7Z0JBQ2IsSUFBSSxLQUFLLEdBQUcsa0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBRXRELElBQUksUUFBUSxHQUFHO29CQUNkLEtBQUs7b0JBRUwsR0FBRyxJQUFJO29CQUVQLEdBQUcsS0FBSztpQkFFUixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFFekIsb0JBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTdCLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtvQkFDMUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO29CQUNiLEtBQUssRUFBRSxTQUFTO2lCQUNoQixDQUFDLENBQUM7Z0JBRUgsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUNaO29CQUNDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQTtpQkFDZDtnQkFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQ2Q7b0JBQ0MsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztvQkFFekIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUV2RCxJQUFJLEdBQUcsR0FBRyw2QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUVwQyxJQUFJLFVBQVUsR0FBRyxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVuQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQ3JCO3dCQUNDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFDN0M7NEJBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDbEI7d0JBRUQsVUFBVTs2QkFDUixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBR2YsSUFBSSx3QkFBa0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQ2pDO2dDQUNDLE9BQU87NkJBQ1A7NEJBRUQsSUFBSSxRQUFRLEdBQUc7Z0NBQ2QsS0FBSztnQ0FFTCxJQUFJO2dDQUVKLEdBQUcsTUFBTTs2QkFFVCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQzs0QkFFekIsb0JBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBRTdCLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtnQ0FDMUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHOzZCQUViLENBQUMsQ0FBQzt3QkFDSixDQUFDLENBQUMsQ0FDRjtxQkFDRDtpQkFDRDtZQUNGLENBQUM7WUFFRCxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVwQixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNoQztnQkFFRCxlQUFPLENBQUMsR0FBRyxDQUFDLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHsgZXhpc3RzRGVwZW5kZW5jaWVzLCBmbGFnc1lhcm5BZGQsIGxpc3RUb1R5cGVzLCBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgW25hbWVdJyxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBJbnN0YWxscyBhIHBhY2thZ2VgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuQWRkVG9ZYXJncyh5YXJncylcblx0XHRcdC5vcHRpb24oJ3R5cGVzJywge1xuXHRcdFx0XHRhbGlhczogWyd0eXBlJ10sXG5cdFx0XHRcdGRlc2M6IGB0cnkgYXV0byBpbnN0YWxsIEB0eXBlcy8qIHRvb2AsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCBhcmdzID0gYXJndi5fLnNsaWNlKCk7XG5cblx0XHRpZiAoYXJnc1swXSA9PT0gJ2FkZCcpXG5cdFx0e1xuXHRcdFx0YXJncy5zaGlmdCgpO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2Lm5hbWUpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0YXJncy51bnNoaWZ0KGFyZ3YubmFtZSk7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmRpcihhcmd2KTtcblxuXHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0e1xuLy9cdFx0XHR5YXJncy5zaG93SGVscCgpO1xuXG5cdFx0XHRjb25zb2xlRGVidWcuZXJyb3IoYE1pc3NpbmcgbGlzdCBvZiBwYWNrYWdlcyB0byBhZGQgdG8geW91ciBwcm9qZWN0LmApO1xuXG5cdFx0XHRyZXR1cm4gcHJvY2Vzcy5leGl0KDEpO1xuXHRcdH1cblxuXHRcdHdyYXBEZWR1cGUocmVxdWlyZSgneWFyZ3MnKSwgYXJndiwge1xuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBmbGFncyA9IGZsYWdzWWFybkFkZChhcmd2KS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdC4uLmFyZ3MsXG5cblx0XHRcdFx0XHQuLi5mbGFncyxcblxuXHRcdFx0XHRdLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGNwLmVycm9yKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgY3AuZXJyb3Jcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhcmd2LnR5cGVzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHsgcm9vdERhdGEgfSA9IGNhY2hlO1xuXG5cdFx0XHRcdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0XHRcdFx0bGV0IHBrZyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZSk7XG5cblx0XHRcdFx0XHRsZXQgYXJnc190eXBlcyA9IGxpc3RUb1R5cGVzKGFyZ3MpO1xuXG5cdFx0XHRcdFx0aWYgKGFyZ3NfdHlwZXMubGVuZ3RoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBmbGFnczIgPSBmbGFncy5zbGljZSgpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWFyZ3Yub3B0aW9uYWwgJiYgIWFyZ3YucGVlciAmJiAhYXJndi5kZXYpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGZsYWdzMi5wdXNoKCctRCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRhcmdzX3R5cGVzXG5cdFx0XHRcdFx0XHRcdC5mb3JFYWNoKG5hbWUgPT5cblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGV4aXN0c0RlcGVuZGVuY2llcyhuYW1lLCBwa2cpKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdFx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdFx0XHRcdFx0bmFtZSxcblxuXHRcdFx0XHRcdFx0XHRcdFx0Li4uZmxhZ3MyLFxuXG5cdFx0XHRcdFx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygneWFybicsIGNtZF9hcmd2LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly9zdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coY2FjaGUueWFybmxvY2tfbXNnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==