"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../../lib/cmd_dir");
const index_1 = require("../../../lib/index");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Remove a package in workspaces.`,
    builder(yargs) {
        return yargs;
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        let rootData = index_1.findRoot({
            ...argv,
        }, true);
        if (!rootData.hasWorkspace) {
            return index_1.yarnProcessExit(`workspace not exists`);
        }
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'yarn',
            cmd: [
                key,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILGtEQUFxRztBQUdyRyw4Q0FBK0Q7QUFFL0QsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsaUNBQWlDO0lBRTNDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLLENBQUE7SUFDYixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksUUFBUSxHQUFHLGdCQUFRLENBQUM7WUFDdkIsR0FBRyxJQUFJO1NBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUMxQjtZQUNDLE9BQU8sdUJBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1NBQzlDO1FBRUQsNEJBQWtCLENBQUM7WUFDbEIsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRTtnQkFDSixHQUFHO2dCQUNILElBQUk7YUFDSjtZQUNELGFBQWE7WUFDYixJQUFJLEVBQUU7Z0JBQ0wsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2FBQ2hCO1NBQ0QsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHNldHVwWWFybkFkZFRvWWFyZ3MgfSBmcm9tICcuLi8uLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgeyBZVF9CSU4gfSBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBmaW5kUm9vdCwgeWFyblByb2Nlc3NFeGl0IH0gZnJvbSAnLi4vLi4vLi4vbGliL2luZGV4JztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgUmVtb3ZlIGEgcGFja2FnZSBpbiB3b3Jrc3BhY2VzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRsZXQgcm9vdERhdGEgPSBmaW5kUm9vdCh7XG5cdFx0XHQuLi5hcmd2LFxuXHRcdH0sIHRydWUpO1xuXG5cdFx0aWYgKCFyb290RGF0YS5oYXNXb3Jrc3BhY2UpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHlhcm5Qcm9jZXNzRXhpdChgd29ya3NwYWNlIG5vdCBleGlzdHNgKVxuXHRcdH1cblxuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kOiBrZXksXG5cdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdGNtZDogW1xuXHRcdFx0XHRrZXksXG5cdFx0XHRcdCctVycsXG5cdFx0XHRdLFxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0YXJndjoge1xuXHRcdFx0XHRjd2Q6IHJvb3REYXRhLndzLFxuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=