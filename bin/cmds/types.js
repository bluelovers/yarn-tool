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
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [name]',
    //aliases: [],
    describe: `Installs @types/* of packages if not exists in package.json`,
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs)
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
        if (!args.length) {
            index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
            return process.exit(1);
        }
        let flags = add_1.flagsYarnAdd(argv).filter(v => v != null);
        let rootData = index_1.findRoot({
            ...argv,
        });
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg = package_dts_1.readPackageJson(pkg_file);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBOEU7QUFDOUUsK0JBQWdDO0FBQ2hDLDJDQUFpRjtBQUNqRixzREFBdUQ7QUFNdkQsMkNBTTJCO0FBQzNCLGdEQUFpRDtBQUNqRCwrQ0FBMkQ7QUFFM0QsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUztJQUM5QyxjQUFjO0lBQ2QsUUFBUSxFQUFFLDZEQUE2RDtJQUV2RSxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8seUJBQW1CLENBQUMsS0FBSyxDQUFDO2FBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1FBRWpCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUN2QjtZQUNDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNiO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUNiO1lBQ0MsYUFBYTtZQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCO1lBQ0Msb0JBQVksQ0FBQyxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztZQUV2RSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkI7UUFFRCxJQUFJLEtBQUssR0FBRyxrQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztR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LENBQUM7UUFFYixTQUFTLFVBQVU7WUFFbEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25GLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDWixDQUFDO0lBQ0YsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgcHJpbnRSb290RGF0YSB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB7XG5cdGV4aXN0c0RlcGVuZGVuY2llcyxcblx0ZmxhZ3NZYXJuQWRkLFxuXHRsaXN0VG9UeXBlcyxcblx0cGFyc2VBcmd2UGtnTmFtZSxcblx0c2V0dXBZYXJuQWRkVG9ZYXJncyxcbn0gZnJvbSAnLi4vLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0IHsgZmV0Y2hQYWNrYWdlSnNvbkluZm8gfSBmcm9tICcuLi8uLi9saWIvY2xpL3R5cGVzJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFtuYW1lXScsXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgSW5zdGFsbHMgQHR5cGVzLyogb2YgcGFja2FnZXMgaWYgbm90IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBZYXJuQWRkVG9ZYXJncyh5YXJncylcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0YXN5bmMgaGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IGFyZ3MgPSBhcmd2Ll8uc2xpY2UoKTtcblxuXHRcdGlmIChhcmdzWzBdID09PSAndHlwZXMnKVxuXHRcdHtcblx0XHRcdGFyZ3Muc2hpZnQoKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5uYW1lKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGFyZ3MudW5zaGlmdChhcmd2Lm5hbWUpO1xuXHRcdH1cblxuXHRcdGlmICghYXJncy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZURlYnVnLmVycm9yKGBNaXNzaW5nIGxpc3Qgb2YgcGFja2FnZXMgdG8gYWRkIHRvIHlvdXIgcHJvamVjdC5gKTtcblxuXHRcdFx0cmV0dXJuIHByb2Nlc3MuZXhpdCgxKTtcblx0XHR9XG5cblx0XHRsZXQgZmxhZ3MgPSBmbGFnc1lhcm5BZGQoYXJndikuZmlsdGVyKHYgPT4gdiAhPSBudWxsKTtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0fSk7XG5cblx0XHRsZXQgcGtnX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQgcGtnID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlKTtcblxuXHRcdGxldCBmbGFnczIgPSBmbGFncy5zbGljZSgpO1xuXG5cdFx0aWYgKCFhcmd2Lm9wdGlvbmFsICYmICFhcmd2LnBlZXIgJiYgIWFyZ3YuZGV2KVxuXHRcdHtcblx0XHRcdGZsYWdzMi5wdXNoKCctRCcpO1xuXHRcdH1cblxuXHRcdGxldCBsaXN0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdGxldCB3YXJuczogYW55W10gPSBbXTtcblxuXHRcdGZvciAobGV0IHBhY2thZ2VOYW1lIG9mIGFyZ3MpXG5cdFx0e1xuXHRcdFx0cGFja2FnZU5hbWUgPSBgQHR5cGVzLyR7cGFja2FnZU5hbWV9YDtcblx0XHRcdGxldCBtID0gcGFyc2VBcmd2UGtnTmFtZShwYWNrYWdlTmFtZSk7XG5cblx0XHRcdGlmICghbSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGBbZXJyb3JdYCwgcGFja2FnZU5hbWUpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHsgdmVyc2lvbiwgbmFtZSwgbmFtZXNwYWNlIH0gPSBtO1xuXHRcdFx0aWYgKG5hbWVzcGFjZSlcblx0XHRcdHtcblx0XHRcdFx0bmFtZSA9IG5hbWVzcGFjZSArICcvJyArIG5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChleGlzdHNEZXBlbmRlbmNpZXMobmFtZSwgcGtnKSlcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLndhcm4oYFtza2lwXWAsIGAke25hbWV9IGFscmVhZHkgZXhpc3RzIGluIHBhY2thZ2UuanNvbmApO1xuXG5cdFx0XHRcdHdhcm5zLnB1c2goW2Bbc2tpcF1gLCBgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gXSk7XG5cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHRhcmdldCA9IGF3YWl0IGZldGNoUGFja2FnZUpzb25JbmZvKHBhY2thZ2VOYW1lKTtcblxuXHRcdFx0aWYgKHRhcmdldCA9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHR3YXJucy5wdXNoKFtgW3dhcm5dYCwgYCR7bmFtZX0gbm90IGV4aXN0c2BdKTtcblxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRhcmdldC5kZXByZWNhdGVkKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUud2FybihgW3NraXBdYCwgdGFyZ2V0LmRlcHJlY2F0ZWQpO1xuXG5cdFx0XHRcdHdhcm5zLnB1c2goW2BbaWdub3JlXWAsIHRhcmdldC5uYW1lLCAn77yaJywgdGFyZ2V0LmRlcHJlY2F0ZWRdKTtcblxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGlzdC5wdXNoKHRhcmdldC5uYW1lICsgYEBeJHt0YXJnZXQudmVyc2lvbn1gKTtcblx0XHR9XG5cblx0XHRpZiAobGlzdC5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IGNtZF9hcmd2ID0gW1xuXHRcdFx0XHQnYWRkJyxcblx0XHRcdFx0Li4ubGlzdCxcblx0XHRcdFx0Li4uZmxhZ3MyLFxuXHRcdFx0XS5maWx0ZXIodiA9PiB2ICE9IG51bGwpO1xuXG5cdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduLnN5bmMoJ3lhcm4nLCBjbWRfYXJndiwge1xuXHRcdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChjcC5lcnJvcilcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgY3AuZXJyb3Jcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHByaW50V2FybnMoKTtcblxuXHRcdFx0Y29uc29sZS53YXJuKGBbd2Fybl1gLCBgbm8gYW55IG5ldyB0eXBlcyBpbnN0YWxsYCk7XG5cdFx0fVxuXG5cdFx0cHJpbnRXYXJucygpO1xuXG5cdFx0ZnVuY3Rpb24gcHJpbnRXYXJucygpXG5cdFx0e1xuXHRcdFx0d2FybnMuZm9yRWFjaCgoW2xhYmVsLCAuLi5hcnJdKSA9PiBjb25zb2xlLmluZm8oY29uc29sZS5yZWQuY2hhbGsobGFiZWwpLCAuLi5hcnIpKTtcblx0XHRcdHdhcm5zID0gW107XG5cdFx0fVxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=