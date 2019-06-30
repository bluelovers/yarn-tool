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
function listToTypes(input, includeVersion) {
    return array_hyper_unique_1.array_unique_overwrite(input.reduce(function (a, b) {
        let m = parseArgvPkgName(b);
        if (m && !m.namespace && m.name) {
            if (includeVersion && m.version != null && m.version !== '') {
                a.push(`@types/${m.name}@${m.version}`);
            }
            else {
                a.push(`@types/${m.name}`);
            }
        }
        return a;
    }, []));
}
exports.listToTypes = listToTypes;
function existsDependencies(name, pkg) {
    return pkg.dependencies && pkg.dependencies[name]
        || pkg.devDependencies && pkg.devDependencies[name]
        || pkg.optionalDependencies && pkg.optionalDependencies[name];
}
exports.existsDependencies = existsDependencies;
exports.default = flagsYarnAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0dBRUc7QUFDSCxvQ0FBcUM7QUFFckMsMkRBQTBFO0FBRzFFLFNBQWdCLFlBQVksQ0FBQyxJQUU1QjtJQUVBLE9BQU8saUJBQVMsQ0FBQztRQUNoQixLQUFLO1FBQ0wsTUFBTTtRQUNOLFVBQVU7UUFDVixPQUFPO1FBQ1AsT0FBTztRQUNQLDZCQUE2QjtRQUM3QixPQUFPO0tBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNULENBQUM7QUFiRCxvQ0FhQztBQUVELFNBQWdCLG1CQUFtQixDQUFnQixLQUFjO0lBRWhFLE9BQU8sS0FBSztTQUNWLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDZCxLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxzQ0FBc0M7UUFDNUMsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLHVDQUF1QztRQUM3QyxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsVUFBVSxFQUFFO1FBQ25CLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLDJDQUEyQztRQUNqRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLElBQUksRUFBRSwrQ0FBK0M7UUFDckQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7S0FDbEIsQ0FBQztTQUNELE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDakIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ1osSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyw2QkFBNkIsRUFBRTtRQUN0QyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixJQUFJLEVBQUUsK0NBQStDO1FBQ3JELE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQS9DRCxrREErQ0M7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxLQUFhO0lBRTdDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUUzRCxJQUFJLENBQUMsRUFDTDtRQUNDLE9BQU87WUFDTixLQUFLO1lBQ0wsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNWLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2IsQ0FBQTtLQUNEO0FBQ0YsQ0FBQztBQWJELDRDQWFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEtBQWUsRUFBRSxjQUF3QjtJQUVwRSxPQUFPLDJDQUFzQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksRUFDL0I7WUFDQyxJQUFJLGNBQWMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFDM0Q7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7YUFDdkM7aUJBRUQ7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO2FBQzFCO1NBQ0Q7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsRUFBRSxFQUFjLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFwQkQsa0NBb0JDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWSxFQUM5QyxHQUF3SDtJQUd4SCxPQUFPLEdBQUcsQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7V0FDN0MsR0FBRyxDQUFDLGVBQWUsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztXQUNoRCxHQUFHLENBQUMsb0JBQW9CLElBQUksR0FBRyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUM3RDtBQUNGLENBQUM7QUFSRCxnREFRQztBQUVELGtCQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuaW1wb3J0IHsgbGF6eUZsYWdzIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgQXJndiwgT21pdCB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSwgYXJyYXlfdW5pcXVlX292ZXJ3cml0ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGFnc1lhcm5BZGQoYXJndjoge1xuXHRbazogc3RyaW5nXTogYm9vbGVhbixcbn0pOiBzdHJpbmdbXVxue1xuXHRyZXR1cm4gbGF6eUZsYWdzKFtcblx0XHQnZGV2Jyxcblx0XHQncGVlcicsXG5cdFx0J29wdGlvbmFsJyxcblx0XHQnZXhhY3QnLFxuXHRcdCd0aWxkZScsXG5cdFx0J2lnbm9yZS13b3Jrc3BhY2Utcm9vdC1jaGVjaycsXG5cdFx0J2F1ZGl0Jyxcblx0XSwgYXJndilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwWWFybkFkZFRvWWFyZ3M8VCBleHRlbmRzIGFueT4oeWFyZ3M6IEFyZ3Y8VD4pXG57XG5cdHJldHVybiB5YXJnc1xuXHRcdC5vcHRpb24oJ2RldicsIHtcblx0XHRcdGFsaWFzOiAnRCcsXG5cdFx0XHRkZXNjOiBgaW5zdGFsbCBwYWNrYWdlcyB0byBkZXZEZXBlbmRlbmNpZXMuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwZWVyJywge1xuXHRcdFx0YWxpYXM6ICdQJyxcblx0XHRcdGRlc2M6IGBpbnN0YWxsIHBhY2thZ2VzIHRvIHBlZXJEZXBlbmRlbmNpZXMuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdvcHRpb25hbCcsIHtcblx0XHRcdGFsaWFzOiAnTycsXG5cdFx0XHRkZXNjOiBgaW5zdGFsbCBwYWNrYWdlcyB0byBvcHRpb25hbERlcGVuZGVuY2llcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2V4YWN0Jywge1xuXHRcdFx0YWxpYXM6ICdFJyxcblx0XHRcdGRlc2M6IGBzZWUgaHR0cHM6Ly95YXJucGtnLmNvbS9sYW5nL2VuL2RvY3MvY2xpL2FkZC9gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3RpbGRlJywge1xuXHRcdFx0YWxpYXM6ICdUJyxcblx0XHRcdGRlc2M6IGBzZWUgaHR0cHM6Ly95YXJucGtnLmNvbS9sYW5nL2VuL2RvY3MvY2xpL2FkZC9gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ2F1ZGl0Jywge1xuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbihgbmFtZWAsIHtcblx0XHRcdHR5cGU6ICdzdHJpbmcnLFxuXHRcdFx0ZGVtYW5kT3B0aW9uOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZGVkdXBlJywge1xuXHRcdFx0YWxpYXM6IFsnZCddLFxuXHRcdFx0ZGVzYzogYERhdGEgZGVkdXBsaWNhdGlvbiBmb3IgeWFybi5sb2NrYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRkZWZhdWx0OiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignaWdub3JlLXdvcmtzcGFjZS1yb290LWNoZWNrJywge1xuXHRcdFx0YWxpYXM6IFsnVyddLFxuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFyZ3ZQa2dOYW1lKGlucHV0OiBzdHJpbmcpXG57XG5cdGxldCBtID0gaW5wdXQubWF0Y2goL14oPzooQFteXFwvXSspXFwvKT8oW15AXSspKD86QCguKykpPyQvKTtcblxuXHRpZiAobSlcblx0e1xuXHRcdHJldHVybiB7XG5cdFx0XHRpbnB1dCxcblx0XHRcdG5hbWVzcGFjZTogbVsxXSxcblx0XHRcdG5hbWU6IG1bMl0sXG5cdFx0XHR2ZXJzaW9uOiBtWzNdLFxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdFRvVHlwZXMoaW5wdXQ6IHN0cmluZ1tdLCBpbmNsdWRlVmVyc2lvbj86IGJvb2xlYW4pXG57XG5cdHJldHVybiBhcnJheV91bmlxdWVfb3ZlcndyaXRlKGlucHV0LnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdGxldCBtID0gcGFyc2VBcmd2UGtnTmFtZShiKTtcblxuXHRcdGlmIChtICYmICFtLm5hbWVzcGFjZSAmJiBtLm5hbWUpXG5cdFx0e1xuXHRcdFx0aWYgKGluY2x1ZGVWZXJzaW9uICYmIG0udmVyc2lvbiAhPSBudWxsICYmIG0udmVyc2lvbiAhPT0gJycpXG5cdFx0XHR7XG5cdFx0XHRcdGEucHVzaChgQHR5cGVzLyR7bS5uYW1lfUAke20udmVyc2lvbn1gKVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRhLnB1c2goYEB0eXBlcy8ke20ubmFtZX1gKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXHR9LCBbXSBhcyBzdHJpbmdbXSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWU6IHN0cmluZyxcblx0cGtnOiBJUGFja2FnZUpzb24gfCBQYXJ0aWFsPFJlY29yZDwnZGVwZW5kZW5jaWVzJyB8ICdkZXZEZXBlbmRlbmNpZXMnIHwgJ29wdGlvbmFsRGVwZW5kZW5jaWVzJywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4+LFxuKVxue1xuXHRyZXR1cm4gcGtnLmRlcGVuZGVuY2llcyAmJiBwa2cuZGVwZW5kZW5jaWVzW25hbWVdXG5cdFx0fHwgcGtnLmRldkRlcGVuZGVuY2llcyAmJiBwa2cuZGV2RGVwZW5kZW5jaWVzW25hbWVdXG5cdFx0fHwgcGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzICYmIHBrZy5vcHRpb25hbERlcGVuZGVuY2llc1tuYW1lXVxuXHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZsYWdzWWFybkFkZDtcbiJdfQ==