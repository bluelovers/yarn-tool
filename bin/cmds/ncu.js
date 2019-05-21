"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const ncu_1 = require("../../lib/cli/ncu");
const yarnlock_1 = require("../../lib/yarnlock");
const table_1 = require("../../lib/table");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename) + ' [-u]',
    aliases: ['update'],
    describe: `Find newer versions of dependencies than what your package.json allows`,
    builder(yargs) {
        return ncu_1.default(yargs)
            .option('resolutions', {
            alias: ['R'],
            desc: 'do with resolutions only',
            boolean: true,
        })
            .option('no-safe', {
            boolean: true,
        })
            .example(`$0 ncu -u`, `check new version and update package.json`)
            .example(`$0 ncu -R`, `check new version of resolutions in package.json`)
            .example(`$0 ncu -u -R`, `check new version of resolutions in package.json and update package.json`);
    },
    async handler(argv) {
        const { cwd } = argv;
        let rootData = index_1.findRoot({
            ...argv,
            cwd,
        }, true);
        //console.dir(rootData);
        let pkg_file_root = path.join(rootData.root, 'package.json');
        let pkg_file = path.join(rootData.pkg, 'package.json');
        let pkg_data = package_dts_1.readPackageJson(pkg_file);
        let resolutions = pkg_data.resolutions;
        let pkg_file_ws;
        let pkg_data_ws;
        let doWorkspace = !rootData.isWorkspace && rootData.hasWorkspace;
        if (doWorkspace) {
            pkg_file_ws = path.join(rootData.ws, 'package.json');
            pkg_data_ws = package_dts_1.readPackageJson(pkg_file_ws);
            resolutions = pkg_data_ws.resolutions;
        }
        if (argv.resolutions) {
            if (!resolutions || !Object.keys(resolutions).length) {
                return index_1.yargsProcessExit(`resolutions is not exists in package.json`);
            }
            let yl = index_1.fsYarnLock(rootData.root);
            let ret = await ncu_1.checkResolutionsUpdate(resolutions, yl.yarnlock_old, argv);
            //console.log(ret);
            if (ret.yarnlock_changed) {
                yarnlock_1.writeYarnLockfile(yl.yarnlock_file, ret.yarnlock_new_obj);
                index_1.chalkByConsole((chalk, console) => {
                    let p = chalk.cyan(path.relative(argv.cwd, yl.yarnlock_file));
                    console.log(`${p} is updated!`);
                }, index_1.console);
                let msg = yarnlock_1.yarnLockDiff(yarnlock_1.stringify(ret.yarnlock_old_obj), yarnlock_1.stringify(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            let ls2 = Object.values(ret.deps)
                .filter(data => {
                let { name, version_old, version_new } = data;
                return ncu_1.isUpgradeable(version_old, version_new);
            });
            let ncuOptions = ncu_1.npmCheckUpdatesOptions(argv);
            let fromto = ls2
                .reduce((a, data) => {
                let { name, version_old, version_new } = data;
                let new_semver = ncu_1.updateSemver(version_old, version_new, ncuOptions);
                a.from[name] = version_old;
                a.to[name] = new_semver;
                resolutions[name] = new_semver;
                return a;
            }, {
                from: {},
                to: {},
            });
            let msg = table_1.toDependencyTable(fromto);
            index_1.console.log(`\n${msg}\n`);
            if (argv.upgrade) {
                if (doWorkspace) {
                    pkg_data_ws.resolutions = resolutions;
                    pkg_1.writePackageJson(pkg_file_ws, pkg_data_ws);
                    index_1.chalkByConsole((chalk, console) => {
                        let p = chalk.cyan(path.relative(argv.cwd, pkg_file_ws));
                        console.log(`${p} is updated!`);
                    }, index_1.console);
                }
                else {
                    pkg_data.resolutions = resolutions;
                    pkg_1.writePackageJson(pkg_file, pkg_data);
                    index_1.chalkByConsole((chalk, console) => {
                        let p = chalk.cyan(path.relative(rootData.ws || rootData.pkg, pkg_file));
                        console.log(`${p} is updated!`);
                    }, index_1.console);
                }
            }
            return;
        }
        index_1.printRootData(rootData, argv);
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
        if (argv.dedupe && resolutions && Object.keys(resolutions).length) {
            let ls = Object.entries(pkgNcu.json_new.dependencies || {})
                .concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))
                .reduce(function (a, [name, ver_new]) {
                let ver_old = resolutions[name];
                if (ver_old) {
                    if (ver_new === 'latest') {
                        ver_new = '*';
                    }
                    // @ts-ignore
                    a[name] = ver_new;
                }
                return a;
            }, {});
            let yl = index_1.fsYarnLock(rootData.root);
            let ret = await ncu_1.checkResolutionsUpdate(resolutions, yl.yarnlock_old, argv);
            if (ret.yarnlock_changed) {
                let msg = yarnlock_1.yarnLockDiff(yarnlock_1.stringify(ret.yarnlock_old_obj), yarnlock_1.stringify(ret.yarnlock_new_obj));
                if (msg) {
                    index_1.console.log(`\n${msg}\n`);
                }
            }
            if (pkgNcu.json_changed && !argv.upgrade) {
                ret.yarnlock_changed && index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
            }
            if (ret.yarnlock_changed && argv.upgrade) {
                yarnlock_1.writeYarnLockfile(yl.yarnlock_file, ret.yarnlock_new_obj);
                index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
            }
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSwrQkFBZ0M7QUFDaEMsMkNBUXlCO0FBQ3pCLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBSzJCO0FBQzNCLGlEQU00QjtBQUk1QiwyQ0FBb0Q7QUFFcEQsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTztJQUM1QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsUUFBUSxFQUFFLHdFQUF3RTtJQUVsRixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sYUFBZSxDQUFDLEtBQUssQ0FBQzthQUMzQixNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ3RCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxPQUFPLENBQUMsV0FBVyxFQUFFLDJDQUEyQyxDQUFDO2FBQ2pFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0RBQWtELENBQUM7YUFDeEUsT0FBTyxDQUFDLGNBQWMsRUFBRSwwRUFBMEUsQ0FBQyxDQUFBO0lBQ3RHLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lBQ3ZCLEdBQUcsSUFBSTtZQUNQLEdBQUc7U0FDSCxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsd0JBQXdCO1FBRXhCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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QUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFFMUQsb0JBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3JELG9CQUFZLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxlQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsaUNBQWlDLENBQUMsQ0FBQzthQUMxRztTQUVEO0lBRUYsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHtcblx0Y2hhbGtCeUNvbnNvbGUsXG5cdGNvbnNvbGUsXG5cdGNvbnNvbGVEZWJ1Zyxcblx0ZmluZFJvb3QsXG5cdGZzWWFybkxvY2ssXG5cdHByaW50Um9vdERhdGEsXG5cdHlhcmdzUHJvY2Vzc0V4aXQsXG59IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgSVBhY2thZ2VKc29uLCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlSlNPTlN5bmMsIHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBzZXR1cE5jdVRvWWFyZ3MsIHtcblx0Y2hlY2tSZXNvbHV0aW9uc1VwZGF0ZSxcblx0aXNCYWRWZXJzaW9uLFxuXHRpc1VwZ3JhZGVhYmxlLFxuXHRucG1DaGVja1VwZGF0ZXMsIG5wbUNoZWNrVXBkYXRlc09wdGlvbnMsIHVwZGF0ZVNlbXZlcixcbn0gZnJvbSAnLi4vLi4vbGliL2NsaS9uY3UnO1xuaW1wb3J0IHtcblx0ZmlsdGVyUmVzb2x1dGlvbnMsXG5cdElEZXBlbmRlbmNpZXMsXG5cdElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdyxcblx0cGFyc2UgYXMgcGFyc2VZYXJuTG9jaywgcmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpbmdpZnkgYXMgc3RyaW5naWZ5WWFybkxvY2ssXG5cdHN0cmlwRGVwc05hbWUsIHdyaXRlWWFybkxvY2tmaWxlLCB5YXJuTG9ja0RpZmYsXG59IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IHRvRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi4vLi4vbGliL3RhYmxlJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFstdV0nLFxuXHRhbGlhc2VzOiBbJ3VwZGF0ZSddLFxuXHRkZXNjcmliZTogYEZpbmQgbmV3ZXIgdmVyc2lvbnMgb2YgZGVwZW5kZW5jaWVzIHRoYW4gd2hhdCB5b3VyIHBhY2thZ2UuanNvbiBhbGxvd3NgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBOY3VUb1lhcmdzKHlhcmdzKVxuXHRcdFx0Lm9wdGlvbigncmVzb2x1dGlvbnMnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ1InXSxcblx0XHRcdFx0ZGVzYzogJ2RvIHdpdGggcmVzb2x1dGlvbnMgb25seScsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignbm8tc2FmZScsIHtcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuZXhhbXBsZShgJDAgbmN1IC11YCwgYGNoZWNrIG5ldyB2ZXJzaW9uIGFuZCB1cGRhdGUgcGFja2FnZS5qc29uYClcblx0XHRcdC5leGFtcGxlKGAkMCBuY3UgLVJgLCBgY2hlY2sgbmV3IHZlcnNpb24gb2YgcmVzb2x1dGlvbnMgaW4gcGFja2FnZS5qc29uYClcblx0XHRcdC5leGFtcGxlKGAkMCBuY3UgLXUgLVJgLCBgY2hlY2sgbmV3IHZlcnNpb24gb2YgcmVzb2x1dGlvbnMgaW4gcGFja2FnZS5qc29uIGFuZCB1cGRhdGUgcGFja2FnZS5qc29uYClcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRjd2QsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHQvL2NvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdGxldCBwa2dfZmlsZV9yb290ID0gcGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0bGV0IHJlc29sdXRpb25zID0gcGtnX2RhdGEucmVzb2x1dGlvbnM7XG5cblx0XHRsZXQgcGtnX2ZpbGVfd3M6IHN0cmluZztcblx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdGxldCBkb1dvcmtzcGFjZSA9ICFyb290RGF0YS5pc1dvcmtzcGFjZSAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2U7XG5cblx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cGtnX2ZpbGVfd3MgPSBwYXRoLmpvaW4ocm9vdERhdGEud3MsICdwYWNrYWdlLmpzb24nKTtcblx0XHRcdHBrZ19kYXRhX3dzID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlX3dzKTtcblxuXHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHR9XG5cblx0XHRpZiAoYXJndi5yZXNvbHV0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAoIXJlc29sdXRpb25zIHx8ICFPYmplY3Qua2V5cyhyZXNvbHV0aW9ucykubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4geWFyZ3NQcm9jZXNzRXhpdChgcmVzb2x1dGlvbnMgaXMgbm90IGV4aXN0cyBpbiBwYWNrYWdlLmpzb25gKVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRsZXQgcmV0ID0gYXdhaXQgY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShyZXNvbHV0aW9ucywgeWwueWFybmxvY2tfb2xkLCBhcmd2KTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhyZXQpO1xuXG5cdFx0XHRpZiAocmV0Lnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdHdyaXRlWWFybkxvY2tmaWxlKHlsLnlhcm5sb2NrX2ZpbGUsIHJldC55YXJubG9ja19uZXdfb2JqKTtcblxuXHRcdFx0XHRjaGFsa0J5Q29uc29sZSgoY2hhbGssIGNvbnNvbGUpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgcCA9IGNoYWxrLmN5YW4ocGF0aC5yZWxhdGl2ZShhcmd2LmN3ZCwgeWwueWFybmxvY2tfZmlsZSkpO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYCR7cH0gaXMgdXBkYXRlZCFgKTtcblxuXHRcdFx0XHR9LCBjb25zb2xlKTtcblxuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHN0cmluZ2lmeVlhcm5Mb2NrKHJldC55YXJubG9ja19vbGRfb2JqKSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ld19vYmopKTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7bXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBsczIgPSBPYmplY3QudmFsdWVzKHJldC5kZXBzKVxuXHRcdFx0XHQuZmlsdGVyKGRhdGEgPT4ge1xuXG5cdFx0XHRcdFx0bGV0IHsgbmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25fbmV3IH0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGlzVXBncmFkZWFibGUodmVyc2lvbl9vbGQsIHZlcnNpb25fbmV3KVxuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgbmN1T3B0aW9ucyA9IG5wbUNoZWNrVXBkYXRlc09wdGlvbnMoYXJndik7XG5cblx0XHRcdGxldCBmcm9tdG8gPSBsczJcblx0XHRcdFx0LnJlZHVjZSgoYSwgZGF0YSkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB7IG5hbWUsIHZlcnNpb25fb2xkLCB2ZXJzaW9uX25ldyB9ID0gZGF0YTtcblxuXHRcdFx0XHRcdGxldCBuZXdfc2VtdmVyID0gdXBkYXRlU2VtdmVyKHZlcnNpb25fb2xkLCB2ZXJzaW9uX25ldywgbmN1T3B0aW9ucyk7XG5cblx0XHRcdFx0XHRhLmZyb21bbmFtZV0gPSB2ZXJzaW9uX29sZDtcblx0XHRcdFx0XHRhLnRvW25hbWVdID0gbmV3X3NlbXZlcjtcblxuXHRcdFx0XHRcdHJlc29sdXRpb25zW25hbWVdID0gbmV3X3NlbXZlcjtcblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0ZnJvbToge30sXG5cdFx0XHRcdFx0dG86IHt9LFxuXHRcdFx0XHR9IGFzIFBhcmFtZXRlcnM8dHlwZW9mIHRvRGVwZW5kZW5jeVRhYmxlPlswXSlcblx0XHRcdDtcblxuXHRcdFx0bGV0IG1zZyA9IHRvRGVwZW5kZW5jeVRhYmxlKGZyb210byk7XG5cblx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke21zZ31cXG5gKTtcblxuXHRcdFx0aWYgKGFyZ3YudXBncmFkZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGRvV29ya3NwYWNlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGtnX2RhdGFfd3MucmVzb2x1dGlvbnMgPSByZXNvbHV0aW9ucztcblxuXHRcdFx0XHRcdHdyaXRlUGFja2FnZUpzb24ocGtnX2ZpbGVfd3MsIHBrZ19kYXRhX3dzKTtcblxuXHRcdFx0XHRcdGNoYWxrQnlDb25zb2xlKChjaGFsaywgY29uc29sZSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgcCA9IGNoYWxrLmN5YW4ocGF0aC5yZWxhdGl2ZShhcmd2LmN3ZCwgcGtnX2ZpbGVfd3MpKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYCR7cH0gaXMgdXBkYXRlZCFgKTtcblxuXHRcdFx0XHRcdH0sIGNvbnNvbGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBrZ19kYXRhLnJlc29sdXRpb25zID0gcmVzb2x1dGlvbnM7XG5cblx0XHRcdFx0XHR3cml0ZVBhY2thZ2VKc29uKHBrZ19maWxlLCBwa2dfZGF0YSk7XG5cblx0XHRcdFx0XHRjaGFsa0J5Q29uc29sZSgoY2hhbGssIGNvbnNvbGUpID0+XG5cdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRsZXQgcCA9IGNoYWxrLmN5YW4ocGF0aC5yZWxhdGl2ZShyb290RGF0YS53cyB8fCByb290RGF0YS5wa2csIHBrZ19maWxlKSk7XG5cblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGAke3B9IGlzIHVwZGF0ZWQhYCk7XG5cblx0XHRcdFx0XHR9LCBjb25zb2xlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cHJpbnRSb290RGF0YShyb290RGF0YSwgYXJndik7XG5cblx0XHRsZXQgcGtnTmN1ID0gYXdhaXQgbnBtQ2hlY2tVcGRhdGVzKHtcblx0XHRcdGN3ZCxcblx0XHRcdHJvb3REYXRhLFxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdH0sIHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRqc29uX29sZDogcGtnX2RhdGEsXG5cdFx0fSk7XG5cblx0XHRpZiAocGtnTmN1Lmpzb25fY2hhbmdlZCAmJiBhcmd2LnVwZ3JhZGUpXG5cdFx0e1xuXHRcdFx0d3JpdGVKU09OU3luYyhwa2dfZmlsZSwgcGtnTmN1Lmpzb25fbmV3KTtcblx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBwYWNrYWdlLmpzb24gdXBkYXRlZGApO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2LmRlZHVwZSAmJiByZXNvbHV0aW9ucyAmJiBPYmplY3Qua2V5cyhyZXNvbHV0aW9ucykubGVuZ3RoKVxuXHRcdHtcblxuXHRcdFx0bGV0IGxzID0gT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3LmRlcGVuZGVuY2llcyB8fCB7fSlcblx0XHRcdFx0LmNvbmNhdChPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcuZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSwgT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3Lm9wdGlvbmFsRGVwZW5kZW5jaWVzIHx8IHt9KSlcblxuXHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBbbmFtZSwgdmVyX25ld10pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdmVyX29sZCA9IHJlc29sdXRpb25zW25hbWVdO1xuXG5cdFx0XHRcdFx0aWYgKHZlcl9vbGQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHZlcl9uZXcgPT09ICdsYXRlc3QnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR2ZXJfbmV3ID0gJyonO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRhW25hbWVdID0gdmVyX25ldztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwge30gYXMgSURlcGVuZGVuY2llcylcblx0XHRcdDtcblxuXHRcdFx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdFx0bGV0IHJldCA9IGF3YWl0IGNoZWNrUmVzb2x1dGlvbnNVcGRhdGUocmVzb2x1dGlvbnMsIHlsLnlhcm5sb2NrX29sZCwgYXJndik7XG5cblx0XHRcdGlmIChyZXQueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0bGV0IG1zZyA9IHlhcm5Mb2NrRGlmZihzdHJpbmdpZnlZYXJuTG9jayhyZXQueWFybmxvY2tfb2xkX29iaiksIHN0cmluZ2lmeVlhcm5Mb2NrKHJldC55YXJubG9ja19uZXdfb2JqKSk7XG5cblx0XHRcdFx0aWYgKG1zZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBcXG4ke21zZ31cXG5gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGtnTmN1Lmpzb25fY2hhbmdlZCAmJiAhYXJndi51cGdyYWRlKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQueWFybmxvY2tfY2hhbmdlZCAmJiBjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGB5b3VyIGRlcGVuZGVuY2llcyB2ZXJzaW9uIGhpZ2ggdGhhbiByZXNvbHV0aW9uc2ApO1xuXHRcdFx0XHRjb25zb2xlRGVidWcubG9nKGB5b3UgY2FuIGRvIGAsIGNvbnNvbGUuYm9sZC5jeWFuLmNoYWxrKGB5dCBuY3UgLXVgKSwgYCAsIGZvciB1cGRhdGUgcGFja2FnZS5qc29uYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyZXQueWFybmxvY2tfY2hhbmdlZCAmJiBhcmd2LnVwZ3JhZGUpXG5cdFx0XHR7XG5cdFx0XHRcdHdyaXRlWWFybkxvY2tmaWxlKHlsLnlhcm5sb2NrX2ZpbGUsIHJldC55YXJubG9ja19uZXdfb2JqKTtcblxuXHRcdFx0XHRjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGBEZWR1cGxpY2F0aW9uIHlhcm4ubG9ja2ApO1xuXHRcdFx0XHRjb25zb2xlRGVidWcubG9nKGB5b3UgY2FuIGRvIGAsIGNvbnNvbGUuYm9sZC5jeWFuLmNoYWxrKGB5dCBpbnN0YWxsYCksIGAgLCBmb3IgdXBncmFkZSBkZXBlbmRlbmNpZXMgbm93YCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19