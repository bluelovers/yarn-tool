"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const add_1 = require("../../../lib/cli/add");
const index_1 = require("../../../index");
const index_2 = require("../../../lib/index");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Installs a package in workspaces.`,
    builder(yargs) {
        return add_1.setupYarnAddToYargs(yargs)
            .option('types', {
            alias: ['type'],
            desc: `try auto install @types/* too`,
            boolean: true,
        });
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        let rootData = index_2.findRoot({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return index_2.yarnProcessExit(`workspace not exists`);
        }
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'node',
            cmd: [
                require.resolve(index_1.YT_BIN),
                'add',
                '-W',
            ],
            // @ts-ignore
            argv: {
                cwd: rootData.ws,
            },
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILGtEQUFxRztBQUNyRyw4Q0FBMkQ7QUFDM0QsMENBQXdDO0FBQ3hDLDhDQUErRDtBQUUvRCxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxtQ0FBbUM7SUFFN0MsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLHlCQUFtQixDQUFDLEtBQUssQ0FBQzthQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLElBQUksRUFBRSwrQkFBK0I7WUFDckMsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1NBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUMxQjtZQUNDLE9BQU8sdUJBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1NBQzlDO1FBRUQsNEJBQWtCLENBQUM7WUFDbEIsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRTtnQkFDSixPQUFPLENBQUMsT0FBTyxDQUFDLGNBQU0sQ0FBQztnQkFDdkIsS0FBSztnQkFDTCxJQUFJO2FBQ0o7WUFDRCxhQUFhO1lBQ2IsSUFBSSxFQUFFO2dCQUNMLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBRTthQUNoQjtTQUNELENBQUMsQ0FBQTtJQUNILENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IHsgWVRfQklOIH0gZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgZmluZFJvb3QsIHlhcm5Qcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uLy4uL2xpYi9pbmRleCc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYEluc3RhbGxzIGEgcGFja2FnZSBpbiB3b3Jrc3BhY2VzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiBzZXR1cFlhcm5BZGRUb1lhcmdzKHlhcmdzKVxuXHRcdFx0Lm9wdGlvbigndHlwZXMnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ3R5cGUnXSxcblx0XHRcdFx0ZGVzYzogYHRyeSBhdXRvIGluc3RhbGwgQHR5cGVzLyogdG9vYCxcblx0XHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdH0pXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHRpZiAoIXJvb3REYXRhLmhhc1dvcmtzcGFjZSlcblx0XHR7XG5cdFx0XHRyZXR1cm4geWFyblByb2Nlc3NFeGl0KGB3b3Jrc3BhY2Ugbm90IGV4aXN0c2ApXG5cdFx0fVxuXG5cdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdGNvbW1hbmQ6IGtleSxcblx0XHRcdGJpbjogJ25vZGUnLFxuXHRcdFx0Y21kOiBbXG5cdFx0XHRcdHJlcXVpcmUucmVzb2x2ZShZVF9CSU4pLFxuXHRcdFx0XHQnYWRkJyxcblx0XHRcdFx0Jy1XJyxcblx0XHRcdF0sXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRhcmd2OiB7XG5cdFx0XHRcdGN3ZDogcm9vdERhdGEud3MsXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==