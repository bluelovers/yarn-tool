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
                    index_1.console.log(`\n${cache.yarnlock_msg}\n`);
                }
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSw2QkFBOEI7QUFDOUIsMkNBQWtFO0FBQ2xFLHNEQUF1RDtBQUl2RCxpREFBdUU7QUFFdkUsMkNBQXVHO0FBQ3ZHLGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTO0lBQzlDLGNBQWM7SUFDZCxRQUFRLEVBQUUsb0JBQW9CO0lBRTlCLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyx5QkFBbUIsQ0FBQyxLQUFLLENBQUM7YUFDL0IsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDZixJQUFJLEVBQUUsK0JBQStCO1lBQ3JDLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQ3JCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxvQkFBb0I7UUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCO1lBQ0Ysc0JBQXNCO1lBRW5CLG9CQUFZLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFFdkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsbUJB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cnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7IGV4aXN0c0RlcGVuZGVuY2llcywgZmxhZ3NZYXJuQWRkLCBsaXN0VG9UeXBlcywgc2V0dXBZYXJuQWRkVG9ZYXJncyB9IGZyb20gJy4uLy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtuYW1lXScsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgSW5zdGFsbHMgYSBwYWNrYWdlYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwWWFybkFkZFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQub3B0aW9uKCd0eXBlcycsIHtcblx0XHRcdFx0YWxpYXM6IFsndHlwZSddLFxuXHRcdFx0XHRkZXNjOiBgdHJ5IGF1dG8gaW5zdGFsbCBAdHlwZXMvKiB0b29gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgYXJncyA9IGFyZ3YuXy5zbGljZSgpO1xuXG5cdFx0aWYgKGFyZ3NbMF0gPT09ICdhZGQnKVxuXHRcdHtcblx0XHRcdGFyZ3Muc2hpZnQoKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5uYW1lKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGFyZ3MudW5zaGlmdChhcmd2Lm5hbWUpO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5kaXIoYXJndik7XG5cblx0XHRpZiAoIWFyZ3MubGVuZ3RoKVxuXHRcdHtcbi8vXHRcdFx0eWFyZ3Muc2hvd0hlbHAoKTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHR3cmFwRGVkdXBlKHJlcXVpcmUoJ3lhcmdzJyksIGFyZ3YsIHtcblxuXHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHQuLi5hcmdzLFxuXG5cdFx0XHRcdFx0Li4uZmxhZ3MsXG5cblx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhjbWRfYXJndik7XG5cblx0XHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi50eXBlcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB7IHJvb3REYXRhIH0gPSBjYWNoZTtcblxuXHRcdFx0XHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdFx0XHRcdGxldCBwa2cgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0XHRcdFx0bGV0IGFyZ3NfdHlwZXMgPSBsaXN0VG9UeXBlcyhhcmdzKTtcblxuXHRcdFx0XHRcdGlmIChhcmdzX3R5cGVzLmxlbmd0aClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgZmxhZ3MyID0gZmxhZ3Muc2xpY2UoKTtcblxuXHRcdFx0XHRcdFx0aWYgKCFhcmd2Lm9wdGlvbmFsICYmICFhcmd2LnBlZXIgJiYgIWFyZ3YuZGV2KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRmbGFnczIucHVzaCgnLUQnKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0YXJnc190eXBlc1xuXHRcdFx0XHRcdFx0XHQuZm9yRWFjaChuYW1lID0+XG5cdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChleGlzdHNEZXBlbmRlbmNpZXMobmFtZSwgcGtnKSlcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHRcdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHRcdFx0XHRcdG5hbWUsXG5cblx0XHRcdFx0XHRcdFx0XHRcdC4uLmZsYWdzMixcblxuXHRcdFx0XHRcdFx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhjbWRfYXJndik7XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0XHRcdFx0XHRcdC8vc3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke2NhY2hlLnlhcm5sb2NrX21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdH0sXG5cdFx0fSk7XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==