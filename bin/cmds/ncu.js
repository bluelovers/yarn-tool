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
const fs = require("fs-extra");
const semver = require("semver");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: ['update'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUE4RTtBQUM5RSwrQkFBZ0M7QUFDaEMsMkNBQTZGO0FBQzdGLHNEQUFxRTtBQUNyRSx1Q0FBZ0U7QUFHaEUsMkNBQXFFO0FBQ3JFLGlEQU00QjtBQUM1QiwrQkFBZ0M7QUFDaEMsaUNBQWtDO0FBRWxDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsUUFBUSxFQUFFLHNGQUFzRjtJQUVoRyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sYUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzlCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFFakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lBQ3ZCLEdBQUcsSUFBSTtZQUNQLEdBQUc7U0FDSCxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsd0JBQXdCO1FBRXhCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU3RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkQsSUFBSSxRQUFRLEdBQUcsNkJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRXZDLElBQUksV0FBbUIsQ0FBQztRQUN4QixJQUFJLFdBQXlCLENBQUM7UUFFOUIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxJ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O29CQUNyRCxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7aUJBQzFHO2FBQ0Q7U0FDRDtJQUVGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QsIGZzWWFybkxvY2ssIHByaW50Um9vdERhdGEgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiwgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZUpTT05TeW5jLCB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IG5wbUNoZWNrVXBkYXRlcyB9IGZyb20gJy4uLy4uL2xpYi9jbGkvbmN1JztcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJRGVwZW5kZW5jaWVzLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssIHJlbW92ZVJlc29sdXRpb25zQ29yZSwgc3RyaW5naWZ5IGFzIHN0cmluZ2lmeVlhcm5Mb2NrLFxuXHRzdHJpcERlcHNOYW1lLFxufSBmcm9tICcuLi8uLi9saWIveWFybmxvY2snO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGFsaWFzZXM6IFsndXBkYXRlJ10sXG5cdGRlc2NyaWJlOiBgRmluZCBuZXdlciB2ZXJzaW9ucyBvZiBkZXBlbmRlbmNpZXMgdGhhbiB3aGF0IHlvdXIgcGFja2FnZS5qc29uIG9yIGJvd2VyLmpzb24gYWxsb3dzYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHNldHVwTmN1VG9ZYXJncyh5YXJncylcblx0fSxcblxuXHRhc3luYyBoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCB7IGN3ZCB9ID0gYXJndjtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRjd2QsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHQvL2NvbnNvbGUuZGlyKHJvb3REYXRhKTtcblxuXHRcdGxldCBwa2dfZmlsZV9yb290ID0gcGF0aC5qb2luKHJvb3REYXRhLnJvb3QsICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBwa2dfZmlsZSA9IHBhdGguam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblx0XHRsZXQgcGtnX2RhdGEgPSByZWFkUGFja2FnZUpzb24ocGtnX2ZpbGUpO1xuXG5cdFx0bGV0IHJlc29sdXRpb25zID0gcGtnX2RhdGEucmVzb2x1dGlvbnM7XG5cblx0XHRsZXQgcGtnX2ZpbGVfd3M6IHN0cmluZztcblx0XHRsZXQgcGtnX2RhdGFfd3M6IElQYWNrYWdlSnNvbjtcblxuXHRcdGxldCBkb1dvcmtzcGFjZSA9ICFyb290RGF0YS5pc1dvcmtzcGFjZSAmJiByb290RGF0YS5oYXNXb3Jrc3BhY2U7XG5cblx0XHRpZiAoZG9Xb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cGtnX2ZpbGVfd3MgPSBwYXRoLmpvaW4ocm9vdERhdGEud3MsICdwYWNrYWdlLmpzb24nKTtcblx0XHRcdHBrZ19kYXRhX3dzID0gcmVhZFBhY2thZ2VKc29uKHBrZ19maWxlX3dzKTtcblxuXHRcdFx0cmVzb2x1dGlvbnMgPSBwa2dfZGF0YV93cy5yZXNvbHV0aW9ucztcblx0XHR9XG5cblx0XHRwcmludFJvb3REYXRhKHJvb3REYXRhLCBhcmd2KTtcblxuXHRcdGxldCBwa2dOY3UgPSBhd2FpdCBucG1DaGVja1VwZGF0ZXMoe1xuXHRcdFx0Y3dkLFxuXHRcdFx0cm9vdERhdGEsXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0fSwge1xuXHRcdFx0Li4uYXJndixcblx0XHRcdGpzb25fb2xkOiBwa2dfZGF0YSxcblx0XHR9KTtcblxuXHRcdGlmIChwa2dOY3UuanNvbl9jaGFuZ2VkICYmIGFyZ3YudXBncmFkZSlcblx0XHR7XG5cdFx0XHR3cml0ZUpTT05TeW5jKHBrZ19maWxlLCBwa2dOY3UuanNvbl9uZXcpXG5cdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgcGFja2FnZS5qc29uIHVwZGF0ZWRgKTtcblx0XHR9XG5cblx0XHRpZiAoYXJndi5kZWR1cGUgJiYgT2JqZWN0LmtleXMocmVzb2x1dGlvbnMpLmxlbmd0aClcblx0XHR7XG5cblx0XHRcdGxldCBscyA9IE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5kZXBlbmRlbmNpZXMgfHwge30pXG5cdFx0XHRcdC5jb25jYXQoT2JqZWN0LmVudHJpZXMocGtnTmN1Lmpzb25fbmV3LmRldkRlcGVuZGVuY2llcyB8fCB7fSksIE9iamVjdC5lbnRyaWVzKHBrZ05jdS5qc29uX25ldy5vcHRpb25hbERlcGVuZGVuY2llcyB8fCB7fSkpXG5cblx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwgW25hbWUsIHZlcl9uZXddKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHZlcl9vbGQgPSByZXNvbHV0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHRcdGlmICh2ZXJfb2xkKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGFbbmFtZV0gPSB2ZXJfbmV3O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHR9LCB7fSBhcyBJRGVwZW5kZW5jaWVzKVxuXHRcdFx0O1xuXG5cdFx0XHRsZXQgeWwgPSBmc1lhcm5Mb2NrKHJvb3REYXRhLnJvb3QpO1xuXG5cdFx0XHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWwueWFybmxvY2tfb2xkKTtcblxuXHRcdFx0bGV0IHJlc3VsdCA9IGZpbHRlclJlc29sdXRpb25zKHtcblx0XHRcdFx0cmVzb2x1dGlvbnM6IGxzXG5cdFx0XHR9LCB5YXJubG9ja19vbGRfb2JqKTtcblxuXHRcdFx0bGV0IHIyID0gcmVzdWx0Lm5hbWVzXG5cdFx0XHRcdC5maWx0ZXIobmFtZSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWUobmFtZSk7XG5cblx0XHRcdFx0XHRsZXQgZGEgPSByZXN1bHQuZGVwc1tuWzBdXTtcblxuXHRcdFx0XHRcdGlmICghZGEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChkYVsnKiddIHx8IGxzW25bMF1dID09ICcqJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0LnZhbHVlcyhkYSkuc29tZShkciA9PiB7XG5cblx0XHRcdFx0XHRcdGlmIChsc1tuYW1lXSA9PSBudWxsKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bGV0IGJvb2wgPSBzZW12ZXIubHQoZHIudmVyc2lvbiwgbHNbbmFtZV0pO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gYm9vbFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQucmVkdWNlKChhLCBuYW1lKSA9PiB7XG5cblx0XHRcdFx0XHRsZXQgbiA9IHN0cmlwRGVwc05hbWUobmFtZSk7XG5cblx0XHRcdFx0XHRhLm5hbWVzLnB1c2gobmFtZSk7XG5cdFx0XHRcdFx0YS5kZXBzW25bMF1dID0gcmVzdWx0LmRlcHNbblswXV07XG5cblx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdG5hbWVzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRcdFx0XHRkZXBzOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nIHwgJyonLCBJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3c+Pixcblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0bGV0IHJldCA9IHJlbW92ZVJlc29sdXRpb25zQ29yZShyMiwgeWFybmxvY2tfb2xkX29iaik7XG5cblx0XHRcdGlmIChyZXQueWFybmxvY2tfY2hhbmdlZClcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFhcmd2LnVwZ3JhZGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlRGVidWcubWFnZW50YS5pbmZvKGB5b3VyIGRlcGVuZGVuY2llcyB2ZXJzaW9uIGhpZ2ggdGhhbiByZXNvbHV0aW9uc2ApO1xuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5sb2coYHlvdSBjYW4gZG8gYCwgY29uc29sZS5ib2xkLmN5YW4uY2hhbGsoYHl0IG5jdSAtdWApLCBgICwgZm9yIHVwZGF0ZSBwYWNrYWdlLmpzb25gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmcy53cml0ZUZpbGVTeW5jKHlsLnlhcm5sb2NrX2ZpbGUsIHN0cmluZ2lmeVlhcm5Mb2NrKHJldC55YXJubG9ja19uZXcpKTtcblxuXHRcdFx0XHRcdGNvbnNvbGVEZWJ1Zy5tYWdlbnRhLmluZm8oYERlZHVwbGljYXRpb24geWFybi5sb2NrYCk7XG5cdFx0XHRcdFx0Y29uc29sZURlYnVnLmxvZyhgeW91IGNhbiBkbyBgLCBjb25zb2xlLmJvbGQuY3lhbi5jaGFsayhgeXQgaW5zdGFsbGApLCBgICwgZm9yIHVwZ3JhZGUgZGVwZW5kZW5jaWVzIG5vd2ApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==