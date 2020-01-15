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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFDM0QsMkRBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSw2REFBNkQ7SUFFdkUsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssRUFBRTtZQUNqQyxjQUFjLEVBQUUsSUFBSTtTQUNwQixDQUFDO2FBQ0EsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksRUFBRSxnQ0FBZ0M7WUFDdEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSxpREFBaUQ7WUFDdkQsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQ3ZCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lB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Q0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRixLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIHByaW50Um9vdERhdGEgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoJ3lhcmdzJyk7XG5pbXBvcnQge1xuXHRleGlzdHNEZXBlbmRlbmNpZXMsXG5cdGZsYWdzWWFybkFkZCxcblx0bGlzdFRvVHlwZXMsXG5cdHBhcnNlQXJndlBrZ05hbWUsXG5cdHNldHVwWWFybkFkZFRvWWFyZ3MsXG59IGZyb20gJy4uLy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcbmltcG9ydCB7IGZldGNoUGFja2FnZUpzb25JbmZvIH0gZnJvbSAnLi4vLi4vbGliL2NsaS90eXBlcyc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgW25hbWVdJyxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBJbnN0YWxscyBAdHlwZXMvKiBvZiBwYWNrYWdlcyBpZiBub3QgZXhpc3RzIGluIHBhY2thZ2UuanNvbmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzLCB7XG5cdFx0XHRhbGxvd0VtcHR5TmFtZTogdHJ1ZSxcblx0XHR9KVxuXHRcdFx0Lm9wdGlvbignYXV0bycsIHtcblx0XHRcdFx0ZGVzYzogYGF1dG8gaW5zdGFsbCBmcm9tIHBhY2thZ2UuanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignYWxsJywge1xuXHRcdFx0XHRkZXNjOiBgZGVwZW5kZW5jaWVzLCBkZXZEZXBlbmRlbmNpZXMgZnJvbSBwYWNrYWdlLmpzb25gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0YXN5bmMgaGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdGlmIChhcmdzWzBdID09PSAndHlwZXMnKVxuXHRcdHtcblx0XHRcdGFyZ3Muc2hpZnQoKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5uYW1lKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGFyZ3MudW5zaGlmdChhcmd2Lm5hbWUpO1xuXHRcdH1cblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0fSk7XG5cblx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQgcGtnID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdGlmIChhcmd2LmF1dG8pXG5cdFx0e1xuXHRcdFx0bGV0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRpZiAoKGFyZ3YuZGV2IHx8IGFyZ3YuYWxsKSAmJiBwa2cuZGV2RGVwZW5kZW5jaWVzKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5kZXZEZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFyZ3YucGVlciB8fCBhcmd2Lm9wdGlvbmFsKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYXJndi5wZWVyICYmIHBrZy5wZWVyRGVwZW5kZW5jaWVzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cucGVlckRlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFyZ3Yub3B0aW9uYWwgJiYgcGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoIWFyZ3YuZGV2ICYmIHBrZy5kZXBlbmRlbmNpZXMpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLmRlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXJndi5hbGwgJiYgcGtnLmRlcGVuZGVuY2llcylcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuYW1lcy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MucHVzaCguLi5uYW1lcyk7XG5cdFx0XHR9XG5cblx0XHRcdGFyZ3Yub3B0aW9uYWwgPSBhcmd2LnBlZXIgPSBhcmd2LmRldiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGFyZ3MgPSBhcmdzLnJlZHVjZSgoYSwgYikgPT4ge1xuXG5cdFx0XHRcdGIgPSBiLnJlcGxhY2UoL15AdHlwZXNcXC8vLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFiLmluY2x1ZGVzKCcvJykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLnB1c2goYik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIFtdIGFzIHN0cmluZ1tdKTtcblxuXHRcdFx0YXJncyA9IGFycmF5X3VuaXF1ZShhcmdzKTtcblxuXHRcdFx0aWYgKCFhcmdzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZURlYnVnLndhcm4oYG5vIHBhY2thZ2UgbGlzdCBmb3IgaW5zdGFsbCB0eXBlc2ApO1xuXG5cdFx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblx0XHRsZXQgZmxhZ3MyID0gZmxhZ3Muc2xpY2UoKTtcblxuXHRcdGlmICghYXJndi5vcHRpb25hbCAmJiAhYXJndi5wZWVyICYmICFhcmd2LmRldilcblx0XHR7XG5cdFx0XHRmbGFnczIucHVzaCgnLUQnKTtcblx0XHR9XG5cblx0XHRsZXQgbGlzdDogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgd2FybnM6IGFueVtdID0gW107XG5cblx0XHRmb3IgKGxldCBwYWNrYWdlTmFtZSBvZiBhcmdzKVxuXHRcdHtcblx0XHRcdHBhY2thZ2VOYW1lID0gYEB0eXBlcy8ke3BhY2thZ2VOYW1lfWA7XG5cdFx0XHRsZXQgbSA9IHBhcnNlQXJndlBrZ05hbWUocGFja2FnZU5hbWUpO1xuXG5cdFx0XHRpZiAoIW0pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgW2Vycm9yXWAsIHBhY2thZ2VOYW1lKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCB7IHZlcnNpb24sIG5hbWUsIG5hbWVzcGFjZSB9ID0gbTtcblx0XHRcdGlmIChuYW1lc3BhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWUgPSBuYW1lc3BhY2UgKyAnLycgKyBuYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWUsIHBrZykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS53YXJuKGBbc2tpcF1gLCBgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW3NraXBdYCwgYCR7bmFtZX0gYWxyZWFkeSBleGlzdHMgaW4gcGFja2FnZS5qc29uYF0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB0YXJnZXQgPSBhd2FpdCBmZXRjaFBhY2thZ2VKc29uSW5mbyhwYWNrYWdlTmFtZSk7XG5cblx0XHRcdGlmICh0YXJnZXQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0d2FybnMucHVzaChbYFt3YXJuXWAsIGAke25hbWV9IG5vdCBleGlzdHNgXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0YXJnZXQuZGVwcmVjYXRlZClcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYFtza2lwXWAsIHRhcmdldC5kZXByZWNhdGVkKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW2lnbm9yZV1gLCB0YXJnZXQubmFtZSwgJ++8micsIHRhcmdldC5kZXByZWNhdGVkXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxpc3QucHVzaCh0YXJnZXQubmFtZSArIGBAXiR7dGFyZ2V0LnZlcnNpb259YCk7XG5cdFx0fVxuXG5cdFx0aWYgKGxpc3QubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0J2FkZCcsXG5cdFx0XHRcdC4uLmxpc3QsXG5cdFx0XHRcdC4uLmZsYWdzMixcblx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoY3AuZXJyb3IpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwcmludFdhcm5zKCk7XG5cblx0XHRcdGNvbnNvbGUud2FybihgW3dhcm5dYCwgYG5vIGFueSBuZXcgdHlwZXMgaW5zdGFsbGApO1xuXHRcdH1cblxuXHRcdHByaW50V2FybnMoKTtcblxuXHRcdGZ1bmN0aW9uIHByaW50V2FybnMoKVxuXHRcdHtcblx0XHRcdHdhcm5zLmZvckVhY2goKFtsYWJlbCwgLi4uYXJyXSkgPT4gY29uc29sZS5pbmZvKGNvbnNvbGUucmVkLmNoYWxrKGxhYmVsKSwgLi4uYXJyKSk7XG5cdFx0XHR3YXJucyA9IFtdO1xuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19