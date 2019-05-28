"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxTQUFnQix1QkFBdUIsQ0FBZ0IsS0FBYztJQUVwRSxPQUFPLEtBQUs7U0FDVixNQUFNLENBQUMsYUFBYSxFQUFFO1FBQ3RCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUNaLElBQUksRUFBRSw0RUFBNEU7UUFDbEYsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLElBQUksRUFBRSxrUkFBa1I7UUFDeFIsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNoQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixJQUFJLEVBQUUsd0VBQXdFO1FBQzlFLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDZCxJQUFJLEVBQUUsc09BQXNPO1FBQzVPLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN6QixJQUFJLEVBQUUsc0ZBQXNGO1FBQzVGLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN6QixJQUFJLEVBQUUsd0dBQXdHO1FBQzlHLFNBQVMsRUFBRSxJQUFJO0tBQ2YsQ0FBQztTQUNELE1BQU0sQ0FBQyxhQUFhLEVBQUU7UUFDdEIsSUFBSSxFQUFFLDhDQUE4QztRQUNwRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3JCLElBQUksRUFBRSx3T0FBd087UUFDOU8sS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ2YsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLGVBQWUsRUFBRTtRQUN4QixJQUFJLEVBQUUsc0NBQXNDO1FBQzVDLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDaEIsSUFBSSxFQUFFLDhMQUE4TDtRQUNwTSxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsaUJBQWlCLEVBQUU7UUFDMUIsSUFBSSxFQUFFLHNFQUFzRTtRQUM1RSxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ2pCLElBQUksRUFBRSxxREFBcUQ7UUFDM0QsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFO1FBQ3pCLElBQUksRUFBRSx1QkFBdUI7UUFDN0IsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLGlCQUFpQixFQUFFO1FBQzFCLElBQUksRUFBRSx1Q0FBdUM7UUFDN0MsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtRQUNsQixJQUFJLEVBQUUsbUNBQW1DO1FBQ3pDLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtRQUMxQixJQUFJLEVBQUUsb0ZBQW9GO1FBQzFGLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxrQkFBa0IsRUFBRTtRQUMzQixJQUFJLEVBQUUsNkdBQTZHO1FBQ25ILE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDaEIsSUFBSSxFQUFFLHVWQUF1VjtRQUM3VixPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsY0FBYyxFQUFFO1FBQ3ZCLElBQUksRUFBRSxpRkFBaUY7UUFDdkYsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLGlCQUFpQixFQUFFO1FBQzFCLElBQUksRUFBRSwyREFBMkQ7UUFDakUsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDLENBQUE7QUFDSixDQUFDO0FBdEZELDBEQXNGQztBQUVELGtCQUFlLHVCQUF1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXJndiwgT21pdCB9IGZyb20gJ3lhcmdzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwWWFybkluc3RhbGxUb1lhcmdzPFQgZXh0ZW5kcyBhbnk+KHlhcmdzOiBBcmd2PFQ+KVxue1xuXHRyZXR1cm4geWFyZ3Ncblx0XHQub3B0aW9uKCdjaGVjay1maWxlcycsIHtcblx0XHRcdGFsaWFzOiBbJ0MnXSxcblx0XHRcdGRlc2M6IGBWZXJpZmllcyB0aGF0IGFscmVhZHkgaW5zdGFsbGVkIGZpbGVzIGluIG5vZGVfbW9kdWxlcyBkaWQgbm90IGdldCByZW1vdmVkLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZmxhdCcsIHtcblx0XHRcdGRlc2M6IGBJbnN0YWxsIGFsbCB0aGUgZGVwZW5kZW5jaWVzLCBidXQgb25seSBhbGxvdyBvbmUgdmVyc2lvbiBmb3IgZWFjaCBwYWNrYWdlLiBPbiB0aGUgZmlyc3QgcnVuIHRoaXMgd2lsbCBwcm9tcHQgeW91IHRvIGNob29zZSBhIHNpbmdsZSB2ZXJzaW9uIGZvciBlYWNoIHBhY2thZ2UgdGhhdCBpcyBkZXBlbmRlZCBvbiBhdCBtdWx0aXBsZSB2ZXJzaW9uIHJhbmdlcy4gVGhlc2Ugd2lsbCBiZSBhZGRlZCB0byB5b3VyIHBhY2thZ2UuanNvbiB1bmRlciBhIHJlc29sdXRpb25zIGZpZWxkLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZm9yY2UnLCB7XG5cdFx0XHRhbGlhczogWydGJ10sXG5cdFx0XHRkZXNjOiBgVGhpcyByZWZldGNoZXMgYWxsIHBhY2thZ2VzLCBldmVuIG9uZXMgdGhhdCB3ZXJlIHByZXZpb3VzbHkgaW5zdGFsbGVkLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignaGFyJywge1xuXHRcdFx0ZGVzYzogYE91dHB1dHMgYW4gSFRUUCBhcmNoaXZlIGZyb20gYWxsIHRoZSBuZXR3b3JrIHJlcXVlc3RzIHBlcmZvcm1lZCBkdXJpbmcgdGhlIGluc3RhbGxhdGlvbi4gSEFSIGZpbGVzIGFyZSBjb21tb25seSB1c2VkIHRvIGludmVzdGlnYXRlIG5ldHdvcmsgcGVyZm9ybWFuY2UsIGFuZCBjYW4gYmUgYW5hbHl6ZWQgd2l0aCB0b29scyBzdWNoIGFzIEdvb2dsZeKAmXMgSEFSIEFuYWx5emVyIG9yIEhBUiBWaWV3ZXIuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdpZ25vcmUtc2NyaXB0cycsIHtcblx0XHRcdGRlc2M6IGBEbyBub3QgZXhlY3V0ZSBhbnkgc2NyaXB0cyBkZWZpbmVkIGluIHRoZSBwcm9qZWN0IHBhY2thZ2UuanNvbiBhbmQgaXRzIGRlcGVuZGVuY2llcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ21vZHVsZXMtZm9sZGVyJywge1xuXHRcdFx0ZGVzYzogYFNwZWNpZmllcyBhbiBhbHRlcm5hdGUgbG9jYXRpb24gZm9yIHRoZSBub2RlX21vZHVsZXMgZGlyZWN0b3J5LCBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IC4vbm9kZV9tb2R1bGVzLmAsXG5cdFx0XHRub3JtYWxpemU6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCduby1sb2NrZmlsZScsIHtcblx0XHRcdGRlc2M6IGBEb27igJl0IHJlYWQgb3IgZ2VuZXJhdGUgYSB5YXJuLmxvY2sgbG9ja2ZpbGUuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwcm9kdWN0aW9uJywge1xuXHRcdFx0ZGVzYzogYFlhcm4gd2lsbCBub3QgaW5zdGFsbCBhbnkgcGFja2FnZSBsaXN0ZWQgaW4gZGV2RGVwZW5kZW5jaWVzIGlmIHRoZSBOT0RFX0VOViBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBzZXQgdG8gcHJvZHVjdGlvbi4gVXNlIHRoaXMgZmxhZyB0byBpbnN0cnVjdCBZYXJuIHRvIGlnbm9yZSBOT0RFX0VOViBhbmQgdGFrZSBpdHMgcHJvZHVjdGlvbi1vci1ub3Qgc3RhdHVzIGZyb20gdGhpcyBmbGFnIGluc3RlYWQuYCxcblx0XHRcdGFsaWFzOiBbJ3Byb2QnXSxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwdXJlLWxvY2tmaWxlJywge1xuXHRcdFx0ZGVzYzogYERvbuKAmXQgZ2VuZXJhdGUgYSB5YXJuLmxvY2sgbG9ja2ZpbGUuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdmb2N1cycsIHtcblx0XHRcdGRlc2M6IGBTaGFsbG93bHkgaW5zdGFsbHMgYSBwYWNrYWdl4oCZcyBzaWJsaW5nIHdvcmtzcGFjZSBkZXBlbmRlbmNpZXMgdW5kZXJuZWF0aCBpdHMgbm9kZV9tb2R1bGVzIGZvbGRlci4gVGhpcyBhbGxvd3MgeW91IHRvIHJ1biB0aGF0IHdvcmtzcGFjZSB3aXRob3V0IGJ1aWxkaW5nIHRoZSBvdGhlciB3b3Jrc3BhY2VzIGl0IGRlcGVuZHMgb24uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdmcm96ZW4tbG9ja2ZpbGUnLCB7XG5cdFx0XHRkZXNjOiBgRG9u4oCZdCBnZW5lcmF0ZSBhIHlhcm4ubG9jayBsb2NrZmlsZSBhbmQgZmFpbCBpZiBhbiB1cGRhdGUgaXMgbmVlZGVkLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignc2lsZW50Jywge1xuXHRcdFx0ZGVzYzogYFJ1biB5YXJuIGluc3RhbGwgd2l0aG91dCBwcmludGluZyBpbnN0YWxsYXRpb24gbG9nLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignaWdub3JlLWVuZ2luZXMnLCB7XG5cdFx0XHRkZXNjOiBgSWdub3JlIGVuZ2luZXMgY2hlY2suYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdpZ25vcmUtb3B0aW9uYWwnLCB7XG5cdFx0XHRkZXNjOiBgRG9u4oCZdCBpbnN0YWxsIG9wdGlvbmFsIGRlcGVuZGVuY2llcy4uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdvZmZsaW5lJywge1xuXHRcdFx0ZGVzYzogYFJ1biB5YXJuIGluc3RhbGwgaW4gb2ZmbGluZSBtb2RlLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbm9uLWludGVyYWN0aXZlJywge1xuXHRcdFx0ZGVzYzogYERpc2FibGUgaW50ZXJhY3RpdmUgcHJvbXB0cywgbGlrZSB3aGVuIHRoZXJl4oCZcyBhbiBpbnZhbGlkIHZlcnNpb24gb2YgYSBkZXBlbmRlbmN5LmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigndXBkYXRlLWNoZWNrc3VtcycsIHtcblx0XHRcdGRlc2M6IGBVcGRhdGUgY2hlY2tzdW1zIGluIHRoZSB5YXJuLmxvY2sgbG9ja2ZpbGUgaWYgdGhlcmXigJlzIGEgbWlzbWF0Y2ggYmV0d2VlbiB0aGVtIGFuZCB0aGVpciBwYWNrYWdl4oCZcyBjaGVja3N1bS5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2F1ZGl0Jywge1xuXHRcdFx0ZGVzYzogYENoZWNrcyBmb3Iga25vd24gc2VjdXJpdHkgaXNzdWVzIHdpdGggdGhlIGluc3RhbGxlZCBwYWNrYWdlcy4gQSBjb3VudCBvZiBmb3VuZCBpc3N1ZXMgd2lsbCBiZSBhZGRlZCB0byB0aGUgb3V0cHV0LiBVc2UgdGhlIHlhcm4gYXVkaXQgY29tbWFuZCBmb3IgYWRkaXRpb25hbCBkZXRhaWxzLiBVbmxpa2UgbnBtLCB3aGljaCBhdXRvbWF0aWNhbGx5IHJ1bnMgYW4gYXVkaXQgb24gZXZlcnkgaW5zdGFsbCwgeWFybiB3aWxsIG9ubHkgZG8gc28gd2hlbiByZXF1ZXN0ZWQuIChUaGlzIG1heSBjaGFuZ2UgaW4gYSBsYXRlciB1cGRhdGUgYXMgdGhlIGZlYXR1cmUgaXMgcHJvdmVuIHRvIGJlIHN0YWJsZS4pYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCduby1iaW4tbGlua3MnLCB7XG5cdFx0XHRkZXNjOiBgUHJldmVudCB5YXJuIGZyb20gY3JlYXRpbmcgc3ltbGlua3MgZm9yIGFueSBiaW5hcmllcyB0aGUgcGFja2FnZSBtaWdodCBjb250YWluLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbGluay1kdXBsaWNhdGVzJywge1xuXHRcdFx0ZGVzYzogYENyZWF0ZSBoYXJkbGlua3MgdG8gdGhlIHJlcGVhdGVkIG1vZHVsZXMgaW4gbm9kZV9tb2R1bGVzLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHNldHVwWWFybkluc3RhbGxUb1lhcmdzXG4iXX0=