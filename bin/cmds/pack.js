"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Creates a compressed gzip archive of package dependencies.`,
    builder(yargs) {
        return yargs
            .option('dry-run', {
            boolean: true,
        })
            .option('filename', {
            string: true,
        });
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'npm',
            cmd: key,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBUWxHLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU8sRUFBRSx1QkFBYSxDQUFDLFVBQVUsQ0FBQztJQUNsQyxjQUFjO0lBQ2QsUUFBUSxFQUFFLDREQUE0RDtJQUV0RSxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDbEIsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDO2FBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUNuQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sR0FBRyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEMsNEJBQWtCLENBQUM7WUFDbEIsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUUsS0FBSztZQUNWLEdBQUcsRUFBRSxHQUFHO1lBQ1IsSUFBSTtTQUNKLENBQUMsQ0FBQTtJQUNILENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmluZFJvb3QgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHQvL2FsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYENyZWF0ZXMgYSBjb21wcmVzc2VkIGd6aXAgYXJjaGl2ZSBvZiBwYWNrYWdlIGRlcGVuZGVuY2llcy5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ2RyeS1ydW4nLCB7XG5cdFx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignZmlsZW5hbWUnLCB7XG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kOiBrZXksXG5cdFx0XHRiaW46ICducG0nLFxuXHRcdFx0Y21kOiBrZXksXG5cdFx0XHRhcmd2LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==