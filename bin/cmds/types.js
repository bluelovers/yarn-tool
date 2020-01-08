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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFDM0QsMkRBQWtEO0FBRWxELE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVM7SUFDOUMsY0FBYztJQUNkLFFBQVEsRUFBRSw2REFBNkQ7SUFFdkUsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxFQUFFLGdDQUFnQztZQUN0QyxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxFQUFFLGlEQUFpRDtZQUN2RCxPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUVqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFDdkI7WUFDQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFDYjtZQUNDLGFBQWE7WUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1NBQ1AsQ0FBQyxDQUFDO1FB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SSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7Z0JBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixLQUFLLEVBQUUsU0FBUzthQUNoQixDQUFDLENBQUM7WUFFSCxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQ1o7Z0JBQ0MsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFBO2FBQ2Q7U0FDRDthQUVEO1lBQ0MsVUFBVSxFQUFFLENBQUM7WUFFYixlQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1NBQ25EO1FBRUQsVUFBVSxFQUFFLENBQUM7UUFFYixTQUFTLFVBQVU7WUFFbEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25GLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0YsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgcHJpbnRSb290RGF0YSB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7XG5cdGV4aXN0c0RlcGVuZGVuY2llcyxcblx0ZmxhZ3NZYXJuQWRkLFxuXHRsaXN0VG9UeXBlcyxcblx0cGFyc2VBcmd2UGtnTmFtZSxcblx0c2V0dXBZYXJuQWRkVG9ZYXJncyxcbn0gZnJvbSAnLi4vLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0IHsgZmV0Y2hQYWNrYWdlSnNvbkluZm8gfSBmcm9tICcuLi8uLi9saWIvY2xpL3R5cGVzJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpICsgJyBbbmFtZV0nLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYEluc3RhbGxzIEB0eXBlcy8qIG9mIHBhY2thZ2VzIGlmIG5vdCBleGlzdHMgaW4gcGFja2FnZS5qc29uYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwWWFybkFkZFRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQub3B0aW9uKCdhdXRvJywge1xuXHRcdFx0XHRkZXNjOiBgYXV0byBpbnN0YWxsIGZyb20gcGFja2FnZS5qc29uYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdhbGwnLCB7XG5cdFx0XHRcdGRlc2M6IGBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcyBmcm9tIHBhY2thZ2UuanNvbmAsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgYXJncyA9IGFyZ3YuXy5zbGljZSgpO1xuXG5cdFx0aWYgKGFyZ3NbMF0gPT09ICd0eXBlcycpXG5cdFx0e1xuXHRcdFx0YXJncy5zaGlmdCgpO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2Lm5hbWUpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0YXJncy51bnNoaWZ0KGFyZ3YubmFtZSk7XG5cdFx0fVxuXG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHR9KTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2cgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0aWYgKGFyZ3YuYXV0bylcblx0XHR7XG5cdFx0XHRsZXQgbmFtZXM6IHN0cmluZ1tdID0gW107XG5cblx0XHRcdGlmIChhcmd2LmRldiB8fCBhcmd2LmFsbClcblx0XHRcdHtcblx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IFtdKSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcmd2LnBlZXIgfHwgYXJndi5vcHRpb25hbClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFyZ3YucGVlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWVzLnB1c2goLi4uT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhcmd2Lm9wdGlvbmFsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZXMucHVzaCguLi5PYmplY3Qua2V5cyhwa2cub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoIWFyZ3YuZGV2KVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5kZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFyZ3YuYWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lcy5wdXNoKC4uLk9iamVjdC5rZXlzKHBrZy5kZXBlbmRlbmNpZXMgfHwgW10pKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5hbWVzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0YXJncy5wdXNoKC4uLm5hbWVzKTtcblx0XHRcdH1cblxuXHRcdFx0YXJndi5vcHRpb25hbCA9IGFyZ3YucGVlciA9IGFyZ3YuZGV2ID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0YXJncyA9IGFycmF5X3VuaXF1ZShhcmdzKTtcblxuXHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblx0XHRsZXQgZmxhZ3MyID0gZmxhZ3Muc2xpY2UoKTtcblxuXHRcdGlmICghYXJndi5vcHRpb25hbCAmJiAhYXJndi5wZWVyICYmICFhcmd2LmRldilcblx0XHR7XG5cdFx0XHRmbGFnczIucHVzaCgnLUQnKTtcblx0XHR9XG5cblx0XHRsZXQgbGlzdDogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgd2FybnM6IGFueVtdID0gW107XG5cblx0XHRmb3IgKGxldCBwYWNrYWdlTmFtZSBvZiBhcmdzKVxuXHRcdHtcblx0XHRcdHBhY2thZ2VOYW1lID0gYEB0eXBlcy8ke3BhY2thZ2VOYW1lfWA7XG5cdFx0XHRsZXQgbSA9IHBhcnNlQXJndlBrZ05hbWUocGFja2FnZU5hbWUpO1xuXG5cdFx0XHRpZiAoIW0pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgW2Vycm9yXWAsIHBhY2thZ2VOYW1lKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCB7IHZlcnNpb24sIG5hbWUsIG5hbWVzcGFjZSB9ID0gbTtcblx0XHRcdGlmIChuYW1lc3BhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWUgPSBuYW1lc3BhY2UgKyAnLycgKyBuYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWUsIHBrZykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS53YXJuKGBbc2tpcF1gLCBgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW3NraXBdYCwgYCR7bmFtZX0gYWxyZWFkeSBleGlzdHMgaW4gcGFja2FnZS5qc29uYF0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCB0YXJnZXQgPSBhd2FpdCBmZXRjaFBhY2thZ2VKc29uSW5mbyhwYWNrYWdlTmFtZSk7XG5cblx0XHRcdGlmICh0YXJnZXQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0d2FybnMucHVzaChbYFt3YXJuXWAsIGAke25hbWV9IG5vdCBleGlzdHNgXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0YXJnZXQuZGVwcmVjYXRlZClcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYFtza2lwXWAsIHRhcmdldC5kZXByZWNhdGVkKTtcblxuXHRcdFx0XHR3YXJucy5wdXNoKFtgW2lnbm9yZV1gLCB0YXJnZXQubmFtZSwgJ++8micsIHRhcmdldC5kZXByZWNhdGVkXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxpc3QucHVzaCh0YXJnZXQubmFtZSArIGBAXiR7dGFyZ2V0LnZlcnNpb259YCk7XG5cdFx0fVxuXG5cdFx0aWYgKGxpc3QubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBjbWRfYXJndiA9IFtcblx0XHRcdFx0J2FkZCcsXG5cdFx0XHRcdC4uLmxpc3QsXG5cdFx0XHRcdC4uLmZsYWdzMixcblx0XHRcdF0uZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bi5zeW5jKCd5YXJuJywgY21kX2FyZ3YsIHtcblx0XHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoY3AuZXJyb3IpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IGNwLmVycm9yXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwcmludFdhcm5zKCk7XG5cblx0XHRcdGNvbnNvbGUud2FybihgW3dhcm5dYCwgYG5vIGFueSBuZXcgdHlwZXMgaW5zdGFsbGApO1xuXHRcdH1cblxuXHRcdHByaW50V2FybnMoKTtcblxuXHRcdGZ1bmN0aW9uIHByaW50V2FybnMoKVxuXHRcdHtcblx0XHRcdHdhcm5zLmZvckVhY2goKFtsYWJlbCwgLi4uYXJyXSkgPT4gY29uc29sZS5pbmZvKGNvbnNvbGUucmVkLmNoYWxrKGxhYmVsKSwgLi4uYXJyKSk7XG5cdFx0XHR3YXJucyA9IFtdO1xuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19