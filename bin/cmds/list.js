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
                ...argv._,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBRWxHLDJDQUEwRztBQUsxRywyQ0FBa0Q7QUFDbEQsbURBQTBDO0FBQzFDLDJEQUE0RDtBQUU1RCwyQ0FBMEM7QUFFMUMsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLE9BQU8sRUFBRSxFQUFFO0lBQ1gsUUFBUSxFQUFFLDBCQUEwQjtJQUVwQyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQzthQUNELE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUM7YUFDckMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQzthQUM3QyxPQUFPLENBQUMsMENBQTBDLEVBQUUsRUFBRSxDQUFDO2FBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksV0FBVyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFDakQ7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN0QjtRQUVELElBQUksRUFBRSxHQUFHLDRCQUFvQixDQUFDLElBQUksRUFBRTtZQUNuQyxP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Q0FBQztTQUNiO1FBRUQsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFOUMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUNoQjtZQUNDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUM5QztnQkFDQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsdUNBQXVDO1NBQ3ZDO1FBRUQsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxDQUFDO1NBQ0YsSUFBSSxFQUFFLENBQUE7QUFDVCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBZSxFQUFFLEtBQWEsRUFBRSxLQUFlO0lBRXRFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssRUFDekI7UUFDQyxPQUFPLENBQUMsQ0FBQTtLQUNSO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBN0dELGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaWx0ZXJZYXJnc0FyZ3VtZW50cywgZmluZFJvb3QsIGxhenlGbGFncyB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5cbmltcG9ydCB7IElVbnBhY2tNeVlhcmdzQXJndiB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCB7IGNyb3NzU3Bhd25PdGhlciB9IGZyb20gJy4uLy4uL2xpYi9zcGF3bic7XG5pbXBvcnQgeyBjcmxmLCBMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZV9vdmVyd3JpdGUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5cbmNvbnN0IGNtZE1vZHVsZSA9IGNyZWF0ZUNvbW1hbmRNb2R1bGVFeHBvcnRzKHtcblxuXHRjb21tYW5kOiBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpLFxuXHRhbGlhc2VzOiBbXSxcblx0ZGVzY3JpYmU6IGBMaXN0IGluc3RhbGxlZCBwYWNrYWdlcy5gLFxuXG5cdGJ1aWxkZXIoeWFyZ3MpXG5cdHtcblx0XHRyZXR1cm4geWFyZ3Ncblx0XHRcdC5vcHRpb24oJ2RlcHRoJywge1xuXHRcdFx0XHRudW1iZXI6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Lm9wdGlvbigncGF0dGVybicsIHtcblx0XHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ2R1cGxpY2F0ZScsIHtcblx0XHRcdFx0YWxpYXM6IFsnRCddLFxuXHRcdFx0XHRudW1iZXI6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0LmV4YW1wbGUoYCQwIGxpc3QgLS1wYXR0ZXJuIGd1bHBgLCBgYClcblx0XHRcdC5leGFtcGxlKGAkMCBsaXN0IC0tcGF0dGVybiBcImd1bHB8Z3J1bnRcImAsIGBgKVxuXHRcdFx0LmV4YW1wbGUoYCQwIGxpc3QgLS1wYXR0ZXJuIFwiZ3VscHxncnVudFwiIC0tZGVwdGg9MWAsIGBgKVxuXHRcdFx0LnN0cmljdChmYWxzZSlcblx0fSxcblxuXHRoYW5kbGVyKGFyZ3YpXG5cdHtcblx0XHRjb25zdCBrZXkgPSBiYXNlbmFtZVN0cmlwKF9fZmlsZW5hbWUpO1xuXG5cdFx0aWYgKCdkdXBsaWNhdGUnIGluIGFyZ3YgJiYgYXJndi5kdXBsaWNhdGUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRhcmd2LmR1cGxpY2F0ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0bGV0IGZjID0gZmlsdGVyWWFyZ3NBcmd1bWVudHMoYXJndiwgW1xuXHRcdFx0J2RlcHRoJyxcblx0XHRcdCdwYXR0ZXJuJyxcblx0XHRdKTtcblxuXHRcdGNvbnN0IHVucGFyc2UgPSByZXF1aXJlKCd5YXJncy11bnBhcnNlcicpO1xuXHRcdGNvbnN0IHBhcnNlID0gcmVxdWlyZSgneWFyZ3MtcGFyc2VyJyk7XG5cblx0XHRsZXQgZmNhOiBzdHJpbmdbXSA9IHVucGFyc2UoZmMpO1xuXG5cdFx0aWYgKGFyZ3YuZHVwbGljYXRlKVxuXHRcdHtcblx0XHRcdGxldCBjcCA9IGNyb3NzU3Bhd25PdGhlcigneWFybicsIFtcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHQuLi5mY2EsXG5cdFx0XHRcdC4uLmFyZ3YuXyxcblx0XHRcdF0sIGFyZ3YsIHtcblx0XHRcdFx0c3RkaW86IG51bGwsXG5cdFx0XHRcdHN0cmlwQW5zaTogdHJ1ZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgbGlzdCA9IHBhcnNlTGlzdChjcC5zdGRvdXQudG9TdHJpbmcoKSk7XG5cdFx0XHRsZXQgbGlzdDIgPSBmaW5kRHVwbGljYXRlZChsaXN0KTtcblxuXHRcdFx0Ly9jb25zb2xlLmRpcihsaXN0KTtcblx0XHRcdC8vY29uc29sZS5kaXIobGlzdDIpO1xuXG5cdFx0XHRpZiAoMClcblx0XHRcdHtcblx0XHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBsaXN0Milcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSBmYy5wYXR0ZXJuO1xuXG5cdFx0XHRcdFx0bGV0IGZjYTI6IHN0cmluZ1tdID0gdW5wYXJzZShmYyk7XG5cblx0XHRcdFx0XHRsZXQgY3AyID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRcdC4uLmZjYTIsXG5cdFx0XHRcdFx0XSwgYXJndik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5pbmZvKGBkdXBsaWNhdGUgaW5zdGFsbGVkIHBhY2thZ2VzIGxpc3RgKTtcblx0XHRcdFx0Y29uc29sZURlYnVnLnJlZC5pbmZvKGB0aGlzIGZlYXR1cmVzIGN1cnJlbnQgaGFzIGJ1Zywgc29tZSBwYWNrYWdlIG9ubHkgaW5zdGFsbCBvbmUgdmVyc2lvbiwgYnV0IHN0aWxsIHNob3cgdXBgLCBcIlxcblwiKTtcblxuXHRcdFx0XHRmb3IgKGxldCBuYW1lIG9mIGxpc3QyKVxuXHRcdFx0XHR7XG5cblxuXHRcdFx0XHRcdGxldCB2cyA9IFtdO1xuXG5cdFx0XHRcdFx0bGlzdC5mb3JFYWNoKGRhdGEgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YS5uYW1lID09IG5hbWUgJiYgZGF0YS52ZXJzaW9uICE9IG51bGwgJiYgIXZzLmluY2x1ZGVzKGRhdGEudmVyc2lvbikpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ+KUnOKUgCcsIGRhdGEudmVyc2lvbik7XG5cblx0XHRcdFx0XHRcdFx0dnMucHVzaChkYXRhLnZlcnNpb24ucmVwbGFjZSgvXlxcXi8sICcnKSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vdnMgPSB2cy5zb3J0KHNlbXZlci5yY29tcGFyZSk7XG5cblx0XHRcdFx0XHRpZiAodnMubGVuZ3RoID09IDEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2cobmFtZSk7XG5cblx0XHRcdFx0XHRsZXQgYXJyID0gdnMuc2xpY2UoMCwgLTEpO1xuXG5cdFx0XHRcdFx0aWYgKGFyci5sZW5ndGgpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ+KUnOKUgCcsIGFyci5qb2luKCdcXG7ilJzilIAgJykpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCfilJTilIAnLCB2c1t2cy5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0ZmMucGF0dGVybiA9IGxpc3QyLmpvaW4oJ3wnKTtcblxuXHRcdFx0XHRsZXQgZmNhMjogc3RyaW5nW10gPSB1bnBhcnNlKGZjKTtcblxuXHRcdFx0XHRsZXQgY3AyID0gY3Jvc3NTcGF3bk90aGVyKCd5YXJuJywgW1xuXHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHQuLi5mY2EyLFxuXHRcdFx0XHRdLCBhcmd2KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGNyb3NzU3Bhd25PdGhlcigneWFybicsIFtcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHQuLi5mY2EsXG5cdFx0XHRdLCBhcmd2KVxuXHRcdH1cblx0fSxcblxufSk7XG5cbmV4cG9ydCA9IGNtZE1vZHVsZVxuXG5mdW5jdGlvbiBwYXJzZUxpc3Qoc3Rkb3V0OiBzdHJpbmcpXG57XG5cdHJldHVybiBjcmxmKHN0ZG91dClcblx0XHQuc3BsaXQoTEYpXG5cdFx0LmZpbHRlcihsaW5lID0+XG5cdFx0e1xuXHRcdFx0bGluZSA9IGxpbmUudHJpbSgpO1xuXHRcdFx0cmV0dXJuIGxpbmUgJiYgIS9eXFxzKlthLXpdL2kudGVzdChsaW5lKVxuXHRcdH0pXG5cdFx0Lm1hcChsaW5lID0+XG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBhcnNlTmFtZShsaW5lKVxuXHRcdH0pXG5cdFx0O1xufVxuXG5mdW5jdGlvbiBwYXJzZU5hbWUobGluZTogc3RyaW5nKVxue1xuXHRsZXQgbSA9IGxpbmUubWF0Y2goL14oW15AYS16XSspKEA/LispJC9pKTtcblxuXHRsZXQgbGluZV9wcmVmaXggPSBtWzFdO1xuXHRsZXQgZnVsbG5hbWUgPSBtWzJdO1xuXG5cdGxldCBsZXZlbCA9IDA7XG5cblx0bVsxXS5yZXBsYWNlKC8gIC9nLCBmdW5jdGlvbiAocylcblx0e1xuXHRcdGxldmVsKys7XG5cblx0XHRyZXR1cm4gcztcblx0fSk7XG5cblx0bGV0IG0yID0gZnVsbG5hbWUubWF0Y2goL14oQD9bXkBdKylAKC4rKSQvKTtcblxuXHRsZXQgbmFtZSA9IG0yWzFdO1xuXHRsZXQgdmVyc2lvbiA9IG0yWzJdO1xuXG5cdGxldCBtMyA9IHZlcnNpb24ubWF0Y2goL14oW15hLXowLTldKikoW15cXHNdKykoLio/KS9pKTtcblxuXHRpZiAodmVyc2lvbi5pbmNsdWRlcygnfHwnKXx8IHZlcnNpb24gPT09ICcqJyB8fCBtICYmIG0zWzFdICYmICFtM1szXSlcblx0e1xuXHRcdHZlcnNpb24gPSBtM1syXTtcblx0XHR2ZXJzaW9uID0gbnVsbDtcblx0fVxuXG5cdGlmIChsZXZlbCA+IDEpXG5cdHtcblx0XHR2ZXJzaW9uID0gbnVsbDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bmFtZSxcblx0XHR2ZXJzaW9uLFxuXHRcdGxldmVsLFxuXG5cdFx0bGluZSxcblx0XHRsaW5lX3ByZWZpeCxcblx0XHRmdWxsbmFtZSxcblx0fVxufVxuXG5mdW5jdGlvbiBmaW5kRHVwbGljYXRlZChsaXN0OiBSZXR1cm5UeXBlPHR5cGVvZiBwYXJzZU5hbWU+W10pXG57XG5cdGxldCBhcnIgPSBsaXN0XG5cdFx0LmZpbHRlcihkID0+IHtcblx0XHRcdHJldHVybiBkLnZlcnNpb24gIT0gbnVsbCAmJiBkLnZlcnNpb24gIT0gJyonXG5cdFx0fSlcblx0XHQubWFwKGQgPT4gZC5uYW1lKVxuXHQ7XG5cblx0Ly9jb25zb2xlLmxvZyhhcnIpO1xuXG5cdHJldHVybiBhcnJheV91bmlxdWVfb3ZlcndyaXRlKGFyclxuXHRcdC5maWx0ZXIoKHZhbHVlLCBpbmRleCwgYXJyYXkpID0+XG5cdFx0e1xuXHRcdFx0aWYgKHZhbHVlID09PSAnKicgfHwgdmFsdWUgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgYm9vbCA9IGluZGV4T2ZWZXJzaW9uKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cblx0XHRcdGlmIChib29sICE9IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsaXN0W2Jvb2xdLnZlcnNpb24gPT09IGxpc3RbaW5kZXhdLnZlcnNpb24pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKGxpc3RbYm9vbF0sIGxpc3RbaW5kZXhdKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJvb2wgIT0gbnVsbDtcblx0XHR9KSlcblx0XHQuc29ydCgpXG59XG5cbmZ1bmN0aW9uIGluZGV4T2ZWZXJzaW9uKHZlcnNpb246IHN0cmluZywgaW5kZXg6IG51bWJlciwgYXJyYXk6IHN0cmluZ1tdKVxue1xuXHRsZXQgaSA9IGFycmF5LmluZGV4T2YodmVyc2lvbik7XG5cblx0aWYgKGkgIT0gLTEgJiYgaSAhPSBpbmRleClcblx0e1xuXHRcdHJldHVybiBpXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cbiJdfQ==