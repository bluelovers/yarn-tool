"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by user on 2019/4/30.
 */
const index_1 = require("../index");
const array_hyper_unique_1 = require("array-hyper-unique");
function flagsYarnAdd(argv) {
    return index_1.lazyFlags([
        'dev',
        'peer',
        'optional',
        'exact',
        'tilde',
        'ignore-workspace-root-check',
        'audit',
    ], argv);
}
exports.flagsYarnAdd = flagsYarnAdd;
function setupYarnAddToYargs(yargs) {
    return yargs
        .option('dev', {
        alias: 'D',
        desc: `install packages to devDependencies.`,
        boolean: true,
    })
        .option('peer', {
        alias: 'P',
        desc: `install packages to peerDependencies.`,
        boolean: true,
    })
        .option('optional', {
        alias: 'O',
        desc: `install packages to optionalDependencies.`,
        boolean: true,
    })
        .option('exact', {
        alias: 'E',
        desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
        boolean: true,
    })
        .option('tilde', {
        alias: 'T',
        desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
        boolean: true,
    })
        .option('audit', {
        desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
        boolean: true,
    })
        .option(`name`, {
        type: 'string',
        demandOption: true,
    })
        .option('dedupe', {
        alias: ['d'],
        desc: `Data deduplication for yarn.lock`,
        boolean: true,
        default: true,
    })
        .option('ignore-workspace-root-check', {
        alias: ['W'],
        desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
        boolean: true,
    });
}
exports.setupYarnAddToYargs = setupYarnAddToYargs;
function parseArgvPkgName(input) {
    let m = input.match(/^(?:(@[^\/]+)\/)?([^@]+)(?:@(.+))?$/);
    if (m) {
        return {
            input,
            namespace: m[1],
            name: m[2],
            version: m[3],
        };
    }
}
exports.parseArgvPkgName = parseArgvPkgName;
function listToTypes(input) {
    return array_hyper_unique_1.array_unique_overwrite(input.reduce(function (a, b) {
        let m = parseArgvPkgName(b);
        if (m && !m.namespace && m.name) {
            a.push(`@types/${m.name}`);
        }
        return a;
    }, []));
}
exports.listToTypes = listToTypes;
function existsDependencies(name, pkg) {
    return pkg.dependencies[name]
        || pkg.devDependencies[name]
        || pkg.optionalDependencies[name];
}
exports.existsDependencies = existsDependencies;
exports.default = flagsYarnAdd;
//# sourceMappingURL=add.js.map