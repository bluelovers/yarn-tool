"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("path");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const ncu_1 = require("../../lib/cli/ncu");
const yarnlock_1 = require("../../lib/yarnlock");
const fs = require("fs-extra");
const semver = require("semver");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: ['update', 'upgrade', 'up'],
    describe: `Find newer versions of dependencies than what your package.json or bower.json allows`,
    builder(yargs) {
        return ncu_1.default(yargs);
    },
    async handler(argv) {
        const { cwd } = argv;
        let rootData = index_1.findRoot({
            ...argv,
            cwd,
        }, true);
        index_1.console.dir(rootData);
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
            let ls = Object.entries(pkgNcu.json_new.dependencies)
                .concat(Object.entries(pkgNcu.json_new.devDependencies || {}), Object.entries(pkgNcu.json_new.optionalDependencies || {}))
                .reduce(function (a, [name, ver_new]) {
                let ver_old = resolutions[name];
                if (ver_old) {
                    // @ts-ignore
                    a[name] = ver_new;
                }
                return a;
            }, {});
            let yl = index_1.fsYarnLock(rootData.root);
            let yarnlock_old_obj = yarnlock_1.parse(yl.yarnlock_old);
            let result = yarnlock_1.filterResolutions({
                resolutions: ls
            }, yarnlock_old_obj);
            let r2 = result.names
                .filter(name => {
                let n = yarnlock_1.stripDepsName(name);
                let da = result.deps[n[0]];
                if (!da) {
                    return false;
                }
                if (da['*'] || ls[n[0]] == '*') {
                    return true;
                }
                return Object.values(da).some(dr => {
                    if (ls[name] == null) {
                        return true;
                    }
                    let bool = semver.lt(dr.version, ls[name]);
                    return bool;
                });
            })
                .reduce((a, name) => {
                let n = yarnlock_1.stripDepsName(name);
                a.names.push(name);
                a.deps[n[0]] = result.deps[n[0]];
                return a;
            }, {
                names: [],
                deps: {},
            });
            let ret = yarnlock_1.removeResolutionsCore(r2, yarnlock_old_obj);
            if (ret.yarnlock_changed) {
                if (!argv.upgrade) {
                    index_1.consoleDebug.magenta.info(`your dependencies version high than resolutions`);
                    index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt ncu -u`), ` , for update package.json`);
                }
                else {
                    fs.writeFileSync(yl.yarnlock_file, yarnlock_1.stringify(ret.yarnlock_new));
                    index_1.consoleDebug.magenta.info(`Deduplication yarn.lock`);
                    index_1.consoleDebug.log(`you can do `, index_1.console.bold.cyan.chalk(`yt install`), ` , for upgrade dependencies now`);
                }
            }
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSw2QkFBOEI7QUFDOUIsMkNBQThFO0FBQzlFLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBQXFFO0FBQ3JFLGlEQU00QjtBQUM1QiwrQkFBZ0M7QUFDaEMsaUNBQWtDO0FBRWxDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQztJQUNwQyxRQUFRLEVBQUUsc0ZBQXNGO0lBRWhHLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxhQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDOUIsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUVqQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXJCLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1lBQ1AsR0FBRztTQUNILEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVCxlQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU3RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkQsSUFBSSxRQUFRLEdBQUcsNkJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRXZDLElBQUksV0FBbUIsQ0FBQztRQUN4QixJQUFJLFdBQXlC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Q3JELG9CQUFZLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxlQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztpQkFDMUc7YUFDRDtTQUNEO0lBRUYsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIGZzWWFybkxvY2sgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiwgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZUpTT05TeW5jLCB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IG5wbUNoZWNrVXBkYXRlcyB9IGZyb20gJy4uLy4uL2xpYi9jbGkvbmN1JztcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJRGVwZW5kZW5jaWVzLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssIHJlbW92ZVJlc29sdXRpb25zQ29yZSwgc3RyaW5naWZ5IGFzIHN0cmluZ2lmeVlhcm5Mb2NrLFxuXHRzdHJpcERlcHNOYW1lLFxufSBmcm9tICcuLi8uLi9saWIveWFybmxvY2snO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGFsaWFzZXM6IFsndXBkYXRlJywgJ3VwZ3JhZGUnLCAndXAnXSxcblx0ZGVzY3JpYmU6IGBGaW5kIG5ld2VyIHZlcnNpb25zIG9mIGRlcGVuZGVuY2llcyB0aGFuIHdoYXQgeW91ciBwYWNrYWdlLmpzb24gb3IgYm93ZXIuanNvbiBhbGxvd3NgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4gc2V0dXBOY3VUb1lhcmdzKHlhcmdzKVxuXHR9LFxuXG5cdGFzeW5jIGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IHsgY3dkIH0gPSBhcmd2O1xuXG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHRcdGN3ZCxcblx0XHR9LCB0cnVlKTtcblxuXHRcdGNvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdGxldCBwa2dfZmlsZV9yb290ID0gcGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0bGV0IHJlc29sdXRpb25zID0gcGtnX2RhdGEucmVzb2x1dGlvbnM7XG5cblx0XHRsZXQgcGtnX2ZpbGVfd3M6IHN0cmluZztcblx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdGxldCBkb1dvcmtzcGFjZSA9ICFyb290RGF0YS5pc1dvcmtzcGFjZSAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2U7XG5cblx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cGtnX2ZpbGVfd3MgPSBwYXRoLmpvaW4ocm9vdERhdGEud3MsICdwYWNrYWdlLmpzb24nKTtcblx0XHRcdHBrZ19kYXRhX3dzID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlX3dzKTtcblxuXHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHR9XG5cblx0XHRsZXQgcGtnTmN1ID0gYXdhaXQgbnBtQ2hlY2tVcGRhdGVzKHtcblx0XHRcdGN3ZCxcblx0XHRcdHJvb3REYXRhLFxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdH0sIHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRqc29uX29sZDogcGtnX2RhdGEsXG5cdFx0fSk7XG5cblx0XHRpZiAocGtnTmN1Lmpzb25fY2hhbmdlZCAmJiBhcmd2LnVwZ3JhZGUpXG5cdFx0e1xuXHRcdFx0d3JpdGVKU09OU3luYyhwa2dfZmlsZSwgcGtnTmN1Lmpzb25fbmV3KVxuXHRcdFx0Y29uc29sZURlYnVnLmluZm8oYHBhY2thZ2UuanNvbiB1cGRhdGVkYCk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3YuZGVkdXBlICYmIE9iamVjdC5rZXlzKHJlc29sdXRpb25zKS5sZW5ndGgpXG5cdFx0e1xuXG5cdFx0XHRsZXQgbHMgPSBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcuZGVwZW5kZW5jaWVzKVxuXHRcdFx0XHQuY29uY2F0KE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXZEZXBlbmRlbmNpZXMgfHwge30pLCBPYmplY3QuZW50cmllcyhwa2dOY3UuanNvbl9uZXcub3B0aW9uYWxEZXBlbmRlbmNpZXMgfHwge30pKVxuXG5cdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIFtuYW1lLCB2ZXJfbmV3XSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCB2ZXJfb2xkID0gcmVzb2x1dGlvbnNbbmFtZV07XG5cblx0XHRcdFx0XHRpZiAodmVyX29sZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRhW25hbWVdID0gdmVyX25ldztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwge30gYXMgSURlcGVuZGVuY2llcylcblx0XHRcdDtcblxuXHRcdFx0bGV0IHlsID0gZnNZYXJuTG9jayhyb290RGF0YS5yb290KTtcblxuXHRcdFx0bGV0IHlhcm5sb2NrX29sZF9vYmogPSBwYXJzZVlhcm5Mb2NrKHlsLnlhcm5sb2NrX29sZCk7XG5cblx0XHRcdGxldCByZXN1bHQgPSBmaWx0ZXJSZXNvbHV0aW9ucyh7XG5cdFx0XHRcdHJlc29sdXRpb25zOiBsc1xuXHRcdFx0fSwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdGxldCByMiA9IHJlc3VsdC5uYW1lc1xuXHRcdFx0XHQuZmlsdGVyKG5hbWUgPT4ge1xuXG5cdFx0XHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lKG5hbWUpO1xuXG5cdFx0XHRcdFx0bGV0IGRhID0gcmVzdWx0LmRlcHNbblswXV07XG5cblx0XHRcdFx0XHRpZiAoIWRhKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoZGFbJyonXSB8fCBsc1tuWzBdXSA9PSAnKicpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdC52YWx1ZXMoZGEpLnNvbWUoZHIgPT4ge1xuXG5cdFx0XHRcdFx0XHRpZiAobHNbbmFtZV0gPT0gbnVsbClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBib29sID0gc2VtdmVyLmx0KGRyLnZlcnNpb24sIGxzW25hbWVdKTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGJvb2xcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnJlZHVjZSgoYSwgbmFtZSkgPT4ge1xuXG5cdFx0XHRcdFx0bGV0IG4gPSBzdHJpcERlcHNOYW1lKG5hbWUpO1xuXG5cdFx0XHRcdFx0YS5uYW1lcy5wdXNoKG5hbWUpO1xuXHRcdFx0XHRcdGEuZGVwc1tuWzBdXSA9IHJlc3VsdC5kZXBzW25bMF1dO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRuYW1lczogW10gYXMgc3RyaW5nW10sXG5cdFx0XHRcdFx0ZGVwczoge30gYXMgUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZyB8ICcqJywgSVlhcm5Mb2NrZmlsZVBhcnNlT2JqZWN0Um93Pj4sXG5cdFx0XHRcdH0pXG5cdFx0XHQ7XG5cblx0XHRcdGxldCByZXQgPSByZW1vdmVSZXNvbHV0aW9uc0NvcmUocjIsIHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdFx0XHRpZiAocmV0Lnlhcm5sb2NrX2NoYW5nZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghYXJndi51cGdyYWRlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLm1hZ2VudGEuaW5mbyhgeW91ciBkZXBlbmRlbmNpZXMgdmVyc2lvbiBoaWdoIHRoYW4gcmVzb2x1dGlvbnNgKTtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcubG9nKGB5b3UgY2FuIGRvIGAsIGNvbnNvbGUuYm9sZC5jeWFuLmNoYWxrKGB5dCBuY3UgLXVgKSwgYCAsIGZvciB1cGRhdGUgcGFja2FnZS5qc29uYCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZnMud3JpdGVGaWxlU3luYyh5bC55YXJubG9ja19maWxlLCBzdHJpbmdpZnlZYXJuTG9jayhyZXQueWFybmxvY2tfbmV3KSk7XG5cblx0XHRcdFx0XHRjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGBEZWR1cGxpY2F0aW9uIHlhcm4ubG9ja2ApO1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG8gYCwgY29uc29sZS5ib2xkLmN5YW4uY2hhbGsoYHl0IGluc3RhbGxgKSwgYCAsIGZvciB1cGdyYWRlIGRlcGVuZGVuY2llcyBub3dgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=