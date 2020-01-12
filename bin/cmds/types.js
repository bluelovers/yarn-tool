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
            if (argv.dev || argv.all) {
                names.push(...Object.keys(pkg.devDependencies || []));
            }
            if (argv.peer || argv.optional) {
                if (argv.peer) {
                    names.push(...Object.keys(pkg.peerDependencies || []));
                }
                if (argv.optional) {
                    names.push(...Object.keys(pkg.optionalDependencies || []));
                }
            }
            else if (!argv.dev) {
                names.push(...Object.keys(pkg.dependencies || []));
            }
            if (argv.all) {
                names.push(...Object.keys(pkg.dependencies || []));
            }
            if (names.length) {
                args.push(...names);
            }
            argv.optional = argv.peer = argv.dev = false;
        }
        args = array_hyper_unique_1.array_unique(args);
        if (!args.length) {
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFDM0QsMkRBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSw2REFBNkQ7SUFFdkUsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssRUFBRTtZQUNqQyxjQUFjLEVBQUUsSUFBSTtTQUNwQixDQUFDO2FBQ0EsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksRUFBRSxnQ0FBZ0M7WUFDdEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSxpREFBaUQ7WUFDdkQsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQ3ZCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lB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ekIsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO2dCQUMxQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsS0FBSyxFQUFFLFNBQVM7YUFDaEIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUNaO2dCQUNDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQTthQUNkO1NBQ0Q7YUFFRDtZQUNDLFVBQVUsRUFBRSxDQUFDO1lBRWIsZUFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztTQUNuRDtRQUVELFVBQVUsRUFBRSxDQUFDO1FBRWIsU0FBUyxVQUFVO1lBRWxCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLGVBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRixLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIHByaW50Um9vdERhdGEgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgaW5mb0Zyb21EZWR1cGVDYWNoZSwgd3JhcERlZHVwZSB9IGZyb20gJy4uLy4uL2xpYi9jbGkvZGVkdXBlJztcbmltcG9ydCB5YXJncyA9IHJlcXVpcmUoJ3lhcmdzJyk7XG5pbXBvcnQge1xuXHRleGlzdHNEZXBlbmRlbmNpZXMsXG5cdGZsYWdzWWFybkFkZCxcblx0bGlzdFRvVHlwZXMsXG5cdHBhcnNlQXJndlBrZ05hbWUsXG5cdHNldHVwWWFybkFkZFRvWWFyZ3MsXG59IGZyb20gJy4uLy4uL2xpYi9jbGkvYWRkJztcbmltcG9ydCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcbmltcG9ydCB7IGZldGNoUGFja2FnZUpzb25JbmZvIH0gZnJvbSAnLi4vLi4vbGliL2NsaS90eXBlcyc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgW25hbWVdJyxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBJbnN0YWxscyBAdHlwZXMvKiBvZiBwYWNrYWdlcyBpZiBub3QgZXhpc3RzIGluIHBhY2thZ2UuanNvbmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzLCB7XG5cdFx0XHRhbGxvd0VtcHR5TmFtZTogdHJ1ZSxcblx0XHR9KVxuXHRcdFx0Lm9wdGlvbignYXV0bycsIHtcblx0XHRcdFx0ZGVzYzogYGF1dG8gaW5zdGFsbCBmcm9tIHBhY2thZ2UuanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignYWxsJywge1xuXHRcdFx0XHRkZXNjOiBgZGVwZW5kZW5jaWVzLCBkZXZEZXBlbmRlbmNpZXMgZnJvbSBwYWNrYWdlLmpzb25gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0YXN5bmMgaGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdGlmIChhcmdzWzBdID09PSAndHlwZXMnKVxuXHRcdHtcblx0XHRcdGFyZ3Muc2hpZnQoKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5uYW1lKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGFyZ3MudW5zaGlmdChhcmd2Lm5hbWUpO1xuXHRcdH1cblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0fSk7XG5cblx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQgcGtnID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdGlmIChhcmd2LmF1dG8pXG5cdFx0e1xuXHRcdFx0bGV0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0XHRpZiAoYXJndi5kZXYgfHwgYXJndi5hbGwpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLmRldkRlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXJndi5wZWVyIHx8IGFyZ3Yub3B0aW9uYWwpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhcmd2LnBlZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5wZWVyRGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi5vcHRpb25hbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFhcmd2LmRldilcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2LmFsbClcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuYW1lcy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MucHVzaCguLi5uYW1lcyk7XG5cdFx0XHR9XG5cblx0XHRcdGFyZ3Yub3B0aW9uYWwgPSBhcmd2LnBlZXIgPSBhcmd2LmRldiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdGFyZ3MgPSBhcnJheV91bmlxdWUoYXJncyk7XG5cblx0XHRpZiAoIWFyZ3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5lcnJvcihgTWlzc2luZyBsaXN0IG9mIHBhY2thZ2VzIHRvIGFkZCB0byB5b3VyIHByb2plY3QuYCk7XG5cblx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXG5cdFx0bGV0IGZsYWdzID0gZmxhZ3NZYXJuQWRkKGFyZ3YpLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cdFx0bGV0IGZsYWdzMiA9IGZsYWdzLnNsaWNlKCk7XG5cblx0XHRpZiAoIWFyZ3Yub3B0aW9uYWwgJiYgIWFyZ3YucGVlciAmJiAhYXJndi5kZXYpXG5cdFx0e1xuXHRcdFx0ZmxhZ3MyLnB1c2goJy1EJyk7XG5cdFx0fVxuXG5cdFx0bGV0IGxpc3Q6IHN0cmluZ1tdID0gW107XG5cdFx0bGV0IHdhcm5zOiBhbnlbXSA9IFtdO1xuXG5cdFx0Zm9yIChsZXQgcGFja2FnZU5hbWUgb2YgYXJncylcblx0XHR7XG5cdFx0XHRwYWNrYWdlTmFtZSA9IGBAdHlwZXMvJHtwYWNrYWdlTmFtZX1gO1xuXHRcdFx0bGV0IG0gPSBwYXJzZUFyZ3ZQa2dOYW1lKHBhY2thZ2VOYW1lKTtcblxuXHRcdFx0aWYgKCFtKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYFtlcnJvcl1gLCBwYWNrYWdlTmFtZSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgeyB2ZXJzaW9uLCBuYW1lLCBuYW1lc3BhY2UgfSA9IG07XG5cdFx0XHRpZiAobmFtZXNwYWNlKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lID0gbmFtZXNwYWNlICsgJy8nICsgbmFtZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGV4aXN0c0RlcGVuZGVuY2llcyhuYW1lLCBwa2cpKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUud2FybihgW3NraXBdYCwgYCR7bmFtZX0gYWxyZWFkeSBleGlzdHMgaW4gcGFja2FnZS5qc29uYCk7XG5cblx0XHRcdFx0d2FybnMucHVzaChbYFtza2lwXWAsIGAke25hbWV9IGFscmVhZHkgZXhpc3RzIGluIHBhY2thZ2UuanNvbmBdKTtcblxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgdGFyZ2V0ID0gYXdhaXQgZmV0Y2hQYWNrYWdlSnNvbkluZm8ocGFja2FnZU5hbWUpO1xuXG5cdFx0XHRpZiAodGFyZ2V0ID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHdhcm5zLnB1c2goW2Bbd2Fybl1gLCBgJHtuYW1lfSBub3QgZXhpc3RzYF0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGFyZ2V0LmRlcHJlY2F0ZWQpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS53YXJuKGBbc2tpcF1gLCB0YXJnZXQuZGVwcmVjYXRlZCk7XG5cblx0XHRcdFx0d2FybnMucHVzaChbYFtpZ25vcmVdYCwgdGFyZ2V0Lm5hbWUsICfvvJonLCB0YXJnZXQuZGVwcmVjYXRlZF0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsaXN0LnB1c2godGFyZ2V0Lm5hbWUgKyBgQF4ke3RhcmdldC52ZXJzaW9ufWApO1xuXHRcdH1cblxuXHRcdGlmIChsaXN0Lmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgY21kX2FyZ3YgPSBbXG5cdFx0XHRcdCdhZGQnLFxuXHRcdFx0XHQuLi5saXN0LFxuXHRcdFx0XHQuLi5mbGFnczIsXG5cdFx0XHRdLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cblx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd24uc3luYygneWFybicsIGNtZF9hcmd2LCB7XG5cdFx0XHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0XHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGNwLmVycm9yKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBjcC5lcnJvclxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cHJpbnRXYXJucygpO1xuXG5cdFx0XHRjb25zb2xlLndhcm4oYFt3YXJuXWAsIGBubyBhbnkgbmV3IHR5cGVzIGluc3RhbGxgKTtcblx0XHR9XG5cblx0XHRwcmludFdhcm5zKCk7XG5cblx0XHRmdW5jdGlvbiBwcmludFdhcm5zKClcblx0XHR7XG5cdFx0XHR3YXJucy5mb3JFYWNoKChbbGFiZWwsIC4uLmFycl0pID0+IGNvbnNvbGUuaW5mbyhjb25zb2xlLnJlZC5jaGFsayhsYWJlbCksIC4uLmFycikpO1xuXHRcdFx0d2FybnMgPSBbXTtcblx0XHR9XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==