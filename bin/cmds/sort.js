"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const path = require("path");
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
            boolean: true,
        });
    },
    handler(argv) {
        let rootData = index_1.findRoot({
            ...argv,
            cwd: argv.cwd,
        }, true);
        let json_file = path.join(rootData.pkg, 'package.json');
        let json = package_dts_1.readPackageJson(json_file);
        require('sort-package-json').sortPackageJson(json);
        pkg_1.writePackageJson(json_file, json);
        !argv.silent && index_1.chalkByConsole((chalk, console) => {
            let p = chalk.cyan(path.relative(argv.cwd, json_file));
            console.log(`${p} is sorted!`);
        }, index_1.consoleDebug);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBQzlFLDZCQUE4QjtBQUM5QiwyQ0FBeUU7QUFDekUsc0RBQXVEO0FBQ3ZELHVDQUFpRDtBQUlqRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSx3QkFBd0I7SUFFbEMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE9BQU8sRUFBRSxJQUFJO1NBQ2IsQ0FBQyxDQUFBO0lBRUosQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQztZQUN2QixHQUFHLElBQUk7WUFDUCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDYixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRXhELElBQUksSUFBSSxHQUFHLDZCQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFckMsT0FBTyxDQUFDLG1CQUFtQixDQUF3QyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzRixzQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLHNCQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFFakQsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUV2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVoQyxDQUFDLEVBQUUsb0JBQVksQ0FBQyxDQUFDO0lBRWxCLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYHNvcnQgcGFja2FnZS5qc29uIGZpbGVgLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ3NpbGVudCcsIHtcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdFx0Y3dkOiBhcmd2LmN3ZCxcblx0XHR9LCB0cnVlKTtcblxuXHRcdGxldCBqc29uX2ZpbGUgPSBwYXRoLmpvaW4ocm9vdERhdGEucGtnLCAncGFja2FnZS5qc29uJyk7XG5cblx0XHRsZXQganNvbiA9IHJlYWRQYWNrYWdlSnNvbihqc29uX2ZpbGUpO1xuXG5cdFx0KHJlcXVpcmUoJ3NvcnQtcGFja2FnZS1qc29uJykgYXMgdHlwZW9mIGltcG9ydCgnc29ydC1wYWNrYWdlLWpzb24nKSkuc29ydFBhY2thZ2VKc29uKGpzb24pO1xuXG5cdFx0d3JpdGVQYWNrYWdlSnNvbihqc29uX2ZpbGUsIGpzb24pO1xuXG5cdFx0IWFyZ3Yuc2lsZW50ICYmIGNoYWxrQnlDb25zb2xlKChjaGFsaywgY29uc29sZSkgPT4ge1xuXG5cdFx0XHRsZXQgcCA9IGNoYWxrLmN5YW4ocGF0aC5yZWxhdGl2ZShhcmd2LmN3ZCwganNvbl9maWxlKSk7XG5cblx0XHRcdGNvbnNvbGUubG9nKGAke3B9IGlzIHNvcnRlZCFgKTtcblxuXHRcdH0sIGNvbnNvbGVEZWJ1Zyk7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19