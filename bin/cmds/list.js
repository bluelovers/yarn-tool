"use strict";
/**
 * Created by user on 2019/5/19.
 */
const cmd_dir_1 = require("../../lib/cmd_dir");
const index_1 = require("../../lib/index");
const spawn_1 = require("../../lib/spawn");
const crlf_normalize_1 = require("crlf-normalize");
const array_hyper_unique_1 = require("array-hyper-unique");
const index_2 = require("../../lib/index");
const command = cmd_dir_1.basenameStrip(__filename);
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command,
    aliases: [],
    describe: `List installed packages.`,
    builder(yargs) {
        return yargs
            .option('depth', {
            number: true,
        })
            .option('pattern', {
            string: true,
        })
            .option('duplicate', {
            alias: ['D'],
            number: true,
        })
            .example(`$0 list --pattern gulp`, ``)
            .example(`$0 list --pattern "gulp|grunt"`, ``)
            .example(`$0 list --pattern "gulp|grunt" --depth=1`, ``)
            .strict(false);
    },
    handler(argv) {
        const key = command;
        if ('duplicate' in argv && argv.duplicate == null) {
            argv.duplicate = true;
        }
        let fc = index_1.filterYargsArguments(argv, [
            'depth',
            'pattern',
        ]);
        const unparse = require('yargs-unparser');
        const parse = require('yargs-parser');
        let fca = unparse(fc);
        if (argv.duplicate) {
            delete argv.duplicate;
            delete argv.D;
            let cp = spawn_1.crossSpawnOther('yarn', [
                key,
            ], argv, {
                stdio: null,
                stripAnsi: true,
            });
            let list = parseList(cp.stdout.toString());
            let list2 = findDuplicated(list);
            //console.dir(list);
            //console.dir(list2);
            if (0) {
                for (let name of list2) {
                    delete fc.pattern;
                    let fca2 = unparse(fc);
                    let cp2 = spawn_1.crossSpawnOther('yarn', [
                        key,
                        name,
                        ...fca2,
                    ], argv);
                }
            }
            else if (1) {
                index_1.consoleDebug.info(`duplicate installed packages list`);
                index_1.consoleDebug.red.info(`this features current has bug, some package only install one version, but still show up`, "\n");
                for (let name of list2) {
                    let vs = [];
                    list.forEach(data => {
                        if (data.name == name && data.version != null && !vs.includes(data.version)) {
                            //console.log('├─', data.version);
                            vs.push(data.version.replace(/^\^/, ''));
                        }
                    });
                    //vs = vs.sort(semver.rcompare);
                    if (vs.length == 1) {
                        continue;
                    }
                    index_2.console.log(name);
                    let arr = vs.slice(0, -1);
                    if (arr.length) {
                        index_2.console.log('├─', arr.join('\n├─ '));
                    }
                    index_2.console.log('└─', vs[vs.length - 1]);
                }
            }
            else {
                fc.pattern = list2.join('|');
                let fca2 = unparse(fc);
                let cp2 = spawn_1.crossSpawnOther('yarn', [
                    key,
                    ...fca2,
                ], argv);
            }
        }
        else {
            /*
            crossSpawnOther('yarn', [
                key,
                ...fca,
            ], argv)
             */
            cmd_dir_1.lazySpawnArgvSlice({
                command,
                bin: 'yarn',
                cmd: [
                    command,
                ],
                argv,
            });
        }
    },
});
function parseList(stdout) {
    return crlf_normalize_1.crlf(stdout)
        .split(crlf_normalize_1.LF)
        .filter(line => {
        line = line.trim();
        return line && !/^\s*[a-z]/i.test(line);
    })
        .map(line => {
        return parseName(line);
    });
}
function parseName(line) {
    let m = line.match(/^([^@a-z]+)(@?.+)$/i);
    let line_prefix = m[1];
    let fullname = m[2];
    let level = 0;
    m[1].replace(/  /g, function (s) {
        level++;
        return s;
    });
    let m2 = fullname.match(/^(@?[^@]+)@(.+)$/);
    let name = m2[1];
    let version = m2[2];
    let m3 = version.match(/^([^a-z0-9]*)([^\s]+)(.*?)/i);
    if (version.includes('||') || version === '*' || m && m3[1] && !m3[3]) {
        version = m3[2];
        version = null;
    }
    if (level > 1) {
        version = null;
    }
    return {
        name,
        version,
        level,
        line,
        line_prefix,
        fullname,
    };
}
function findDuplicated(list) {
    let arr = list
        .filter(d => {
        return d.version != null && d.version != '*';
    })
        .map(d => d.name);
    //console.log(arr);
    return array_hyper_unique_1.array_unique_overwrite(arr
        .filter((value, index, array) => {
        if (value === '*' || value == null) {
            return false;
        }
        let bool = indexOfVersion(value, index, array);
        if (bool != null) {
            if (list[bool].version === list[index].version) {
                return false;
            }
            //console.log(list[bool], list[index]);
        }
        return bool != null;
    }))
        .sort();
}
function indexOfVersion(version, index, array) {
    let i = array.indexOf(version);
    if (i != -1 && i != index) {
        return i;
    }
    return null;
}
module.exports = cmdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBRWxHLDJDQUEwRztBQUsxRywyQ0FBa0Q7QUFDbEQsbURBQTBDO0FBQzFDLDJEQUE0RDtBQUU1RCwyQ0FBMEM7QUFFMUMsTUFBTSxPQUFPLEdBQUcsdUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUUxQyxNQUFNLFNBQVMsR0FBRyxvQ0FBMEIsQ0FBQztJQUU1QyxPQUFPO0lBQ1AsT0FBTyxFQUFFLEVBQUU7SUFDWCxRQUFRLEVBQUUsMEJBQTBCO0lBRXBDLE9BQU8sQ0FBQyxLQUFLO1FBRVosT0FBTyxLQUFLO2FBQ1YsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQ2xCLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQzthQUNELE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsT0FBTyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQzthQUNyQyxPQUFPLENBQUMsZ0NBQWdDLEVBQUUsRUFBRSxDQUFDO2FBQzdDLE9BQU8sQ0FBQywwQ0FBMEMsRUFBRSxFQUFFLENBQUM7YUFDdkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUVYLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQztRQUVwQixJQUFJLFdBQVcsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQ2pEO1lBQ0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDdEI7UUFFRCxJQUFJLEVBQUUsR0FBRyw0QkFBb0IsQ0FBQyxJQUFJLEVBQUU7WUFD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UUFFL0IsSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQ2xDO1lBQ0MsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRTlDLElBQUksSUFBSSxJQUFJLElBQUksRUFDaEI7WUFDQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFDOUM7Z0JBQ0MsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELHVDQUF1QztTQUN2QztRQUVELE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztTQUNGLElBQUksRUFBRSxDQUFBO0FBQ1QsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLE9BQWUsRUFBRSxLQUFhLEVBQUUsS0FBZTtJQUV0RSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQ3pCO1FBQ0MsT0FBTyxDQUFDLENBQUE7S0FDUjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQTdHRCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmlsdGVyWWFyZ3NBcmd1bWVudHMsIGZpbmRSb290LCBsYXp5RmxhZ3MgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuXG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBjcm9zc1NwYXduT3RoZXIgfSBmcm9tICcuLi8uLi9saWIvc3Bhd24nO1xuaW1wb3J0IHsgY3JsZiwgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWVfb3ZlcndyaXRlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuXG5jb25zdCBjb21tYW5kID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQsXG5cdGFsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYExpc3QgaW5zdGFsbGVkIHBhY2thZ2VzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbignZGVwdGgnLCB7XG5cdFx0XHRcdG51bWJlcjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdwYXR0ZXJuJywge1xuXHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignZHVwbGljYXRlJywge1xuXHRcdFx0XHRhbGlhczogWydEJ10sXG5cdFx0XHRcdG51bWJlcjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuZXhhbXBsZShgJDAgbGlzdCAtLXBhdHRlcm4gZ3VscGAsIGBgKVxuXHRcdFx0LmV4YW1wbGUoYCQwIGxpc3QgLS1wYXR0ZXJuIFwiZ3VscHxncnVudFwiYCwgYGApXG5cdFx0XHQuZXhhbXBsZShgJDAgbGlzdCAtLXBhdHRlcm4gXCJndWxwfGdydW50XCIgLS1kZXB0aD0xYCwgYGApXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGNvbW1hbmQ7XG5cblx0XHRpZiAoJ2R1cGxpY2F0ZScgaW4gYXJndiAmJiBhcmd2LmR1cGxpY2F0ZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdGFyZ3YuZHVwbGljYXRlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRsZXQgZmMgPSBmaWx0ZXJZYXJnc0FyZ3VtZW50cyhhcmd2LCBbXG5cdFx0XHQnZGVwdGgnLFxuXHRcdFx0J3BhdHRlcm4nLFxuXHRcdF0pO1xuXG5cdFx0Y29uc3QgdW5wYXJzZSA9IHJlcXVpcmUoJ3lhcmdzLXVucGFyc2VyJyk7XG5cdFx0Y29uc3QgcGFyc2UgPSByZXF1aXJlKCd5YXJncy1wYXJzZXInKTtcblxuXHRcdGxldCBmY2E6IHN0cmluZ1tdID0gdW5wYXJzZShmYyk7XG5cblx0XHRpZiAoYXJndi5kdXBsaWNhdGUpXG5cdFx0e1xuXHRcdFx0ZGVsZXRlIGFyZ3YuZHVwbGljYXRlO1xuXHRcdFx0ZGVsZXRlIGFyZ3YuRDtcblxuXHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRrZXksXG5cdFx0XHRcdC8vLi4uZmNhLFxuXHRcdFx0XHQvLy4uLmFyZ3YuXyxcblx0XHRcdF0sIGFyZ3YsIHtcblx0XHRcdFx0c3RkaW86IG51bGwsXG5cdFx0XHRcdHN0cmlwQW5zaTogdHJ1ZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgbGlzdCA9IHBhcnNlTGlzdChjcC5zdGRvdXQudG9TdHJpbmcoKSk7XG5cdFx0XHRsZXQgbGlzdDIgPSBmaW5kRHVwbGljYXRlZChsaXN0KTtcblxuXHRcdFx0Ly9jb25zb2xlLmRpcihsaXN0KTtcblx0XHRcdC8vY29uc29sZS5kaXIobGlzdDIpO1xuXG5cdFx0XHRpZiAoMClcblx0XHRcdHtcblx0XHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBsaXN0Milcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSBmYy5wYXR0ZXJuO1xuXG5cdFx0XHRcdFx0bGV0IGZjYTI6IHN0cmluZ1tdID0gdW5wYXJzZShmYyk7XG5cblx0XHRcdFx0XHRsZXQgY3AyID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdC4uLmZjYTIsXG5cdFx0XHRcdFx0XSwgYXJndik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBkdXBsaWNhdGUgaW5zdGFsbGVkIHBhY2thZ2VzIGxpc3RgKTtcblx0XHRcdFx0Y29uc29sZURlYnVnLnJlZC5pbmZvKGB0aGlzIGZlYXR1cmVzIGN1cnJlbnQgaGFzIGJ1Zywgc29tZSBwYWNrYWdlIG9ubHkgaW5zdGFsbCBvbmUgdmVyc2lvbiwgYnV0IHN0aWxsIHNob3cgdXBgLCBcIlxcblwiKTtcblxuXHRcdFx0XHRmb3IgKGxldCBuYW1lIG9mIGxpc3QyKVxuXHRcdFx0XHR7XG5cblxuXHRcdFx0XHRcdGxldCB2cyA9IFtdO1xuXG5cdFx0XHRcdFx0bGlzdC5mb3JFYWNoKGRhdGEgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5uYW1lID09IG5hbWUgJiYgZGF0YS52ZXJzaW9uICE9IG51bGwgJiYgIXZzLmluY2x1ZGVzKGRhdGEudmVyc2lvbikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ+KUnOKUgCcsIGRhdGEudmVyc2lvbik7XG5cblx0XHRcdFx0XHRcdFx0dnMucHVzaChkYXRhLnZlcnNpb24ucmVwbGFjZSgvXlxcXi8sICcnKSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vdnMgPSB2cy5zb3J0KHNlbXZlci5yY29tcGFyZSk7XG5cblx0XHRcdFx0XHRpZiAodnMubGVuZ3RoID09IDEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0XHRsZXQgYXJyID0gdnMuc2xpY2UoMCwgLTEpO1xuXG5cdFx0XHRcdFx0aWYgKGFyci5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFyci5qb2luKCdcXG7ilJzilIAgJykpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCB2c1t2cy5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0ZmMucGF0dGVybiA9IGxpc3QyLmpvaW4oJ3wnKTtcblxuXHRcdFx0XHRsZXQgZmNhMjogc3RyaW5nW10gPSB1bnBhcnNlKGZjKTtcblxuXHRcdFx0XHRsZXQgY3AyID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHQuLi5mY2EyLFxuXHRcdFx0XHRdLCBhcmd2KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdC8qXG5cdFx0XHRjcm9zc1NwYXduT3RoZXIoJ3lhcm4nLCBbXG5cdFx0XHRcdGtleSxcblx0XHRcdFx0Li4uZmNhLFxuXHRcdFx0XSwgYXJndilcblx0XHRcdCAqL1xuXHRcdFx0bGF6eVNwYXduQXJndlNsaWNlKHtcblx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0YmluOiAneWFybicsXG5cdFx0XHRcdGNtZDogW1xuXHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGFyZ3YsXG5cdFx0XHR9KVxuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG5mdW5jdGlvbiBwYXJzZUxpc3Qoc3Rkb3V0OiBzdHJpbmcpXG57XG5cdHJldHVybiBjcmxmKHN0ZG91dClcblx0XHQuc3BsaXQoTEYpXG5cdFx0LmZpbHRlcihsaW5lID0+XG5cdFx0e1xuXHRcdFx0bGluZSA9IGxpbmUudHJpbSgpO1xuXHRcdFx0cmV0dXJuIGxpbmUgJiYgIS9eXFxzKlthLXpdL2kudGVzdChsaW5lKVxuXHRcdH0pXG5cdFx0Lm1hcChsaW5lID0+XG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBhcnNlTmFtZShsaW5lKVxuXHRcdH0pXG5cdFx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZU5hbWUobGluZTogc3RyaW5nKVxue1xuXHRsZXQgbSA9IGxpbmUubWF0Y2goL14oW15AYS16XSspKEA/LispJC9pKTtcblxuXHRsZXQgbGluZV9wcmVmaXggPSBtWzFdO1xuXHRsZXQgZnVsbG5hbWUgPSBtWzJdO1xuXG5cdGxldCBsZXZlbCA9IDA7XG5cblx0bVsxXS5yZXBsYWNlKC8gIC9nLCBmdW5jdGlvbiAocylcblx0e1xuXHRcdGxldmVsKys7XG5cblx0XHRyZXR1cm4gcztcblx0fSk7XG5cblx0bGV0IG0yID0gZnVsbG5hbWUubWF0Y2goL14oQD9bXkBdKylAKC4rKSQvKTtcblxuXHRsZXQgbmFtZSA9IG0yWzFdO1xuXHRsZXQgdmVyc2lvbiA9IG0yWzJdO1xuXG5cdGxldCBtMyA9IHZlcnNpb24ubWF0Y2goL14oW15hLXowLTldKikoW15cXHNdKykoLio/KS9pKTtcblxuXHRpZiAodmVyc2lvbi5pbmNsdWRlcygnfHwnKXx8IHZlcnNpb24gPT09ICcqJyB8fCBtICYmIG0zWzFdICYmICFtM1szXSlcblx0e1xuXHRcdHZlcnNpb24gPSBtM1syXTtcblx0XHR2ZXJzaW9uID0gbnVsbDtcblx0fVxuXG5cdGlmIChsZXZlbCA+IDEpXG5cdHtcblx0XHR2ZXJzaW9uID0gbnVsbDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uLFxuXHRcdGxldmVsLFxuXG5cdFx0bGluZSxcblx0XHRsaW5lX3ByZWZpeCxcblx0XHRmdWxsbmFtZSxcblx0fVxufVxuXG5mdW5jdGlvbiBmaW5kRHVwbGljYXRlZChsaXN0OiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZU5hbWU+W10pXG57XG5cdGxldCBhcnIgPSBsaXN0XG5cdFx0LmZpbHRlcihkID0+IHtcblx0XHRcdHJldHVybiBkLnZlcnNpb24gIT0gbnVsbCAmJiBkLnZlcnNpb24gIT0gJyonXG5cdFx0fSlcblx0XHQubWFwKGQgPT4gZC5uYW1lKVxuXHQ7XG5cblx0Ly9jb25zb2xlLmxvZyhhcnIpO1xuXG5cdHJldHVybiBhcnJheV91bmlxdWVfb3ZlcndyaXRlKGFyclxuXHRcdC5maWx0ZXIoKHZhbHVlLCBpbmRleCwgYXJyYXkpID0+XG5cdFx0e1xuXHRcdFx0aWYgKHZhbHVlID09PSAnKicgfHwgdmFsdWUgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgYm9vbCA9IGluZGV4T2ZWZXJzaW9uKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cblx0XHRcdGlmIChib29sICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsaXN0W2Jvb2xdLnZlcnNpb24gPT09IGxpc3RbaW5kZXhdLnZlcnNpb24pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGxpc3RbYm9vbF0sIGxpc3RbaW5kZXhdKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJvb2wgIT0gbnVsbDtcblx0XHR9KSlcblx0XHQuc29ydCgpXG59XG5cbmZ1bmN0aW9uIGluZGV4T2ZWZXJzaW9uKHZlcnNpb246IHN0cmluZywgaW5kZXg6IG51bWJlciwgYXJyYXk6IHN0cmluZ1tdKVxue1xuXHRsZXQgaSA9IGFycmF5LmluZGV4T2YodmVyc2lvbik7XG5cblx0aWYgKGkgIT0gLTEgJiYgaSAhPSBpbmRleClcblx0e1xuXHRcdHJldHVybiBpXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cbiJdfQ==