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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUU5RSwyQ0FBaUY7QUFLakYsaURBQXVFO0FBRXZFLDJDQUF1RztBQUN2RyxnREFBaUQ7QUFDakQsdUNBQXFDO0FBRXJDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSxvQkFBb0I7SUFFOUIsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLElBQUksRUFBRSwrQkFBK0I7WUFDckMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFDckI7WUFDQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFDYjtZQUNDLGFBQWE7WUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELG9CQUFvQjtRQUVwQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFDaEI7WUFDRixzQkFBc0I7WUFFbkIsb0JBQVksQ0FBQyxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztZQUV2RSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkI7UUFFRCxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUU7WUFFbEMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFdkIscUJBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVyQixhQUFhO2dCQUNiLElBQUksS0FBSyxHQUFHLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLFFBQVEsR0FBRztvQkFDZCxLQUFLO29CQUVMLEdBQUcsSUFBSTtvQkFFUCxHQUFHLEtBQUs7aUJBRVIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBRXpCLG9CQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU3QixJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7b0JBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztvQkFDYixLQUFLLEVBQUUsU0FBUztpQkFDaEIsQ0FBQyxDQUFDO2dCQUVILElBQUksRUFBRSxDQUFDLEtBQUssRUFDWjtvQkFDQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUE7aUJBQ2Q7Z0JBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUNkO29CQUNDLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNoQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQU0sQ0FBQzt3QkFFdkIsT0FBTzt3QkFFUCxHQUFHLElBQUk7d0JBRVAsR0FBRyxLQUFLO3FCQUNSLEVBQUU7d0JBQ0YsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO3dCQUNiLEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUE7aUJBQ0Y7WUFDRixDQUFDO1lBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFHdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUM5RDtvQkFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3RCLEtBQUssRUFBRSxTQUFTO3FCQUNoQixDQUFDLENBQUM7aUJBQ0g7WUFFRixDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsMENBQTBDO2dCQUUxQyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQztpQkFDekM7WUFDRixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgcHJpbnRSb290RGF0YSB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7IGV4aXN0c0RlcGVuZGVuY2llcywgZmxhZ3NZYXJuQWRkLCBsaXN0VG9UeXBlcywgc2V0dXBZYXJuQWRkVG9ZYXJncyB9IGZyb20gJy4uLy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcbmltcG9ydCB7IFlUX0JJTiB9IGZyb20gJy4uLy4uL2luZGV4JztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtuYW1lXScsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgSW5zdGFsbHMgYSBwYWNrYWdlYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwWWFybkFkZFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQub3B0aW9uKCd0eXBlcycsIHtcblx0XHRcdFx0YWxpYXM6IFsndHlwZSddLFxuXHRcdFx0XHRkZXNjOiBgdHJ5IGF1dG8gaW5zdGFsbCBAdHlwZXMvKiB0b29gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgYXJncyA9IGFyZ3YuXy5zbGljZSgpO1xuXG5cdFx0aWYgKGFyZ3NbMF0gPT09ICdhZGQnKVxuXHRcdHtcblx0XHRcdGFyZ3Muc2hpZnQoKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5uYW1lKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGFyZ3MudW5zaGlmdChhcmd2Lm5hbWUpO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIoYXJndik7XG5cblx0XHRpZiAoIWFyZ3MubGVuZ3RoKVxuXHRcdHtcbi8vXHRcdFx0eWFyZ3Muc2hvd0hlbHAoKTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHR3cmFwRGVkdXBlKHJlcXVpcmUoJ3lhcmdzJyksIGFyZ3YsIHtcblxuXHRcdFx0YmVmb3JlKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRwcmludFJvb3REYXRhKGNhY2hlLnJvb3REYXRhLCBhcmd2KTtcblx0XHRcdH0sXG5cblx0XHRcdG1haW4oeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IGZsYWdzID0gZmxhZ3NZYXJuQWRkKGFyZ3YpLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cblx0XHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHRcdCdhZGQnLFxuXG5cdFx0XHRcdFx0Li4uYXJncyxcblxuXHRcdFx0XHRcdC4uLmZsYWdzLFxuXG5cdFx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoY21kX2FyZ3YpO1xuXG5cdFx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygneWFybicsIGNtZF9hcmd2LCB7XG5cdFx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoY3AuZXJyb3IpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aHJvdyBjcC5lcnJvclxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFyZ3YudHlwZXMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ25vZGUnLCBbXG5cdFx0XHRcdFx0XHRyZXF1aXJlLnJlc29sdmUoWVRfQklOKSxcblxuXHRcdFx0XHRcdFx0J3R5cGVzJyxcblxuXHRcdFx0XHRcdFx0Li4uYXJncyxcblxuXHRcdFx0XHRcdFx0Li4uZmxhZ3MsXG5cdFx0XHRcdFx0XSwge1xuXHRcdFx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cblx0XHRcdFx0aWYgKCFjYWNoZS5yb290RGF0YS5pc1dvcmtzcGFjZSAmJiBjYWNoZS5yb290RGF0YS5oYXNXb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0Y3dkOiBjYWNoZS5yb290RGF0YS53cyxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblxuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7Y2FjaGUueWFybmxvY2tfbXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=