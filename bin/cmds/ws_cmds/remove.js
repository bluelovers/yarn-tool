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
        return yargs
            .strict(false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILGtEQUFxRztBQUdyRyw4Q0FBZ0U7QUFFaEUsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLGNBQWM7SUFDZCxRQUFRLEVBQUUsaUNBQWlDO0lBRTNDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sR0FBRyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEMsSUFBSSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQztZQUN2QixHQUFHLElBQUk7U0FDUCxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRVQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQzFCO1lBQ0MsT0FBTyx3QkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1NBQy9DO1FBRUQsNEJBQWtCLENBQUM7WUFDbEIsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRTtnQkFDSixHQUFHO2dCQUNILElBQUk7YUFDSjtZQUNELGFBQWE7WUFDYixJQUFJLEVBQUU7Z0JBQ0wsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2FBQ2hCO1NBQ0QsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IHNldHVwWWFybkFkZFRvWWFyZ3MgfSBmcm9tICcuLi8uLi8uLi9saWIvY2xpL2FkZCc7XG5pbXBvcnQgeyBZVF9CSU4gfSBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBmaW5kUm9vdCwgeWFyZ3NQcm9jZXNzRXhpdCB9IGZyb20gJy4uLy4uLy4uL2xpYi9pbmRleCc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYFJlbW92ZSBhIHBhY2thZ2UgaW4gd29ya3NwYWNlcy5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdGxldCByb290RGF0YSA9IGZpbmRSb290KHtcblx0XHRcdC4uLmFyZ3YsXG5cdFx0fSwgdHJ1ZSk7XG5cblx0XHRpZiAoIXJvb3REYXRhLmhhc1dvcmtzcGFjZSlcblx0XHR7XG5cdFx0XHRyZXR1cm4geWFyZ3NQcm9jZXNzRXhpdChgd29ya3NwYWNlIG5vdCBleGlzdHNgKVxuXHRcdH1cblxuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kOiBrZXksXG5cdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdGNtZDogW1xuXHRcdFx0XHRrZXksXG5cdFx0XHRcdCctVycsXG5cdFx0XHRdLFxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0YXJndjoge1xuXHRcdFx0XHRjd2Q6IHJvb3REYXRhLndzLFxuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=