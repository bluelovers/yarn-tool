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
const cmdModule = cmd_dir_1.createCommandModuleExports({
    command: cmd_dir_1.basenameStrip(__filename),
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
        const key = cmd_dir_1.basenameStrip(__filename);
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
            let cp = spawn_1.crossSpawnOther('yarn', [
                key,
                ...fca,
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
            spawn_1.crossSpawnOther('yarn', [
                key,
                ...fca,
            ], argv);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBRWxHLDJDQUEwRztBQUsxRywyQ0FBa0Q7QUFDbEQsbURBQTBDO0FBQzFDLDJEQUE0RDtBQUU1RCwyQ0FBMEM7QUFFMUMsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLE9BQU8sRUFBRSxFQUFFO0lBQ1gsUUFBUSxFQUFFLDBCQUEwQjtJQUVwQyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQzthQUNELE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUM7YUFDckMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQzthQUM3QyxPQUFPLENBQUMsMENBQTBDLEVBQUUsRUFBRSxDQUFDO2FBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksV0FBVyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFDakQ7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN0QjtRQUVELElBQUksRUFBRSxHQUFHLDRCQUFvQixDQUFDLElBQUksRUFBRTtZQUNuQyxP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QUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRTlDLElBQUksSUFBSSxJQUFJLElBQUksRUFDaEI7WUFDQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFDOUM7Z0JBQ0MsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELHVDQUF1QztTQUN2QztRQUVELE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztTQUNGLElBQUksRUFBRSxDQUFBO0FBQ1QsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLE9BQWUsRUFBRSxLQUFhLEVBQUUsS0FBZTtJQUV0RSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQ3pCO1FBQ0MsT0FBTyxDQUFDLENBQUE7S0FDUjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQTdHRCxpQkFBUyxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMTkuXG4gKi9cbmltcG9ydCB7IGJhc2VuYW1lU3RyaXAsIGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzLCBsYXp5U3Bhd25Bcmd2U2xpY2UgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IHsgY2hhbGtCeUNvbnNvbGUsIGNvbnNvbGVEZWJ1ZywgZmlsdGVyWWFyZ3NBcmd1bWVudHMsIGZpbmRSb290LCBsYXp5RmxhZ3MgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uIH0gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMnO1xuaW1wb3J0IHsgd3JpdGVQYWNrYWdlSnNvbiB9IGZyb20gJy4uLy4uL2xpYi9wa2cnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgSVVucGFja015WWFyZ3NBcmd2IH0gZnJvbSAnLi4vLi4vbGliL2NtZF9kaXInO1xuaW1wb3J0IHsgY3Jvc3NTcGF3bk90aGVyIH0gZnJvbSAnLi4vLi4vbGliL3NwYXduJztcbmltcG9ydCB7IGNybGYsIExGIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlX292ZXJ3cml0ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnLi4vLi4vbGliL2luZGV4JztcblxuY29uc3QgY21kTW9kdWxlID0gY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMoe1xuXG5cdGNvbW1hbmQ6IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSksXG5cdGFsaWFzZXM6IFtdLFxuXHRkZXNjcmliZTogYExpc3QgaW5zdGFsbGVkIHBhY2thZ2VzLmAsXG5cblx0YnVpbGRlcih5YXJncylcblx0e1xuXHRcdHJldHVybiB5YXJnc1xuXHRcdFx0Lm9wdGlvbignZGVwdGgnLCB7XG5cdFx0XHRcdG51bWJlcjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdwYXR0ZXJuJywge1xuXHRcdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbignZHVwbGljYXRlJywge1xuXHRcdFx0XHRhbGlhczogWydEJ10sXG5cdFx0XHRcdG51bWJlcjogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQuZXhhbXBsZShgJDAgbGlzdCAtLXBhdHRlcm4gZ3VscGAsIGBgKVxuXHRcdFx0LmV4YW1wbGUoYCQwIGxpc3QgLS1wYXR0ZXJuIFwiZ3VscHxncnVudFwiYCwgYGApXG5cdFx0XHQuZXhhbXBsZShgJDAgbGlzdCAtLXBhdHRlcm4gXCJndWxwfGdydW50XCIgLS1kZXB0aD0xYCwgYGApXG5cdFx0XHQuc3RyaWN0KGZhbHNlKVxuXHR9LFxuXG5cdGhhbmRsZXIoYXJndilcblx0e1xuXHRcdGNvbnN0IGtleSA9IGJhc2VuYW1lU3RyaXAoX19maWxlbmFtZSk7XG5cblx0XHRpZiAoJ2R1cGxpY2F0ZScgaW4gYXJndiAmJiBhcmd2LmR1cGxpY2F0ZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdGFyZ3YuZHVwbGljYXRlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRsZXQgZmMgPSBmaWx0ZXJZYXJnc0FyZ3VtZW50cyhhcmd2LCBbXG5cdFx0XHQnZGVwdGgnLFxuXHRcdFx0J3BhdHRlcm4nLFxuXHRcdF0pO1xuXG5cdFx0Y29uc3QgdW5wYXJzZSA9IHJlcXVpcmUoJ3lhcmdzLXVucGFyc2VyJyk7XG5cdFx0Y29uc3QgcGFyc2UgPSByZXF1aXJlKCd5YXJncy1wYXJzZXInKTtcblxuXHRcdGxldCBmY2E6IHN0cmluZ1tdID0gdW5wYXJzZShmYyk7XG5cblx0XHRpZiAoYXJndi5kdXBsaWNhdGUpXG5cdFx0e1xuXHRcdFx0bGV0IGNwID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRrZXksXG5cdFx0XHRcdC4uLmZjYSxcblx0XHRcdF0sIGFyZ3YsIHtcblx0XHRcdFx0c3RkaW86IG51bGwsXG5cdFx0XHRcdHN0cmlwQW5zaTogdHJ1ZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgbGlzdCA9IHBhcnNlTGlzdChjcC5zdGRvdXQudG9TdHJpbmcoKSk7XG5cdFx0XHRsZXQgbGlzdDIgPSBmaW5kRHVwbGljYXRlZChsaXN0KTtcblxuXHRcdFx0Ly9jb25zb2xlLmRpcihsaXN0KTtcblx0XHRcdC8vY29uc29sZS5kaXIobGlzdDIpO1xuXG5cdFx0XHRpZiAoMClcblx0XHRcdHtcblx0XHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBsaXN0Milcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSBmYy5wYXR0ZXJuO1xuXG5cdFx0XHRcdFx0bGV0IGZjYTI6IHN0cmluZ1tdID0gdW5wYXJzZShmYyk7XG5cblx0XHRcdFx0XHRsZXQgY3AyID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdC4uLmZjYTIsXG5cdFx0XHRcdFx0XSwgYXJndik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBkdXBsaWNhdGUgaW5zdGFsbGVkIHBhY2thZ2VzIGxpc3RgKTtcblx0XHRcdFx0Y29uc29sZURlYnVnLnJlZC5pbmZvKGB0aGlzIGZlYXR1cmVzIGN1cnJlbnQgaGFzIGJ1Zywgc29tZSBwYWNrYWdlIG9ubHkgaW5zdGFsbCBvbmUgdmVyc2lvbiwgYnV0IHN0aWxsIHNob3cgdXBgLCBcIlxcblwiKTtcblxuXHRcdFx0XHRmb3IgKGxldCBuYW1lIG9mIGxpc3QyKVxuXHRcdFx0XHR7XG5cblxuXHRcdFx0XHRcdGxldCB2cyA9IFtdO1xuXG5cdFx0XHRcdFx0bGlzdC5mb3JFYWNoKGRhdGEgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5uYW1lID09IG5hbWUgJiYgZGF0YS52ZXJzaW9uICE9IG51bGwgJiYgIXZzLmluY2x1ZGVzKGRhdGEudmVyc2lvbikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ+KUnOKUgCcsIGRhdGEudmVyc2lvbik7XG5cblx0XHRcdFx0XHRcdFx0dnMucHVzaChkYXRhLnZlcnNpb24ucmVwbGFjZSgvXlxcXi8sICcnKSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vdnMgPSB2cy5zb3J0KHNlbXZlci5yY29tcGFyZSk7XG5cblx0XHRcdFx0XHRpZiAodnMubGVuZ3RoID09IDEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0XHRsZXQgYXJyID0gdnMuc2xpY2UoMCwgLTEpO1xuXG5cdFx0XHRcdFx0aWYgKGFyci5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFyci5qb2luKCdcXG7ilJzilIAgJykpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCB2c1t2cy5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0ZmMucGF0dGVybiA9IGxpc3QyLmpvaW4oJ3wnKTtcblxuXHRcdFx0XHRsZXQgZmNhMjogc3RyaW5nW10gPSB1bnBhcnNlKGZjKTtcblxuXHRcdFx0XHRsZXQgY3AyID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHQuLi5mY2EyLFxuXHRcdFx0XHRdLCBhcmd2KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGNyb3NzU3Bhd25PdGhlcigneWFybicsIFtcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHQuLi5mY2EsXG5cdFx0XHRdLCBhcmd2KVxuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG5mdW5jdGlvbiBwYXJzZUxpc3Qoc3Rkb3V0OiBzdHJpbmcpXG57XG5cdHJldHVybiBjcmxmKHN0ZG91dClcblx0XHQuc3BsaXQoTEYpXG5cdFx0LmZpbHRlcihsaW5lID0+XG5cdFx0e1xuXHRcdFx0bGluZSA9IGxpbmUudHJpbSgpO1xuXHRcdFx0cmV0dXJuIGxpbmUgJiYgIS9eXFxzKlthLXpdL2kudGVzdChsaW5lKVxuXHRcdH0pXG5cdFx0Lm1hcChsaW5lID0+XG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBhcnNlTmFtZShsaW5lKVxuXHRcdH0pXG5cdFx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZU5hbWUobGluZTogc3RyaW5nKVxue1xuXHRsZXQgbSA9IGxpbmUubWF0Y2goL14oW15AYS16XSspKEA/LispJC9pKTtcblxuXHRsZXQgbGluZV9wcmVmaXggPSBtWzFdO1xuXHRsZXQgZnVsbG5hbWUgPSBtWzJdO1xuXG5cdGxldCBsZXZlbCA9IDA7XG5cblx0bVsxXS5yZXBsYWNlKC8gIC9nLCBmdW5jdGlvbiAocylcblx0e1xuXHRcdGxldmVsKys7XG5cblx0XHRyZXR1cm4gcztcblx0fSk7XG5cblx0bGV0IG0yID0gZnVsbG5hbWUubWF0Y2goL14oQD9bXkBdKylAKC4rKSQvKTtcblxuXHRsZXQgbmFtZSA9IG0yWzFdO1xuXHRsZXQgdmVyc2lvbiA9IG0yWzJdO1xuXG5cdGxldCBtMyA9IHZlcnNpb24ubWF0Y2goL14oW15hLXowLTldKikoW15cXHNdKykoLio/KS9pKTtcblxuXHRpZiAodmVyc2lvbi5pbmNsdWRlcygnfHwnKXx8IHZlcnNpb24gPT09ICcqJyB8fCBtICYmIG0zWzFdICYmICFtM1szXSlcblx0e1xuXHRcdHZlcnNpb24gPSBtM1syXTtcblx0XHR2ZXJzaW9uID0gbnVsbDtcblx0fVxuXG5cdGlmIChsZXZlbCA+IDEpXG5cdHtcblx0XHR2ZXJzaW9uID0gbnVsbDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uLFxuXHRcdGxldmVsLFxuXG5cdFx0bGluZSxcblx0XHRsaW5lX3ByZWZpeCxcblx0XHRmdWxsbmFtZSxcblx0fVxufVxuXG5mdW5jdGlvbiBmaW5kRHVwbGljYXRlZChsaXN0OiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZU5hbWU+W10pXG57XG5cdGxldCBhcnIgPSBsaXN0XG5cdFx0LmZpbHRlcihkID0+IHtcblx0XHRcdHJldHVybiBkLnZlcnNpb24gIT0gbnVsbCAmJiBkLnZlcnNpb24gIT0gJyonXG5cdFx0fSlcblx0XHQubWFwKGQgPT4gZC5uYW1lKVxuXHQ7XG5cblx0Ly9jb25zb2xlLmxvZyhhcnIpO1xuXG5cdHJldHVybiBhcnJheV91bmlxdWVfb3ZlcndyaXRlKGFyclxuXHRcdC5maWx0ZXIoKHZhbHVlLCBpbmRleCwgYXJyYXkpID0+XG5cdFx0e1xuXHRcdFx0aWYgKHZhbHVlID09PSAnKicgfHwgdmFsdWUgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgYm9vbCA9IGluZGV4T2ZWZXJzaW9uKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cblx0XHRcdGlmIChib29sICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsaXN0W2Jvb2xdLnZlcnNpb24gPT09IGxpc3RbaW5kZXhdLnZlcnNpb24pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGxpc3RbYm9vbF0sIGxpc3RbaW5kZXhdKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJvb2wgIT0gbnVsbDtcblx0XHR9KSlcblx0XHQuc29ydCgpXG59XG5cbmZ1bmN0aW9uIGluZGV4T2ZWZXJzaW9uKHZlcnNpb246IHN0cmluZywgaW5kZXg6IG51bWJlciwgYXJyYXk6IHN0cmluZ1tdKVxue1xuXHRsZXQgaSA9IGFycmF5LmluZGV4T2YodmVyc2lvbik7XG5cblx0aWYgKGkgIT0gLTEgJiYgaSAhPSBpbmRleClcblx0e1xuXHRcdHJldHVybiBpXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cbiJdfQ==