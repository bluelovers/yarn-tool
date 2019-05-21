"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSwrQkFBZ0M7QUFDaEMsMkNBQWlGO0FBQ2pGLHNEQUF1RDtBQUl2RCxpREFBdUU7QUFFdkUsMkNBQXVHO0FBQ3ZHLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTO0lBQzlDLGNBQWM7SUFDZCxRQUFRLEVBQUUsb0JBQW9CO0lBRTlCLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyx5QkFBbUIsQ0FBQyxLQUFLLENBQUM7YUFDL0IsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDZixJQUFJLEVBQUUsK0JBQStCO1lBQ3JDLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQ3JCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxvQkFBb0I7UUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCO1lBQ0Ysc0JBQXNCO1lBRW5CLG9CQUFZLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFFdkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsbUJBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFO1lBRWxDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXZCLHFCQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFckIsYUFBYTtnQkFDYixJQUFJLEtBQUssR0FBRyxrQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFFdEQsSUFBSSxRQUFRLEdBQUc7b0JBQ2QsS0FBSztvQkFFTCxHQUFHLElBQUk7b0JBRVAsR0FBRyxLQUFLO2lCQUVSLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUV6QixvQkFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFN0IsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO29CQUMxQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7b0JBQ2IsS0FBSyxFQUFFLFNBQVM7aUJBQ2hCLENBQUMsQ0FBQztnQkFFSCxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQ1o7b0JBQ0MsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFBO2lCQUNkO2dCQUVELElBQUksSUFBSSxDQUFDLEtBQUssRUFDZDtvQkFDQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDO29CQUV6QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBRXZELElBQUksR0FBRyxHQUFHLDZCQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRXBDLElBQUksVUFBVSxHQUFHLGlCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRW5DLElBQUksVUFBVSxDQUFDLE1BQU0sRUFDckI7d0JBQ0MsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUUzQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUM3Qzs0QkFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUNsQjt3QkFFRCxVQUFVOzZCQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFHZixJQUFJLHdCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFDakM7Z0NBQ0MsT0FBTzs2QkFDUDs0QkFFRCxJQUFJLFFBQVEsR0FBRztnQ0FDZCxLQUFLO2dDQUVMLElBQUk7Z0NBRUosR0FBRyxNQUFNOzZCQUVULENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDOzRCQUV6QixvQkFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFFN0IsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO2dDQUMxQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7NkJBRWIsQ0FBQyxDQUFDO3dCQUNKLENBQUMsQ0FBQyxDQUNGO3FCQUNEO2lCQUNEO1lBQ0YsQ0FBQztZQUVELEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBR3RCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksRUFDOUQ7b0JBQ0MsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO3dCQUMzQixHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUN0QixLQUFLLEVBQUUsU0FBUztxQkFDaEIsQ0FBQyxDQUFDO2lCQUNIO1lBRUYsQ0FBQztZQUVELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXBCLDBDQUEwQztnQkFFMUMsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUN0QjtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7aUJBQ3pDO1lBQ0YsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIHByaW50Um9vdERhdGEgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoJ3lhcmdzJyk7XG5pbXBvcnQgeyBleGlzdHNEZXBlbmRlbmNpZXMsIGZsYWdzWWFybkFkZCwgbGlzdFRvVHlwZXMsIHNldHVwWWFybkFkZFRvWWFyZ3MgfSBmcm9tICcuLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbbmFtZV0nLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYEluc3RhbGxzIGEgcGFja2FnZWAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzKVxuXHRcdFx0Lm9wdGlvbigndHlwZXMnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ3R5cGUnXSxcblx0XHRcdFx0ZGVzYzogYHRyeSBhdXRvIGluc3RhbGwgQHR5cGVzLyogdG9vYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdGlmIChhcmdzWzBdID09PSAnYWRkJylcblx0XHR7XG5cdFx0XHRhcmdzLnNoaWZ0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YubmFtZSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmdzLnVuc2hpZnQoYXJndi5uYW1lKTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKGFyZ3YpO1xuXG5cdFx0aWYgKCFhcmdzLmxlbmd0aClcblx0XHR7XG4vL1x0XHRcdHlhcmdzLnNob3dIZWxwKCk7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5lcnJvcihgTWlzc2luZyBsaXN0IG9mIHBhY2thZ2VzIHRvIGFkZCB0byB5b3VyIHByb2plY3QuYCk7XG5cblx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXG5cdFx0d3JhcERlZHVwZShyZXF1aXJlKCd5YXJncycpLCBhcmd2LCB7XG5cblx0XHRcdGJlZm9yZSh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0cHJpbnRSb290RGF0YShjYWNoZS5yb290RGF0YSwgYXJndik7XG5cdFx0XHR9LFxuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBmbGFncyA9IGZsYWdzWWFybkFkZChhcmd2KS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdC4uLmFyZ3MsXG5cblx0XHRcdFx0XHQuLi5mbGFncyxcblxuXHRcdFx0XHRdLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGNwLmVycm9yKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgY3AuZXJyb3Jcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhcmd2LnR5cGVzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHsgcm9vdERhdGEgfSA9IGNhY2hlO1xuXG5cdFx0XHRcdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0XHRcdFx0bGV0IHBrZyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZSk7XG5cblx0XHRcdFx0XHRsZXQgYXJnc190eXBlcyA9IGxpc3RUb1R5cGVzKGFyZ3MpO1xuXG5cdFx0XHRcdFx0aWYgKGFyZ3NfdHlwZXMubGVuZ3RoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBmbGFnczIgPSBmbGFncy5zbGljZSgpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIWFyZ3Yub3B0aW9uYWwgJiYgIWFyZ3YucGVlciAmJiAhYXJndi5kZXYpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGZsYWdzMi5wdXNoKCctRCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRhcmdzX3R5cGVzXG5cdFx0XHRcdFx0XHRcdC5mb3JFYWNoKG5hbWUgPT5cblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGV4aXN0c0RlcGVuZGVuY2llcyhuYW1lLCBwa2cpKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdFx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdFx0XHRcdFx0bmFtZSxcblxuXHRcdFx0XHRcdFx0XHRcdFx0Li4uZmxhZ3MyLFxuXG5cdFx0XHRcdFx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRcdFx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygneWFybicsIGNtZF9hcmd2LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly9zdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cblx0XHRcdFx0aWYgKCFjYWNoZS5yb290RGF0YS5pc1dvcmtzcGFjZSAmJiBjYWNoZS5yb290RGF0YS5oYXNXb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0Y3dkOiBjYWNoZS5yb290RGF0YS53cyxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblxuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7Y2FjaGUueWFybmxvY2tfbXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=