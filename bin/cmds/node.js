"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    //aliases: [],
    describe: `Run node with the hook already setup.`,
    builder(yargs) {
        return yargs
            .help(false)
            .version(false)
            .strict(false);
    },
    handler(argv) {
        cmd_dir_1.lazySpawnArgvSlice({
            command,
            bin: 'yarn',
            cmd: command,
            argv,
        });
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBT2xHLE1BQU0sT0FBTyxHQUFHLHVCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFMUMsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTztJQUNQLGNBQWM7SUFDZCxRQUFRLEVBQUUsdUNBQXVDO0lBRWpELE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQzthQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJO1FBRVgsNEJBQWtCLENBQUM7WUFDbEIsT0FBTztZQUNQLEdBQUcsRUFBRSxNQUFNO1lBQ1gsR0FBRyxFQUFFLE9BQU87WUFDWixJQUFJO1NBQ0osQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUVELENBQUMsQ0FBQztBQUVILGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaW5kUm9vdCB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNvbW1hbmQgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZCxcblx0Ly9hbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBSdW4gbm9kZSB3aXRoIHRoZSBob29rIGFscmVhZHkgc2V0dXAuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuaGVscChmYWxzZSlcblx0XHRcdC52ZXJzaW9uKGZhbHNlKVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsYXp5U3Bhd25Bcmd2U2xpY2Uoe1xuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGJpbjogJ3lhcm4nLFxuXHRcdFx0Y21kOiBjb21tYW5kLFxuXHRcdFx0YXJndixcblx0XHR9KVxuXHR9LFxuXG59KTtcblxuZXhwb3J0ID0gY21kTW9kdWxlXG4iXX0=