"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    aliases: ['upnp'],
    describe: `Temporarily copies a package (with an optional @range suffix) outside of the global cache for debugging purposes`,
    builder(yargs) {
        return yargs
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5wbHVnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidW5wbHVnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNILCtDQUFrRztBQU9sRyxNQUFNLE9BQU8sR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sU0FBUyxHQUFHLG9DQUEwQixDQUFDO0lBRTVDLE9BQU87SUFDUCxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDakIsUUFBUSxFQUFFLGtIQUFrSDtJQUU1SCxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCw0QkFBa0IsQ0FBQztZQUNsQixPQUFPO1lBQ1AsR0FBRyxFQUFFLE1BQU07WUFDWCxHQUFHLEVBQUUsT0FBTztZQUNaLElBQUk7U0FDSixDQUFDLENBQUE7SUFDSCxDQUFDO0NBRUQsQ0FBQyxDQUFDO0FBRUgsaUJBQVMsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE5LlxuICovXG5pbXBvcnQgeyBiYXNlbmFtZVN0cmlwLCBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cywgbGF6eVNwYXduQXJndlNsaWNlIH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCB7IGNoYWxrQnlDb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290IH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcbmltcG9ydCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IHdyaXRlUGFja2FnZUpzb24gfSBmcm9tICcuLi8uLi9saWIvcGtnJztcbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcblxuY29uc3QgY29tbWFuZCA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kLFxuXHRhbGlhc2VzOiBbJ3VwbnAnXSxcblx0ZGVzY3JpYmU6IGBUZW1wb3JhcmlseSBjb3BpZXMgYSBwYWNrYWdlICh3aXRoIGFuIG9wdGlvbmFsIEByYW5nZSBzdWZmaXgpIG91dHNpZGUgb2YgdGhlIGdsb2JhbCBjYWNoZSBmb3IgZGVidWdnaW5nIHB1cnBvc2VzYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGxhenlTcGF3bkFyZ3ZTbGljZSh7XG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRjbWQ6IGNvbW1hbmQsXG5cdFx0XHRhcmd2LFxuXHRcdH0pXG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcbiJdfQ==