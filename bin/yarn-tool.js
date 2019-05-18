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
const sort_package_json_1 = require("sort-package-json");
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
    handler(argv) {
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
    command: 'workspaces <init|run>',
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
            handler(argv) {
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
            .command({
            command: 'run',
            describe: `run by lerna`,
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
    async handler(argv) {
    },
}))
    .command(cli_1.create_command2({
    command: 'sort',
    describe: `sort package.json file`,
    builder(yargs) {
        return yargs;
    },
    handler(argv) {
        let rootData = index_1.findRoot({
            ...argv,
            cwd: argv.cwd,
        }, true);
        let json_file = path.join(rootData.pkg, 'package.json');
        let json = pkg_1.readPackageJson(json_file);
        sort_package_json_1.sortPackageJson(json);
        pkg_1.writePackageJson(json_file, json);
        index_1.consoleDebug.log(`sort: ${json_file}`);
    },
}))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand();
cli.argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi10b29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieWFybi10b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLCtCQUFnQztBQUNoQyxrREFBbUQ7QUFDbkQsdUNBQXdDO0FBQ3hDLDZCQUE4QjtBQUM5QiwrQkFBZ0M7QUFDaEMsZ0RBQWlEO0FBQ2pELHdDQUF5RjtBQUN6Riw4Q0FBNEU7QUFDNUUsd0NBQW9HO0FBQ3BHLGdEQUF5RDtBQUN6RCxpQ0FBa0M7QUFDbEMsK0RBQTJEO0FBQzNELHlEQUFvRDtBQUVwRCxvQ0FPb0I7QUFDcEIsb0NBQThFO0FBRTlFLHdDQUFrRTtBQUNsRSw4Q0FPeUI7QUFFekIsd0VBQWtGO0FBQ2xGLHdDQUFvRjtBQUVwRixjQUFjLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWpDLElBQUksR0FBRyxHQUFHLGNBQVEsRUFBRTtLQUNsQixPQUFPLENBQUMscUJBQWUsQ0FBcUI7SUFDNUMsT0FBTyxFQUFFLGNBQWM7SUFDdkIsUUFBUSxFQUFFLGtDQUFrQztJQUM1QyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDZCxPQUFPLENBQUMsSUFBSTtRQUVYLG1CQUFVLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtZQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO1lBR3RCLENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVwQixJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQ3RCO29CQUNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNoQztnQkFFRCxlQUFPLENBQUMsR0FBRyxDQUFDLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCxDQUFDLENBQUM7S0FDRixPQUFPLENBQUMscUJBQWUsQ0FBQztJQUN4QixPQUFPLEVBQUUsWUFBWTtJQUNyQixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8seUJBQW1CLENBQUMsS0FBSyxDQUFDO2FBQy9CLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2YsSUFBSSxFQUFFLDJCQUEyQjtZQUNqQyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxPQUFPLENBQUMsSUFBSTtRQUVYLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUNyQjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNiO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUNiO1lBQ0MsYUFBYTtZQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsb0JBQW9CO1FBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUNoQjtZQUNILHNCQUFzQjtZQUVsQixvQkFBWSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1lBRXZFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QjtRQUVELG1CQUFVLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtZQUV2QixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLO2dCQUVyQixhQUFhO2dCQUNiLElBQUksS0FBSyxHQUFHLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLFFBQVEsR0FBRztvQkFDZCxLQUFLO29CQUVMLEdBQUcsSUFBSTtvQkFFUCxHQUFHLEtBQUs7aUJBRVIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBRXpCLG9CQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU3QixJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7b0JBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztvQkFDYixLQUFLLEVBQUUsU0FBUztpQkFDaEIsQ0FBQyxDQUFDO2dCQUVILElBQUksRUFBRSxDQUFDLEtBQUssRUFDWjtvQkFDQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUE7aUJBQ2Q7Z0JBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUNkO29CQUNDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUM7b0JBRXpCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFFdkQsSUFBSSxHQUFHLEdBQUcscUJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFcEMsSUFBSSxVQUFVLEdBQUcsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFbkMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUNyQjt3QkFDQyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBRTNCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQzdDOzRCQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ2xCO3dCQUVELFVBQVU7NkJBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUdmLElBQUksd0JBQWtCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUNqQztnQ0FDQyxPQUFPOzZCQUNQOzRCQUVELElBQUksUUFBUSxHQUFHO2dDQUNkLEtBQUs7Z0NBRUwsSUFBSTtnQ0FFSixHQUFHLE1BQU07NkJBRVQsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7NEJBRXpCLG9CQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUU3QixJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7Z0NBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRzs2QkFFYixDQUFDLENBQUM7d0JBQ0osQ0FBQyxDQUFDLENBQ0Y7cUJBQ0Q7aUJBQ0Q7WUFDRixDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUN0QjtvQkFDQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDaEM7Z0JBRUQsZUFBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0QsQ0FBQyxDQUFDO0tBQ0YsT0FBTyxDQUFDLHFCQUFlLENBQUM7SUFDeEIsT0FBTyxFQUFFLGVBQWU7SUFDeEIsUUFBUSxFQUFFLDZCQUE2QjtJQUN2QyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7SUFDZCxPQUFPLEVBQUUsaUJBQXVCO0lBQ2hDLE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFakIsbUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBRXZCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXZCLElBQUksSUFBSSxHQUFHLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUM3QjtvQkFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUc7d0JBQ0gsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztvQkFFSCxLQUFLLEdBQUcsS0FBSyxDQUFDO2lCQUNkO1lBQ0YsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXJCLElBQUksSUFBSSxHQUFHLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFDekI7b0JBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztpQkFDMUQ7Z0JBRUQsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUNsQztvQkFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7d0JBQzNCLEdBQUc7d0JBQ0gsS0FBSyxFQUFFLFNBQVM7cUJBQ2hCLENBQUMsQ0FBQztvQkFFSCxLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNiO1lBRUYsQ0FBQztZQUVELEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7Z0JBRXRCLElBQUksSUFBSSxHQUFHLDRCQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQ2xDO29CQUNDLG9CQUFZLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7b0JBRTFELFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRTt3QkFDM0IsR0FBRzt3QkFDSCxLQUFLLEVBQUUsU0FBUztxQkFDaEIsQ0FBQyxDQUFDO29CQUVILEtBQUssR0FBRyxLQUFLLENBQUM7aUJBQ2Q7WUFDRixDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztnQkFFcEIsSUFBSSxLQUFLLENBQUMsbUJBQW1CLElBQUksS0FBSyxDQUFDLFlBQVksRUFDbkQ7b0JBQ0MsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2hDO2dCQUVELGVBQU8sQ0FBQyxHQUFHLENBQUMsNEJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDO1NBRUQsQ0FBQyxDQUFDO1FBRUgsT0FBTztJQUNSLENBQUM7Q0FDRCxDQUFDLENBQUM7S0FDRixPQUFPLENBQUMscUJBQWUsQ0FBQztJQUN4QixPQUFPLEVBQUUsS0FBSztJQUNkLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDO0lBQ3BDLE9BQU8sRUFBRSxhQUFlO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUVqQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXJCLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1lBQ1AsR0FBRztTQUNILEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVCxlQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU3RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkQsSUFBSSxRQUFRLEdBQUcscUJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRXZDLElBQUksV0FBbUIsQ0FBQztRQUN4QixJQUFJLFdBQXlCLENBQUM7UUFFOUIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFFakUsSUFBSSxXQUFXLEVBQ2Y7WUFDQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JELFdBQVcsR0FBRyxxQkFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTNDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxNQUFNLEdBQUcsTUFBTSxxQkFBZSxDQUFDO1lBQ2xDLEdBQUc7WUFDSCxRQUFRO1NBRVIsRUFBRTtZQUNGLEdBQUcsSUFBSTtZQUNQLFFBQVEsRUFBRSxRQUFRO1NBQ2xCLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUN2QztZQUNDLG1CQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUN4QyxvQkFBWSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUNsRDtZQUVDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7aUJBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFFekgsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztnQkFFbkMsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoQyxJQUFJLE9BQU8sRUFDWDtvQkFDQyxhQUFhO29CQUNiLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7aUJBQ2xCO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxFQUFFLEVBQW1CLENBQUMsQ0FDdkI7WUFFRCxJQUFJLEVBQUUsR0FBRyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQyxJQUFJLGdCQUFnQixHQUFHLGdCQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXRELElBQUksTUFBTSxHQUFHLDRCQUFpQixDQUFDO2dCQUM5QixXQUFXLEVBQUUsRUFBRTthQUNmLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVyQixJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSztpQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUVkLElBQUksQ0FBQyxHQUFHLHdCQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTdCLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLElBQUksQ0FBQyxFQUFFLEVBQ1A7b0JBQ0MsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFDOUI7b0JBQ0MsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFFbEMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUNwQjt3QkFDQyxPQUFPLElBQUksQ0FBQztxQkFDWjtvQkFFRCxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRTNDLE9BQU8sSUFBSSxDQUFBO2dCQUNaLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO2lCQUNBLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFFbkIsSUFBSSxDQUFDLEdBQUcsd0JBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFNUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFakMsT0FBTyxDQUFDLENBQUM7WUFDWCxDQUFDLEVBQUU7Z0JBQ0QsS0FBSyxFQUFFLEVBQWM7Z0JBQ3JCLElBQUksRUFBRSxFQUF1RTthQUM3RSxDQUFDLENBQ0Y7WUFFRCxJQUFJLEdBQUcsR0FBRyxnQ0FBcUIsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUV0RCxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFDeEI7Z0JBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQ2pCO29CQUNDLG9CQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO29CQUM3RSxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsZUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztpQkFDaEU7cUJBRUQ7b0JBQ0MsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLG9CQUFpQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUV4RSxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDckQsb0JBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGVBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLG9CQUFZLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7aUJBQ2pEO2FBQ0Q7U0FDRDtJQUVGLENBQUM7Q0FDRCxDQUFDLENBQUM7S0FDRixPQUFPLENBQUM7SUFDUixPQUFPLEVBQUUsU0FBUztJQUNsQixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDakIsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLGlNQUFpTTtZQUV2TSxNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksRUFBRSx3UEFBd1A7WUFDOVAsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSx1TkFBdU47WUFDN04sTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLEVBQUUsa0pBQWtKO1lBQ3hKLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztJQUNELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFMUQsdUJBQWUsQ0FBQyxLQUFLLEVBQUU7WUFFdEIsU0FBUztZQUVULEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0NBQ0QsQ0FBQztLQUNELE9BQU8sQ0FBQyxxQkFBZSxDQUFxQjtJQUM1QyxPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSw0QkFBNEI7SUFDdEMsT0FBTyxFQUFFLHVCQUFnQjtJQUN6QixPQUFPLENBQUMsSUFBSTtRQUVYLElBQUksR0FBRyxHQUFHLHlCQUFpQixDQUFDO1lBQzNCLElBQUksRUFBRSxXQUFXO1lBQ2pCLFdBQVcsRUFBRSx5QkFBeUI7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsRUFDUjtZQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7UUFFRCxJQUFJLFFBQVEsR0FBRyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0MsdUJBQWUsQ0FBQyxNQUFNLEVBQUU7WUFFdkIsR0FBRztZQUVILEdBQUcsUUFBUTtTQUNYLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFVixDQUFDO0NBQ0QsQ0FBQyxDQUFDO0tBQ0YsT0FBTyxDQUFDLHFCQUFlLENBQXFCO0lBQzVDLE9BQU8sRUFBRSx1QkFBdUI7SUFDaEMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQztJQUM3QixRQUFRLEVBQUUsd0JBQXdCO0lBQ2xDLGFBQWE7SUFDYixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE9BQU8sQ0FBQztZQUNSLE9BQU8sRUFBRSxNQUFNO1lBQ2YsUUFBUSxFQUFFLHdCQUF3QjtZQUNsQyxPQUFPLENBQUMsS0FBSztnQkFFWixPQUFPLDBDQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3pDLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSTtnQkFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztvQkFDM0IsSUFBSSxFQUFFLHdCQUF3QjtvQkFDOUIsV0FBVyxFQUFFLHlDQUF5QztpQkFDdEQsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxHQUFHLEVBQ1I7b0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEI7Z0JBRUQsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUU3Qyx1QkFBZSxDQUFDLE1BQU0sRUFBRTtvQkFFdkIsR0FBRztvQkFFSCxHQUFHLFFBQVE7aUJBQ1gsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUM7U0FDRCxDQUFDO2FBQ0QsT0FBTyxDQUFDO1lBQ1IsT0FBTyxFQUFFLEtBQUs7WUFDZCxRQUFRLEVBQUUsY0FBYztZQUN4QixPQUFPLENBQUMsS0FBSztnQkFFWixPQUFPLEtBQUssQ0FBQTtZQUNiLENBQUM7WUFDRCxPQUFPLENBQUMsSUFBSTtnQkFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztvQkFDM0IsSUFBSSxFQUFFLE9BQU87aUJBQ2IsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxHQUFHLEVBQ1I7b0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEI7Z0JBRUQsSUFBSSxRQUFRLEdBQUcsd0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUU1Qyx1QkFBZSxDQUFDLE9BQU8sRUFBRTtvQkFFeEIsS0FBSztvQkFFTCxHQUFHLFFBQVE7aUJBQ1gsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUM7U0FDRCxDQUFDO2FBQ0QsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFLENBQ2hCO0lBQ0YsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtJQUdsQixDQUFDO0NBQ0QsQ0FBQyxDQUFDO0tBQ0YsT0FBTyxDQUFDLHFCQUFlLENBQXFCO0lBQzVDLE9BQU8sRUFBRSxNQUFNO0lBQ2YsUUFBUSxFQUFFLHdCQUF3QjtJQUNsQyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSyxDQUFBO0lBQ2IsQ0FBQztJQUNELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQztZQUN2QixHQUFHLElBQUk7WUFDUCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDYixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRXhELElBQUksSUFBSSxHQUFHLHFCQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdEMsbUNBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixzQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEMsb0JBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBRXhDLENBQUM7Q0FDRCxDQUFDLENBQUM7S0FDRixJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ1YsY0FBYyxDQUFDLElBQUksQ0FBQztLQUNwQixNQUFNLEVBQUU7S0FDUixhQUFhLEVBQUUsQ0FDaEI7QUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHVwZGF0ZU5vdGlmaWVyID0gcmVxdWlyZSgndXBkYXRlLW5vdGlmaWVyJyk7XG5pbXBvcnQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrLCB5YXJuTG9ja0RpZmYgfSBmcm9tICcuLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgRGVkdXBlLCBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgZXhpc3RzRGVwZW5kZW5jaWVzLCBmbGFnc1lhcm5BZGQsIGxpc3RUb1R5cGVzLCBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IHNldHVwWWFybkluc3RhbGxUb1lhcmdzIGZyb20gJy4uL2xpYi9jbGkvaW5zdGFsbCc7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgc2V0dXBJbml0VG9ZYXJncyBmcm9tICducG0taW5pdDIvbGliL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuXG5pbXBvcnQge1xuXHRjcmVhdGVfY29tbWFuZCxcblx0Y3JlYXRlX2NvbW1hbmQyLFxuXHRkdW1teV9idWlsZGVyLFxuXHRnZXRZYXJncyxcblx0SVVucGFja015WWFyZ3NBcmd2LFxuXHRJVW5wYWNrWWFyZ3NBcmd2LFxufSBmcm9tICcuLi9saWIvY2xpJztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiwgd3JpdGVKU09OU3luYywgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uL2xpYi9wa2cnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cy9wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHNldHVwTmN1VG9ZYXJncywgeyBucG1DaGVja1VwZGF0ZXMgfSBmcm9tICcuLi9saWIvY2xpL25jdSc7XG5pbXBvcnQge1xuXHRmaWx0ZXJSZXNvbHV0aW9ucyxcblx0SURlcGVuZGVuY2llcyxcblx0SVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93LFxuXHRwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrLFxuXHRzdHJpbmdpZnkgYXMgc3RyaW5naWZ5WWFybkxvY2ssXG5cdHJlbW92ZVJlc29sdXRpb25zQ29yZSwgc3RyaXBEZXBzTmFtZSxcbn0gZnJvbSAnLi4vbGliL3lhcm5sb2NrJztcbmltcG9ydCB7IElUU0l0ZXJhdG9yTGF6eSwgSVRTVmFsdWVPZkFycmF5IH0gZnJvbSAndHMtdHlwZSc7XG5pbXBvcnQgeyBzZXR1cFdvcmtzcGFjZXNJbml0VG9ZYXJncyB9IGZyb20gJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBjaGVja01vZGlsZUV4aXN0cywgY3Jvc3NTcGF3bk90aGVyLCBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vbGliL3NwYXduJztcblxudXBkYXRlTm90aWZpZXIoeyBwa2cgfSkubm90aWZ5KCk7XG5cbmxldCBjbGkgPSBnZXRZYXJncygpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMjxJVW5wYWNrTXlZYXJnc0FyZ3Y+KHtcblx0XHRjb21tYW5kOiAnZGVkdXBlIFtjd2RdJyxcblx0XHRkZXNjcmliZTogYERhdGEgZGVkdXBsaWNhdGlvbiBmb3IgeWFybi5sb2NrYCxcblx0XHRhbGlhc2VzOiBbJ2QnXSxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0d3JhcERlZHVwZSh5YXJncywgYXJndiwge1xuXHRcdFx0XHRtYWluKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX21zZylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhjYWNoZS55YXJubG9ja19tc2cpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUuZGlyKGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pO1xuXHRcdH0sXG5cdH0pKVxuXHQuY29tbWFuZChjcmVhdGVfY29tbWFuZDIoe1xuXHRcdGNvbW1hbmQ6ICdhZGQgW25hbWVdJyxcblx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdHtcblx0XHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzKVxuXHRcdFx0XHQub3B0aW9uKCd0eXBlcycsIHtcblx0XHRcdFx0XHRhbGlhczogWyd0eXBlJ10sXG5cdFx0XHRcdFx0ZGVzYzogYHRyeSBhdXRvIGluc3RhbGwgQHR5cGVzLypgLFxuXHRcdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0fSxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdFx0aWYgKGFyZ3NbMF0gPT09ICdhZGQnKVxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLnNoaWZ0KCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2Lm5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0YXJncy51bnNoaWZ0KGFyZ3YubmFtZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vY29uc29sZS5kaXIoYXJndik7XG5cblx0XHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0XHR7XG4vL1x0XHRcdHlhcmdzLnNob3dIZWxwKCk7XG5cblx0XHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0XHRyZXR1cm4gcHJvY2Vzcy5leGl0KDEpO1xuXHRcdFx0fVxuXG5cdFx0XHR3cmFwRGVkdXBlKHlhcmdzLCBhcmd2LCB7XG5cblx0XHRcdFx0bWFpbih5YXJnLCBhcmd2LCBjYWNoZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0XHRcdCdhZGQnLFxuXG5cdFx0XHRcdFx0XHQuLi5hcmdzLFxuXG5cdFx0XHRcdFx0XHQuLi5mbGFncyxcblxuXHRcdFx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5kZWJ1ZyhjbWRfYXJndik7XG5cblx0XHRcdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRpZiAoY3AuZXJyb3IpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhyb3cgY3AuZXJyb3Jcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYXJndi50eXBlcylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgeyByb290RGF0YSB9ID0gY2FjaGU7XG5cblx0XHRcdFx0XHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdFx0XHRcdFx0bGV0IHBrZyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZSk7XG5cblx0XHRcdFx0XHRcdGxldCBhcmdzX3R5cGVzID0gbGlzdFRvVHlwZXMoYXJncyk7XG5cblx0XHRcdFx0XHRcdGlmIChhcmdzX3R5cGVzLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGZsYWdzMiA9IGZsYWdzLnNsaWNlKCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCFhcmd2Lm9wdGlvbmFsICYmICFhcmd2LnBlZXIgJiYgIWFyZ3YuZGV2KVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZmxhZ3MyLnB1c2goJy1EJyk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRhcmdzX3R5cGVzXG5cdFx0XHRcdFx0XHRcdFx0LmZvckVhY2gobmFtZSA9PlxuXHRcdFx0XHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGV4aXN0c0RlcGVuZGVuY2llcyhuYW1lLCBwa2cpKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0J2FkZCcsXG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZSxcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHQuLi5mbGFnczIsXG5cblx0XHRcdFx0XHRcdFx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGNtZF9hcmd2KTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9zdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRlbmQoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGNhY2hlLnlhcm5sb2NrX21zZyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSk7XG5cdFx0fSxcblx0fSkpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMih7XG5cdFx0Y29tbWFuZDogJ2luc3RhbGwgW2N3ZF0nLFxuXHRcdGRlc2NyaWJlOiBgZG8gZGVkdXBlIHdoZW4geWFybiBpbnN0YWxsYCxcblx0XHRhbGlhc2VzOiBbJ2knXSxcblx0XHRidWlsZGVyOiBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJncyxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0Y29uc3QgeyBjd2QgfSA9IGFyZ3Y7XG5cblx0XHRcdGxldCBfb25jZSA9IHRydWU7XG5cblx0XHRcdHdyYXBEZWR1cGUoeWFyZ3MsIGFyZ3YsIHtcblxuXHRcdFx0XHRiZWZvcmUoeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdFx0aWYgKCFpbmZvLnlhcm5sb2NrX29sZF9leGlzdHMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgW10sIHtcblx0XHRcdFx0XHRcdFx0Y3dkLFxuXHRcdFx0XHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdF9vbmNlID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdG1haW4oeWFyZywgYXJndiwgY2FjaGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgaW5mbyA9IGluZm9Gcm9tRGVkdXBlQ2FjaGUoY2FjaGUpO1xuXG5cdFx0XHRcdFx0aWYgKGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcuZGVidWcoYHlhcm4ubG9jayBjaGFuZ2VkLCBkbyBpbnN0YWxsIGFnYWluYCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKF9vbmNlIHx8IGluZm8ueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0X29uY2UgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGFmdGVyKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IGluZm8gPSBpbmZvRnJvbURlZHVwZUNhY2hlKGNhY2hlKTtcblxuXHRcdFx0XHRcdGlmIChfb25jZSAmJiBpbmZvLnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmRlYnVnKGB5YXJuLmxvY2sgY2hhbmdlZCwgZG8gaW5zdGFsbCBhZ2FpbmApO1xuXG5cdFx0XHRcdFx0XHRjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBbXSwge1xuXHRcdFx0XHRcdFx0XHRjd2QsXG5cdFx0XHRcdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0X29uY2UgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZW5kKHlhcmcsIGFyZ3YsIGNhY2hlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGNhY2hlLnlhcm5sb2NrX29sZF9leGlzdHMgJiYgY2FjaGUueWFybmxvY2tfbXNnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGNhY2hlLnlhcm5sb2NrX21zZyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5kaXIoaW5mb0Zyb21EZWR1cGVDYWNoZShjYWNoZSkpO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH0sXG5cdH0pKVxuXHQuY29tbWFuZChjcmVhdGVfY29tbWFuZDIoe1xuXHRcdGNvbW1hbmQ6ICduY3UnLFxuXHRcdGFsaWFzZXM6IFsndXBkYXRlJywgJ3VwZ3JhZGUnLCAndXAnXSxcblx0XHRidWlsZGVyOiBzZXR1cE5jdVRvWWFyZ3MsXG5cdFx0YXN5bmMgaGFuZGxlcihhcmd2KVxuXHRcdHtcblx0XHRcdGNvbnN0IHsgY3dkIH0gPSBhcmd2O1xuXG5cdFx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRcdGN3ZCxcblx0XHRcdH0sIHRydWUpO1xuXG5cdFx0XHRjb25zb2xlLmRpcihyb290RGF0YSk7XG5cblx0XHRcdGxldCBwa2dfZmlsZV9yb290ID0gcGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXHRcdFx0bGV0IHBrZ19kYXRhID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdFx0bGV0IHJlc29sdXRpb25zID0gcGtnX2RhdGEucmVzb2x1dGlvbnM7XG5cblx0XHRcdGxldCBwa2dfZmlsZV93czogc3RyaW5nO1xuXHRcdFx0bGV0IHBrZ19kYXRhX3dzOiBJUGFja2FnZUpzb247XG5cblx0XHRcdGxldCBkb1dvcmtzcGFjZSA9ICFyb290RGF0YS5pc1dvcmtzcGFjZSAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2U7XG5cblx0XHRcdGlmIChkb1dvcmtzcGFjZSlcblx0XHRcdHtcblx0XHRcdFx0cGtnX2ZpbGVfd3MgPSBwYXRoLmpvaW4ocm9vdERhdGEud3MsICdwYWNrYWdlLmpzb24nKTtcblx0XHRcdFx0cGtnX2RhdGFfd3MgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGVfd3MpO1xuXG5cdFx0XHRcdHJlc29sdXRpb25zID0gcGtnX2RhdGFfd3MucmVzb2x1dGlvbnM7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwa2dOY3UgPSBhd2FpdCBucG1DaGVja1VwZGF0ZXMoe1xuXHRcdFx0XHRjd2QsXG5cdFx0XHRcdHJvb3REYXRhLFxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR9LCB7XG5cdFx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRcdGpzb25fb2xkOiBwa2dfZGF0YSxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAocGtnTmN1Lmpzb25fY2hhbmdlZCAmJiBhcmd2LnVwZ3JhZGUpXG5cdFx0XHR7XG5cdFx0XHRcdHdyaXRlSlNPTlN5bmMocGtnX2ZpbGUsIHBrZ05jdS5qc29uX25ldylcblx0XHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UuanNvbiB1cGRhdGVkYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2LmRlZHVwZSAmJiBPYmplY3Qua2V5cyhyZXNvbHV0aW9ucykubGVuZ3RoKVxuXHRcdFx0e1xuXG5cdFx0XHRcdGxldCBscyA9IE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXBlbmRlbmNpZXMpXG5cdFx0XHRcdFx0LmNvbmNhdChPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcuZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSwgT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3Lm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IHt9KSlcblxuXHRcdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIFtuYW1lLCB2ZXJfbmV3XSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgdmVyX29sZCA9IHJlc29sdXRpb25zW25hbWVdO1xuXG5cdFx0XHRcdFx0XHRpZiAodmVyX29sZClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRhW25hbWVdID0gdmVyX25ldztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdFx0fSwge30gYXMgSURlcGVuZGVuY2llcylcblx0XHRcdFx0O1xuXG5cdFx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdFx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlsLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdFx0bGV0IHJlc3VsdCA9IGZpbHRlclJlc29sdXRpb25zKHtcblx0XHRcdFx0XHRyZXNvbHV0aW9uczogbHNcblx0XHRcdFx0fSwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdFx0bGV0IHIyID0gcmVzdWx0Lm5hbWVzXG5cdFx0XHRcdFx0LmZpbHRlcihuYW1lID0+IHtcblxuXHRcdFx0XHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lKG5hbWUpO1xuXG5cdFx0XHRcdFx0bGV0IGRhID0gcmVzdWx0LmRlcHNbblswXV07XG5cblx0XHRcdFx0XHRpZiAoIWRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoZGFbJyonXSB8fCBsc1tuWzBdXSA9PSAnKicpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdC52YWx1ZXMoZGEpLnNvbWUoZHIgPT4ge1xuXG5cdFx0XHRcdFx0XHRpZiAobHNbbmFtZV0gPT0gbnVsbClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBib29sID0gc2VtdmVyLmx0KGRyLnZlcnNpb24sIGxzW25hbWVdKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGJvb2xcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkdWNlKChhLCBuYW1lKSA9PiB7XG5cblx0XHRcdFx0XHRcdGxldCBuID0gc3RyaXBEZXBzTmFtZShuYW1lKTtcblxuXHRcdFx0XHRcdFx0YS5uYW1lcy5wdXNoKG5hbWUpO1xuXHRcdFx0XHRcdFx0YS5kZXBzW25bMF1dID0gcmVzdWx0LmRlcHNbblswXV07XG5cblx0XHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRuYW1lczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdFx0XHRkZXBzOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nIHwgJyonLCBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c+Pixcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0bGV0IHJldCA9IHJlbW92ZVJlc29sdXRpb25zQ29yZShyMiwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCFhcmd2LnVwZ3JhZGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLm1hZ2VudGEuaW5mbyhgeW91ciBkZXBlbmRlbmNpZXMgdmVyc2lvbiBoaWdoIHRoYW4gcmVzb2x1dGlvbnNgKTtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG9gLCBjb25zb2xlLmN5YW4uY2hhbGsoYHl0IG5jdSAtdWApKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZzLndyaXRlRmlsZVN5bmMoeWwueWFybmxvY2tfZmlsZSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ldykpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGBEZWR1cGxpY2F0aW9uIHlhcm4ubG9ja2ApO1xuXHRcdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkb2AsIGNvbnNvbGUuY3lhbi5jaGFsayhgeXQgaW5zdGFsbGApKTtcblx0XHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYGZvciB1cGdyYWRlIGRlcGVuZGVuY2llcyBub3dgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH0sXG5cdH0pKVxuXHQuY29tbWFuZCh7XG5cdFx0Y29tbWFuZDogJ3B1Ymxpc2gnLFxuXHRcdGFsaWFzZXM6IFsncHVzaCddLFxuXHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdC5vcHRpb24oJ3RhZycsIHtcblx0XHRcdFx0XHRkZXNjOiBgUmVnaXN0ZXJzIHRoZSBwdWJsaXNoZWQgcGFja2FnZSB3aXRoIHRoZSBnaXZlbiB0YWcsIHN1Y2ggdGhhdCBcXGBucG0gaW5zdGFsbCBAXFxgIHdpbGwgaW5zdGFsbCB0aGlzIHZlcnNpb24uIEJ5IGRlZmF1bHQsIFxcYG5wbSBwdWJsaXNoXFxgIHVwZGF0ZXMgYW5kIFxcYG5wbSBpbnN0YWxsXFxgIGluc3RhbGxzIHRoZSBcXGBsYXRlc3RcXGAgdGFnLmAsXG5cblx0XHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5vcHRpb24oJ2FjY2VzcycsIHtcblx0XHRcdFx0XHRkZXNjOiBgVGVsbHMgdGhlIHJlZ2lzdHJ5IHdoZXRoZXIgdGhpcyBwYWNrYWdlIHNob3VsZCBiZSBwdWJsaXNoZWQgYXMgcHVibGljIG9yIHJlc3RyaWN0ZWQuIE9ubHkgYXBwbGllcyB0byBzY29wZWQgcGFja2FnZXMsIHdoaWNoIGRlZmF1bHQgdG8gcmVzdHJpY3RlZC4gSWYgeW91IGRvbuKAmXQgaGF2ZSBhIHBhaWQgYWNjb3VudCwgeW91IG11c3QgcHVibGlzaCB3aXRoIC0tYWNjZXNzIHB1YmxpYyB0byBwdWJsaXNoIHNjb3BlZCBwYWNrYWdlcy5gLFxuXHRcdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9wdGlvbignb3RwJywge1xuXHRcdFx0XHRcdGRlc2M6IGBJZiB5b3UgaGF2ZSB0d28tZmFjdG9yIGF1dGhlbnRpY2F0aW9uIGVuYWJsZWQgaW4gYXV0aC1hbmQtd3JpdGVzIG1vZGUgdGhlbiB5b3UgY2FuIHByb3ZpZGUgYSBjb2RlIGZyb20geW91ciBhdXRoZW50aWNhdG9yIHdpdGggdGhpcy4gSWYgeW91IGRvbuKAmXQgaW5jbHVkZSB0aGlzIGFuZCB5b3XigJlyZSBydW5uaW5nIGZyb20gYSBUVFkgdGhlbiB5b3XigJlsbCBiZSBwcm9tcHRlZC5gLFxuXHRcdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9wdGlvbignZHJ5LXJ1bicsIHtcblx0XHRcdFx0XHRkZXNjOiBgQXMgb2YgbnBtQDYsIGRvZXMgZXZlcnl0aGluZyBwdWJsaXNoIHdvdWxkIGRvIGV4Y2VwdCBhY3R1YWxseSBwdWJsaXNoaW5nIHRvIHRoZSByZWdpc3RyeS4gUmVwb3J0cyB0aGUgZGV0YWlscyBvZiB3aGF0IHdvdWxkIGhhdmUgYmVlbiBwdWJsaXNoZWQuYCxcblx0XHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXHRcdH0sXG5cdFx0aGFuZGxlcihhcmd2KVxuXHRcdHtcblx0XHRcdGxldCBjbWRfbGlzdCA9IHByb2Nlc3NBcmd2U2xpY2UoWydwdWJsaXNoJywgJ3B1c2gnXSkuYXJndjtcblxuXHRcdFx0Y3Jvc3NTcGF3bk90aGVyKCducG0nLCBbXG5cblx0XHRcdFx0J3B1Ymxpc2gnLFxuXG5cdFx0XHRcdC4uLmNtZF9saXN0LFxuXHRcdFx0XSwgYXJndik7XG5cdFx0fVxuXHR9KVxuXHQuY29tbWFuZChjcmVhdGVfY29tbWFuZDI8SVVucGFja015WWFyZ3NBcmd2Pih7XG5cdFx0Y29tbWFuZDogJ2luaXQnLFxuXHRcdGRlc2NyaWJlOiBgY3JlYXRlIGEgcGFja2FnZS5qc29uIGZpbGVgLFxuXHRcdGJ1aWxkZXI6IHNldHVwSW5pdFRvWWFyZ3MsXG5cdFx0aGFuZGxlcihhcmd2KVxuXHRcdHtcblx0XHRcdGxldCByZXQgPSBjaGVja01vZGlsZUV4aXN0cyh7XG5cdFx0XHRcdG5hbWU6ICducG0taW5pdDInLFxuXHRcdFx0XHRyZXF1aXJlTmFtZTogJ25wbS1pbml0Mi9iaW4vbnBtLWluaXQyJyxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIXJldClcblx0XHRcdHtcblx0XHRcdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgY21kX2xpc3QgPSBwcm9jZXNzQXJndlNsaWNlKCdpbml0JykuYXJndjtcblxuXHRcdFx0Y3Jvc3NTcGF3bk90aGVyKCdub2RlJywgW1xuXG5cdFx0XHRcdHJldCxcblxuXHRcdFx0XHQuLi5jbWRfbGlzdCxcblx0XHRcdF0sIGFyZ3YpO1xuXG5cdFx0fSxcblx0fSkpXG5cdC5jb21tYW5kKGNyZWF0ZV9jb21tYW5kMjxJVW5wYWNrTXlZYXJnc0FyZ3Y+KHtcblx0XHRjb21tYW5kOiAnd29ya3NwYWNlcyA8aW5pdHxydW4+Jyxcblx0XHRhbGlhc2VzOiBbJ3dzJywgJ3dvcmtzcGFjZXMnXSxcblx0XHRkZXNjcmliZTogYGNyZWF0ZSB5YXJuIHdvcmtzcGFjZXNgLFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRidWlsZGVyKHlhcmdzKVxuXHRcdHtcblx0XHRcdHJldHVybiB5YXJnc1xuXHRcdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdFx0Y29tbWFuZDogJ2luaXQnLFxuXHRcdFx0XHRcdGRlc2NyaWJlOiBgY3JlYXRlIHlhcm4gd29ya3NwYWNlc2AsXG5cdFx0XHRcdFx0YnVpbGRlcih5YXJncylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdFx0XHRcdFx0bmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMnLFxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlTmFtZTogJ2NyZWF0ZS15YXJuLXdvcmtzcGFjZXMvYmluL3lhcm4td3MtaW5pdCcsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0aWYgKCFyZXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3MuZXhpdCgxKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZSgnaW5pdCcpLmFyZ3Y7XG5cblx0XHRcdFx0XHRcdGNyb3NzU3Bhd25PdGhlcignbm9kZScsIFtcblxuXHRcdFx0XHRcdFx0XHRyZXQsXG5cblx0XHRcdFx0XHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XHRcdFx0XHRdLCBhcmd2KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY29tbWFuZCh7XG5cdFx0XHRcdFx0Y29tbWFuZDogJ3J1bicsXG5cdFx0XHRcdFx0ZGVzY3JpYmU6IGBydW4gYnkgbGVybmFgLFxuXHRcdFx0XHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHJldCA9IGNoZWNrTW9kaWxlRXhpc3RzKHtcblx0XHRcdFx0XHRcdFx0bmFtZTogJ2xlcm5hJyxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRpZiAoIXJldClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsZXQgY21kX2xpc3QgPSBwcm9jZXNzQXJndlNsaWNlKCdydW4nKS5hcmd2O1xuXG5cdFx0XHRcdFx0XHRjcm9zc1NwYXduT3RoZXIoJ2xlcm5hJywgW1xuXG5cdFx0XHRcdFx0XHRcdCdydW4nLFxuXG5cdFx0XHRcdFx0XHRcdC4uLmNtZF9saXN0LFxuXHRcdFx0XHRcdFx0XSwgYXJndik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSlcblx0XHRcdFx0LnN0cmljdCgpXG5cdFx0XHRcdC5kZW1hbmRDb21tYW5kKClcblx0XHRcdDtcblx0XHR9LFxuXHRcdGFzeW5jIGhhbmRsZXIoYXJndilcblx0XHR7XG5cblx0XHR9LFxuXHR9KSlcblx0LmNvbW1hbmQoY3JlYXRlX2NvbW1hbmQyPElVbnBhY2tNeVlhcmdzQXJndj4oe1xuXHRcdGNvbW1hbmQ6ICdzb3J0Jyxcblx0XHRkZXNjcmliZTogYHNvcnQgcGFja2FnZS5qc29uIGZpbGVgLFxuXHRcdGJ1aWxkZXIoeWFyZ3MpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHlhcmdzXG5cdFx0fSxcblx0XHRoYW5kbGVyKGFyZ3YpXG5cdFx0e1xuXHRcdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0XHQuLi5hcmd2LFxuXHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0fSwgdHJ1ZSk7XG5cblx0XHRcdGxldCBqc29uX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRcdGxldCBqc29uID0gcmVhZFBhY2thZ2VKc29uKGpzb25fZmlsZSk7XG5cblx0XHRcdHNvcnRQYWNrYWdlSnNvbihqc29uKTtcblx0XHRcdHdyaXRlUGFja2FnZUpzb24oanNvbl9maWxlLCBqc29uKTtcblxuXHRcdFx0Y29uc29sZURlYnVnLmxvZyhgc29ydDogJHtqc29uX2ZpbGV9YCk7XG5cblx0XHR9LFxuXHR9KSlcblx0LmhlbHAodHJ1ZSlcblx0LnNob3dIZWxwT25GYWlsKHRydWUpXG5cdC5zdHJpY3QoKVxuXHQuZGVtYW5kQ29tbWFuZCgpXG47XG5cbmNsaS5hcmd2O1xuXG4iXX0=