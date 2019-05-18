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
const yargs_setting_1 = require("npm-init2/lib/yargs-setting");
const cli_1 = require("../lib/cli");
const pkg_1 = require("../lib/pkg");
const ncu_1 = require("../lib/cli/ncu");
const yarnlock_1 = require("../lib/yarnlock");
const yargs_setting_2 = require("create-yarn-workspaces/yargs-setting");
const spawn_1 = require("../lib/spawn");
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
                    // @ts-ignore
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
        let cmd_list = spawn_1.processArgvSlice(['publish', 'push']).argv;
        spawn_1.crossSpawnOther('npm', [
            'publish',
            ...cmd_list,
        ], argv);
    }
})
    .command(cli_1.create_command2({
    command: 'init',
    describe: `create a package.json file`,
    builder: yargs_setting_1.default,
    async handler(argv) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2/bin/npm-init2',
        });
        if (!ret) {
            process.exit(1);
        }
        let cmd_list = spawn_1.processArgvSlice('init').argv;
        spawn_1.crossSpawnOther('node', [
            ret,
            ...cmd_list,
        ], argv);
    },
}))
    .command(cli_1.create_command2({
    command: 'workspaces',
    aliases: ['ws', 'workspaces'],
    describe: `create yarn workspaces`,
    // @ts-ignore
    builder(yargs) {
        return yargs
            .command({
            command: 'init',
            describe: `create yarn workspaces`,
            builder(yargs) {
                return yargs_setting_2.setupWorkspacesInitToYargs(yargs);
            },
            async handler(argv) {
                let ret = spawn_1.checkModileExists({
                    name: 'create-yarn-workspaces',
                    requireName: 'create-yarn-workspaces/bin/yarn-ws-init',
                });
                if (!ret) {
                    process.exit(1);
                }
                let cmd_list = spawn_1.processArgvSlice('init').argv;
                spawn_1.crossSpawnOther('node', [
                    ret,
                    ...cmd_list,
                ], argv);
            },
        })
            .strict()
            .demandCommand();
    },
    async handler(argv) {
    },
}))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand();
cli.argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi10b29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieWFybi10b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtCQUFnQztBQUNoQyxrREFBbUQ7QUFDbkQsdUNBQXdDO0FBQ3hDLDZCQUE4QjtBQUM5QiwrQkFBZ0M7QUFDaEMsZ0RBQWlEO0FBQ2pELHdDQUF5RjtBQUN6Riw4Q0FBNEU7QUFDNUUsd0NBQW9HO0FBQ3BHLGdEQUF5RDtBQUN6RCxpQ0FBa0M7QUFDbEMsK0RBQTJEO0FBRTNELG9DQU9vQjtBQUNwQixvQ0FBNEQ7QUFFNUQsd0NBQWtFO0FBQ2xFLDhDQU95QjtBQUV6Qix3RUFBa0Y7QUFDbEYsd0NBQW9GO0FBRXBGLGNBQWMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFakMsSUFBSSxHQUFHLEdBQUcsY0FBUSxFQUFFO0tBQ2xCLE9BQU8sQ0FBQyxxQkFBZSxDQUFxQjtJQUM1QyxPQUFPLEVBQUUsY0FBYztJQUN2QixRQUFRLEVBQUUsa0NBQWtDO0lBQzVDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLE9BQU8sQ0FBQyxJQUFJO1FBRVgsbUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFHdEIsQ0FBQztZQUNELEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXBCLElBQUksS0FBSyxDQUFDLFlBQVksRUFDdEI7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2hDO2dCQUVELGVBQU8sQ0FBQyxHQUFHLENBQUMsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNELENBQUMsQ0FBQztLQUNGLE9BQU8sQ0FBQyxxQkFBZSxDQUFD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QUFDLElBQUk7SUFHbEIsQ0FBQztDQUNELENBQUMsQ0FBQztLQUNGLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDVixjQUFjLENBQUMsSUFBSSxDQUFDO0tBQ3BCLE1BQU0sRUFBRTtLQUNSLGFBQWEsRUFBRSxDQUNoQjtBQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoJ3lhcmdzJyk7XG5pbXBvcnQgdXBkYXRlTm90aWZpZXIgPSByZXF1aXJlKCd1cGRhdGUtbm90aWZpZXInKTtcbmltcG9ydCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIGZzWWFybkxvY2ssIHlhcm5Mb2NrRGlmZiB9IGZyb20gJy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyBEZWR1cGUsIGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeyBleGlzdHNEZXBlbmRlbmNpZXMsIGZsYWdzWWFybkFkZCwgbGlzdFRvVHlwZXMsIHNldHVwWWFybkFkZFRvWWFyZ3MgfSBmcm9tICcuLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgc2V0dXBZYXJuSW5zdGFsbFRvWWFyZ3MgZnJvbSAnLi4vbGliL2NsaS9pbnN0YWxsJztcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbmltcG9ydCBzZXR1cEluaXRUb1lhcmdzIGZyb20gJ25wbS1pbml0Mi9saWIveWFyZ3Mtc2V0dGluZyc7XG5cbmltcG9ydCB7XG5cdGNyZWF0ZV9jb21tYW5kLFxuXHRjcmVhdGVfY29tbWFuZDIsXG5cdGR1bW15X2J1aWxkZXIsXG5cdGdldFlhcmdzLFxuXHRJVW5wYWNrTXlZYXJnc0FyZ3YsXG5cdElVbnBhY2tZYXJnc0FyZ3YsXG59IGZyb20gJy4uL2xpYi9jbGknO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uLCB3cml0ZUpTT05TeW5jIH0gZnJvbSAnLi4vbGliL3BrZyc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IG5wbUNoZWNrVXBkYXRlcyB9IGZyb20gJy4uL2xpYi9jbGkvbmN1JztcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJRGVwZW5kZW5jaWVzLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssXG5cdHN0cmluZ2lmeSBhcyBzdHJpbmdpZnlZYXJuTG9jayxcblx0cmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpcERlcHNOYW1lLFxufSBmcm9tICcuLi9saWIveWFybmxvY2snO1xuaW1wb3J0IHsgSVRTSXRlcmF0b3JMYXp5LCBJVFNWYWx1ZU9mQXJyYXkgfSBmcm9tICd0cy10eXBlJztcbmltcG9ydCB7IHNldHVwV29ya3NwYWNlc0luaXRUb1lhcmdzIH0gZnJvbSAnY3JlYXRlLXlhcm4td29ya3NwYWNlcy95YXJncy1zZXR0aW5nJztcbmltcG9ydCB7IGNoZWNrTW9kaWxlRXhpc3RzLCBjcm9zc1NwYXduT3RoZXIsIHByb2Nlc3NBcmd2U2xpY2UgfSBmcm9tICcuLi9saWIvc3Bhd24nO1xuXG51cGRhdGVOb3RpZmllcih7IHBrZyB9KS5ub3RpZnkoKTtcblxubGV0IGNsaSA9IGdldFlhcmdzKClcblx0LmNvbW1hbmQoY3JlYXRlX2NvbW1hbmQyPElVbnBhY2tNeVlhcmdzQXJndj4oe1xuXHRcdGNvbW1hbmQ6ICdkZWR1cGUgW2N3ZF0nLFxuXHRcdGRlc2NyaWJlOiBgRGF0YSBkZWR1cGxpY2F0aW9uIGZvciB5YXJuLmxvY2tgLFxuXHRcdGFsaWFzZXM6IFsnZCddLFxuXHRcdGhhbmRsZXIoYXJndilcblx0XHR7XG5cdFx0XHR3cmFwRGVkdXBlKHlhcmdzLCBhcmd2LCB7XG5cdFx0XHRcdG1haW4oeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGNhY2hlLnlhcm5sb2NrX21zZyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSk7XG5cdFx0fSxcblx0fSkpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMih7XG5cdFx0Y29tbWFuZDogJ2FkZCBbbmFtZV0nLFxuXHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHNldHVwWWFybkFkZFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHRcdC5vcHRpb24oJ3R5cGVzJywge1xuXHRcdFx0XHRcdGFsaWFzOiBbJ3R5cGUnXSxcblx0XHRcdFx0XHRkZXNjOiBgdHJ5IGF1dG8gaW5zdGFsbCBAdHlwZXMvKmAsXG5cdFx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHR9LFxuXHRcdGhhbmRsZXIoYXJndilcblx0XHR7XG5cdFx0XHRsZXQgYXJncyA9IGFyZ3YuXy5zbGljZSgpO1xuXG5cdFx0XHRpZiAoYXJnc1swXSA9PT0gJ2FkZCcpXG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3Muc2hpZnQoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFyZ3YubmFtZSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRhcmdzLnVuc2hpZnQoYXJndi5uYW1lKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9jb25zb2xlLmRpcihhcmd2KTtcblxuXHRcdFx0aWYgKCFhcmdzLmxlbmd0aClcblx0XHRcdHtcbi8vXHRcdFx0eWFyZ3Muc2hvd0hlbHAoKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcuZXJyb3IoYE1pc3NpbmcgbGlzdCBvZiBwYWNrYWdlcyB0byBhZGQgdG8geW91ciBwcm9qZWN0LmApO1xuXG5cdFx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG5cdFx0XHR9XG5cblx0XHRcdHdyYXBEZWR1cGUoeWFyZ3MsIGFyZ3YsIHtcblxuXHRcdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGxldCBmbGFncyA9IGZsYWdzWWFybkFkZChhcmd2KS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHRcdC4uLmFyZ3MsXG5cblx0XHRcdFx0XHRcdC4uLmZsYWdzLFxuXG5cdFx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygneWFybicsIGNtZF9hcmd2LCB7XG5cdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aHJvdyBjcC5lcnJvclxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhcmd2LnR5cGVzKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB7IHJvb3REYXRhIH0gPSBjYWNoZTtcblxuXHRcdFx0XHRcdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0XHRcdFx0XHRsZXQgcGtnID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdFx0XHRcdFx0bGV0IGFyZ3NfdHlwZXMgPSBsaXN0VG9UeXBlcyhhcmdzKTtcblxuXHRcdFx0XHRcdFx0aWYgKGFyZ3NfdHlwZXMubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgZmxhZ3MyID0gZmxhZ3Muc2xpY2UoKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIWFyZ3Yub3B0aW9uYWwgJiYgIWFyZ3YucGVlciAmJiAhYXJndi5kZXYpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRmbGFnczIucHVzaCgnLUQnKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGFyZ3NfdHlwZXNcblx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaChuYW1lID0+XG5cdFx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWUsIHBrZykpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnYWRkJyxcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lLFxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC4uLmZsYWdzMixcblxuXHRcdFx0XHRcdFx0XHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoY21kX2FyZ3YpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL3N0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGVuZCh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coY2FjaGUueWFybmxvY2tfbXNnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHR9LFxuXHR9KSlcblx0LmNvbW1hbmQoY3JlYXRlX2NvbW1hbmQyKHtcblx0XHRjb21tYW5kOiAnaW5zdGFsbCBbY3dkXScsXG5cdFx0ZGVzY3JpYmU6IGBkbyBkZWR1cGUgd2hlbiB5YXJuIGluc3RhbGxgLFxuXHRcdGFsaWFzZXM6IFsnaSddLFxuXHRcdGJ1aWxkZXI6IHNldHVwWWFybkluc3RhbGxUb1lhcmdzLFxuXHRcdGhhbmRsZXIoYXJndilcblx0XHR7XG5cdFx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdFx0bGV0IF9vbmNlID0gdHJ1ZTtcblxuXHRcdFx0d3JhcERlZHVwZSh5YXJncywgYXJndiwge1xuXG5cdFx0XHRcdGJlZm9yZSh5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0XHRpZiAoIWluZm8ueWFybmxvY2tfb2xkX2V4aXN0cylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBpbmZvID0gaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSk7XG5cblx0XHRcdFx0XHRpZiAoaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgeWFybi5sb2NrIGNoYW5nZWQsIGRvIGluc3RhbGwgYWdhaW5gKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoX29uY2UgfHwgaW5mby55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRfb25jZSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0YWZ0ZXIoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdFx0aWYgKF9vbmNlICYmIGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cblx0XHRcdFx0XHRcdGNyb3NzU3Bhd24uc3luYygneWFybicsIFtdLCB7XG5cdFx0XHRcdFx0XHRcdGN3ZCxcblx0XHRcdFx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRfb25jZSA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfb2xkX2V4aXN0cyAmJiBjYWNoZS55YXJubG9ja19tc2cpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coY2FjaGUueWFybmxvY2tfbXNnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlLmRpcihpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKSk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fSxcblx0fSkpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMih7XG5cdFx0Y29tbWFuZDogJ25jdScsXG5cdFx0YWxpYXNlczogWyd1cGRhdGUnLCAndXBncmFkZScsICd1cCddLFxuXHRcdGJ1aWxkZXI6IHNldHVwTmN1VG9ZYXJncyxcblx0XHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBjd2QgfSA9IGFyZ3Y7XG5cblx0XHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdFx0Li4uYXJndixcblx0XHRcdFx0Y3dkLFxuXHRcdFx0fSwgdHJ1ZSk7XG5cblx0XHRcdGNvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdFx0bGV0IHBrZ19maWxlX3Jvb3QgPSBwYXRoLmpvaW4ocm9vdERhdGEucm9vdCwgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cdFx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0XHRsZXQgcmVzb2x1dGlvbnMgPSBwa2dfZGF0YS5yZXNvbHV0aW9ucztcblxuXHRcdFx0bGV0IHBrZ19maWxlX3dzOiBzdHJpbmc7XG5cdFx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdFx0bGV0IGRvV29ya3NwYWNlID0gIXJvb3REYXRhLmlzV29ya3NwYWNlICYmIHJvb3REYXRhLmhhc1dvcmtzcGFjZTtcblxuXHRcdFx0aWYgKGRvV29ya3NwYWNlKVxuXHRcdFx0e1xuXHRcdFx0XHRwa2dfZmlsZV93cyA9IHBhdGguam9pbihyb290RGF0YS53cywgJ3BhY2thZ2UuanNvbicpO1xuXHRcdFx0XHRwa2dfZGF0YV93cyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZV93cyk7XG5cblx0XHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBrZ05jdSA9IGF3YWl0IG5wbUNoZWNrVXBkYXRlcyh7XG5cdFx0XHRcdGN3ZCxcblx0XHRcdFx0cm9vdERhdGEsXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdH0sIHtcblx0XHRcdFx0Li4uYXJndixcblx0XHRcdFx0anNvbl9vbGQ6IHBrZ19kYXRhLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHRcdHtcblx0XHRcdFx0d3JpdGVKU09OU3luYyhwa2dfZmlsZSwgcGtnTmN1Lmpzb25fbmV3KVxuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgcGFja2FnZS5qc29uIHVwZGF0ZWRgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFyZ3YuZGVkdXBlICYmIE9iamVjdC5rZXlzKHJlc29sdXRpb25zKS5sZW5ndGgpXG5cdFx0XHR7XG5cblx0XHRcdFx0bGV0IGxzID0gT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3LmRlcGVuZGVuY2llcylcblx0XHRcdFx0XHQuY29uY2F0KE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXZEZXBlbmRlbmNpZXMgfHwge30pLCBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30pKVxuXG5cdFx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgW25hbWUsIHZlcl9uZXddKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCB2ZXJfb2xkID0gcmVzb2x1dGlvbnNbbmFtZV07XG5cblx0XHRcdFx0XHRcdGlmICh2ZXJfb2xkKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGFbbmFtZV0gPSB2ZXJfbmV3O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0XHR9LCB7fSBhcyBJRGVwZW5kZW5jaWVzKVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdFx0XHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWwueWFybmxvY2tfb2xkKTtcblxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gZmlsdGVyUmVzb2x1dGlvbnMoe1xuXHRcdFx0XHRcdHJlc29sdXRpb25zOiBsc1xuXHRcdFx0XHR9LCB5YXJubG9ja19vbGRfb2JqKTtcblxuXHRcdFx0XHRsZXQgcjIgPSByZXN1bHQubmFtZXNcblx0XHRcdFx0XHQuZmlsdGVyKG5hbWUgPT4ge1xuXG5cdFx0XHRcdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWUobmFtZSk7XG5cblx0XHRcdFx0XHRsZXQgZGEgPSByZXN1bHQuZGVwc1tuWzBdXTtcblxuXHRcdFx0XHRcdGlmICghZGEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChkYVsnKiddIHx8IGxzW25bMF1dID09ICcqJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0LnZhbHVlcyhkYSkuc29tZShkciA9PiB7XG5cblx0XHRcdFx0XHRcdGlmIChsc1tuYW1lXSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IGJvb2wgPSBzZW12ZXIubHQoZHIudmVyc2lvbiwgbHNbbmFtZV0pO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gYm9vbFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5yZWR1Y2UoKGEsIG5hbWUpID0+IHtcblxuXHRcdFx0XHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lKG5hbWUpO1xuXG5cdFx0XHRcdFx0XHRhLm5hbWVzLnB1c2gobmFtZSk7XG5cdFx0XHRcdFx0XHRhLmRlcHNbblswXV0gPSByZXN1bHQuZGVwc1tuWzBdXTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdG5hbWVzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0XHRcdGRlcHM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcgfCAnKicsIElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdz4+LFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRsZXQgcmV0ID0gcmVtb3ZlUmVzb2x1dGlvbnNDb3JlKHIyLCB5YXJubG9ja19vbGRfb2JqKTtcblxuXHRcdFx0XHRpZiAocmV0Lnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIWFyZ3YudXBncmFkZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGB5b3VyIGRlcGVuZGVuY2llcyB2ZXJzaW9uIGhpZ2ggdGhhbiByZXNvbHV0aW9uc2ApO1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkb2AsIGNvbnNvbGUuY3lhbi5jaGFsayhgeXQgbmN1IC11YCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5bC55YXJubG9ja19maWxlLCBzdHJpbmdpZnlZYXJuTG9jayhyZXQueWFybmxvY2tfbmV3KSk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcubG9nKGB5b3UgY2FuIGRvYCwgY29uc29sZS5jeWFuLmNoYWxrKGB5dCBpbnN0YWxsYCkpO1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgZm9yIHVwZ3JhZGUgZGVwZW5kZW5jaWVzIG5vd2ApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fSxcblx0fSkpXG5cdC5jb21tYW5kKHtcblx0XHRjb21tYW5kOiAncHVibGlzaCcsXG5cdFx0YWxpYXNlczogWydwdXNoJ10sXG5cdFx0YnVpbGRlcih5YXJncylcblx0XHR7XG5cdFx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdFx0Lm9wdGlvbigndGFnJywge1xuXHRcdFx0XHRcdGRlc2M6IGBSZWdpc3RlcnMgdGhlIHB1Ymxpc2hlZCBwYWNrYWdlIHdpdGggdGhlIGdpdmVuIHRhZywgc3VjaCB0aGF0IFxcYG5wbSBpbnN0YWxsIEBcXGAgd2lsbCBpbnN0YWxsIHRoaXMgdmVyc2lvbi4gQnkgZGVmYXVsdCwgXFxgbnBtIHB1Ymxpc2hcXGAgdXBkYXRlcyBhbmQgXFxgbnBtIGluc3RhbGxcXGAgaW5zdGFsbHMgdGhlIFxcYGxhdGVzdFxcYCB0YWcuYCxcblxuXHRcdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9wdGlvbignYWNjZXNzJywge1xuXHRcdFx0XHRcdGRlc2M6IGBUZWxscyB0aGUgcmVnaXN0cnkgd2hldGhlciB0aGlzIHBhY2thZ2Ugc2hvdWxkIGJlIHB1Ymxpc2hlZCBhcyBwdWJsaWMgb3IgcmVzdHJpY3RlZC4gT25seSBhcHBsaWVzIHRvIHNjb3BlZCBwYWNrYWdlcywgd2hpY2ggZGVmYXVsdCB0byByZXN0cmljdGVkLiBJZiB5b3UgZG9u4oCZdCBoYXZlIGEgcGFpZCBhY2NvdW50LCB5b3UgbXVzdCBwdWJsaXNoIHdpdGggLS1hY2Nlc3MgcHVibGljIHRvIHB1Ymxpc2ggc2NvcGVkIHBhY2thZ2VzLmAsXG5cdFx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQub3B0aW9uKCdvdHAnLCB7XG5cdFx0XHRcdFx0ZGVzYzogYElmIHlvdSBoYXZlIHR3by1mYWN0b3IgYXV0aGVudGljYXRpb24gZW5hYmxlZCBpbiBhdXRoLWFuZC13cml0ZXMgbW9kZSB0aGVuIHlvdSBjYW4gcHJvdmlkZSBhIGNvZGUgZnJvbSB5b3VyIGF1dGhlbnRpY2F0b3Igd2l0aCB0aGlzLiBJZiB5b3UgZG9u4oCZdCBpbmNsdWRlIHRoaXMgYW5kIHlvdeKAmXJlIHJ1bm5pbmcgZnJvbSBhIFRUWSB0aGVuIHlvdeKAmWxsIGJlIHByb21wdGVkLmAsXG5cdFx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQub3B0aW9uKCdkcnktcnVuJywge1xuXHRcdFx0XHRcdGRlc2M6IGBBcyBvZiBucG1ANiwgZG9lcyBldmVyeXRoaW5nIHB1Ymxpc2ggd291bGQgZG8gZXhjZXB0IGFjdHVhbGx5IHB1Ymxpc2hpbmcgdG8gdGhlIHJlZ2lzdHJ5LiBSZXBvcnRzIHRoZSBkZXRhaWxzIG9mIHdoYXQgd291bGQgaGF2ZSBiZWVuIHB1Ymxpc2hlZC5gLFxuXHRcdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cdFx0fSxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZShbJ3B1Ymxpc2gnLCAncHVzaCddKS5hcmd2O1xuXG5cdFx0XHRjcm9zc1NwYXduT3RoZXIoJ25wbScsIFtcblxuXHRcdFx0XHQncHVibGlzaCcsXG5cblx0XHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XHRdLCBhcmd2KTtcblx0XHR9XG5cdH0pXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMjxJVW5wYWNrTXlZYXJnc0FyZ3Y+KHtcblx0XHRjb21tYW5kOiAnaW5pdCcsXG5cdFx0ZGVzY3JpYmU6IGBjcmVhdGUgYSBwYWNrYWdlLmpzb24gZmlsZWAsXG5cdFx0YnVpbGRlcjogc2V0dXBJbml0VG9ZYXJncyxcblx0XHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdFx0bmFtZTogJ25wbS1pbml0MicsXG5cdFx0XHRcdHJlcXVpcmVOYW1lOiAnbnBtLWluaXQyL2Jpbi9ucG0taW5pdDInLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9jZXNzLmV4aXQoMSk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoJ2luaXQnKS5hcmd2O1xuXG5cdFx0XHRjcm9zc1NwYXduT3RoZXIoJ25vZGUnLCBbXG5cblx0XHRcdFx0cmV0LFxuXG5cdFx0XHRcdC4uLmNtZF9saXN0LFxuXHRcdFx0XSwgYXJndik7XG5cblx0XHR9LFxuXHR9KSlcblx0LmNvbW1hbmQoY3JlYXRlX2NvbW1hbmQyPElVbnBhY2tNeVlhcmdzQXJndj4oe1xuXHRcdGNvbW1hbmQ6ICd3b3Jrc3BhY2VzJyxcblx0XHRhbGlhc2VzOiBbJ3dzJywgJ3dvcmtzcGFjZXMnXSxcblx0XHRkZXNjcmliZTogYGNyZWF0ZSB5YXJuIHdvcmtzcGFjZXNgLFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdHtcblx0XHRcdHJldHVybiB5YXJnc1xuXHRcdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdFx0Y29tbWFuZDogJ2luaXQnLFxuXHRcdFx0XHRcdGRlc2NyaWJlOiBgY3JlYXRlIHlhcm4gd29ya3NwYWNlc2AsXG5cdFx0XHRcdFx0YnVpbGRlcih5YXJncylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdFx0XHRcdFx0bmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMnLFxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlTmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMvYmluL3lhcm4td3MtaW5pdCcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0aWYgKCFyZXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZSgnaW5pdCcpLmFyZ3Y7XG5cblx0XHRcdFx0XHRcdGNyb3NzU3Bhd25PdGhlcignbm9kZScsIFtcblxuXHRcdFx0XHRcdFx0XHRyZXQsXG5cblx0XHRcdFx0XHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XHRcdFx0XHRdLCBhcmd2KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuc3RyaWN0KClcblx0XHRcdFx0LmRlbWFuZENvbW1hbmQoKVxuXHRcdFx0O1xuXHRcdH0sXG5cdFx0YXN5bmMgaGFuZGxlcihhcmd2KVxuXHRcdHtcblxuXHRcdH0sXG5cdH0pKVxuXHQuaGVscCh0cnVlKVxuXHQuc2hvd0hlbHBPbkZhaWwodHJ1ZSlcblx0LnN0cmljdCgpXG5cdC5kZW1hbmRDb21tYW5kKClcbjtcblxuY2xpLmFyZ3Y7XG5cbiJdfQ==