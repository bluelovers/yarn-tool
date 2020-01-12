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
function setupYarnAddToYargs(yargs, opts = {}) {
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
        demandOption: !opts.allowEmptyName,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0dBRUc7QUFDSCxvQ0FBcUM7QUFFckMsMkRBQTBFO0FBRzFFLFNBQWdCLFlBQVksQ0FBQyxJQUU1QjtJQUVBLE9BQU8saUJBQVMsQ0FBQztRQUNoQixLQUFLO1FBQ0wsTUFBTTtRQUNOLFVBQVU7UUFDVixPQUFPO1FBQ1AsT0FBTztRQUNQLDZCQUE2QjtRQUM3QixPQUFPO0tBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNULENBQUM7QUFiRCxvQ0FhQztBQUVELFNBQWdCLG1CQUFtQixDQUFnQixLQUFjLEVBQUUsT0FFL0QsRUFBRTtJQUVMLE9BQU8sS0FBSztTQUNWLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDZCxLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxzQ0FBc0M7UUFDNUMsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLHVDQUF1QztRQUM3QyxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsVUFBVSxFQUFFO1FBQ25CLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLDJDQUEyQztRQUNqRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLElBQUksRUFBRSwrQ0FBK0M7UUFDckQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWM7S0FDbEMsQ0FBQztTQUNELE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDakIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ1osSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyw2QkFBNkIsRUFBRTtRQUN0QyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixJQUFJLEVBQUUsK0NBQStDO1FBQ3JELE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQWpERCxrREFpREM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxLQUFhO0lBRTdDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUUzRCxJQUFJLENBQUMsRUFDTDtRQUNDLE9BQU87WUFDTixLQUFLO1lBQ0wsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNWLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2IsQ0FBQTtLQUNEO0FBQ0YsQ0FBQztBQWJELDRDQWFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEtBQWUsRUFBRSxjQUF3QjtJQUVwRSxPQUFPLDJDQUFzQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUV4RCxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksRUFDL0I7WUFDQyxJQUFJLGNBQWMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFDM0Q7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7YUFDdkM7aUJBRUQ7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO2FBQzFCO1NBQ0Q7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsRUFBRSxFQUFjLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFwQkQsa0NBb0JDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWSxFQUM5QyxHQUF3SDtJQUd4SCxPQUFPLEdBQUcsQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7V0FDN0MsR0FBRyxDQUFDLGVBQWUsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztXQUNoRCxHQUFHLENBQUMsb0JBQW9CLElBQUksR0FBRyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUM3RDtBQUNGLENBQUM7QUFSRCxnREFRQztBQUVELGtCQUFlLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuaW1wb3J0IHsgbGF6eUZsYWdzIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgQXJndiwgT21pdCB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSwgYXJyYXlfdW5pcXVlX292ZXJ3cml0ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGFnc1lhcm5BZGQoYXJndjoge1xuXHRbazogc3RyaW5nXTogYm9vbGVhbixcbn0pOiBzdHJpbmdbXVxue1xuXHRyZXR1cm4gbGF6eUZsYWdzKFtcblx0XHQnZGV2Jyxcblx0XHQncGVlcicsXG5cdFx0J29wdGlvbmFsJyxcblx0XHQnZXhhY3QnLFxuXHRcdCd0aWxkZScsXG5cdFx0J2lnbm9yZS13b3Jrc3BhY2Utcm9vdC1jaGVjaycsXG5cdFx0J2F1ZGl0Jyxcblx0XSwgYXJndilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwWWFybkFkZFRvWWFyZ3M8VCBleHRlbmRzIGFueT4oeWFyZ3M6IEFyZ3Y8VD4sIG9wdHM6IHtcblx0YWxsb3dFbXB0eU5hbWU/OiBib29sZWFuLFxufSA9IHt9KVxue1xuXHRyZXR1cm4geWFyZ3Ncblx0XHQub3B0aW9uKCdkZXYnLCB7XG5cdFx0XHRhbGlhczogJ0QnLFxuXHRcdFx0ZGVzYzogYGluc3RhbGwgcGFja2FnZXMgdG8gZGV2RGVwZW5kZW5jaWVzLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncGVlcicsIHtcblx0XHRcdGFsaWFzOiAnUCcsXG5cdFx0XHRkZXNjOiBgaW5zdGFsbCBwYWNrYWdlcyB0byBwZWVyRGVwZW5kZW5jaWVzLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignb3B0aW9uYWwnLCB7XG5cdFx0XHRhbGlhczogJ08nLFxuXHRcdFx0ZGVzYzogYGluc3RhbGwgcGFja2FnZXMgdG8gb3B0aW9uYWxEZXBlbmRlbmNpZXMuYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdleGFjdCcsIHtcblx0XHRcdGFsaWFzOiAnRScsXG5cdFx0XHRkZXNjOiBgc2VlIGh0dHBzOi8veWFybnBrZy5jb20vbGFuZy9lbi9kb2NzL2NsaS9hZGQvYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCd0aWxkZScsIHtcblx0XHRcdGFsaWFzOiAnVCcsXG5cdFx0XHRkZXNjOiBgc2VlIGh0dHBzOi8veWFybnBrZy5jb20vbGFuZy9lbi9kb2NzL2NsaS9hZGQvYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdhdWRpdCcsIHtcblx0XHRcdGRlc2M6IGBzZWUgaHR0cHM6Ly95YXJucGtnLmNvbS9sYW5nL2VuL2RvY3MvY2xpL2FkZC9gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oYG5hbWVgLCB7XG5cdFx0XHR0eXBlOiAnc3RyaW5nJyxcblx0XHRcdGRlbWFuZE9wdGlvbjogIW9wdHMuYWxsb3dFbXB0eU5hbWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdkZWR1cGUnLCB7XG5cdFx0XHRhbGlhczogWydkJ10sXG5cdFx0XHRkZXNjOiBgRGF0YSBkZWR1cGxpY2F0aW9uIGZvciB5YXJuLmxvY2tgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdpZ25vcmUtd29ya3NwYWNlLXJvb3QtY2hlY2snLCB7XG5cdFx0XHRhbGlhczogWydXJ10sXG5cdFx0XHRkZXNjOiBgc2VlIGh0dHBzOi8veWFybnBrZy5jb20vbGFuZy9lbi9kb2NzL2NsaS9hZGQvYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXJndlBrZ05hbWUoaW5wdXQ6IHN0cmluZylcbntcblx0bGV0IG0gPSBpbnB1dC5tYXRjaCgvXig/OihAW15cXC9dKylcXC8pPyhbXkBdKykoPzpAKC4rKSk/JC8pO1xuXG5cdGlmIChtKVxuXHR7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlucHV0LFxuXHRcdFx0bmFtZXNwYWNlOiBtWzFdLFxuXHRcdFx0bmFtZTogbVsyXSxcblx0XHRcdHZlcnNpb246IG1bM10sXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0VG9UeXBlcyhpbnB1dDogc3RyaW5nW10sIGluY2x1ZGVWZXJzaW9uPzogYm9vbGVhbilcbntcblx0cmV0dXJuIGFycmF5X3VuaXF1ZV9vdmVyd3JpdGUoaW5wdXQucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHR7XG5cdFx0bGV0IG0gPSBwYXJzZUFyZ3ZQa2dOYW1lKGIpO1xuXG5cdFx0aWYgKG0gJiYgIW0ubmFtZXNwYWNlICYmIG0ubmFtZSlcblx0XHR7XG5cdFx0XHRpZiAoaW5jbHVkZVZlcnNpb24gJiYgbS52ZXJzaW9uICE9IG51bGwgJiYgbS52ZXJzaW9uICE9PSAnJylcblx0XHRcdHtcblx0XHRcdFx0YS5wdXNoKGBAdHlwZXMvJHttLm5hbWV9QCR7bS52ZXJzaW9ufWApXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGEucHVzaChgQHR5cGVzLyR7bS5uYW1lfWApXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGE7XG5cdH0sIFtdIGFzIHN0cmluZ1tdKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGlzdHNEZXBlbmRlbmNpZXMobmFtZTogc3RyaW5nLFxuXHRwa2c6IElQYWNrYWdlSnNvbiB8IFBhcnRpYWw8UmVjb3JkPCdkZXBlbmRlbmNpZXMnIHwgJ2RldkRlcGVuZGVuY2llcycgfCAnb3B0aW9uYWxEZXBlbmRlbmNpZXMnLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pj4sXG4pXG57XG5cdHJldHVybiBwa2cuZGVwZW5kZW5jaWVzICYmIHBrZy5kZXBlbmRlbmNpZXNbbmFtZV1cblx0XHR8fCBwa2cuZGV2RGVwZW5kZW5jaWVzICYmIHBrZy5kZXZEZXBlbmRlbmNpZXNbbmFtZV1cblx0XHR8fCBwa2cub3B0aW9uYWxEZXBlbmRlbmNpZXMgJiYgcGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzW25hbWVdXG5cdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZmxhZ3NZYXJuQWRkO1xuIl19