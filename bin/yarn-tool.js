#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const updateNotifier = require("update-notifier");
const pkg = require("../package.json");
const path = require("path");
const fs = require("fs-extra");
const crossSpawn = require("cross-spawn-extra");
const index_1 = require("../lib/index");
const dedupe_1 = require("../lib/cli/dedupe");
const add_1 = require("../lib/cli/add");
const install_1 = require("../lib/cli/install");
const cli_1 = require("../lib/cli");
updateNotifier({ pkg }).notify();
let cli = cli_1.getYargs();
cli = cli
    //.usage('$0 <dedupe> [cwd]')
    .command('dedupe [cwd]', `Data deduplication for yarn.lock`, ...cli_1.create_command(cli, 'dedupe', (argv) => {
    let root = index_1.findRoot(argv, true);
    let hasWorkspace = root.ws != null;
    let yarnlock_cache = index_1.fsYarnLock(root.root);
    let { yarnlock_file, yarnlock_exists, yarnlock_old } = yarnlock_cache;
    index_1.consoleDebug.info(`Deduplication yarn.lock`);
    index_1.consoleDebug.gray.info(`${yarnlock_file}`);
    if (!yarnlock_exists) {
        index_1.consoleDebug.error(`yarn.lock not exists`);
        return;
    }
    let ret = dedupe_1.Dedupe(yarnlock_old);
    let msg = index_1.yarnLockDiff(ret.yarnlock_old, ret.yarnlock_new);
    if (msg) {
        fs.writeFileSync(yarnlock_file, ret.yarnlock_new);
        index_1.console.log(msg);
    }
    else {
        index_1.consoleDebug.warn(`yarn.lock no need data deduplication`);
    }
}))
    .command('add [name]', ``, (yargs) => {
    return add_1.setupYarnAddToYargs(yargs)
        .option('types', {
        desc: `try auto install @types/*`,
        boolean: true,
    });
}, (argv) => {
    let args = argv._.slice();
    if (args[0] === 'add') {
        args.shift();
    }
    if (argv.name) {
        args.unshift(argv.name);
    }
    //console.dir(argv);
    if (!args.length) {
        //			yargs.showHelp();
        index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
        return process.exit(1);
    }
    dedupe_1.wrapDedupe(yargs, argv, {
        main(yarg, argv, cache) {
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
                let pkg = fs.readJSONSync(pkg_file);
                let args_types = add_1.listToTypes(args);
                if (args_types.length) {
                    args_types
                        .forEach(name => {
                        if (add_1.existsDependencies(name, pkg)) {
                            return;
                        }
                        let cmd_argv = [
                            'add',
                            name,
                            ...flags,
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
})
    .command('install [cwd]', `do dedupe when yarn install`, (yargs) => {
    return install_1.default(yargs);
}, function (argv) {
    const { cwd } = argv;
    let _once = true;
    dedupe_1.wrapDedupe(yargs, argv, {
        before(yarg, argv, cache) {
            let info = dedupe_1.infoFromDedupeCache(cache);
            if (!info.yarnlock_old_exists) {
                crossSpawn.sync('yarn', [], {
                    cwd,
                    stdio: 'inherit',
                });
                _once = false;
            }
        },
        main(yarg, argv, cache) {
            let info = dedupe_1.infoFromDedupeCache(cache);
            if (info.yarnlock_changed) {
                index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
            }
            if (_once || info.yarnlock_changed) {
                crossSpawn.sync('yarn', [], {
                    cwd,
                    stdio: 'inherit',
                });
                _once = true;
            }
        },
        after(yarg, argv, cache) {
            let info = dedupe_1.infoFromDedupeCache(cache);
            if (_once && info.yarnlock_changed) {
                index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
                crossSpawn.sync('yarn', [], {
                    cwd,
                    stdio: 'inherit',
                });
                _once = false;
            }
        },
        end(yarg, argv, cache) {
            if (cache.yarnlock_msg) {
                index_1.console.log(cache.yarnlock_msg);
            }
            index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
        },
    });
    return;
})
    .demandCommand();
cli.argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi10b29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieWFybi10b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtCQUFnQztBQUNoQyxrREFBbUQ7QUFDbkQsdUNBQXdDO0FBQ3hDLDZCQUE4QjtBQUM5QiwrQkFBZ0M7QUFDaEMsZ0RBQWlEO0FBQ2pELHdDQUF5RjtBQUN6Riw4Q0FBNEU7QUFDNUUsd0NBQW9HO0FBQ3BHLGdEQUF5RDtBQUV6RCxvQ0FBc0Q7QUFFdEQsY0FBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVqQyxJQUFJLEdBQUcsR0FBRyxjQUFRLEVBQUUsQ0FBQztBQUVyQixHQUFHLEdBQUcsR0FBRztJQUNULDZCQUE2QjtLQUMzQixPQUFPLENBQUMsY0FBYyxFQUFFLGtDQUFrQyxFQUFFLEdBQUcsb0JBQWMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFFdEcsSUFBSSxJQUFJLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUM7SUFFbkMsSUFBSSxjQUFjLEdBQUcsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFM0MsSUFBSSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLEdBQUcsY0FBYyxDQUFDO0lBRXRFLG9CQUFZLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDN0Msb0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUUzQyxJQUFJLENBQUMsZUFBZSxFQUNwQjtRQUNDLG9CQUFZLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFM0MsT0FBTztLQUNQO0lBRUQsSUFBSSxHQUFHLEdB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QUFDLFlBQVksRUFDdEI7Z0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDaEM7WUFFRCxlQUFPLENBQUMsR0FBRyxDQUFDLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUVELENBQUMsQ0FBQztJQUVILE9BQU87QUFDUixDQUFDLENBQUM7S0FDRCxhQUFhLEVBQUUsQ0FDaEI7QUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHVwZGF0ZU5vdGlmaWVyID0gcmVxdWlyZSgndXBkYXRlLW5vdGlmaWVyJyk7XG5pbXBvcnQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrLCB5YXJuTG9ja0RpZmYgfSBmcm9tICcuLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgRGVkdXBlLCBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgZXhpc3RzRGVwZW5kZW5jaWVzLCBmbGFnc1lhcm5BZGQsIGxpc3RUb1R5cGVzLCBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IHNldHVwWWFybkluc3RhbGxUb1lhcmdzIGZyb20gJy4uL2xpYi9jbGkvaW5zdGFsbCc7XG5cbmltcG9ydCB7IGNyZWF0ZV9jb21tYW5kLCBnZXRZYXJncyB9IGZyb20gJy4uL2xpYi9jbGknO1xuXG51cGRhdGVOb3RpZmllcih7IHBrZyB9KS5ub3RpZnkoKTtcblxubGV0IGNsaSA9IGdldFlhcmdzKCk7XG5cbmNsaSA9IGNsaVxuLy8udXNhZ2UoJyQwIDxkZWR1cGU+IFtjd2RdJylcblx0LmNvbW1hbmQoJ2RlZHVwZSBbY3dkXScsIGBEYXRhIGRlZHVwbGljYXRpb24gZm9yIHlhcm4ubG9ja2AsIC4uLmNyZWF0ZV9jb21tYW5kKGNsaSwgJ2RlZHVwZScsIChhcmd2KSA9PlxuXHR7XG5cdFx0bGV0IHJvb3QgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblx0XHRsZXQgaGFzV29ya3NwYWNlID0gcm9vdC53cyAhPSBudWxsO1xuXG5cdFx0bGV0IHlhcm5sb2NrX2NhY2hlID0gZnNZYXJuTG9jayhyb290LnJvb3QpO1xuXG5cdFx0bGV0IHsgeWFybmxvY2tfZmlsZSwgeWFybmxvY2tfZXhpc3RzLCB5YXJubG9ja19vbGQgfSA9IHlhcm5sb2NrX2NhY2hlO1xuXG5cdFx0Y29uc29sZURlYnVnLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0Y29uc29sZURlYnVnLmdyYXkuaW5mbyhgJHt5YXJubG9ja19maWxlfWApO1xuXG5cdFx0aWYgKCF5YXJubG9ja19leGlzdHMpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGB5YXJuLmxvY2sgbm90IGV4aXN0c2ApO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IERlZHVwZSh5YXJubG9ja19vbGQpO1xuXG5cdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihyZXQueWFybmxvY2tfb2xkLCByZXQueWFybmxvY2tfbmV3KTtcblxuXHRcdGlmIChtc2cpXG5cdFx0e1xuXHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5YXJubG9ja19maWxlLCByZXQueWFybmxvY2tfbmV3KTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGB5YXJuLmxvY2sgbm8gbmVlZCBkYXRhIGRlZHVwbGljYXRpb25gKTtcblx0XHR9XG5cdH0pKVxuXHQuY29tbWFuZCgnYWRkIFtuYW1lXScsIGBgLCAoeWFyZ3MpID0+XG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuQWRkVG9ZYXJncyh5YXJncylcblx0XHRcdC5vcHRpb24oJ3R5cGVzJywge1xuXHRcdFx0XHRkZXNjOiBgdHJ5IGF1dG8gaW5zdGFsbCBAdHlwZXMvKmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9LCAoYXJndikgPT5cblx0e1xuXG5cdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdGlmIChhcmdzWzBdID09PSAnYWRkJylcblx0XHR7XG5cdFx0XHRhcmdzLnNoaWZ0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YubmFtZSlcblx0XHR7XG5cdFx0XHRhcmdzLnVuc2hpZnQoYXJndi5uYW1lKTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUuZGlyKGFyZ3YpO1xuXG5cdFx0aWYgKCFhcmdzLmxlbmd0aClcblx0XHR7XG4vL1x0XHRcdHlhcmdzLnNob3dIZWxwKCk7XG5cblx0XHRcdGNvbnNvbGVEZWJ1Zy5lcnJvcihgTWlzc2luZyBsaXN0IG9mIHBhY2thZ2VzIHRvIGFkZCB0byB5b3VyIHByb2plY3QuYCk7XG5cblx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXG5cdFx0d3JhcERlZHVwZSh5YXJncywgYXJndiwge1xuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHQuLi5hcmdzLFxuXG5cdFx0XHRcdFx0Li4uZmxhZ3MsXG5cblx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhjbWRfYXJndik7XG5cblx0XHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi50eXBlcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB7IHJvb3REYXRhIH0gPSBjYWNoZTtcblxuXHRcdFx0XHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdFx0XHRcdGxldCBwa2cgPSBmcy5yZWFkSlNPTlN5bmMocGtnX2ZpbGUpO1xuXG5cdFx0XHRcdFx0bGV0IGFyZ3NfdHlwZXMgPSBsaXN0VG9UeXBlcyhhcmdzKTtcblxuXHRcdFx0XHRcdGlmIChhcmdzX3R5cGVzLmxlbmd0aClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhcmdzX3R5cGVzXG5cdFx0XHRcdFx0XHRcdC5mb3JFYWNoKG5hbWUgPT5cblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGV4aXN0c0RlcGVuZGVuY2llcyhuYW1lLCBwa2cpKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdFx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdFx0XHRcdFx0bmFtZSxcblxuXHRcdFx0XHRcdFx0XHRcdFx0Li4uZmxhZ3MsXG5cblx0XHRcdFx0XHRcdFx0XHRdLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoY21kX2FyZ3YpO1xuXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0XHRcdFx0XHRcdFx0XHQvL3N0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhjYWNoZS55YXJubG9ja19tc2cpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0fSxcblx0XHR9KTtcblxuXHR9KVxuXHQuY29tbWFuZCgnaW5zdGFsbCBbY3dkXScsIGBkbyBkZWR1cGUgd2hlbiB5YXJuIGluc3RhbGxgLCAoeWFyZ3MpID0+XG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuSW5zdGFsbFRvWWFyZ3MoeWFyZ3MpO1xuXHR9LCBmdW5jdGlvbiAoYXJndilcblx0e1xuXHRcdGNvbnN0IHsgY3dkIH0gPSBhcmd2O1xuXG5cdFx0bGV0IF9vbmNlID0gdHJ1ZTtcblxuXHRcdHdyYXBEZWR1cGUoeWFyZ3MsIGFyZ3YsIHtcblxuXHRcdFx0YmVmb3JlKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmICghaW5mby55YXJubG9ja19vbGRfZXhpc3RzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdGlmIChpbmZvLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoX29uY2UgfHwgaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRfb25jZSA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSxcblxuXHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0aWYgKF9vbmNlICYmIGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgeWFybi5sb2NrIGNoYW5nZWQsIGRvIGluc3RhbGwgYWdhaW5gKTtcblxuXHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coY2FjaGUueWFybmxvY2tfbXNnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdH0sXG5cblx0XHR9KTtcblxuXHRcdHJldHVybjtcblx0fSlcblx0LmRlbWFuZENvbW1hbmQoKVxuO1xuXG5jbGkuYXJndjtcblxuIl19