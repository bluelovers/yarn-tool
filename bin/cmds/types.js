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
                a.push(b);
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
            let m = add_1.parseArgvPkgName(packageName);
            if (!m) {
                index_1.console.warn(`[error]`, packageName);
                continue;
            }
            let { version, name, namespace } = m;
            if (namespace) {
                name = namespace.replace('@', '') + '__' + name;
            }
            packageName = name = `@types/${name}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFDM0QsMkRBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSw2REFBNkQ7SUFFdkUsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssRUFBRTtZQUNqQyxjQUFjLEVBQUUsSUFBSTtTQUNwQixDQUFDO2FBQ0EsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksRUFBRSxnQ0FBZ0M7WUFDdEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksRUFBRSxpREFBaUQ7WUFDdkQsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQ3ZCO1lBQ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQ2I7WUFDQyxhQUFhO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lB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RSxDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25GLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0YsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgcHJpbnRSb290RGF0YSB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHtcblx0ZXhpc3RzRGVwZW5kZW5jaWVzLFxuXHRmbGFnc1lhcm5BZGQsXG5cdGxpc3RUb1R5cGVzLFxuXHRwYXJzZUFyZ3ZQa2dOYW1lLFxuXHRzZXR1cFlhcm5BZGRUb1lhcmdzLFxufSBmcm9tICcuLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBmZXRjaFBhY2thZ2VKc29uSW5mbyB9IGZyb20gJy4uLy4uL2xpYi9jbGkvdHlwZXMnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtuYW1lXScsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgSW5zdGFsbHMgQHR5cGVzLyogb2YgcGFja2FnZXMgaWYgbm90IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuQWRkVG9ZYXJncyh5YXJncywge1xuXHRcdFx0YWxsb3dFbXB0eU5hbWU6IHRydWUsXG5cdFx0fSlcblx0XHRcdC5vcHRpb24oJ2F1dG8nLCB7XG5cdFx0XHRcdGRlc2M6IGBhdXRvIGluc3RhbGwgZnJvbSBwYWNrYWdlLmpzb25gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2FsbCcsIHtcblx0XHRcdFx0ZGVzYzogYGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzIGZyb20gcGFja2FnZS5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGFzeW5jIGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCBhcmdzID0gYXJndi5fLnNsaWNlKCk7XG5cblx0XHRpZiAoYXJnc1swXSA9PT0gJ3R5cGVzJylcblx0XHR7XG5cdFx0XHRhcmdzLnNoaWZ0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YubmFtZSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmdzLnVuc2hpZnQoYXJndi5uYW1lKTtcblx0XHR9XG5cblx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdH0pO1xuXG5cdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0bGV0IHBrZyA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZSk7XG5cblx0XHRpZiAoYXJndi5hdXRvKVxuXHRcdHtcblx0XHRcdGxldCBuYW1lczogc3RyaW5nW10gPSBbXTtcblxuXHRcdFx0aWYgKChhcmd2LmRldiB8fCBhcmd2LmFsbCkgJiYgcGtnLmRldkRlcGVuZGVuY2llcylcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2LnBlZXIgfHwgYXJndi5vcHRpb25hbClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFyZ3YucGVlciAmJiBwa2cucGVlckRlcGVuZGVuY2llcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhcmd2Lm9wdGlvbmFsICYmIHBrZy5vcHRpb25hbERlcGVuZGVuY2llcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFhcmd2LmRldiAmJiBwa2cuZGVwZW5kZW5jaWVzKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5kZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFyZ3YuYWxsICYmIHBrZy5kZXBlbmRlbmNpZXMpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLmRlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobmFtZXMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRhcmdzLnB1c2goLi4ubmFtZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRhcmd2Lm9wdGlvbmFsID0gYXJndi5wZWVyID0gYXJndi5kZXYgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoIWFyZ3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5lcnJvcihgTWlzc2luZyBsaXN0IG9mIHBhY2thZ2VzIHRvIGFkZCB0byB5b3VyIHByb2plY3QuYCk7XG5cblx0XHRcdHJldHVybiBwcm9jZXNzLmV4aXQoMSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRhcmdzID0gYXJncy5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHR7XG5cblx0XHRcdFx0YiA9IGIucmVwbGFjZSgvXkB0eXBlc1xcLy8sICcnKTtcblxuXHRcdFx0XHRhLnB1c2goYik7XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCBbXSBhcyBzdHJpbmdbXSk7XG5cblx0XHRcdGFyZ3MgPSBhcnJheV91bmlxdWUoYXJncyk7XG5cblx0XHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy53YXJuKGBubyBwYWNrYWdlIGxpc3QgZm9yIGluc3RhbGwgdHlwZXNgKTtcblxuXHRcdFx0XHRyZXR1cm4gcHJvY2Vzcy5leGl0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGZsYWdzID0gZmxhZ3NZYXJuQWRkKGFyZ3YpLmZpbHRlcih2ID0+IHYgIT0gbnVsbCk7XG5cdFx0bGV0IGZsYWdzMiA9IGZsYWdzLnNsaWNlKCk7XG5cblx0XHRpZiAoIWFyZ3Yub3B0aW9uYWwgJiYgIWFyZ3YucGVlciAmJiAhYXJndi5kZXYpXG5cdFx0e1xuXHRcdFx0ZmxhZ3MyLnB1c2goJy1EJyk7XG5cdFx0fVxuXG5cdFx0bGV0IGxpc3Q6IHN0cmluZ1tdID0gW107XG5cdFx0bGV0IHdhcm5zOiBhbnlbXSA9IFtdO1xuXG5cdFx0Zm9yIChsZXQgcGFja2FnZU5hbWUgb2YgYXJncylcblx0XHR7XG5cdFx0XHRsZXQgbSA9IHBhcnNlQXJndlBrZ05hbWUocGFja2FnZU5hbWUpO1xuXG5cdFx0XHRpZiAoIW0pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgW2Vycm9yXWAsIHBhY2thZ2VOYW1lKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCB7IHZlcnNpb24sIG5hbWUsIG5hbWVzcGFjZSB9ID0gbTtcblx0XHRcdGlmIChuYW1lc3BhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWUgPSBuYW1lc3BhY2UucmVwbGFjZSgnQCcsICcnKSArICdfXycgKyBuYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRwYWNrYWdlTmFtZSA9IG5hbWUgPSBgQHR5cGVzLyR7bmFtZX1gO1xuXG5cdFx0XHRpZiAoZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWUsIHBrZykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS53YXJuKGBbc2tpcF1gLCBgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW3NraXBdYCwgYCR7bmFtZX0gYWxyZWFkeSBleGlzdHMgaW4gcGFja2FnZS5qc29uYF0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB0YXJnZXQgPSBhd2FpdCBmZXRjaFBhY2thZ2VKc29uSW5mbyhwYWNrYWdlTmFtZSk7XG5cblx0XHRcdGlmICh0YXJnZXQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0d2FybnMucHVzaChbYFt3YXJuXWAsIGAke25hbWV9IG5vdCBleGlzdHNgXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0YXJnZXQuZGVwcmVjYXRlZClcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYFtza2lwXWAsIHRhcmdldC5kZXByZWNhdGVkKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW2lnbm9yZV1gLCB0YXJnZXQubmFtZSwgJ++8micsIHRhcmdldC5kZXByZWNhdGVkXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxpc3QucHVzaCh0YXJnZXQubmFtZSArIGBAXiR7dGFyZ2V0LnZlcnNpb259YCk7XG5cdFx0fVxuXG5cdFx0aWYgKGxpc3QubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0J2FkZCcsXG5cdFx0XHRcdC4uLmxpc3QsXG5cdFx0XHRcdC4uLmZsYWdzMixcblx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoY3AuZXJyb3IpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwcmludFdhcm5zKCk7XG5cblx0XHRcdGNvbnNvbGUud2FybihgW3dhcm5dYCwgYG5vIGFueSBuZXcgdHlwZXMgaW5zdGFsbGApO1xuXHRcdH1cblxuXHRcdHByaW50V2FybnMoKTtcblxuXHRcdGZ1bmN0aW9uIHByaW50V2FybnMoKVxuXHRcdHtcblx0XHRcdHdhcm5zLmZvckVhY2goKFtsYWJlbCwgLi4uYXJyXSkgPT4gY29uc29sZS5pbmZvKGNvbnNvbGUucmVkLmNoYWxrKGxhYmVsKSwgLi4uYXJyKSk7XG5cdFx0XHR3YXJucyA9IFtdO1xuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19