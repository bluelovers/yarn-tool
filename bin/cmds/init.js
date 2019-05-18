"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const spawn_1 = require("../../lib/spawn");
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
    describe: `create a npm package or update package.json file`,
    builder(yargs) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2/lib/yargs-setting',
            processExit: true,
        });
        return require(ret).setupToYargs(yargs);
    },
    handler(argv) {
        let ret = spawn_1.checkModileExists({
            name: 'npm-init2',
            requireName: 'npm-init2/bin/npm-init2',
            processExit: true,
        });
        let cmd_list = spawn_1.processArgvSlice('init').argv;
        spawn_1.crossSpawnOther('node', [
            ret,
            ...cmd_list,
        ], argv);
    },
});
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQThFO0FBQzlFLDJDQUF1RjtBQUl2RixNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPLEVBQUUsdUJBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEMsUUFBUSxFQUFFLGtEQUFrRDtJQUU1RCxPQUFPLENBQUMsS0FBSztRQUVaLElBQUksR0FBRyxHQUFHLHlCQUFpQixDQUFDO1lBQzNCLElBQUksRUFBRSxXQUFXO1lBQ2pCLFdBQVcsRUFBRSw2QkFBNkI7WUFDMUMsV0FBVyxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBRUgsT0FBUSxPQUFPLENBQUMsR0FBRyxDQUFrRCxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMxRixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxJQUFJLEdBQUcsR0FBRyx5QkFBaUIsQ0FBQztZQUMzQixJQUFJLEVBQUUsV0FBVztZQUNqQixXQUFXLEVBQUUseUJBQXlCO1lBQ3RDLFdBQVcsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUVILElBQUksUUFBUSxHQUFHLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3Qyx1QkFBZSxDQUFDLE1BQU0sRUFBRTtZQUV2QixHQUFHO1lBRUgsR0FBRyxRQUFRO1NBQ1gsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVWLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFSCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgY2hlY2tNb2RpbGVFeGlzdHMsIGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9zcGF3bic7XG5pbXBvcnQgeyBzZXR1cFRvWWFyZ3MgYXMgc2V0dXBJbml0VG9ZYXJncyB9IGZyb20gJ25wbS1pbml0Mi9saWIveWFyZ3Mtc2V0dGluZyc7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHRkZXNjcmliZTogYGNyZWF0ZSBhIG5wbSBwYWNrYWdlIG9yIHVwZGF0ZSBwYWNrYWdlLmpzb24gZmlsZWAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdGxldCByZXQgPSBjaGVja01vZGlsZUV4aXN0cyh7XG5cdFx0XHRuYW1lOiAnbnBtLWluaXQyJyxcblx0XHRcdHJlcXVpcmVOYW1lOiAnbnBtLWluaXQyL2xpYi95YXJncy1zZXR0aW5nJyxcblx0XHRcdHByb2Nlc3NFeGl0OiB0cnVlLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIChyZXF1aXJlKHJldCkgYXMgdHlwZW9mIGltcG9ydCgnbnBtLWluaXQyL2xpYi95YXJncy1zZXR0aW5nJykpLnNldHVwVG9ZYXJncyh5YXJncylcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRsZXQgcmV0ID0gY2hlY2tNb2RpbGVFeGlzdHMoe1xuXHRcdFx0bmFtZTogJ25wbS1pbml0MicsXG5cdFx0XHRyZXF1aXJlTmFtZTogJ25wbS1pbml0Mi9iaW4vbnBtLWluaXQyJyxcblx0XHRcdHByb2Nlc3NFeGl0OiB0cnVlLFxuXHRcdH0pO1xuXG5cdFx0bGV0IGNtZF9saXN0ID0gcHJvY2Vzc0FyZ3ZTbGljZSgnaW5pdCcpLmFyZ3Y7XG5cblx0XHRjcm9zc1NwYXduT3RoZXIoJ25vZGUnLCBbXG5cblx0XHRcdHJldCxcblxuXHRcdFx0Li4uY21kX2xpc3QsXG5cdFx0XSwgYXJndik7XG5cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuIl19