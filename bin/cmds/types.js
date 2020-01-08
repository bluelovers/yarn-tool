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
        return add_1.setupYarnAddToYargs(yargs)
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
        let flags = add_1.flagsYarnAdd(argv).filter(v => v != null);
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
        }
        args = array_hyper_unique_1.array_unique(args);
        if (!args.length) {
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFDM0QsMkRBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSw2REFBNkQ7SUFFdkUsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxFQUFFLGdDQUFnQztZQUN0QyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLGlEQUFpRDtZQUN2RCxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUVqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFDdkI7WUFDQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFDYjtZQUNDLGFBQWE7WUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELElBQUksS0FBSyxHQUFHLGtCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FB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QUFTO2FBQ2hCLENBQUMsQ0FBQztZQUVILElBQUksRUFBRSxDQUFDLEtBQUssRUFDWjtnQkFDQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUE7YUFDZDtTQUNEO2FBRUQ7WUFDQyxVQUFVLEVBQUUsQ0FBQztZQUViLGVBQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLDBCQUEwQixDQUFDLENBQUM7U0FDbkQ7UUFFRCxVQUFVLEVBQUUsQ0FBQztRQUViLFNBQVMsVUFBVTtZQUVsQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkYsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNaLENBQUM7SUFDRixDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBwcmludFJvb3REYXRhIH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGluZm9Gcm9tRGVkdXBlQ2FjaGUsIHdyYXBEZWR1cGUgfSBmcm9tICcuLi8uLi9saWIvY2xpL2RlZHVwZSc7XG5pbXBvcnQgeWFyZ3MgPSByZXF1aXJlKCd5YXJncycpO1xuaW1wb3J0IHtcblx0ZXhpc3RzRGVwZW5kZW5jaWVzLFxuXHRmbGFnc1lhcm5BZGQsXG5cdGxpc3RUb1R5cGVzLFxuXHRwYXJzZUFyZ3ZQa2dOYW1lLFxuXHRzZXR1cFlhcm5BZGRUb1lhcmdzLFxufSBmcm9tICcuLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBmZXRjaFBhY2thZ2VKc29uSW5mbyB9IGZyb20gJy4uLy4uL2xpYi9jbGkvdHlwZXMnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtuYW1lXScsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgSW5zdGFsbHMgQHR5cGVzLyogb2YgcGFja2FnZXMgaWYgbm90IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuQWRkVG9ZYXJncyh5YXJncylcblx0XHRcdC5vcHRpb24oJ2F1dG8nLCB7XG5cdFx0XHRcdGRlc2M6IGBhdXRvIGluc3RhbGwgZnJvbSBwYWNrYWdlLmpzb25gLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2FsbCcsIHtcblx0XHRcdFx0ZGVzYzogYGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzIGZyb20gcGFja2FnZS5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGFzeW5jIGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCBhcmdzID0gYXJndi5fLnNsaWNlKCk7XG5cblx0XHRpZiAoYXJnc1swXSA9PT0gJ3R5cGVzJylcblx0XHR7XG5cdFx0XHRhcmdzLnNoaWZ0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YubmFtZSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmdzLnVuc2hpZnQoYXJndi5uYW1lKTtcblx0XHR9XG5cblx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0fSk7XG5cblx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQgcGtnID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdGlmIChhcmd2LmF1dG8pXG5cdFx0e1xuXHRcdFx0bGV0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XG5cdFx0XHRpZiAoYXJndi5kZXYgfHwgYXJndi5hbGwpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLmRldkRlcGVuZGVuY2llcyB8fCBbXSkpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoYXJndi5wZWVyIHx8IGFyZ3Yub3B0aW9uYWwpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhcmd2LnBlZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5wZWVyRGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYXJndi5vcHRpb25hbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFhcmd2LmRldilcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2LmFsbClcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChuYW1lcy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGFyZ3MucHVzaCguLi5uYW1lcyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YXJncyA9IGFycmF5X3VuaXF1ZShhcmdzKTtcblxuXHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHRsZXQgZmxhZ3MyID0gZmxhZ3Muc2xpY2UoKTtcblxuXHRcdGlmICghYXJndi5vcHRpb25hbCAmJiAhYXJndi5wZWVyICYmICFhcmd2LmRldilcblx0XHR7XG5cdFx0XHRmbGFnczIucHVzaCgnLUQnKTtcblx0XHR9XG5cblx0XHRsZXQgbGlzdDogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgd2FybnM6IGFueVtdID0gW107XG5cblx0XHRmb3IgKGxldCBwYWNrYWdlTmFtZSBvZiBhcmdzKVxuXHRcdHtcblx0XHRcdHBhY2thZ2VOYW1lID0gYEB0eXBlcy8ke3BhY2thZ2VOYW1lfWA7XG5cdFx0XHRsZXQgbSA9IHBhcnNlQXJndlBrZ05hbWUocGFja2FnZU5hbWUpO1xuXG5cdFx0XHRpZiAoIW0pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgW2Vycm9yXWAsIHBhY2thZ2VOYW1lKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCB7IHZlcnNpb24sIG5hbWUsIG5hbWVzcGFjZSB9ID0gbTtcblx0XHRcdGlmIChuYW1lc3BhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWUgPSBuYW1lc3BhY2UgKyAnLycgKyBuYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWUsIHBrZykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS53YXJuKGBbc2tpcF1gLCBgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW3NraXBdYCwgYCR7bmFtZX0gYWxyZWFkeSBleGlzdHMgaW4gcGFja2FnZS5qc29uYF0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB0YXJnZXQgPSBhd2FpdCBmZXRjaFBhY2thZ2VKc29uSW5mbyhwYWNrYWdlTmFtZSk7XG5cblx0XHRcdGlmICh0YXJnZXQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0d2FybnMucHVzaChbYFt3YXJuXWAsIGAke25hbWV9IG5vdCBleGlzdHNgXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0YXJnZXQuZGVwcmVjYXRlZClcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYFtza2lwXWAsIHRhcmdldC5kZXByZWNhdGVkKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW2lnbm9yZV1gLCB0YXJnZXQubmFtZSwgJ++8micsIHRhcmdldC5kZXByZWNhdGVkXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxpc3QucHVzaCh0YXJnZXQubmFtZSArIGBAXiR7dGFyZ2V0LnZlcnNpb259YCk7XG5cdFx0fVxuXG5cdFx0aWYgKGxpc3QubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0J2FkZCcsXG5cdFx0XHRcdC4uLmxpc3QsXG5cdFx0XHRcdC4uLmZsYWdzMixcblx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoY3AuZXJyb3IpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwcmludFdhcm5zKCk7XG5cblx0XHRcdGNvbnNvbGUud2FybihgW3dhcm5dYCwgYG5vIGFueSBuZXcgdHlwZXMgaW5zdGFsbGApO1xuXHRcdH1cblxuXHRcdHByaW50V2FybnMoKTtcblxuXHRcdGZ1bmN0aW9uIHByaW50V2FybnMoKVxuXHRcdHtcblx0XHRcdHdhcm5zLmZvckVhY2goKFtsYWJlbCwgLi4uYXJyXSkgPT4gY29uc29sZS5pbmZvKGNvbnNvbGUucmVkLmNoYWxrKGxhYmVsKSwgLi4uYXJyKSk7XG5cdFx0XHR3YXJucyA9IFtdO1xuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19