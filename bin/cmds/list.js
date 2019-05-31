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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0gsK0NBQWtHO0FBRWxHLDJDQUEwRztBQUsxRywyQ0FBa0Q7QUFDbEQsbURBQTBDO0FBQzFDLDJEQUE0RDtBQUU1RCwyQ0FBMEM7QUFFMUMsTUFBTSxTQUFTLEdBQUcsb0NBQTBCLENBQUM7SUFFNUMsT0FBTyxFQUFFLHVCQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xDLE9BQU8sRUFBRSxFQUFFO0lBQ1gsUUFBUSxFQUFFLDBCQUEwQjtJQUVwQyxPQUFPLENBQUMsS0FBSztRQUVaLE9BQU8sS0FBSzthQUNWLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7YUFDRCxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQzthQUNELE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUM7YUFDckMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQzthQUM3QyxPQUFPLENBQUMsMENBQTBDLEVBQUUsRUFBRSxDQUFDO2FBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUk7UUFFWCxNQUFNLEdBQUcsR0FBRyx1QkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksV0FBVyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFDakQ7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN0QjtRQUVELElBQUksRUFBRSxHQUFHLDRCQUFvQixDQUFDLElBQUksRUFBRTtZQUNuQyxP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Q0FBQztTQUNiO1FBRUQsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFOUMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUNoQjtZQUNDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUM5QztnQkFDQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsdUNBQXVDO1NBQ3ZDO1FBRUQsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxDQUFDO1NBQ0YsSUFBSSxFQUFFLENBQUE7QUFDVCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsT0FBZSxFQUFFLEtBQWEsRUFBRSxLQUFlO0lBRXRFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssRUFDekI7UUFDQyxPQUFPLENBQUMsQ0FBQTtLQUNSO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBN0dELGlCQUFTLFNBQVMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOS5cbiAqL1xuaW1wb3J0IHsgYmFzZW5hbWVTdHJpcCwgY3JlYXRlQ29tbWFuZE1vZHVsZUV4cG9ydHMsIGxhenlTcGF3bkFyZ3ZTbGljZSB9IGZyb20gJy4uLy4uL2xpYi9jbWRfZGlyJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgeyBjaGFsa0J5Q29uc29sZSwgY29uc29sZURlYnVnLCBmaWx0ZXJZYXJnc0FyZ3VtZW50cywgZmluZFJvb3QsIGxhenlGbGFncyB9IGZyb20gJy4uLy4uL2xpYi9pbmRleCc7XG5pbXBvcnQgeyByZWFkUGFja2FnZUpzb24gfSBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cyc7XG5pbXBvcnQgeyB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vLi4vbGliL3BrZyc7XG5pbXBvcnQgeyBzb3J0UGFja2FnZUpzb24gfSBmcm9tICdzb3J0LXBhY2thZ2UtanNvbic7XG5pbXBvcnQgeyBJVW5wYWNrTXlZYXJnc0FyZ3YgfSBmcm9tICcuLi8uLi9saWIvY21kX2Rpcic7XG5pbXBvcnQgeyBjcm9zc1NwYXduT3RoZXIgfSBmcm9tICcuLi8uLi9saWIvc3Bhd24nO1xuaW1wb3J0IHsgY3JsZiwgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWVfb3ZlcndyaXRlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuLi8uLi9saWIvaW5kZXgnO1xuXG5jb25zdCBjbWRNb2R1bGUgPSBjcmVhdGVDb21tYW5kTW9kdWxlRXhwb3J0cyh7XG5cblx0Y29tbWFuZDogYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKSxcblx0YWxpYXNlczogW10sXG5cdGRlc2NyaWJlOiBgTGlzdCBpbnN0YWxsZWQgcGFja2FnZXMuYCxcblxuXHRidWlsZGVyKHlhcmdzKVxuXHR7XG5cdFx0cmV0dXJuIHlhcmdzXG5cdFx0XHQub3B0aW9uKCdkZXB0aCcsIHtcblx0XHRcdFx0bnVtYmVyOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5vcHRpb24oJ3BhdHRlcm4nLCB7XG5cdFx0XHRcdHN0cmluZzogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHQub3B0aW9uKCdkdXBsaWNhdGUnLCB7XG5cdFx0XHRcdGFsaWFzOiBbJ0QnXSxcblx0XHRcdFx0bnVtYmVyOiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdC5leGFtcGxlKGAkMCBsaXN0IC0tcGF0dGVybiBndWxwYCwgYGApXG5cdFx0XHQuZXhhbXBsZShgJDAgbGlzdCAtLXBhdHRlcm4gXCJndWxwfGdydW50XCJgLCBgYClcblx0XHRcdC5leGFtcGxlKGAkMCBsaXN0IC0tcGF0dGVybiBcImd1bHB8Z3J1bnRcIiAtLWRlcHRoPTFgLCBgYClcblx0XHRcdC5zdHJpY3QoZmFsc2UpXG5cdH0sXG5cblx0aGFuZGxlcihhcmd2KVxuXHR7XG5cdFx0Y29uc3Qga2V5ID0gYmFzZW5hbWVTdHJpcChfX2ZpbGVuYW1lKTtcblxuXHRcdGlmICgnZHVwbGljYXRlJyBpbiBhcmd2ICYmIGFyZ3YuZHVwbGljYXRlID09IG51bGwpXG5cdFx0e1xuXHRcdFx0YXJndi5kdXBsaWNhdGUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGxldCBmYyA9IGZpbHRlcllhcmdzQXJndW1lbnRzKGFyZ3YsIFtcblx0XHRcdCdkZXB0aCcsXG5cdFx0XHQncGF0dGVybicsXG5cdFx0XSk7XG5cblx0XHRjb25zdCB1bnBhcnNlID0gcmVxdWlyZSgneWFyZ3MtdW5wYXJzZXInKTtcblx0XHRjb25zdCBwYXJzZSA9IHJlcXVpcmUoJ3lhcmdzLXBhcnNlcicpO1xuXG5cdFx0bGV0IGZjYTogc3RyaW5nW10gPSB1bnBhcnNlKGZjKTtcblxuXHRcdGlmIChhcmd2LmR1cGxpY2F0ZSlcblx0XHR7XG5cdFx0XHRsZXQgY3AgPSBjcm9zc1NwYXduT3RoZXIoJ3lhcm4nLCBbXG5cdFx0XHRcdGtleSxcblx0XHRcdFx0Li4uZmNhLFxuXHRcdFx0XHQuLi5hcmd2Ll8sXG5cdFx0XHRdLCBhcmd2LCB7XG5cdFx0XHRcdHN0ZGlvOiBudWxsLFxuXHRcdFx0XHRzdHJpcEFuc2k6IHRydWUsXG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IGxpc3QgPSBwYXJzZUxpc3QoY3Auc3Rkb3V0LnRvU3RyaW5nKCkpO1xuXHRcdFx0bGV0IGxpc3QyID0gZmluZER1cGxpY2F0ZWQobGlzdCk7XG5cblx0XHRcdC8vY29uc29sZS5kaXIobGlzdCk7XG5cdFx0XHQvL2NvbnNvbGUuZGlyKGxpc3QyKTtcblxuXHRcdFx0aWYgKDApXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAobGV0IG5hbWUgb2YgbGlzdDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgZmMucGF0dGVybjtcblxuXHRcdFx0XHRcdGxldCBmY2EyOiBzdHJpbmdbXSA9IHVucGFyc2UoZmMpO1xuXG5cdFx0XHRcdFx0bGV0IGNwMiA9IGNyb3NzU3Bhd25PdGhlcigneWFybicsIFtcblx0XHRcdFx0XHRcdGtleSxcblx0XHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0XHQuLi5mY2EyLFxuXHRcdFx0XHRcdF0sIGFyZ3YpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICgxKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlRGVidWcuaW5mbyhgZHVwbGljYXRlIGluc3RhbGxlZCBwYWNrYWdlcyBsaXN0YCk7XG5cdFx0XHRcdGNvbnNvbGVEZWJ1Zy5yZWQuaW5mbyhgdGhpcyBmZWF0dXJlcyBjdXJyZW50IGhhcyBidWcsIHNvbWUgcGFja2FnZSBvbmx5IGluc3RhbGwgb25lIHZlcnNpb24sIGJ1dCBzdGlsbCBzaG93IHVwYCwgXCJcXG5cIik7XG5cblx0XHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBsaXN0Milcblx0XHRcdFx0e1xuXG5cblx0XHRcdFx0XHRsZXQgdnMgPSBbXTtcblxuXHRcdFx0XHRcdGxpc3QuZm9yRWFjaChkYXRhID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKGRhdGEubmFtZSA9PSBuYW1lICYmIGRhdGEudmVyc2lvbiAhPSBudWxsICYmICF2cy5pbmNsdWRlcyhkYXRhLnZlcnNpb24pKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCfilJzilIAnLCBkYXRhLnZlcnNpb24pO1xuXG5cdFx0XHRcdFx0XHRcdHZzLnB1c2goZGF0YS52ZXJzaW9uLnJlcGxhY2UoL15cXF4vLCAnJykpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvL3ZzID0gdnMuc29ydChzZW12ZXIucmNvbXBhcmUpO1xuXG5cdFx0XHRcdFx0aWYgKHZzLmxlbmd0aCA9PSAxKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKG5hbWUpO1xuXG5cdFx0XHRcdFx0bGV0IGFyciA9IHZzLnNsaWNlKDAsIC0xKTtcblxuXHRcdFx0XHRcdGlmIChhcnIubGVuZ3RoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCfilJzilIAnLCBhcnIuam9pbignXFxu4pSc4pSAICcpKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZygn4pSU4pSAJywgdnNbdnMubGVuZ3RoIC0gMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGZjLnBhdHRlcm4gPSBsaXN0Mi5qb2luKCd8Jyk7XG5cblx0XHRcdFx0bGV0IGZjYTI6IHN0cmluZ1tdID0gdW5wYXJzZShmYyk7XG5cblx0XHRcdFx0bGV0IGNwMiA9IGNyb3NzU3Bhd25PdGhlcigneWFybicsIFtcblx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0Li4uZmNhMixcblx0XHRcdFx0XSwgYXJndik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRjcm9zc1NwYXduT3RoZXIoJ3lhcm4nLCBbXG5cdFx0XHRcdGtleSxcblx0XHRcdFx0Li4uZmNhLFxuXHRcdFx0XSwgYXJndilcblx0XHR9XG5cdH0sXG5cbn0pO1xuXG5leHBvcnQgPSBjbWRNb2R1bGVcblxuZnVuY3Rpb24gcGFyc2VMaXN0KHN0ZG91dDogc3RyaW5nKVxue1xuXHRyZXR1cm4gY3JsZihzdGRvdXQpXG5cdFx0LnNwbGl0KExGKVxuXHRcdC5maWx0ZXIobGluZSA9PlxuXHRcdHtcblx0XHRcdGxpbmUgPSBsaW5lLnRyaW0oKTtcblx0XHRcdHJldHVybiBsaW5lICYmICEvXlxccypbYS16XS9pLnRlc3QobGluZSlcblx0XHR9KVxuXHRcdC5tYXAobGluZSA9PlxuXHRcdHtcblx0XHRcdHJldHVybiBwYXJzZU5hbWUobGluZSlcblx0XHR9KVxuXHRcdDtcbn1cblxuZnVuY3Rpb24gcGFyc2VOYW1lKGxpbmU6IHN0cmluZylcbntcblx0bGV0IG0gPSBsaW5lLm1hdGNoKC9eKFteQGEtel0rKShAPy4rKSQvaSk7XG5cblx0bGV0IGxpbmVfcHJlZml4ID0gbVsxXTtcblx0bGV0IGZ1bGxuYW1lID0gbVsyXTtcblxuXHRsZXQgbGV2ZWwgPSAwO1xuXG5cdG1bMV0ucmVwbGFjZSgvICAvZywgZnVuY3Rpb24gKHMpXG5cdHtcblx0XHRsZXZlbCsrO1xuXG5cdFx0cmV0dXJuIHM7XG5cdH0pO1xuXG5cdGxldCBtMiA9IGZ1bGxuYW1lLm1hdGNoKC9eKEA/W15AXSspQCguKykkLyk7XG5cblx0bGV0IG5hbWUgPSBtMlsxXTtcblx0bGV0IHZlcnNpb24gPSBtMlsyXTtcblxuXHRsZXQgbTMgPSB2ZXJzaW9uLm1hdGNoKC9eKFteYS16MC05XSopKFteXFxzXSspKC4qPykvaSk7XG5cblx0aWYgKHZlcnNpb24uaW5jbHVkZXMoJ3x8Jyl8fCB2ZXJzaW9uID09PSAnKicgfHwgbSAmJiBtM1sxXSAmJiAhbTNbM10pXG5cdHtcblx0XHR2ZXJzaW9uID0gbTNbMl07XG5cdFx0dmVyc2lvbiA9IG51bGw7XG5cdH1cblxuXHRpZiAobGV2ZWwgPiAxKVxuXHR7XG5cdFx0dmVyc2lvbiA9IG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG5hbWUsXG5cdFx0dmVyc2lvbixcblx0XHRsZXZlbCxcblxuXHRcdGxpbmUsXG5cdFx0bGluZV9wcmVmaXgsXG5cdFx0ZnVsbG5hbWUsXG5cdH1cbn1cblxuZnVuY3Rpb24gZmluZER1cGxpY2F0ZWQobGlzdDogUmV0dXJuVHlwZTx0eXBlb2YgcGFyc2VOYW1lPltdKVxue1xuXHRsZXQgYXJyID0gbGlzdFxuXHRcdC5maWx0ZXIoZCA9PiB7XG5cdFx0XHRyZXR1cm4gZC52ZXJzaW9uICE9IG51bGwgJiYgZC52ZXJzaW9uICE9ICcqJ1xuXHRcdH0pXG5cdFx0Lm1hcChkID0+IGQubmFtZSlcblx0O1xuXG5cdC8vY29uc29sZS5sb2coYXJyKTtcblxuXHRyZXR1cm4gYXJyYXlfdW5pcXVlX292ZXJ3cml0ZShhcnJcblx0XHQuZmlsdGVyKCh2YWx1ZSwgaW5kZXgsIGFycmF5KSA9PlxuXHRcdHtcblx0XHRcdGlmICh2YWx1ZSA9PT0gJyonIHx8IHZhbHVlID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGJvb2wgPSBpbmRleE9mVmVyc2lvbih2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXG5cdFx0XHRpZiAoYm9vbCAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobGlzdFtib29sXS52ZXJzaW9uID09PSBsaXN0W2luZGV4XS52ZXJzaW9uKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhsaXN0W2Jvb2xdLCBsaXN0W2luZGV4XSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBib29sICE9IG51bGw7XG5cdFx0fSkpXG5cdFx0LnNvcnQoKVxufVxuXG5mdW5jdGlvbiBpbmRleE9mVmVyc2lvbih2ZXJzaW9uOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGFycmF5OiBzdHJpbmdbXSlcbntcblx0bGV0IGkgPSBhcnJheS5pbmRleE9mKHZlcnNpb24pO1xuXG5cdGlmIChpICE9IC0xICYmIGkgIT0gaW5kZXgpXG5cdHtcblx0XHRyZXR1cm4gaVxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG4iXX0=