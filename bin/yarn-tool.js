"use strict";
/**
 * Created by user on 2019/4/30.
 */
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
yargs
    .option('cwd', {
    desc: `current working directory or package directory`,
    normalize: true,
    default: process.cwd(),
})
    //.usage('$0 <dedupe> [cwd]')
    .command('dedupe [cwd]', `Data deduplication for yarn.lock`, dummy, (argv) => {
    let root = index_1.findRoot(argv);
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
        index_1.console.log(msg);
    }
    else {
        index_1.consoleDebug.warn(`yarn.lock no need data deduplication`);
    }
})
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
        .option('ignore-workspace-root-check', {
        alias: 'W',
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
    });
}, (argv) => {
    if (argv._[0] === 'add') {
        argv._ = argv._.slice(1);
    }
    if (argv.name) {
        argv._.unshift(argv.name);
    }
    //console.dir(argv);
    if (!argv._.length) {
        //			yargs.showHelp();
        index_1.consoleDebug.error(`Missing list of packages to add to your project.`);
        return process.exit(1);
    }
    const { cwd } = argv;
    let cmd_argv = [
        'add',
        ...argv._,
        ...add_1.flagsYarnAdd(argv),
    ].filter(v => v != null);
    index_1.consoleDebug.debug(cmd_argv);
    let { dedupe } = argv;
    const root = index_1.findRoot(argv).root;
    let yarnlock_cache = dedupe && index_1.fsYarnLock(root);
    if (!yarnlock_cache || !yarnlock_cache.yarnlock_exists) {
        dedupe = false;
    }
    else {
        let ret = dedupe_1.Dedupe(yarnlock_cache.yarnlock_old);
        if (ret.yarnlock_changed) {
            yarnlock_cache.yarnlock_old = ret.yarnlock_new;
            fs.writeFileSync(yarnlock_cache.yarnlock_file, yarnlock_cache.yarnlock_old);
            index_1.consoleDebug.info(`Deduplication yarn.lock`);
            index_1.consoleDebug.gray.info(`${yarnlock_cache.yarnlock_file}`);
        }
    }
    let cp = crossSpawn.sync('yarn', cmd_argv, {
        cwd,
        stdio: 'inherit',
    });
    if (cp.error) {
        throw cp.error;
    }
    if (dedupe) {
        let yarnlock_cache2 = index_1.fsYarnLock(root);
        if (yarnlock_cache2 && yarnlock_cache2.yarnlock_exists) {
            let msg = index_1.yarnLockDiff(yarnlock_cache.yarnlock_old, yarnlock_cache2.yarnlock_old);
            if (msg) {
                index_1.console.log(msg);
            }
        }
    }
})
    .demandCommand()
    .help(true)
    .showHelpOnFail(true)
    .argv;
function dummy(yarg) {
    return yarg;
}
//# sourceMappingURL=yarn-tool.js.map