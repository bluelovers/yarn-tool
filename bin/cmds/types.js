"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const add_1 = require("../../lib/cli/add");
const crossSpawn = require("cross-spawn-extra");
const types_1 = require("../../lib/cli/types");
const array_hyper_unique_1 = require("array-hyper-unique");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs @types/* of packages if not exists in package.json`,
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs, {
            allowEmptyName: true,
        })
            .option('auto', {
            desc: `auto install from package.json`,
            boolean: true,
        })
            .option('all', {
            desc: `dependencies, devDependencies from package.json`,
            boolean: true,
        })
            .strict(false);
    },
    async handler(argv) {
        let args = argv._.slice();
        if (args[0] === 'types') {
            args.shift();
        }
        if (argv.name) {
            // @ts-ignore
            args.unshift(argv.name);
        }
        let rootData = index_1.findRoot({
            ...argv,
        });
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg = package_dts_1.readPackageJson(pkg_file);
        if (argv.auto) {
            let names = [];
            if ((argv.dev || argv.all) && pkg.devDependencies) {
                names.push(...Object.keys(pkg.devDependencies || []));
            }
            if (argv.peer || argv.optional) {
                if (argv.peer && pkg.peerDependencies) {
                    names.push(...Object.keys(pkg.peerDependencies || []));
                }
                if (argv.optional && pkg.optionalDependencies) {
                    names.push(...Object.keys(pkg.optionalDependencies || []));
                }
            }
            else if (!argv.dev && pkg.dependencies) {
                names.push(...Object.keys(pkg.dependencies || []));
            }
            if (argv.all && pkg.dependencies) {
                names.push(...Object.keys(pkg.dependencies || []));
            }
            if (names.length) {
                args.push(...names);
            }
            argv.optional = argv.peer = argv.dev = false;
        }
        if (!args.length) {
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
        }
        else {
            args = args.reduce((a, b) => {
                b = b.replace(/^@types\//, '');
                if (!b.includes('/')) {
                    a.push(b);
                }
                return a;
            }, []);
            args = array_hyper_unique_1.array_unique(args);
            if (!args.length) {
                index_1.consoleDebug.warn(`no package list for install types`);
                return process.exit();
            }
        }
        let flags = add_1.flagsYarnAdd(argv).filter(v => v != null);
        let flags2 = flags.slice();
        if (!argv.optional && !argv.peer && !argv.dev) {
            flags2.push('-D');
        }
        let list = [];
        let warns = [];
        for (let packageName of args) {
            packageName = `@types/${packageName}`;
            let m = add_1.parseArgvPkgName(packageName);
            if (!m) {
                index_1.console.warn(`[error]`, packageName);
                continue;
            }
            let { version, name, namespace } = m;
            if (namespace) {
                name = namespace + '/' + name;
            }
            if (add_1.existsDependencies(name, pkg)) {
                //console.warn(`[skip]`, `${name} already exists in package.json`);
                warns.push([`[skip]`, `${name} already exists in package.json`]);
                continue;
            }
            const target = await types_1.fetchPackageJsonInfo(packageName);
            if (target == null) {
                warns.push([`[warn]`, `${name} not exists`]);
                continue;
            }
            if (target.deprecated) {
                //console.warn(`[skip]`, target.deprecated);
                warns.push([`[ignore]`, target.name, '：', target.deprecated]);
                continue;
            }
            list.push(target.name + `@^${target.version}`);
        }
        if (list.length) {
            let cmd_argv = [
                'add',
                ...list,
                ...flags2,
            ].filter(v => v != null);
            let cp = crossSpawn.sync('yarn', cmd_argv, {
                cwd: argv.cwd,
                stdio: 'inherit',
            });
            if (cp.error) {
                throw cp.error;
            }
        }
        else {
            printWarns();
            index_1.console.warn(`[warn]`, `no any new types install`);
        }
        printWarns();
        function printWarns() {
            warns.forEach(([label, ...arr]) => index_1.console.info(index_1.console.red.chalk(label), ...arr));
            warns = [];
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFDM0QsMkRBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSw2REFBNkQ7SUFFdkUsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssRUFBRTtZQUNqQyxjQUFjLEVBQUUsSUFBSTtTQUNwQixDQUFDO2FBQ0EsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksRUFBRSxnQ0FBZ0M7WUFDdEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSxpREFBaUQ7WUFDdkQsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQ3ZCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lBQ3ZCLEdBQUcsSUFBSTtTQUNQLENBQUMsQ0FBQztRQUVILElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUV2RCxJQUFJLEdBQUcsR0FBRyw2QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBDLElBQUksSUFBSSxDQUFDLElBQUksRUFDYjtZQUNDLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztZQUV6QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsRUFDakQ7Z0JBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3REO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQzlCO2dCQUNDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEVBQ3JDO29CQUNDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN2RDtnQkFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLG9CQUFvQixFQUM3QztvQkFDQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDM0Q7YUFDRDtpQkFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxFQUN0QztnQkFDQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkQ7WUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksRUFDaEM7Z0JBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUNoQjtnQkFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7YUFDcEI7WUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7U0FDN0M7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFDaEI7WUFDQyxvQkFBWSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1lBRXZFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QjthQUVEO1lBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBRTNCLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFL0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQ3BCO29CQUNDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ1Y7Z0JBRUQsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUM7WUFFbkIsSUFBSSxHQUFHLGlDQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCO2dCQUNDLG9CQUFZLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Z0JBRXZELE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3RCO1NBQ0Q7UUFFRCxJQUFJLEtBQUssR0FBRyxrQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFDN0M7WUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsSUFBSSxJQUFJLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLElBQUksS0FBSyxHQUFVLEVBQUUsQ0FBQztRQUV0QixLQUFLLElBQUksV0FBVyxJQUFJLElBQUksRUFDNUI7WUFDQyxXQUFXLEdBQUcsVUFBVSxXQUFXLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsR0FBRyxzQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV0QyxJQUFJLENBQUMsQ0FBQyxFQUNOO2dCQUNDLGVBQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNyQyxTQUFTO2FBQ1Q7WUFFRCxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsSUFBSSxTQUFTLEVBQ2I7Z0JBQ0MsSUFBSSxHQUFHLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO2FBQzlCO1lBRUQsSUFBSSx3QkFBa0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQ2pDO2dCQUNDLG1FQUFtRTtnQkFFbkUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksaUNBQWlDLENBQUMsQ0FBQyxDQUFDO2dCQUVqRSxTQUFTO2FBQ1Q7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLDRCQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXZELElBQUksTUFBTSxJQUFJLElBQUksRUFDbEI7Z0JBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFFN0MsU0FBUzthQUNUO1lBRUQsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUNyQjtnQkFDQyw0Q0FBNEM7Z0JBRTVDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBRTlELFNBQVM7YUFDVDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUNmO1lBQ0MsSUFBSSxRQUFRLEdBQUc7Z0JBQ2QsS0FBSztnQkFDTCxHQUFHLElBQUk7Z0JBQ1AsR0FBRyxNQUFNO2FBQ1QsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7WUFFekIsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO2dCQUMxQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsS0FBSyxFQUFFLFNBQVM7YUFDaEIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUNaO2dCQUNDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQTthQUNkO1NBQ0Q7YUFFRDtZQUNDLFVBQVUsRUFBRSxDQUFDO1lBRWIsZUFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztTQUNuRDtRQUVELFVBQVUsRUFBRSxDQUFDO1FBRWIsU0FBUyxVQUFVO1lBRWxCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRixLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIHByaW50Um9vdERhdGEgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7XG5cdGV4aXN0c0RlcGVuZGVuY2llcyxcblx0ZmxhZ3NZYXJuQWRkLFxuXHRsaXN0VG9UeXBlcyxcblx0cGFyc2VBcmd2UGtnTmFtZSxcblx0c2V0dXBZYXJuQWRkVG9ZYXJncyxcbn0gZnJvbSAnLi4vLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0IHsgZmV0Y2hQYWNrYWdlSnNvbkluZm8gfSBmcm9tICcuLi8uLi9saWIvY2xpL3R5cGVzJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbbmFtZV0nLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYEluc3RhbGxzIEB0eXBlcy8qIG9mIHBhY2thZ2VzIGlmIG5vdCBleGlzdHMgaW4gcGFja2FnZS5qc29uYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwWWFybkFkZFRvWWFyZ3MoeWFyZ3MsIHtcblx0XHRcdGFsbG93RW1wdHlOYW1lOiB0cnVlLFxuXHRcdH0pXG5cdFx0XHQub3B0aW9uKCdhdXRvJywge1xuXHRcdFx0XHRkZXNjOiBgYXV0byBpbnN0YWxsIGZyb20gcGFja2FnZS5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdhbGwnLCB7XG5cdFx0XHRcdGRlc2M6IGBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcyBmcm9tIHBhY2thZ2UuanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgYXJncyA9IGFyZ3YuXy5zbGljZSgpO1xuXG5cdFx0aWYgKGFyZ3NbMF0gPT09ICd0eXBlcycpXG5cdFx0e1xuXHRcdFx0YXJncy5zaGlmdCgpO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2Lm5hbWUpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0YXJncy51bnNoaWZ0KGFyZ3YubmFtZSk7XG5cdFx0fVxuXG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHR9KTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2cgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0aWYgKGFyZ3YuYXV0bylcblx0XHR7XG5cdFx0XHRsZXQgbmFtZXM6IHN0cmluZ1tdID0gW107XG5cblx0XHRcdGlmICgoYXJndi5kZXYgfHwgYXJndi5hbGwpICYmIHBrZy5kZXZEZXBlbmRlbmNpZXMpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLmRldkRlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXJndi5wZWVyIHx8IGFyZ3Yub3B0aW9uYWwpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhcmd2LnBlZXIgJiYgcGtnLnBlZXJEZXBlbmRlbmNpZXMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5wZWVyRGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi5vcHRpb25hbCAmJiBwa2cub3B0aW9uYWxEZXBlbmRlbmNpZXMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5vcHRpb25hbERlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICghYXJndi5kZXYgJiYgcGtnLmRlcGVuZGVuY2llcylcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2LmFsbCAmJiBwa2cuZGVwZW5kZW5jaWVzKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5kZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5hbWVzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0YXJncy5wdXNoKC4uLm5hbWVzKTtcblx0XHRcdH1cblxuXHRcdFx0YXJndi5vcHRpb25hbCA9IGFyZ3YucGVlciA9IGFyZ3YuZGV2ID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKCFhcmdzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRjb25zb2xlRGVidWcuZXJyb3IoYE1pc3NpbmcgbGlzdCBvZiBwYWNrYWdlcyB0byBhZGQgdG8geW91ciBwcm9qZWN0LmApO1xuXG5cdFx0XHRyZXR1cm4gcHJvY2Vzcy5leGl0KDEpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0YXJncyA9IGFyZ3MucmVkdWNlKChhLCBiKSA9PiB7XG5cblx0XHRcdFx0YiA9IGIucmVwbGFjZSgvXkB0eXBlc1xcLy8sICcnKTtcblxuXHRcdFx0XHRpZiAoIWIuaW5jbHVkZXMoJy8nKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fSwgW10gYXMgc3RyaW5nW10pO1xuXG5cdFx0XHRhcmdzID0gYXJyYXlfdW5pcXVlKGFyZ3MpO1xuXG5cdFx0XHRpZiAoIWFyZ3MubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlRGVidWcud2Fybihgbm8gcGFja2FnZSBsaXN0IGZvciBpbnN0YWxsIHR5cGVzYCk7XG5cblx0XHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBmbGFncyA9IGZsYWdzWWFybkFkZChhcmd2KS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXHRcdGxldCBmbGFnczIgPSBmbGFncy5zbGljZSgpO1xuXG5cdFx0aWYgKCFhcmd2Lm9wdGlvbmFsICYmICFhcmd2LnBlZXIgJiYgIWFyZ3YuZGV2KVxuXHRcdHtcblx0XHRcdGZsYWdzMi5wdXNoKCctRCcpO1xuXHRcdH1cblxuXHRcdGxldCBsaXN0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdGxldCB3YXJuczogYW55W10gPSBbXTtcblxuXHRcdGZvciAobGV0IHBhY2thZ2VOYW1lIG9mIGFyZ3MpXG5cdFx0e1xuXHRcdFx0cGFja2FnZU5hbWUgPSBgQHR5cGVzLyR7cGFja2FnZU5hbWV9YDtcblx0XHRcdGxldCBtID0gcGFyc2VBcmd2UGtnTmFtZShwYWNrYWdlTmFtZSk7XG5cblx0XHRcdGlmICghbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGBbZXJyb3JdYCwgcGFja2FnZU5hbWUpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHsgdmVyc2lvbiwgbmFtZSwgbmFtZXNwYWNlIH0gPSBtO1xuXHRcdFx0aWYgKG5hbWVzcGFjZSlcblx0XHRcdHtcblx0XHRcdFx0bmFtZSA9IG5hbWVzcGFjZSArICcvJyArIG5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChleGlzdHNEZXBlbmRlbmNpZXMobmFtZSwgcGtnKSlcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYFtza2lwXWAsIGAke25hbWV9IGFscmVhZHkgZXhpc3RzIGluIHBhY2thZ2UuanNvbmApO1xuXG5cdFx0XHRcdHdhcm5zLnB1c2goW2Bbc2tpcF1gLCBgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHRhcmdldCA9IGF3YWl0IGZldGNoUGFja2FnZUpzb25JbmZvKHBhY2thZ2VOYW1lKTtcblxuXHRcdFx0aWYgKHRhcmdldCA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHR3YXJucy5wdXNoKFtgW3dhcm5dYCwgYCR7bmFtZX0gbm90IGV4aXN0c2BdKTtcblxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRhcmdldC5kZXByZWNhdGVkKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUud2FybihgW3NraXBdYCwgdGFyZ2V0LmRlcHJlY2F0ZWQpO1xuXG5cdFx0XHRcdHdhcm5zLnB1c2goW2BbaWdub3JlXWAsIHRhcmdldC5uYW1lLCAn77yaJywgdGFyZ2V0LmRlcHJlY2F0ZWRdKTtcblxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGlzdC5wdXNoKHRhcmdldC5uYW1lICsgYEBeJHt0YXJnZXQudmVyc2lvbn1gKTtcblx0XHR9XG5cblx0XHRpZiAobGlzdC5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHQnYWRkJyxcblx0XHRcdFx0Li4ubGlzdCxcblx0XHRcdFx0Li4uZmxhZ3MyLFxuXHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgY3AuZXJyb3Jcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHByaW50V2FybnMoKTtcblxuXHRcdFx0Y29uc29sZS53YXJuKGBbd2Fybl1gLCBgbm8gYW55IG5ldyB0eXBlcyBpbnN0YWxsYCk7XG5cdFx0fVxuXG5cdFx0cHJpbnRXYXJucygpO1xuXG5cdFx0ZnVuY3Rpb24gcHJpbnRXYXJucygpXG5cdFx0e1xuXHRcdFx0d2FybnMuZm9yRWFjaCgoW2xhYmVsLCAuLi5hcnJdKSA9PiBjb25zb2xlLmluZm8oY29uc29sZS5yZWQuY2hhbGsobGFiZWwpLCAuLi5hcnIpKTtcblx0XHRcdHdhcm5zID0gW107XG5cdFx0fVxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=