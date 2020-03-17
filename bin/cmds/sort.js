"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const upath2_1 = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `sort package.json file`,
    builder(yargs) {
        return yargs
            .option('silent', {
            alias: ['S'],
            boolean: true,
        });
    },
    handler(argv) {
        let rootData = index_1.findRoot({
            ...argv,
            cwd: argv.cwd,
        }, true);
        let json_file = upath2_1.join(rootData.pkg, 'package.json');
        let json = package_dts_1.readPackageJson(json_file);
        // @ts-ignore
        json = require('sort-package-json').sortPackageJson(json);
        pkg_1.writePackageJson(json_file, json);
        !argv.silent && index_1.chalkByConsole((chalk, console) => {
            let p = chalk.cyan(upath2_1.relative(argv.cwd, json_file));
            console.log(`[${chalk.cyan(json.name)}]`, `${p} is sorted!`);
        }, index_1.consoleDebug);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBQzlFLG1DQUF3QztBQUN4QywyQ0FBeUU7QUFDekUsc0RBQXVEO0FBQ3ZELHVDQUFpRDtBQUlqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSx3QkFBd0I7SUFFbEMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFBO0lBRUosQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQztZQUN2QixHQUFHLElBQUk7WUFDUCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDYixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsSUFBSSxTQUFTLEdBQUcsYUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFbkQsSUFBSSxJQUFJLEdBQUcsNkJBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV0QyxhQUFhO1FBQ2IsSUFBSSxHQUFJLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBd0MsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEcsc0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxzQkFBYyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBRWpELElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTlELENBQUMsRUFBRSxvQkFBWSxDQUFDLENBQUM7SUFFbEIsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBqb2luLCByZWxhdGl2ZSB9IGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgc29ydCBwYWNrYWdlLmpzb24gZmlsZWAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbignc2lsZW50Jywge1xuXHRcdFx0XHRhbGlhczogWydTJ10sXG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0bGV0IHJvb3REYXRhID0gZmluZFJvb3Qoe1xuXHRcdFx0Li4uYXJndixcblx0XHRcdGN3ZDogYXJndi5jd2QsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHRsZXQganNvbl9maWxlID0gam9pbihyb290RGF0YS5wa2csICdwYWNrYWdlLmpzb24nKTtcblxuXHRcdGxldCBqc29uID0gcmVhZFBhY2thZ2VKc29uKGpzb25fZmlsZSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0anNvbiA9IChyZXF1aXJlKCdzb3J0LXBhY2thZ2UtanNvbicpIGFzIHR5cGVvZiBpbXBvcnQoJ3NvcnQtcGFja2FnZS1qc29uJykpLnNvcnRQYWNrYWdlSnNvbihqc29uKTtcblxuXHRcdHdyaXRlUGFja2FnZUpzb24oanNvbl9maWxlLCBqc29uKTtcblxuXHRcdCFhcmd2LnNpbGVudCAmJiBjaGFsa0J5Q29uc29sZSgoY2hhbGssIGNvbnNvbGUpID0+IHtcblxuXHRcdFx0bGV0IHAgPSBjaGFsay5jeWFuKHJlbGF0aXZlKGFyZ3YuY3dkLCBqc29uX2ZpbGUpKTtcblxuXHRcdFx0Y29uc29sZS5sb2coYFske2NoYWxrLmN5YW4oanNvbi5uYW1lKX1dYCwgYCR7cH0gaXMgc29ydGVkIWApO1xuXG5cdFx0fSwgY29uc29sZURlYnVnKTtcblxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=