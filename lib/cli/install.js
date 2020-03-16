"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupYarnInstallToYargs = void 0;
function setupYarnInstallToYargs(yargs) {
    return yargs
        .option('check-files', {
        alias: ['C'],
        desc: `Verifies that already installed files in node_modules did not get removed.`,
        boolean: true,
    })
        .option('flat', {
        desc: `Install all the dependencies, but only allow one version for each package. On the first run this will prompt you to choose a single version for each package that is depended on at multiple version ranges. These will be added to your package.json under a resolutions field.`,
        boolean: true,
    })
        .option('force', {
        alias: ['F'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsU0FBZ0IsdUJBQXVCLENBQWdCLEtBQWM7SUFFcEUsT0FBTyxLQUFLO1NBQ1YsTUFBTSxDQUFDLGFBQWEsRUFBRTtRQUN0QixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixJQUFJLEVBQUUsNEVBQTRFO1FBQ2xGLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZixJQUFJLEVBQUUsa1JBQWtSO1FBQ3hSLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDaEIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ1osSUFBSSxFQUFFLHdFQUF3RTtRQUM5RSxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsS0FBSyxFQUFFO1FBQ2QsSUFBSSxFQUFFLHNPQUFzTztRQUM1TyxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7UUFDekIsSUFBSSxFQUFFLHNGQUFzRjtRQUM1RixPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7UUFDekIsSUFBSSxFQUFFLHdHQUF3RztRQUM5RyxTQUFTLEVBQUUsSUFBSTtLQUNmLENBQUM7U0FDRCxNQUFNLENBQUMsYUFBYSxFQUFFO1FBQ3RCLElBQUksRUFBRSw4Q0FBOEM7UUFDcEQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLFlBQVksRUFBRTtRQUNyQixJQUFJLEVBQUUsd09BQXdPO1FBQzlPLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNmLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxlQUFlLEVBQUU7UUFDeEIsSUFBSSxFQUFFLHNDQUFzQztRQUM1QyxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLElBQUksRUFBRSw4TEFBOEw7UUFDcE0sT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLGlCQUFpQixFQUFFO1FBQzFCLElBQUksRUFBRSxzRUFBc0U7UUFDNUUsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNqQixJQUFJLEVBQUUscURBQXFEO1FBQzNELE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN6QixJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtRQUMxQixJQUFJLEVBQUUsdUNBQXVDO1FBQzdDLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDbEIsSUFBSSxFQUFFLG1DQUFtQztRQUN6QyxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsaUJBQWlCLEVBQUU7UUFDMUIsSUFBSSxFQUFFLG9GQUFvRjtRQUMxRixPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsa0JBQWtCLEVBQUU7UUFDM0IsSUFBSSxFQUFFLDZHQUE2RztRQUNuSCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLElBQUksRUFBRSx1VkFBdVY7UUFDN1YsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLGNBQWMsRUFBRTtRQUN2QixJQUFJLEVBQUUsaUZBQWlGO1FBQ3ZGLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtRQUMxQixJQUFJLEVBQUUsMkRBQTJEO1FBQ2pFLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQXRGRCwwREFzRkM7QUFFRCxrQkFBZSx1QkFBdUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFyZ3YsIE9taXQgfSBmcm9tICd5YXJncyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJnczxUIGV4dGVuZHMgYW55Pih5YXJnczogQXJndjxUPilcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignY2hlY2stZmlsZXMnLCB7XG5cdFx0XHRhbGlhczogWydDJ10sXG5cdFx0XHRkZXNjOiBgVmVyaWZpZXMgdGhhdCBhbHJlYWR5IGluc3RhbGxlZCBmaWxlcyBpbiBub2RlX21vZHVsZXMgZGlkIG5vdCBnZXQgcmVtb3ZlZC5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2ZsYXQnLCB7XG5cdFx0XHRkZXNjOiBgSW5zdGFsbCBhbGwgdGhlIGRlcGVuZGVuY2llcywgYnV0IG9ubHkgYWxsb3cgb25lIHZlcnNpb24gZm9yIGVhY2ggcGFja2FnZS4gT24gdGhlIGZpcnN0IHJ1biB0aGlzIHdpbGwgcHJvbXB0IHlvdSB0byBjaG9vc2UgYSBzaW5nbGUgdmVyc2lvbiBmb3IgZWFjaCBwYWNrYWdlIHRoYXQgaXMgZGVwZW5kZWQgb24gYXQgbXVsdGlwbGUgdmVyc2lvbiByYW5nZXMuIFRoZXNlIHdpbGwgYmUgYWRkZWQgdG8geW91ciBwYWNrYWdlLmpzb24gdW5kZXIgYSByZXNvbHV0aW9ucyBmaWVsZC5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2ZvcmNlJywge1xuXHRcdFx0YWxpYXM6IFsnRiddLFxuXHRcdFx0ZGVzYzogYFRoaXMgcmVmZXRjaGVzIGFsbCBwYWNrYWdlcywgZXZlbiBvbmVzIHRoYXQgd2VyZSBwcmV2aW91c2x5IGluc3RhbGxlZC5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2hhcicsIHtcblx0XHRcdGRlc2M6IGBPdXRwdXRzIGFuIEhUVFAgYXJjaGl2ZSBmcm9tIGFsbCB0aGUgbmV0d29yayByZXF1ZXN0cyBwZXJmb3JtZWQgZHVyaW5nIHRoZSBpbnN0YWxsYXRpb24uIEhBUiBmaWxlcyBhcmUgY29tbW9ubHkgdXNlZCB0byBpbnZlc3RpZ2F0ZSBuZXR3b3JrIHBlcmZvcm1hbmNlLCBhbmQgY2FuIGJlIGFuYWx5emVkIHdpdGggdG9vbHMgc3VjaCBhcyBHb29nbGXigJlzIEhBUiBBbmFseXplciBvciBIQVIgVmlld2VyLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignaWdub3JlLXNjcmlwdHMnLCB7XG5cdFx0XHRkZXNjOiBgRG8gbm90IGV4ZWN1dGUgYW55IHNjcmlwdHMgZGVmaW5lZCBpbiB0aGUgcHJvamVjdCBwYWNrYWdlLmpzb24gYW5kIGl0cyBkZXBlbmRlbmNpZXMuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdtb2R1bGVzLWZvbGRlcicsIHtcblx0XHRcdGRlc2M6IGBTcGVjaWZpZXMgYW4gYWx0ZXJuYXRlIGxvY2F0aW9uIGZvciB0aGUgbm9kZV9tb2R1bGVzIGRpcmVjdG9yeSwgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCAuL25vZGVfbW9kdWxlcy5gLFxuXHRcdFx0bm9ybWFsaXplOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbm8tbG9ja2ZpbGUnLCB7XG5cdFx0XHRkZXNjOiBgRG9u4oCZdCByZWFkIG9yIGdlbmVyYXRlIGEgeWFybi5sb2NrIGxvY2tmaWxlLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncHJvZHVjdGlvbicsIHtcblx0XHRcdGRlc2M6IGBZYXJuIHdpbGwgbm90IGluc3RhbGwgYW55IHBhY2thZ2UgbGlzdGVkIGluIGRldkRlcGVuZGVuY2llcyBpZiB0aGUgTk9ERV9FTlYgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgc2V0IHRvIHByb2R1Y3Rpb24uIFVzZSB0aGlzIGZsYWcgdG8gaW5zdHJ1Y3QgWWFybiB0byBpZ25vcmUgTk9ERV9FTlYgYW5kIHRha2UgaXRzIHByb2R1Y3Rpb24tb3Itbm90IHN0YXR1cyBmcm9tIHRoaXMgZmxhZyBpbnN0ZWFkLmAsXG5cdFx0XHRhbGlhczogWydwcm9kJ10sXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncHVyZS1sb2NrZmlsZScsIHtcblx0XHRcdGRlc2M6IGBEb27igJl0IGdlbmVyYXRlIGEgeWFybi5sb2NrIGxvY2tmaWxlLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZm9jdXMnLCB7XG5cdFx0XHRkZXNjOiBgU2hhbGxvd2x5IGluc3RhbGxzIGEgcGFja2FnZeKAmXMgc2libGluZyB3b3Jrc3BhY2UgZGVwZW5kZW5jaWVzIHVuZGVybmVhdGggaXRzIG5vZGVfbW9kdWxlcyBmb2xkZXIuIFRoaXMgYWxsb3dzIHlvdSB0byBydW4gdGhhdCB3b3Jrc3BhY2Ugd2l0aG91dCBidWlsZGluZyB0aGUgb3RoZXIgd29ya3NwYWNlcyBpdCBkZXBlbmRzIG9uLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZnJvemVuLWxvY2tmaWxlJywge1xuXHRcdFx0ZGVzYzogYERvbuKAmXQgZ2VuZXJhdGUgYSB5YXJuLmxvY2sgbG9ja2ZpbGUgYW5kIGZhaWwgaWYgYW4gdXBkYXRlIGlzIG5lZWRlZC5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NpbGVudCcsIHtcblx0XHRcdGRlc2M6IGBSdW4geWFybiBpbnN0YWxsIHdpdGhvdXQgcHJpbnRpbmcgaW5zdGFsbGF0aW9uIGxvZy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2lnbm9yZS1lbmdpbmVzJywge1xuXHRcdFx0ZGVzYzogYElnbm9yZSBlbmdpbmVzIGNoZWNrLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignaWdub3JlLW9wdGlvbmFsJywge1xuXHRcdFx0ZGVzYzogYERvbuKAmXQgaW5zdGFsbCBvcHRpb25hbCBkZXBlbmRlbmNpZXMuLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignb2ZmbGluZScsIHtcblx0XHRcdGRlc2M6IGBSdW4geWFybiBpbnN0YWxsIGluIG9mZmxpbmUgbW9kZS5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ25vbi1pbnRlcmFjdGl2ZScsIHtcblx0XHRcdGRlc2M6IGBEaXNhYmxlIGludGVyYWN0aXZlIHByb21wdHMsIGxpa2Ugd2hlbiB0aGVyZeKAmXMgYW4gaW52YWxpZCB2ZXJzaW9uIG9mIGEgZGVwZW5kZW5jeS5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3VwZGF0ZS1jaGVja3N1bXMnLCB7XG5cdFx0XHRkZXNjOiBgVXBkYXRlIGNoZWNrc3VtcyBpbiB0aGUgeWFybi5sb2NrIGxvY2tmaWxlIGlmIHRoZXJl4oCZcyBhIG1pc21hdGNoIGJldHdlZW4gdGhlbSBhbmQgdGhlaXIgcGFja2FnZeKAmXMgY2hlY2tzdW0uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdhdWRpdCcsIHtcblx0XHRcdGRlc2M6IGBDaGVja3MgZm9yIGtub3duIHNlY3VyaXR5IGlzc3VlcyB3aXRoIHRoZSBpbnN0YWxsZWQgcGFja2FnZXMuIEEgY291bnQgb2YgZm91bmQgaXNzdWVzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIG91dHB1dC4gVXNlIHRoZSB5YXJuIGF1ZGl0IGNvbW1hbmQgZm9yIGFkZGl0aW9uYWwgZGV0YWlscy4gVW5saWtlIG5wbSwgd2hpY2ggYXV0b21hdGljYWxseSBydW5zIGFuIGF1ZGl0IG9uIGV2ZXJ5IGluc3RhbGwsIHlhcm4gd2lsbCBvbmx5IGRvIHNvIHdoZW4gcmVxdWVzdGVkLiAoVGhpcyBtYXkgY2hhbmdlIGluIGEgbGF0ZXIgdXBkYXRlIGFzIHRoZSBmZWF0dXJlIGlzIHByb3ZlbiB0byBiZSBzdGFibGUuKWAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbm8tYmluLWxpbmtzJywge1xuXHRcdFx0ZGVzYzogYFByZXZlbnQgeWFybiBmcm9tIGNyZWF0aW5nIHN5bWxpbmtzIGZvciBhbnkgYmluYXJpZXMgdGhlIHBhY2thZ2UgbWlnaHQgY29udGFpbi5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2xpbmstZHVwbGljYXRlcycsIHtcblx0XHRcdGRlc2M6IGBDcmVhdGUgaGFyZGxpbmtzIHRvIHRoZSByZXBlYXRlZCBtb2R1bGVzIGluIG5vZGVfbW9kdWxlcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBzZXR1cFlhcm5JbnN0YWxsVG9ZYXJnc1xuIl19