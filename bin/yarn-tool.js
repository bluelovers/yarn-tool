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
const semver = require("semver");
const cli_1 = require("../lib/cli");
const pkg_1 = require("../lib/pkg");
const ncu_1 = require("../lib/cli/ncu");
const yarnlock_1 = require("../lib/yarnlock");
updateNotifier({ pkg }).notify();
let cli = cli_1.getYargs()
    .command(cli_1.create_command2({
    command: 'dedupe [cwd]',
    describe: `Data deduplication for yarn.lock`,
    aliases: ['d'],
    handler(argv) {
        dedupe_1.wrapDedupe(yargs, argv, {
            main(yarg, argv, cache) {
            },
            end(yarg, argv, cache) {
                if (cache.yarnlock_msg) {
                    index_1.console.log(cache.yarnlock_msg);
                }
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
            },
        });
    },
}))
    .command(cli_1.create_command2({
    command: 'add [name]',
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/*`,
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
                    let pkg = pkg_1.readPackageJson(pkg_file);
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
}))
    .command(cli_1.create_command2({
    command: 'install [cwd]',
    describe: `do dedupe when yarn install`,
    aliases: ['i'],
    builder: install_1.default,
    handler(argv) {
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
                if (cache.yarnlock_old_exists && cache.yarnlock_msg) {
                    index_1.console.log(cache.yarnlock_msg);
                }
                index_1.console.dir(dedupe_1.infoFromDedupeCache(cache));
            },
        });
        return;
    },
}))
    .command(cli_1.create_command2({
    command: 'ncu',
    aliases: ['update', 'upgrade', 'up'],
    builder: ncu_1.default,
    async handler(argv) {
        const { cwd } = argv;
        let rootData = index_1.findRoot({
            ...argv,
            cwd,
        }, true);
        index_1.console.dir(rootData);
        let pkg_file_root = path.join(rootData.root, 'package.json');
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg_data = pkg_1.readPackageJson(pkg_file);
        let resolutions = pkg_data.resolutions;
        let pkg_file_ws;
        let pkg_data_ws;
        let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;
        if (doWorkspace) {
            pkg_file_ws = path.join(rootData.ws, 'package.json');
            pkg_data_ws = pkg_1.readPackageJson(pkg_file_ws);
            resolutions = pkg_data_ws.resolutions;
        }
        let pkgNcu = await ncu_1.npmCheckUpdates({
            cwd,
            rootData,
        }, {
            ...argv,
            json_old: pkg_data,
        });
        if (pkgNcu.json_changed && argv.upgrade) {
            pkg_1.writeJSONSync(pkg_file, pkgNcu.json_new);
            index_1.consoleDebug.info(`package.json updated`);
        }
        if (argv.dedupe && Object.keys(resolutions).length) {
            let ls = Object.entries(pkgNcu.json_new.dependencies)
                .concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))
                .reduce(function (a, [name, ver_new]) {
                let ver_old = resolutions[name];
                if (ver_old) {
                    a[name] = ver_new;
                }
                return a;
            }, {});
            let yl = index_1.fsYarnLock(rootData.root);
            let yarnlock_old_obj = yarnlock_1.parse(yl.yarnlock_old);
            let result = yarnlock_1.filterResolutions({
                resolutions: ls
            }, yarnlock_old_obj);
            let r2 = result.names
                .filter(name => {
                let n = yarnlock_1.stripDepsName(name);
                let da = result.deps[n[0]];
                if (!da) {
                    return false;
                }
                if (da['*'] || ls[n[0]] == '*') {
                    return true;
                }
                return Object.values(da).some(dr => {
                    if (ls[name] == null) {
                        return true;
                    }
                    let bool = semver.lt(dr.version, ls[name]);
                    return bool;
                });
            })
                .reduce((a, name) => {
                let n = yarnlock_1.stripDepsName(name);
                a.names.push(name);
                a.deps[n[0]] = result.deps[n[0]];
                return a;
            }, {
                names: [],
                deps: {},
            });
            let ret = yarnlock_1.removeResolutionsCore(r2, yarnlock_old_obj);
            if (ret.yarnlock_changed) {
                if (!argv.upgrade) {
                    index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                    index_1.consoleDebug.log(`you can do`, index_1.console.cyan.chalk(`yt ncu -u`));
                }
                else {
                    fs.writeFileSync(yl.yarnlock_file, yarnlock_1.stringify(ret.yarnlock_new));
                    index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                    index_1.consoleDebug.log(`you can do`, index_1.console.cyan.chalk(`yt install`));
                    index_1.consoleDebug.log(`for upgrade dependencies now`);
                }
            }
        }
    },
}))
    .command({
    command: 'publish',
    aliases: ['push'],
    builder(yargs) {
        return yargs
            .option('tag', {
            desc: `Registers the published package with the given tag, such that \`npm install @\` will install this version. By default, \`npm publish\` updates and \`npm install\` installs the \`latest\` tag.`,
            string: true,
        })
            .option('access', {
            desc: `Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.`,
            string: true,
        })
            .option('otp', {
            desc: `If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.`,
            string: true,
        })
            .option('dry-run', {
            desc: `As of npm@6, does everything publish would do except actually publishing to the registry. Reports the details of what would have been published.`,
            boolean: true,
        });
    },
    handler(argv) {
        let cmd_list = [];
        [
            'tag',
            'access',
            'tag',
            'tag',
        ].forEach(k => {
            let v = argv[k];
            if (v) {
                cmd_list.push('--' + k);
                if (typeof v === 'string') {
                    cmd_list.push(v);
                }
            }
        });
        crossSpawn.sync('npm', [
            'publish',
            ...argv._.slice(1),
            ...cmd_list,
        ].filter(v => v != null), {
            stdio: 'inherit',
            cwd: argv.cwd,
        });
    }
});
cli.argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi10b29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieWFybi10b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtCQUFnQztBQUNoQyxrREFBbUQ7QUFDbkQsdUNBQXdDO0FBQ3hDLDZCQUE4QjtBQUM5QiwrQkFBZ0M7QUFDaEMsZ0RBQWlEO0FBQ2pELHdDQUF5RjtBQUN6Riw4Q0FBNEU7QUFDNUUsd0NBQW9HO0FBQ3BHLGdEQUF5RDtBQUN6RCxpQ0FBaUM7QUFFakMsb0NBT29CO0FBQ3BCLG9DQUE0RDtBQUU1RCx3Q0FBa0U7QUFDbEUsOENBT3lCO0FBR3pCLGNBQWMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFakMsSUFBSSxHQUFHLEdBQUcsY0FBUSxFQUFFO0tBQ2xCLE9BQU8sQ0FBQyxxQkFBZSxDQUFxQjtJQUM1QyxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsa0NBQWtDO0lBQzVDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLE9BQU8sQ0FBQyxJQUFJO1FBRVgsbUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFHdEIsQ0FBQztZQUNELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXBCLElBQUksS0FBSyxDQUFDLFlBQVksRUFDdEI7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2hDO2dCQUVELGVBQU8sQ0FBQyxHQUFHLENBQUMsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNELENBQUMsQ0FBQztLQUNGLE9BQU8sQ0FBQyxxQkFBZSxDQUFDO0lBQ3hCLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLE9BQU8sQ0FBQyxL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SSxJQUFJLENBQUMsRUFBRTtZQUN6QixLQUFLLEVBQUUsU0FBUztZQUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDYixDQUFDLENBQUE7SUFDSCxDQUFDO0NBQ0QsQ0FBQyxDQUNGO0FBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB1cGRhdGVOb3RpZmllciA9IHJlcXVpcmUoJ3VwZGF0ZS1ub3RpZmllcicpO1xuaW1wb3J0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jaywgeWFybkxvY2tEaWZmIH0gZnJvbSAnLi4vbGliL2luZGV4JztcbmltcG9ydCB7IERlZHVwZSwgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB7IGV4aXN0c0RlcGVuZGVuY2llcywgZmxhZ3NZYXJuQWRkLCBsaXN0VG9UeXBlcywgc2V0dXBZYXJuQWRkVG9ZYXJncyB9IGZyb20gJy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJncyBmcm9tICcuLi9saWIvY2xpL2luc3RhbGwnO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpXG5cbmltcG9ydCB7XG5cdGNyZWF0ZV9jb21tYW5kLFxuXHRjcmVhdGVfY29tbWFuZDIsXG5cdGR1bW15X2J1aWxkZXIsXG5cdGdldFlhcmdzLFxuXHRJVW5wYWNrTXlZYXJnc0FyZ3YsXG5cdElVbnBhY2tZYXJnc0FyZ3YsXG59IGZyb20gJy4uL2xpYi9jbGknO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uLCB3cml0ZUpTT05TeW5jIH0gZnJvbSAnLi4vbGliL3BrZyc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IG5wbUNoZWNrVXBkYXRlcyB9IGZyb20gJy4uL2xpYi9jbGkvbmN1JztcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJRGVwZW5kZW5jaWVzLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssXG5cdHN0cmluZ2lmeSBhcyBzdHJpbmdpZnlZYXJuTG9jayxcblx0cmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpcERlcHNOYW1lLFxufSBmcm9tICcuLi9saWIveWFybmxvY2snO1xuaW1wb3J0IHsgSVRTSXRlcmF0b3JMYXp5LCBJVFNWYWx1ZU9mQXJyYXkgfSBmcm9tICd0cy10eXBlJztcblxudXBkYXRlTm90aWZpZXIoeyBwa2cgfSkubm90aWZ5KCk7XG5cbmxldCBjbGkgPSBnZXRZYXJncygpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMjxJVW5wYWNrTXlZYXJnc0FyZ3Y+KHtcblx0XHRjb21tYW5kOiAnZGVkdXBlIFtjd2RdJyxcblx0XHRkZXNjcmliZTogYERhdGEgZGVkdXBsaWNhdGlvbiBmb3IgeWFybi5sb2NrYCxcblx0XHRhbGlhc2VzOiBbJ2QnXSxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0d3JhcERlZHVwZSh5YXJncywgYXJndiwge1xuXHRcdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhjYWNoZS55YXJubG9ja19tc2cpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pO1xuXHRcdH0sXG5cdH0pKVxuXHQuY29tbWFuZChjcmVhdGVfY29tbWFuZDIoe1xuXHRcdGNvbW1hbmQ6ICdhZGQgW25hbWVdJyxcblx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdHtcblx0XHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzKVxuXHRcdFx0XHQub3B0aW9uKCd0eXBlcycsIHtcblx0XHRcdFx0XHRhbGlhczogWyd0eXBlJ10sXG5cdFx0XHRcdFx0ZGVzYzogYHRyeSBhdXRvIGluc3RhbGwgQHR5cGVzLypgLFxuXHRcdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0fSxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdFx0aWYgKGFyZ3NbMF0gPT09ICdhZGQnKVxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLnNoaWZ0KCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2Lm5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0YXJncy51bnNoaWZ0KGFyZ3YubmFtZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vY29uc29sZS5kaXIoYXJndik7XG5cblx0XHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0XHR7XG4vL1x0XHRcdHlhcmdzLnNob3dIZWxwKCk7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0XHRyZXR1cm4gcHJvY2Vzcy5leGl0KDEpO1xuXHRcdFx0fVxuXG5cdFx0XHR3cmFwRGVkdXBlKHlhcmdzLCBhcmd2LCB7XG5cblx0XHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBmbGFncyA9IGZsYWdzWWFybkFkZChhcmd2KS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHRcdC4uLmFyZ3MsXG5cblx0XHRcdFx0XHRcdC4uLmZsYWdzLFxuXG5cdFx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygneWFybicsIGNtZF9hcmd2LCB7XG5cdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aHJvdyBjcC5lcnJvclxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhcmd2LnR5cGVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB7IHJvb3REYXRhIH0gPSBjYWNoZTtcblxuXHRcdFx0XHRcdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0XHRcdFx0XHRsZXQgcGtnID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdFx0XHRcdFx0bGV0IGFyZ3NfdHlwZXMgPSBsaXN0VG9UeXBlcyhhcmdzKTtcblxuXHRcdFx0XHRcdFx0aWYgKGFyZ3NfdHlwZXMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgZmxhZ3MyID0gZmxhZ3Muc2xpY2UoKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWFyZ3Yub3B0aW9uYWwgJiYgIWFyZ3YucGVlciAmJiAhYXJndi5kZXYpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRmbGFnczIucHVzaCgnLUQnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGFyZ3NfdHlwZXNcblx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaChuYW1lID0+XG5cdFx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWUsIHBrZykpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC4uLmZsYWdzMixcblxuXHRcdFx0XHRcdFx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoY21kX2FyZ3YpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL3N0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coY2FjaGUueWFybmxvY2tfbXNnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHR9LFxuXHR9KSlcblx0LmNvbW1hbmQoY3JlYXRlX2NvbW1hbmQyKHtcblx0XHRjb21tYW5kOiAnaW5zdGFsbCBbY3dkXScsXG5cdFx0ZGVzY3JpYmU6IGBkbyBkZWR1cGUgd2hlbiB5YXJuIGluc3RhbGxgLFxuXHRcdGFsaWFzZXM6IFsnaSddLFxuXHRcdGJ1aWxkZXI6IHNldHVwWWFybkluc3RhbGxUb1lhcmdzLFxuXHRcdGhhbmRsZXIoYXJndilcblx0XHR7XG5cdFx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdFx0bGV0IF9vbmNlID0gdHJ1ZTtcblxuXHRcdFx0d3JhcERlZHVwZSh5YXJncywgYXJndiwge1xuXG5cdFx0XHRcdGJlZm9yZSh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0XHRpZiAoIWluZm8ueWFybmxvY2tfb2xkX2V4aXN0cylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0XHRpZiAoaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgeWFybi5sb2NrIGNoYW5nZWQsIGRvIGluc3RhbGwgYWdhaW5gKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoX29uY2UgfHwgaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRfb25jZSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdFx0aWYgKF9vbmNlICYmIGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cblx0XHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRfb25jZSA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfb2xkX2V4aXN0cyAmJiBjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coY2FjaGUueWFybmxvY2tfbXNnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fSxcblx0fSkpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMih7XG5cdFx0Y29tbWFuZDogJ25jdScsXG5cdFx0YWxpYXNlczogWyd1cGRhdGUnLCAndXBncmFkZScsICd1cCddLFxuXHRcdGJ1aWxkZXI6IHNldHVwTmN1VG9ZYXJncyxcblx0XHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBjd2QgfSA9IGFyZ3Y7XG5cblx0XHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdFx0Li4uYXJndixcblx0XHRcdFx0Y3dkLFxuXHRcdFx0fSwgdHJ1ZSk7XG5cblx0XHRcdGNvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdFx0bGV0IHBrZ19maWxlX3Jvb3QgPSBwYXRoLmpvaW4ocm9vdERhdGEucm9vdCwgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cdFx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0XHRsZXQgcmVzb2x1dGlvbnMgPSBwa2dfZGF0YS5yZXNvbHV0aW9ucztcblxuXHRcdFx0bGV0IHBrZ19maWxlX3dzOiBzdHJpbmc7XG5cdFx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdFx0bGV0IGRvV29ya3NwYWNlID0gIXJvb3REYXRhLmlzV29ya3NwYWNlICYmIHJvb3REYXRhLmhhc1dvcmtzcGFjZTtcblxuXHRcdFx0aWYgKGRvV29ya3NwYWNlKVxuXHRcdFx0e1xuXHRcdFx0XHRwa2dfZmlsZV93cyA9IHBhdGguam9pbihyb290RGF0YS53cywgJ3BhY2thZ2UuanNvbicpO1xuXHRcdFx0XHRwa2dfZGF0YV93cyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZV93cyk7XG5cblx0XHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBrZ05jdSA9IGF3YWl0IG5wbUNoZWNrVXBkYXRlcyh7XG5cdFx0XHRcdGN3ZCxcblx0XHRcdFx0cm9vdERhdGEsXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdH0sIHtcblx0XHRcdFx0Li4uYXJndixcblx0XHRcdFx0anNvbl9vbGQ6IHBrZ19kYXRhLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHRcdHtcblx0XHRcdFx0d3JpdGVKU09OU3luYyhwa2dfZmlsZSwgcGtnTmN1Lmpzb25fbmV3KVxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgcGFja2FnZS5qc29uIHVwZGF0ZWRgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFyZ3YuZGVkdXBlICYmIE9iamVjdC5rZXlzKHJlc29sdXRpb25zKS5sZW5ndGgpXG5cdFx0XHR7XG5cblx0XHRcdFx0bGV0IGxzID0gT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3LmRlcGVuZGVuY2llcylcblx0XHRcdFx0XHQuY29uY2F0KE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXZEZXBlbmRlbmNpZXMgfHwge30pLCBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30pKVxuXG5cdFx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgW25hbWUsIHZlcl9uZXddKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB2ZXJfb2xkID0gcmVzb2x1dGlvbnNbbmFtZV07XG5cblx0XHRcdFx0XHRcdGlmICh2ZXJfb2xkKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhW25hbWVdID0gdmVyX25ldztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdFx0fSwge30gYXMgSURlcGVuZGVuY2llcylcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdFx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlsLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdFx0bGV0IHJlc3VsdCA9IGZpbHRlclJlc29sdXRpb25zKHtcblx0XHRcdFx0XHRyZXNvbHV0aW9uczogbHNcblx0XHRcdFx0fSwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdFx0bGV0IHIyID0gcmVzdWx0Lm5hbWVzXG5cdFx0XHRcdFx0LmZpbHRlcihuYW1lID0+IHtcblxuXHRcdFx0XHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lKG5hbWUpO1xuXG5cdFx0XHRcdFx0bGV0IGRhID0gcmVzdWx0LmRlcHNbblswXV07XG5cblx0XHRcdFx0XHRpZiAoIWRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoZGFbJyonXSB8fCBsc1tuWzBdXSA9PSAnKicpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdC52YWx1ZXMoZGEpLnNvbWUoZHIgPT4ge1xuXG5cdFx0XHRcdFx0XHRpZiAobHNbbmFtZV0gPT0gbnVsbClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBib29sID0gc2VtdmVyLmx0KGRyLnZlcnNpb24sIGxzW25hbWVdKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGJvb2xcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkdWNlKChhLCBuYW1lKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZShuYW1lKTtcblxuXHRcdFx0XHRcdFx0YS5uYW1lcy5wdXNoKG5hbWUpO1xuXHRcdFx0XHRcdFx0YS5kZXBzW25bMF1dID0gcmVzdWx0LmRlcHNbblswXV07XG5cblx0XHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRuYW1lczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdFx0XHRkZXBzOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nIHwgJyonLCBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c+Pixcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IHJldCA9IHJlbW92ZVJlc29sdXRpb25zQ29yZShyMiwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCFhcmd2LnVwZ3JhZGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLm1hZ2VudGEuaW5mbyhgeW91ciBkZXBlbmRlbmNpZXMgdmVyc2lvbiBoaWdoIHRoYW4gcmVzb2x1dGlvbnNgKTtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG9gLCBjb25zb2xlLmN5YW4uY2hhbGsoYHl0IG5jdSAtdWApKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWwueWFybmxvY2tfZmlsZSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ldykpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGBEZWR1cGxpY2F0aW9uIHlhcm4ubG9ja2ApO1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkb2AsIGNvbnNvbGUuY3lhbi5jaGFsayhgeXQgaW5zdGFsbGApKTtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYGZvciB1cGdyYWRlIGRlcGVuZGVuY2llcyBub3dgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH0sXG5cdH0pKVxuXHQuY29tbWFuZCh7XG5cdFx0Y29tbWFuZDogJ3B1Ymxpc2gnLFxuXHRcdGFsaWFzZXM6IFsncHVzaCddLFxuXHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdC5vcHRpb24oJ3RhZycsIHtcblx0XHRcdFx0XHRkZXNjOiBgUmVnaXN0ZXJzIHRoZSBwdWJsaXNoZWQgcGFja2FnZSB3aXRoIHRoZSBnaXZlbiB0YWcsIHN1Y2ggdGhhdCBcXGBucG0gaW5zdGFsbCBAXFxgIHdpbGwgaW5zdGFsbCB0aGlzIHZlcnNpb24uIEJ5IGRlZmF1bHQsIFxcYG5wbSBwdWJsaXNoXFxgIHVwZGF0ZXMgYW5kIFxcYG5wbSBpbnN0YWxsXFxgIGluc3RhbGxzIHRoZSBcXGBsYXRlc3RcXGAgdGFnLmAsXG5cblx0XHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5vcHRpb24oJ2FjY2VzcycsIHtcblx0XHRcdFx0XHRkZXNjOiBgVGVsbHMgdGhlIHJlZ2lzdHJ5IHdoZXRoZXIgdGhpcyBwYWNrYWdlIHNob3VsZCBiZSBwdWJsaXNoZWQgYXMgcHVibGljIG9yIHJlc3RyaWN0ZWQuIE9ubHkgYXBwbGllcyB0byBzY29wZWQgcGFja2FnZXMsIHdoaWNoIGRlZmF1bHQgdG8gcmVzdHJpY3RlZC4gSWYgeW91IGRvbuKAmXQgaGF2ZSBhIHBhaWQgYWNjb3VudCwgeW91IG11c3QgcHVibGlzaCB3aXRoIC0tYWNjZXNzIHB1YmxpYyB0byBwdWJsaXNoIHNjb3BlZCBwYWNrYWdlcy5gLFxuXHRcdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9wdGlvbignb3RwJywge1xuXHRcdFx0XHRcdGRlc2M6IGBJZiB5b3UgaGF2ZSB0d28tZmFjdG9yIGF1dGhlbnRpY2F0aW9uIGVuYWJsZWQgaW4gYXV0aC1hbmQtd3JpdGVzIG1vZGUgdGhlbiB5b3UgY2FuIHByb3ZpZGUgYSBjb2RlIGZyb20geW91ciBhdXRoZW50aWNhdG9yIHdpdGggdGhpcy4gSWYgeW91IGRvbuKAmXQgaW5jbHVkZSB0aGlzIGFuZCB5b3XigJlyZSBydW5uaW5nIGZyb20gYSBUVFkgdGhlbiB5b3XigJlsbCBiZSBwcm9tcHRlZC5gLFxuXHRcdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9wdGlvbignZHJ5LXJ1bicsIHtcblx0XHRcdFx0XHRkZXNjOiBgQXMgb2YgbnBtQDYsIGRvZXMgZXZlcnl0aGluZyBwdWJsaXNoIHdvdWxkIGRvIGV4Y2VwdCBhY3R1YWxseSBwdWJsaXNoaW5nIHRvIHRoZSByZWdpc3RyeS4gUmVwb3J0cyB0aGUgZGV0YWlscyBvZiB3aGF0IHdvdWxkIGhhdmUgYmVlbiBwdWJsaXNoZWQuYCxcblx0XHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXHRcdH0sXG5cdFx0aGFuZGxlcihhcmd2KVxuXHRcdHtcblxuXHRcdFx0bGV0IGNtZF9saXN0OiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRbXG5cdFx0XHRcdCd0YWcnLFxuXHRcdFx0XHQnYWNjZXNzJyxcblx0XHRcdFx0J3RhZycsXG5cdFx0XHRcdCd0YWcnLFxuXHRcdFx0XS5mb3JFYWNoKGsgPT4ge1xuXG5cdFx0XHRcdGxldCB2ID0gYXJndltrXTtcblxuXHRcdFx0XHRpZiAodilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNtZF9saXN0LnB1c2goJy0tJyArIGspO1xuXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjbWRfbGlzdC5wdXNoKHYpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCducG0nLCBbXG5cblx0XHRcdFx0J3B1Ymxpc2gnLFxuXG5cdFx0XHRcdC4uLmFyZ3YuXy5zbGljZSgxKSxcblxuXHRcdFx0XHQuLi5jbWRfbGlzdCxcblxuXHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpLCB7XG5cdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0XHR9KVxuXHRcdH1cblx0fSlcbjtcblxuY2xpLmFyZ3Y7XG5cbiJdfQ==