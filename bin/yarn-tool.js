#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const updateNotifier = require("update-notifier");
const pkg = require("../package.json");
const index_1 = require("../lib/index");
const fs = require("fs-extra");
const crossSpawn = require("cross-spawn-extra");
const dedupe_1 = require("../lib/cli/dedupe");
const add_1 = require("../lib/cli/add");
updateNotifier({ pkg }).notify();
let cli = yargs
    .option('cwd', {
    desc: `current working directory or package directory`,
    normalize: true,
    default: process.cwd(),
})
    .option('skipCheckWorkspace', {
    desc: `this options is for search yarn.lock, pkg root, workspace root, not same as --ignore-workspace-root-check`,
    boolean: true,
})
    .help(true)
    .showHelpOnFail(true)
    .strict();
const cached_commond = {};
cli = cli
    //.usage('$0 <dedupe> [cwd]')
    .command('dedupe [cwd]', `Data deduplication for yarn.lock`, ...create_commond(cli, 'dedupe', (argv) => {
    let root = index_1.findRoot(argv, true);
    let hasWorkspace = root.ws != null;
    let yarnlock_cache = index_1.fsYarnLock(root.root);
    let { yarnlock_file, yarnlock_exists, yarnlock_old } = yarnlock_cache;
    index_1.consoleDebug.info(`Deduplication yarn.lock`);
    index_1.consoleDebug.gray.info(`${yarnlock_file}`);
    if (!yarnlock_exists) {
        index_1.consoleDebug.error(`yarn.lock not exists`);
        return;
    }
    let ret = dedupe_1.Dedupe(yarnlock_old);
    let msg = index_1.yarnLockDiff(ret.yarnlock_old, ret.yarnlock_new);
    if (msg) {
        fs.writeFileSync(yarnlock_file, ret.yarnlock_new);
        index_1.console.log(msg);
    }
    else {
        index_1.consoleDebug.warn(`yarn.lock no need data deduplication`);
    }
}))
    .command('add [name]', ``, (yargs) => {
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
}, (argv) => {
    let args = argv._.slice();
    if (args[0] === 'add') {
        args.shift();
    }
    if (argv.name) {
        args.unshift(argv.name);
    }
    //console.dir(argv);
    if (!args.length) {
        //			yargs.showHelp();
        index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
        return process.exit(1);
    }
    dedupe_1.wrapDedupe(yargs, argv, {
        main(yarg, argv, cache) {
            let cmd_argv = [
                'add',
                ...args,
                ...add_1.flagsYarnAdd(argv),
            ].filter(v => v != null);
            index_1.consoleDebug.debug(cmd_argv);
            let cp = crossSpawn.sync('yarn', cmd_argv, {
                cwd: argv.cwd,
                stdio: 'inherit',
            });
            if (cp.error) {
                throw cp.error;
            }
        },
        end(yarg, argv, cache) {
            if (cache.yarnlock_msg) {
                index_1.console.log(cache.yarnlock_msg);
            }
        }
    });
})
    .command('install [cwd]', `this will do [dedupe , install , dedupe , install]`, dummy, function (argv) {
    const { cwd } = argv;
    const root = index_1.findRoot(argv, true).root;
    let yarnlock_cache = index_1.fsYarnLock(root);
    if (yarnlock_cache.yarnlock_exists) {
        let ret1 = dedupe_1.Dedupe(yarnlock_cache.yarnlock_old);
        if (ret1.yarnlock_changed) {
            fs.writeFileSync(yarnlock_cache.yarnlock_file, ret1.yarnlock_new);
        }
        let cp = crossSpawn.sync('yarn', [], {
            cwd,
            stdio: 'inherit',
        });
        let ret2 = dedupe_1.Dedupe(fs.readFileSync(yarnlock_cache.yarnlock_file, 'utf8'));
        if (ret2.yarnlock_changed) {
            fs.writeFileSync(yarnlock_cache.yarnlock_file, ret2.yarnlock_new);
            index_1.consoleDebug.debug(`yarn.lock changed, do install again`);
            let cp = crossSpawn.sync('yarn', [], {
                cwd,
                stdio: 'inherit',
            });
        }
        let msg = index_1.yarnLockDiff(yarnlock_cache.yarnlock_old, fs.readFileSync(yarnlock_cache.yarnlock_file, 'utf8'));
        if (msg) {
            index_1.console.log(msg);
        }
    }
    else {
        index_1.consoleDebug.error(`yarn.lock not exists`);
        let cp = crossSpawn.sync('yarn', [], {
            cwd,
            stdio: 'inherit',
        });
    }
})
    .command('help', 'Show help', (yarg) => {
    yargs.showHelp('log');
    return yargs;
})
    .demandCommand();
cli.argv;
function dummy(yarg) {
    return yarg;
}
function create_commond(yarg, commond, handler, builder) {
    // @ts-ignore
    builder = builder || dummy;
    cached_commond[commond] = {
        // @ts-ignore
        builder,
        // @ts-ignore
        handler,
    };
    return [builder, handler];
}
function call_commond(yarg, commond, argv) {
    return cached_commond[commond].handler(argv == null ? yarg.argv : argv);
}
//# sourceMappingURL=yarn-tool.js.map