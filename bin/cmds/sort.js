"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const upath2_1 = require("upath2");
const index_1 = require("../../lib/index");
const package_dts_1 = require("@ts-type/package-dts");
const pkg_1 = require("../../lib/pkg");
const sort_package_json3_1 = require("sort-package-json3");
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
        json = sort_package_json3_1.default(json);
        pkg_1.writePackageJson(json_file, json);
        !argv.silent && index_1.chalkByConsole((chalk, console) => {
            let p = chalk.cyan(upath2_1.relative(argv.cwd, json_file));
            console.log(`[${chalk.cyan(json.name)}]`, `${p} is sorted!`);
        }, index_1.consoleDebug);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBQzlFLG1DQUF3QztBQUN4QywyQ0FBeUU7QUFDekUsc0RBQXVEO0FBQ3ZELHVDQUFpRDtBQUNqRCwyREFBaUQ7QUFJakQsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsd0JBQXdCO0lBRWxDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNqQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNiLENBQUMsQ0FBQTtJQUVKLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1lBQ1AsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1NBQ2IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksU0FBUyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRW5ELElBQUksSUFBSSxHQUFHLDZCQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdEMsYUFBYTtRQUNiLElBQUksR0FBRyw0QkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdCLHNCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVsQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksc0JBQWMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUVqRCxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRWxELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU5RCxDQUFDLEVBQUUsb0JBQVksQ0FBQyxDQUFDO0lBRWxCLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgam9pbiwgcmVsYXRpdmUgfSBmcm9tICd1cGF0aDInO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHNvcnRQYWNrYWdlSnNvbiBmcm9tICdzb3J0LXBhY2thZ2UtanNvbjMnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYHNvcnQgcGFja2FnZS5qc29uIGZpbGVgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ3NpbGVudCcsIHtcblx0XHRcdFx0YWxpYXM6IFsnUyddLFxuXHRcdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdFx0fSlcblxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0XHRjd2Q6IGFyZ3YuY3dkLFxuXHRcdH0sIHRydWUpO1xuXG5cdFx0bGV0IGpzb25fZmlsZSA9IGpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQganNvbiA9IHJlYWRQYWNrYWdlSnNvbihqc29uX2ZpbGUpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGpzb24gPSBzb3J0UGFja2FnZUpzb24oanNvbik7XG5cblx0XHR3cml0ZVBhY2thZ2VKc29uKGpzb25fZmlsZSwganNvbik7XG5cblx0XHQhYXJndi5zaWxlbnQgJiYgY2hhbGtCeUNvbnNvbGUoKGNoYWxrLCBjb25zb2xlKSA9PiB7XG5cblx0XHRcdGxldCBwID0gY2hhbGsuY3lhbihyZWxhdGl2ZShhcmd2LmN3ZCwganNvbl9maWxlKSk7XG5cblx0XHRcdGNvbnNvbGUubG9nKGBbJHtjaGFsay5jeWFuKGpzb24ubmFtZSl9XWAsIGAke3B9IGlzIHNvcnRlZCFgKTtcblxuXHRcdH0sIGNvbnNvbGVEZWJ1Zyk7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19