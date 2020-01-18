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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSwrQkFBZ0M7QUFDaEMsMkNBUXlCO0FBQ3pCLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBSzJCO0FBQzNCLGlEQU00QjtBQUk1QiwyQ0FBb0Q7QUFFcEQsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTztJQUM1QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsUUFBUSxFQUFFLHdFQUF3RTtJQUVsRixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sYUFBZSxDQUFDLEtBQUssQ0FBQzthQUMzQixNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ3RCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxPQUFPLENBQUMsV0FBVyxFQUFFLDJDQUEyQyxDQUFDO2FBQ2pFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0RBQWtELENBQUM7YUFDeEUsT0FBTyxDQUFDLGNBQWMsRUFBRSwwRUFBMEUsQ0FBQyxDQUFBO0lBQ3RHLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lBQ3ZCLEdBQUcsSUFBSTtZQUNQLEdBQUc7U0FDSCxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsd0JBQXdCO1FBRXhCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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QUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFFMUQsb0JBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3JELG9CQUFZLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxlQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsaUNBQWlDLENBQUMsQ0FBQzthQUMxRztTQUVEO0lBRUYsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHtcblx0Y2hhbGtCeUNvbnNvbGUsXG5cdGNvbnNvbGUsXG5cdGNvbnNvbGVEZWJ1Zyxcblx0ZmluZFJvb3QsXG5cdGZzWWFybkxvY2ssXG5cdHByaW50Um9vdERhdGEsXG5cdHlhcmdzUHJvY2Vzc0V4aXQsXG59IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgSVBhY2thZ2VKc29uLCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlSlNPTlN5bmMsIHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcblxuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHNldHVwTmN1VG9ZYXJncywge1xuXHRjaGVja1Jlc29sdXRpb25zVXBkYXRlLFxuXHRpc0JhZFZlcnNpb24sXG5cdGlzVXBncmFkZWFibGUsXG5cdG5wbUNoZWNrVXBkYXRlcywgbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucywgdXBkYXRlU2VtdmVyLFxufSBmcm9tICcuLi8uLi9saWIvY2xpL25jdSc7XG5pbXBvcnQge1xuXHRmaWx0ZXJSZXNvbHV0aW9ucyxcblx0SURlcGVuZGVuY2llcyxcblx0SVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93LFxuXHRwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrLCByZW1vdmVSZXNvbHV0aW9uc0NvcmUsIHN0cmluZ2lmeSBhcyBzdHJpbmdpZnlZYXJuTG9jayxcblx0c3RyaXBEZXBzTmFtZSwgd3JpdGVZYXJuTG9ja2ZpbGUsIHlhcm5Mb2NrRGlmZixcbn0gZnJvbSAnLi4vLi4vbGliL3lhcm5sb2NrJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgdG9EZXBlbmRlbmN5VGFibGUgfSBmcm9tICcuLi8uLi9saWIvdGFibGUnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSArICcgWy11XScsXG5cdGFsaWFzZXM6IFsndXBkYXRlJ10sXG5cdGRlc2NyaWJlOiBgRmluZCBuZXdlciB2ZXJzaW9ucyBvZiBkZXBlbmRlbmNpZXMgdGhhbiB3aGF0IHlvdXIgcGFja2FnZS5qc29uIGFsbG93c2AsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cE5jdVRvWWFyZ3MoeWFyZ3MpXG5cdFx0XHQub3B0aW9uKCdyZXNvbHV0aW9ucycsIHtcblx0XHRcdFx0YWxpYXM6IFsnUiddLFxuXHRcdFx0XHRkZXNjOiAnZG8gd2l0aCByZXNvbHV0aW9ucyBvbmx5Jyxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCduby1zYWZlJywge1xuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5leGFtcGxlKGAkMCBuY3UgLXVgLCBgY2hlY2sgbmV3IHZlcnNpb24gYW5kIHVwZGF0ZSBwYWNrYWdlLmpzb25gKVxuXHRcdFx0LmV4YW1wbGUoYCQwIG5jdSAtUmAsIGBjaGVjayBuZXcgdmVyc2lvbiBvZiByZXNvbHV0aW9ucyBpbiBwYWNrYWdlLmpzb25gKVxuXHRcdFx0LmV4YW1wbGUoYCQwIG5jdSAtdSAtUmAsIGBjaGVjayBuZXcgdmVyc2lvbiBvZiByZXNvbHV0aW9ucyBpbiBwYWNrYWdlLmpzb24gYW5kIHVwZGF0ZSBwYWNrYWdlLmpzb25gKVxuXHR9LFxuXG5cdGFzeW5jIGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IHsgY3dkIH0gPSBhcmd2O1xuXG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHRcdGN3ZCxcblx0XHR9LCB0cnVlKTtcblxuXHRcdC8vY29uc29sZS5kaXIocm9vdERhdGEpO1xuXG5cdFx0bGV0IHBrZ19maWxlX3Jvb3QgPSBwYXRoLmpvaW4ocm9vdERhdGEucm9vdCwgJ3BhY2thZ2UuanNvbicpO1xuXG5cdFx0bGV0IHBrZ19maWxlID0gcGF0aC5qb2luKHJvb3REYXRhLnBrZywgJ3BhY2thZ2UuanNvbicpO1xuXHRcdGxldCBwa2dfZGF0YSA9IHJlYWRQYWNrYWdlSnNvbihwa2dfZmlsZSk7XG5cblx0XHRsZXQgcmVzb2x1dGlvbnMgPSBwa2dfZGF0YS5yZXNvbHV0aW9ucztcblxuXHRcdGxldCBwa2dfZmlsZV93czogc3RyaW5nO1xuXHRcdGxldCBwa2dfZGF0YV93czogSVBhY2thZ2VKc29uO1xuXG5cdFx0bGV0IGRvV29ya3NwYWNlID0gIXJvb3REYXRhLmlzV29ya3NwYWNlICYmIHJvb3REYXRhLmhhc1dvcmtzcGFjZTtcblxuXHRcdGlmIChkb1dvcmtzcGFjZSlcblx0XHR7XG5cdFx0XHRwa2dfZmlsZV93cyA9IHBhdGguam9pbihyb290RGF0YS53cywgJ3BhY2thZ2UuanNvbicpO1xuXHRcdFx0cGtnX2RhdGFfd3MgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGVfd3MpO1xuXG5cdFx0XHRyZXNvbHV0aW9ucyA9IHBrZ19kYXRhX3dzLnJlc29sdXRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChhcmd2LnJlc29sdXRpb25zKVxuXHRcdHtcblx0XHRcdGlmICghcmVzb2x1dGlvbnMgfHwgIU9iamVjdC5rZXlzKHJlc29sdXRpb25zKS5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB5YXJnc1Byb2Nlc3NFeGl0KGByZXNvbHV0aW9ucyBpcyBub3QgZXhpc3RzIGluIHBhY2thZ2UuanNvbmApXG5cdFx0XHR9XG5cblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zLCB5bC55YXJubG9ja19vbGQsIGFyZ3YpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKHJldCk7XG5cblx0XHRcdGlmIChyZXQueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0d3JpdGVZYXJuTG9ja2ZpbGUoeWwueWFybmxvY2tfZmlsZSwgcmV0Lnlhcm5sb2NrX25ld19vYmopO1xuXG5cdFx0XHRcdGNoYWxrQnlDb25zb2xlKChjaGFsaywgY29uc29sZSkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKGFyZ3YuY3dkLCB5bC55YXJubG9ja19maWxlKSk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgJHtwfSBpcyB1cGRhdGVkIWApO1xuXG5cdFx0XHRcdH0sIGNvbnNvbGUpO1xuXG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYoc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX29sZF9vYmopLCBzdHJpbmdpZnlZYXJuTG9jayhyZXQueWFybmxvY2tfbmV3X29iaikpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHttc2d9XFxuYCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGxzMiA9IE9iamVjdC52YWx1ZXMocmV0LmRlcHMpXG5cdFx0XHRcdC5maWx0ZXIoZGF0YSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgeyBuYW1lLCB2ZXJzaW9uX29sZCwgdmVyc2lvbl9uZXcgfSA9IGRhdGE7XG5cblx0XHRcdFx0XHRyZXR1cm4gaXNVcGdyYWRlYWJsZSh2ZXJzaW9uX29sZCwgdmVyc2lvbl9uZXcpXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGxldCBuY3VPcHRpb25zID0gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhhcmd2KTtcblxuXHRcdFx0bGV0IGZyb210byA9IGxzMlxuXHRcdFx0XHQucmVkdWNlKChhLCBkYXRhKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHsgbmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25fbmV3IH0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0bGV0IG5ld19zZW12ZXIgPSB1cGRhdGVTZW12ZXIodmVyc2lvbl9vbGQsIHZlcnNpb25fbmV3LCBuY3VPcHRpb25zKTtcblxuXHRcdFx0XHRcdGEuZnJvbVtuYW1lXSA9IHZlcnNpb25fb2xkO1xuXHRcdFx0XHRcdGEudG9bbmFtZV0gPSBuZXdfc2VtdmVyO1xuXG5cdFx0XHRcdFx0cmVzb2x1dGlvbnNbbmFtZV0gPSBuZXdfc2VtdmVyO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRmcm9tOiB7fSxcblx0XHRcdFx0XHR0bzoge30sXG5cdFx0XHRcdH0gYXMgUGFyYW1ldGVyczx0eXBlb2YgdG9EZXBlbmRlbmN5VGFibGU+WzBdKVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgbXNnID0gdG9EZXBlbmRlbmN5VGFibGUoZnJvbXRvKTtcblxuXHRcdFx0Y29uc29sZS5sb2coYFxcbiR7bXNnfVxcbmApO1xuXG5cdFx0XHRpZiAoYXJndi51cGdyYWRlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwa2dfZGF0YV93cy5yZXNvbHV0aW9ucyA9IHJlc29sdXRpb25zO1xuXG5cdFx0XHRcdFx0d3JpdGVQYWNrYWdlSnNvbihwa2dfZmlsZV93cywgcGtnX2RhdGFfd3MpO1xuXG5cdFx0XHRcdFx0Y2hhbGtCeUNvbnNvbGUoKGNoYWxrLCBjb25zb2xlKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKGFyZ3YuY3dkLCBwa2dfZmlsZV93cykpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhgJHtwfSBpcyB1cGRhdGVkIWApO1xuXG5cdFx0XHRcdFx0fSwgY29uc29sZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGtnX2RhdGEucmVzb2x1dGlvbnMgPSByZXNvbHV0aW9ucztcblxuXHRcdFx0XHRcdHdyaXRlUGFja2FnZUpzb24ocGtnX2ZpbGUsIHBrZ19kYXRhKTtcblxuXHRcdFx0XHRcdGNoYWxrQnlDb25zb2xlKChjaGFsaywgY29uc29sZSkgPT5cblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKHJvb3REYXRhLndzIHx8IHJvb3REYXRhLnBrZywgcGtnX2ZpbGUpKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYCR7cH0gaXMgdXBkYXRlZCFgKTtcblxuXHRcdFx0XHRcdH0sIGNvbnNvbGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRwcmludFJvb3REYXRhKHJvb3REYXRhLCBhcmd2KTtcblxuXHRcdGxldCBwa2dOY3UgPSBhd2FpdCBucG1DaGVja1VwZGF0ZXMoe1xuXHRcdFx0Y3dkLFxuXHRcdFx0cm9vdERhdGEsXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0fSwge1xuXHRcdFx0Li4uYXJndixcblx0XHRcdGpzb25fb2xkOiBwa2dfZGF0YSxcblx0XHR9KTtcblxuXHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHR7XG5cdFx0XHR3cml0ZUpTT05TeW5jKHBrZ19maWxlLCBwa2dOY3UuanNvbl9uZXcpO1xuXHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UuanNvbiB1cGRhdGVkYCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YuZGVkdXBlICYmIHJlc29sdXRpb25zICYmIE9iamVjdC5rZXlzKHJlc29sdXRpb25zKS5sZW5ndGgpXG5cdFx0e1xuXG5cdFx0XHRsZXQgbHMgPSBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcuZGVwZW5kZW5jaWVzIHx8IHt9KVxuXHRcdFx0XHQuY29uY2F0KE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXZEZXBlbmRlbmNpZXMgfHwge30pLCBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30pKVxuXG5cdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIFtuYW1lLCB2ZXJfbmV3XSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2ZXJfb2xkID0gcmVzb2x1dGlvbnNbbmFtZV07XG5cblx0XHRcdFx0XHRpZiAodmVyX29sZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodmVyX25ldyA9PT0gJ2xhdGVzdCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHZlcl9uZXcgPSAnKic7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGFbbmFtZV0gPSB2ZXJfbmV3O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7fSBhcyBJRGVwZW5kZW5jaWVzKVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRsZXQgcmV0ID0gYXdhaXQgY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShyZXNvbHV0aW9ucywgeWwueWFybmxvY2tfb2xkLCBhcmd2KTtcblxuXHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHN0cmluZ2lmeVlhcm5Mb2NrKHJldC55YXJubG9ja19vbGRfb2JqKSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ld19vYmopKTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7bXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmICFhcmd2LnVwZ3JhZGUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldC55YXJubG9ja19jaGFuZ2VkICYmIGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYHlvdXIgZGVwZW5kZW5jaWVzIHZlcnNpb24gaGlnaCB0aGFuIHJlc29sdXRpb25zYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG8gYCwgY29uc29sZS5ib2xkLmN5YW4uY2hhbGsoYHl0IG5jdSAtdWApLCBgICwgZm9yIHVwZGF0ZSBwYWNrYWdlLmpzb25gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHRcdHtcblx0XHRcdFx0d3JpdGVZYXJuTG9ja2ZpbGUoeWwueWFybmxvY2tfZmlsZSwgcmV0Lnlhcm5sb2NrX25ld19vYmopO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG8gYCwgY29uc29sZS5ib2xkLmN5YW4uY2hhbGsoYHl0IGluc3RhbGxgKSwgYCAsIGZvciB1cGdyYWRlIGRlcGVuZGVuY2llcyBub3dgKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=