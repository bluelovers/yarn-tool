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
//# sourceMappingURL=list.js.map