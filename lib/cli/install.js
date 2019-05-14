"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setupYarnInstallToYargs(yargs) {
    return yargs
        .option('check-files', {
        desc: `Verifies that already installed files in node_modules did not get removed.`,
        boolean: true,
    })
        .option('flat', {
        desc: `Install all the dependencies, but only allow one version for each package. On the first run this will prompt you to choose a single version for each package that is depended on at multiple version ranges. These will be added to your package.json under a resolutions field.`,
        boolean: true,
    })
        .option('force', {
        desc: `This refetches all packages, even ones that were previously installed.`,
        boolean: true,
    })
        .option('har', {
        desc: `Outputs an HTTP archive from all the network requests performed during the installation. HAR files are commonly used to investigate network performance, and can be analyzed with tools such as Google’s HAR Analyzer or HAR Viewer.`,
        boolean: true,
    })
        .option('ignore-scripts', {
        desc: `Do not execute any scripts defined in the project package.json and its dependencies.`,
        boolean: true,
    })
        .option('modules-folder', {
        desc: `Specifies an alternate location for the node_modules directory, instead of the default ./node_modules.`,
        normalize: true,
    })
        .option('no-lockfile', {
        desc: `Don’t read or generate a yarn.lock lockfile.`,
        boolean: true,
    })
        .option('production', {
        desc: `Yarn will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production. Use this flag to instruct Yarn to ignore NODE_ENV and take its production-or-not status from this flag instead.`,
        alias: ['prod'],
        boolean: true,
    })
        .option('pure-lockfile', {
        desc: `Don’t generate a yarn.lock lockfile.`,
        boolean: true,
    })
        .option('focus', {
        desc: `Shallowly installs a package’s sibling workspace dependencies underneath its node_modules folder. This allows you to run that workspace without building the other workspaces it depends on.`,
        boolean: true,
    })
        .option('frozen-lockfile', {
        desc: `Don’t generate a yarn.lock lockfile and fail if an update is needed.`,
        boolean: true,
    })
        .option('silent', {
        desc: `Run yarn install without printing installation log.`,
        boolean: true,
    })
        .option('ignore-engines', {
        desc: `Ignore engines check.`,
        boolean: true,
    })
        .option('ignore-optional', {
        desc: `Don’t install optional dependencies..`,
        boolean: true,
    })
        .option('offline', {
        desc: `Run yarn install in offline mode.`,
        boolean: true,
    })
        .option('non-interactive', {
        desc: `Disable interactive prompts, like when there’s an invalid version of a dependency.`,
        boolean: true,
    })
        .option('update-checksums', {
        desc: `Update checksums in the yarn.lock lockfile if there’s a mismatch between them and their package’s checksum.`,
        boolean: true,
    })
        .option('audit', {
        desc: `Checks for known security issues with the installed packages. A count of found issues will be added to the output. Use the yarn audit command for additional details. Unlike npm, which automatically runs an audit on every install, yarn will only do so when requested. (This may change in a later update as the feature is proven to be stable.)`,
        boolean: true,
    })
        .option('no-bin-links', {
        desc: `Prevent yarn from creating symlinks for any binaries the package might contain.`,
        boolean: true,
    })
        .option('link-duplicates', {
        desc: `Create hardlinks to the repeated modules in node_modules.`,
        boolean: true,
    });
}
exports.setupYarnInstallToYargs = setupYarnInstallToYargs;
exports.default = setupYarnInstallToYargs;
//# sourceMappingURL=install.js.map