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
                return index_1.yarnProcessExit(`resolutions is not exists in package.json`);
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
        if (argv.dedupe && Object.keys(resolutions).length) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSwrQkFBZ0M7QUFDaEMsMkNBUXlCO0FBQ3pCLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBSzJCO0FBQzNCLGlEQU00QjtBQUk1QiwyQ0FBb0Q7QUFFcEQsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTztJQUM1QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsUUFBUSxFQUFFLHdFQUF3RTtJQUVsRixPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sYUFBZSxDQUFDLEtBQUssQ0FBQzthQUMzQixNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ3RCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUM7YUFDRCxPQUFPLENBQUMsV0FBVyxFQUFFLDJDQUEyQyxDQUFDO2FBQ2pFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0RBQWtELENBQUM7YUFDeEUsT0FBTyxDQUFDLGNBQWMsRUFBRSwwRUFBMEUsQ0FBQyxDQUFBO0lBQ3RHLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lBQ3ZCLEdBQUcsSUFBSTtZQUNQLEdBQUc7U0FDSCxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsd0JBQXdCO1FBRXhCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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QUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBRTFELG9CQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUNyRCxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7YUFDMUc7U0FFRDtJQUVGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7XG5cdGNoYWxrQnlDb25zb2xlLFxuXHRjb25zb2xlLFxuXHRjb25zb2xlRGVidWcsXG5cdGZpbmRSb290LFxuXHRmc1lhcm5Mb2NrLFxuXHRwcmludFJvb3REYXRhLFxuXHR5YXJuUHJvY2Vzc0V4aXQsXG59IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgSVBhY2thZ2VKc29uLCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlSlNPTlN5bmMsIHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IHNvcnRQYWNrYWdlSnNvbiB9IGZyb20gJ3NvcnQtcGFja2FnZS1qc29uJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBzZXR1cE5jdVRvWWFyZ3MsIHtcblx0Y2hlY2tSZXNvbHV0aW9uc1VwZGF0ZSxcblx0aXNCYWRWZXJzaW9uLFxuXHRpc1VwZ3JhZGVhYmxlLFxuXHRucG1DaGVja1VwZGF0ZXMsIG5wbUNoZWNrVXBkYXRlc09wdGlvbnMsIHVwZGF0ZVNlbXZlcixcbn0gZnJvbSAnLi4vLi4vbGliL2NsaS9uY3UnO1xuaW1wb3J0IHtcblx0ZmlsdGVyUmVzb2x1dGlvbnMsXG5cdElEZXBlbmRlbmNpZXMsXG5cdElZYXJuTG9ja2ZpbGVQYXJzZU9iamVjdFJvdyxcblx0cGFyc2UgYXMgcGFyc2VZYXJuTG9jaywgcmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpbmdpZnkgYXMgc3RyaW5naWZ5WWFybkxvY2ssXG5cdHN0cmlwRGVwc05hbWUsIHdyaXRlWWFybkxvY2tmaWxlLCB5YXJuTG9ja0RpZmYsXG59IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IHRvRGVwZW5kZW5jeVRhYmxlIH0gZnJvbSAnLi4vLi4vbGliL3RhYmxlJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSkgKyAnIFstdV0nLFxuXHRhbGlhc2VzOiBbJ3VwZGF0ZSddLFxuXHRkZXNjcmliZTogYEZpbmQgbmV3ZXIgdmVyc2lvbnMgb2YgZGVwZW5kZW5jaWVzIHRoYW4gd2hhdCB5b3VyIHBhY2thZ2UuanNvbiBhbGxvd3NgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBOY3VUb1lhcmdzKHlhcmdzKVxuXHRcdFx0Lm9wdGlvbigncmVzb2x1dGlvbnMnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ1InXSxcblx0XHRcdFx0ZGVzYzogJ2RvIHdpdGggcmVzb2x1dGlvbnMgb25seScsXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignbm8tc2FmZScsIHtcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuZXhhbXBsZShgJDAgbmN1IC11YCwgYGNoZWNrIG5ldyB2ZXJzaW9uIGFuZCB1cGRhdGUgcGFja2FnZS5qc29uYClcblx0XHRcdC5leGFtcGxlKGAkMCBuY3UgLVJgLCBgY2hlY2sgbmV3IHZlcnNpb24gb2YgcmVzb2x1dGlvbnMgaW4gcGFja2FnZS5qc29uYClcblx0XHRcdC5leGFtcGxlKGAkMCBuY3UgLXUgLVJgLCBgY2hlY2sgbmV3IHZlcnNpb24gb2YgcmVzb2x1dGlvbnMgaW4gcGFja2FnZS5qc29uIGFuZCB1cGRhdGUgcGFja2FnZS5qc29uYClcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRjd2QsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHQvL2NvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdGxldCBwa2dfZmlsZV9yb290ID0gcGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0bGV0IHJlc29sdXRpb25zID0gcGtnX2RhdGEucmVzb2x1dGlvbnM7XG5cblx0XHRsZXQgcGtnX2ZpbGVfd3M6IHN0cmluZztcblx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdGxldCBkb1dvcmtzcGFjZSA9ICFyb290RGF0YS5pc1dvcmtzcGFjZSAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2U7XG5cblx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cGtnX2ZpbGVfd3MgPSBwYXRoLmpvaW4ocm9vdERhdGEud3MsICdwYWNrYWdlLmpzb24nKTtcblx0XHRcdHBrZ19kYXRhX3dzID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlX3dzKTtcblxuXHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHR9XG5cblx0XHRpZiAoYXJndi5yZXNvbHV0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAoIXJlc29sdXRpb25zIHx8ICFPYmplY3Qua2V5cyhyZXNvbHV0aW9ucykubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4geWFyblByb2Nlc3NFeGl0KGByZXNvbHV0aW9ucyBpcyBub3QgZXhpc3RzIGluIHBhY2thZ2UuanNvbmApXG5cdFx0XHR9XG5cblx0XHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRcdGxldCByZXQgPSBhd2FpdCBjaGVja1Jlc29sdXRpb25zVXBkYXRlKHJlc29sdXRpb25zLCB5bC55YXJubG9ja19vbGQsIGFyZ3YpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKHJldCk7XG5cblx0XHRcdGlmIChyZXQueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0d3JpdGVZYXJuTG9ja2ZpbGUoeWwueWFybmxvY2tfZmlsZSwgcmV0Lnlhcm5sb2NrX25ld19vYmopO1xuXG5cdFx0XHRcdGNoYWxrQnlDb25zb2xlKChjaGFsaywgY29uc29sZSkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKGFyZ3YuY3dkLCB5bC55YXJubG9ja19maWxlKSk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgJHtwfSBpcyB1cGRhdGVkIWApO1xuXG5cdFx0XHRcdH0sIGNvbnNvbGUpO1xuXG5cdFx0XHRcdGxldCBtc2cgPSB5YXJuTG9ja0RpZmYoc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX29sZF9vYmopLCBzdHJpbmdpZnlZYXJuTG9jayhyZXQueWFybmxvY2tfbmV3X29iaikpO1xuXG5cdFx0XHRcdGlmIChtc2cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgXFxuJHttc2d9XFxuYCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGxzMiA9IE9iamVjdC52YWx1ZXMocmV0LmRlcHMpXG5cdFx0XHRcdC5maWx0ZXIoZGF0YSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgeyBuYW1lLCB2ZXJzaW9uX29sZCwgdmVyc2lvbl9uZXcgfSA9IGRhdGE7XG5cblx0XHRcdFx0XHRyZXR1cm4gaXNVcGdyYWRlYWJsZSh2ZXJzaW9uX29sZCwgdmVyc2lvbl9uZXcpXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGxldCBuY3VPcHRpb25zID0gbnBtQ2hlY2tVcGRhdGVzT3B0aW9ucyhhcmd2KTtcblxuXHRcdFx0bGV0IGZyb210byA9IGxzMlxuXHRcdFx0XHQucmVkdWNlKChhLCBkYXRhKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHsgbmFtZSwgdmVyc2lvbl9vbGQsIHZlcnNpb25fbmV3IH0gPSBkYXRhO1xuXG5cdFx0XHRcdFx0bGV0IG5ld19zZW12ZXIgPSB1cGRhdGVTZW12ZXIodmVyc2lvbl9vbGQsIHZlcnNpb25fbmV3LCBuY3VPcHRpb25zKTtcblxuXHRcdFx0XHRcdGEuZnJvbVtuYW1lXSA9IHZlcnNpb25fb2xkO1xuXHRcdFx0XHRcdGEudG9bbmFtZV0gPSBuZXdfc2VtdmVyO1xuXG5cdFx0XHRcdFx0cmVzb2x1dGlvbnNbbmFtZV0gPSBuZXdfc2VtdmVyO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRmcm9tOiB7fSxcblx0XHRcdFx0XHR0bzoge30sXG5cdFx0XHRcdH0gYXMgUGFyYW1ldGVyczx0eXBlb2YgdG9EZXBlbmRlbmN5VGFibGU+WzBdKVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgbXNnID0gdG9EZXBlbmRlbmN5VGFibGUoZnJvbXRvKTtcblxuXHRcdFx0Y29uc29sZS5sb2coYFxcbiR7bXNnfVxcbmApO1xuXG5cdFx0XHRpZiAoYXJndi51cGdyYWRlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwa2dfZGF0YV93cy5yZXNvbHV0aW9ucyA9IHJlc29sdXRpb25zO1xuXG5cdFx0XHRcdFx0d3JpdGVQYWNrYWdlSnNvbihwa2dfZmlsZV93cywgcGtnX2RhdGFfd3MpO1xuXG5cdFx0XHRcdFx0Y2hhbGtCeUNvbnNvbGUoKGNoYWxrLCBjb25zb2xlKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKGFyZ3YuY3dkLCBwa2dfZmlsZV93cykpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhgJHtwfSBpcyB1cGRhdGVkIWApO1xuXG5cdFx0XHRcdFx0fSwgY29uc29sZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGtnX2RhdGEucmVzb2x1dGlvbnMgPSByZXNvbHV0aW9ucztcblxuXHRcdFx0XHRcdHdyaXRlUGFja2FnZUpzb24ocGtnX2ZpbGUsIHBrZ19kYXRhKTtcblxuXHRcdFx0XHRcdGNoYWxrQnlDb25zb2xlKChjaGFsaywgY29uc29sZSkgPT5cblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihwYXRoLnJlbGF0aXZlKHJvb3REYXRhLndzIHx8IHJvb3REYXRhLnBrZywgcGtnX2ZpbGUpKTtcblxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYCR7cH0gaXMgdXBkYXRlZCFgKTtcblxuXHRcdFx0XHRcdH0sIGNvbnNvbGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRwcmludFJvb3REYXRhKHJvb3REYXRhLCBhcmd2KTtcblxuXHRcdGxldCBwa2dOY3UgPSBhd2FpdCBucG1DaGVja1VwZGF0ZXMoe1xuXHRcdFx0Y3dkLFxuXHRcdFx0cm9vdERhdGEsXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0fSwge1xuXHRcdFx0Li4uYXJndixcblx0XHRcdGpzb25fb2xkOiBwa2dfZGF0YSxcblx0XHR9KTtcblxuXHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHR7XG5cdFx0XHR3cml0ZUpTT05TeW5jKHBrZ19maWxlLCBwa2dOY3UuanNvbl9uZXcpO1xuXHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UuanNvbiB1cGRhdGVkYCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YuZGVkdXBlICYmIE9iamVjdC5rZXlzKHJlc29sdXRpb25zKS5sZW5ndGgpXG5cdFx0e1xuXG5cdFx0XHRsZXQgbHMgPSBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcuZGVwZW5kZW5jaWVzIHx8IHt9KVxuXHRcdFx0XHQuY29uY2F0KE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXZEZXBlbmRlbmNpZXMgfHwge30pLCBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30pKVxuXG5cdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIFtuYW1lLCB2ZXJfbmV3XSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2ZXJfb2xkID0gcmVzb2x1dGlvbnNbbmFtZV07XG5cblx0XHRcdFx0XHRpZiAodmVyX29sZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodmVyX25ldyA9PT0gJ2xhdGVzdCcpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHZlcl9uZXcgPSAnKic7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGFbbmFtZV0gPSB2ZXJfbmV3O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7fSBhcyBJRGVwZW5kZW5jaWVzKVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRsZXQgcmV0ID0gYXdhaXQgY2hlY2tSZXNvbHV0aW9uc1VwZGF0ZShyZXNvbHV0aW9ucywgeWwueWFybmxvY2tfb2xkLCBhcmd2KTtcblxuXHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbXNnID0geWFybkxvY2tEaWZmKHN0cmluZ2lmeVlhcm5Mb2NrKHJldC55YXJubG9ja19vbGRfb2JqKSwgc3RyaW5naWZ5WWFybkxvY2socmV0Lnlhcm5sb2NrX25ld19vYmopKTtcblxuXHRcdFx0XHRpZiAobXNnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFxcbiR7bXNnfVxcbmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmICFhcmd2LnVwZ3JhZGUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldC55YXJubG9ja19jaGFuZ2VkICYmIGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYHlvdXIgZGVwZW5kZW5jaWVzIHZlcnNpb24gaGlnaCB0aGFuIHJlc29sdXRpb25zYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG8gYCwgY29uc29sZS5ib2xkLmN5YW4uY2hhbGsoYHl0IG5jdSAtdWApLCBgICwgZm9yIHVwZGF0ZSBwYWNrYWdlLmpzb25gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHJldC55YXJubG9ja19jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHRcdHtcblx0XHRcdFx0d3JpdGVZYXJuTG9ja2ZpbGUoeWwueWFybmxvY2tfZmlsZSwgcmV0Lnlhcm5sb2NrX25ld19vYmopO1xuXG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG8gYCwgY29uc29sZS5ib2xkLmN5YW4uY2hhbGsoYHl0IGluc3RhbGxgKSwgYCAsIGZvciB1cGdyYWRlIGRlcGVuZGVuY2llcyBub3dgKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=