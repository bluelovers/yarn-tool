"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const yarnlock_1 = require("../../lib/yarnlock");
const semver_1 = require("semver");
const COMMAND_KEY = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `show yarn.lock info`,
    builder(yargs) {
        return yargs
            .option('duplicate', {
            alias: ['D'],
            desc: `show duplicate list by yarn.lock`,
            boolean: true,
        })
            .example(`$0 ${COMMAND_KEY} --duplicate`, `show duplicate list by yarn.lock`)
            .example(`$0 ${COMMAND_KEY} --duplicate false`, `show packages list by yarn.lock`);
    },
    handler(argv) {
        const key = COMMAND_KEY;
        let rootData = index_1.findRoot(argv, true);
        let yl = index_1.fsYarnLock(rootData.root);
        let yarnlock_old_obj = yarnlock_1.parse(yl.yarnlock_old);
        let fy = yarnlock_1.exportYarnLock(yarnlock_old_obj);
        let ks = Object.keys(fy.installed);
        let max = 0;
        let len = 0;
        let ks2 = ks
            .reduce((a, name) => {
            let arr = fy.installed[name];
            if (!argv.duplicate || arr.length > 1) {
                index_1.console.log(name);
                try {
                    arr = arr.sort(semver_1.rcompare).reverse();
                }
                catch (e) {
                }
                let arr2 = arr.slice(0, -1);
                if (arr2.length) {
                    index_1.console.log('├─', arr2.join('\n├─ '));
                    len += arr2.length;
                }
                index_1.console.log('└─', arr[arr.length - 1]);
                max = Math.max(max, arr.length);
                a.push(name);
            }
            return a;
        }, []);
        let chalk = index_1.console.chalk;
        if (argv.duplicate) {
            // @ts-ignore
            index_1.console.cyan.info(`\nFound duplicate in ${chalk.yellow(ks2.length)} packages, ${chalk.yellow(len)}/${chalk.yellow(len + ks2.length)} installed version, highest is ${max}, in total ${ks.length} packages`);
        }
        else {
            // @ts-ignore
            index_1.console.cyan.info(`\nTotal ${chalk.yellow(ks.length)} packages, with ${chalk.yellow(len)}/${chalk.yellow(len + ks2.length)} installed version`);
        }
        if (len > 0) {
            const terminalLink = require('terminal-link');
            const link = terminalLink('see here', 'https://yarnpkg.com/docs/selective-version-resolutions/', {
                fallback(text, url) {
                    return text + ' ' + url;
                }
            });
            index_1.console.cyan.info(`You can try add they to ${index_1.console.chalk.yellow('resolutions')} in package.json, for force package dedupe, ${link}`);
        }
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NrZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFDSCwrQ0FBa0c7QUFFbEcsMkNBQThGO0FBSzlGLGlEQUE0RTtBQUM1RSxtQ0FBMEM7QUFFMUMsTUFBTSxXQUFXLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUU5QyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxxQkFBcUI7SUFFL0IsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLElBQUksRUFBRSxrQ0FBa0M7WUFDeEMsT0FBTyxFQUFFLElBQUk7U0FFYixDQUFDO2FBQ0QsT0FBTyxDQUFDLE1BQU0sV0FBVyxjQUFjLEVBQUUsa0NBQWtDLENBQUM7YUFDNUUsT0FBTyxDQUFDLE1BQU0sV0FBVyxvQkFBb0IsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFBO0lBQ3BGLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQztRQUV4QixJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVwQyxJQUFJLEVBQUUsR0FBRyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuQyxJQUFJLGdCQUFnQixHQUFHLGdCQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXRELElBQUksRUFBRSxHQUFHLHlCQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUUxQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENB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QSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCwgZnNZYXJuTG9jayB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBleHBvcnRZYXJuTG9jaywgcGFyc2UgYXMgcGFyc2VZYXJuTG9jayB9IGZyb20gJy4uLy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBTZW1WZXIsIHJjb21wYXJlIH0gZnJvbSAnc2VtdmVyJztcblxuY29uc3QgQ09NTUFORF9LRVkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBzaG93IHlhcm4ubG9jayBpbmZvYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdkdXBsaWNhdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ0QnXSxcblx0XHRcdFx0ZGVzYzogYHNob3cgZHVwbGljYXRlIGxpc3QgYnkgeWFybi5sb2NrYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdFx0Ly9kZWZhdWx0OiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5leGFtcGxlKGAkMCAke0NPTU1BTkRfS0VZfSAtLWR1cGxpY2F0ZWAsIGBzaG93IGR1cGxpY2F0ZSBsaXN0IGJ5IHlhcm4ubG9ja2ApXG5cdFx0XHQuZXhhbXBsZShgJDAgJHtDT01NQU5EX0tFWX0gLS1kdXBsaWNhdGUgZmFsc2VgLCBgc2hvdyBwYWNrYWdlcyBsaXN0IGJ5IHlhcm4ubG9ja2ApXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gQ09NTUFORF9LRVk7XG5cblx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdChhcmd2LCB0cnVlKTtcblxuXHRcdGxldCB5bCA9IGZzWWFybkxvY2socm9vdERhdGEucm9vdCk7XG5cblx0XHRsZXQgeWFybmxvY2tfb2xkX29iaiA9IHBhcnNlWWFybkxvY2soeWwueWFybmxvY2tfb2xkKTtcblxuXHRcdGxldCBmeSA9IGV4cG9ydFlhcm5Mb2NrKHlhcm5sb2NrX29sZF9vYmopO1xuXG5cdFx0bGV0IGtzID0gT2JqZWN0LmtleXMoZnkuaW5zdGFsbGVkKTtcblxuXHRcdGxldCBtYXggPSAwO1xuXHRcdGxldCBsZW4gPSAwO1xuXG5cdFx0bGV0IGtzMiA9IGtzXG5cdFx0XHQucmVkdWNlKChhLCBuYW1lKSA9PiB7XG5cblx0XHRcdFx0bGV0IGFyciA9IGZ5Lmluc3RhbGxlZFtuYW1lXTtcblxuXHRcdFx0XHRpZiAoIWFyZ3YuZHVwbGljYXRlIHx8IGFyci5sZW5ndGggPiAxKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0XHR0cnlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhcnIgPSBhcnIuc29ydChyY29tcGFyZSkucmV2ZXJzZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaCAoZSlcblx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRsZXQgYXJyMiA9IGFyci5zbGljZSgwLCAtMSk7XG5cblx0XHRcdFx0XHRpZiAoYXJyMi5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFycjIuam9pbignXFxu4pSc4pSAICcpKTtcblxuXHRcdFx0XHRcdFx0bGVuICs9IGFycjIubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCBhcnJbYXJyLmxlbmd0aCAtIDFdKTtcblxuXHRcdFx0XHRcdG1heCA9IE1hdGgubWF4KG1heCwgYXJyLmxlbmd0aCk7XG5cblx0XHRcdFx0XHRhLnB1c2gobmFtZSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fSwgW10gYXMgc3RyaW5nW10pXG5cdFx0O1xuXG5cdFx0bGV0IGNoYWxrID0gY29uc29sZS5jaGFsaztcblxuXHRcdGlmIChhcmd2LmR1cGxpY2F0ZSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRjb25zb2xlLmN5YW4uaW5mbyhgXFxuRm91bmQgZHVwbGljYXRlIGluICR7Y2hhbGsueWVsbG93KGtzMi5sZW5ndGgpfSBwYWNrYWdlcywgJHtjaGFsay55ZWxsb3cobGVuKX0vJHtjaGFsay55ZWxsb3cobGVuK2tzMi5sZW5ndGgpfSBpbnN0YWxsZWQgdmVyc2lvbiwgaGlnaGVzdCBpcyAke21heH0sIGluIHRvdGFsICR7a3MubGVuZ3RofSBwYWNrYWdlc2ApO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0Y29uc29sZS5jeWFuLmluZm8oYFxcblRvdGFsICR7Y2hhbGsueWVsbG93KGtzLmxlbmd0aCl9IHBhY2thZ2VzLCB3aXRoICR7Y2hhbGsueWVsbG93KGxlbil9LyR7Y2hhbGsueWVsbG93KGxlbitrczIubGVuZ3RoKX0gaW5zdGFsbGVkIHZlcnNpb25gKTtcblx0XHR9XG5cblx0XHRpZiAobGVuID4gMClcblx0XHR7XG5cdFx0XHRjb25zdCB0ZXJtaW5hbExpbmsgPSByZXF1aXJlKCd0ZXJtaW5hbC1saW5rJyk7XG5cdFx0XHRjb25zdCBsaW5rID0gdGVybWluYWxMaW5rKCdzZWUgaGVyZScsICdodHRwczovL3lhcm5wa2cuY29tL2RvY3Mvc2VsZWN0aXZlLXZlcnNpb24tcmVzb2x1dGlvbnMvJywge1xuXHRcdFx0XHRmYWxsYmFjayh0ZXh0LCB1cmwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdGV4dCArICcgJyArIHVybDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnNvbGUuY3lhbi5pbmZvKGBZb3UgY2FuIHRyeSBhZGQgdGhleSB0byAke2NvbnNvbGUuY2hhbGsueWVsbG93KCdyZXNvbHV0aW9ucycpfSBpbiBwYWNrYWdlLmpzb24sIGZvciBmb3JjZSBwYWNrYWdlIGRlZHVwZSwgJHtsaW5rfWApO1xuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19