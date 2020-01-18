"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    //aliases: [],
    describe: `Runs a defined package script.`,
    builder(yargs) {
        return yargs
            .help(false)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        const key = cmd_dir_1.basenameStrip(__filename);
        cmd_dir_1.lazySpawnArgvSlice({
            command: key,
            bin: 'yarn',
            cmd: [
                key,
            ],
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQUVsRyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsY0FBYztJQUNkLFFBQVEsRUFBRSxnQ0FBZ0M7SUFFMUMsT0FBTyxDQUFDLEtBQUs7UUFFWixPQUFPLEtBQUs7YUFDVixJQUFJLENBQUMsS0FBSyxDQUFDO2FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQzthQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDZDtJQUNGLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sR0FBRyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdEMsNEJBQWtCLENBQUM7WUFDbEIsT0FBTyxFQUFFLEdBQUc7WUFDWixHQUFHLEVBQUUsTUFBTTtZQUNYLEdBQUcsRUFBRTtnQkFDSixHQUFHO2FBQ0g7WUFDRCxJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdC8vYWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgUnVucyBhIGRlZmluZWQgcGFja2FnZSBzY3JpcHQuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuaGVscChmYWxzZSlcblx0XHRcdC52ZXJzaW9uKGZhbHNlKVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0XHQ7XG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kOiBrZXksXG5cdFx0XHRiaW46ICd5YXJuJyxcblx0XHRcdGNtZDogW1xuXHRcdFx0XHRrZXksXG5cdFx0XHRdLFxuXHRcdFx0YXJndixcblx0XHR9KVxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=