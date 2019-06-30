"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../lib/index");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    aliases: [
        'push',
    ],
    describe: `publish packages in workspaces.`,
    builder(yargs) {
        return yargs;
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        let rootData = index_1.findRoot({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return index_1.yargsProcessExit(`workspace not exists`);
        }
        cmd_dir_1.lazySpawnArgvSlice({
            command: [key, ...cmdModule.aliases],
            bin: 'lerna',
            cmd: [
                key,
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsa0RBQXFHO0FBR3JHLDhDQUFnRTtBQUdoRSxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsT0FBTyxFQUFFO1FBQ1IsTUFBTTtLQUNOO0lBQ0QsUUFBUSxFQUFFLGlDQUFpQztJQUUzQyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSyxDQUFBO0lBQ2IsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsTUFBTSxHQUFHLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0QyxJQUFJLFFBQVEsR0FBRyxnQkFBUSxDQUFDO1lBQ3ZCLEdBQUcsSUFBSTtTQUNQLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFDMUI7WUFDQyxPQUFPLHdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUE7U0FDL0M7UUFFRCw0QkFBa0IsQ0FBQztZQUNsQixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDO1lBQ3BDLEdBQUcsRUFBRSxPQUFPO1lBQ1osR0FBRyxFQUFFO2dCQUNKLEdBQUc7YUFDSDtZQUNELGFBQWE7WUFDYixJQUFJLEVBQUU7Z0JBQ0wsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2FBQ2hCO1NBQ0QsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHNldHVwWWFybkFkZFRvWWFyZ3MgfSBmcm9tICcuLi8uLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgeyBZVF9CSU4gfSBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBmaW5kUm9vdCwgeWFyZ3NQcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyBwcm9jZXNzQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vLi4vbGliL3NwYXduJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGFsaWFzZXM6IFtcblx0XHQncHVzaCcsXG5cdF0sXG5cdGRlc2NyaWJlOiBgcHVibGlzaCBwYWNrYWdlcyBpbiB3b3Jrc3BhY2VzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdH0sIHRydWUpO1xuXG5cdFx0aWYgKCFyb290RGF0YS5oYXNXb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHlhcmdzUHJvY2Vzc0V4aXQoYHdvcmtzcGFjZSBub3QgZXhpc3RzYClcblx0XHR9XG5cblx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0Y29tbWFuZDogW2tleSwgLi4uY21kTW9kdWxlLmFsaWFzZXNdLFxuXHRcdFx0YmluOiAnbGVybmEnLFxuXHRcdFx0Y21kOiBbXG5cdFx0XHRcdGtleSxcblx0XHRcdF0sXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmd2OiB7XG5cdFx0XHRcdGN3ZDogcm9vdERhdGEud3MsXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==