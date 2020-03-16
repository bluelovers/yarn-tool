"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existsDependencies = exports.listToTypes = exports.parseArgvPkgName = exports.setupYarnAddToYargs = exports.flagsYarnAdd = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ0gsb0NBQXFDO0FBRXJDLDJEQUEwRTtBQUcxRSxTQUFnQixZQUFZLENBQUMsSUFFNUI7SUFFQSxPQUFPLGlCQUFTLENBQUM7UUFDaEIsS0FBSztRQUNMLE1BQU07UUFDTixVQUFVO1FBQ1YsT0FBTztRQUNQLE9BQU87UUFDUCw2QkFBNkI7UUFDN0IsT0FBTztLQUNQLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDVCxDQUFDO0FBYkQsb0NBYUM7QUFFRCxTQUFnQixtQkFBbUIsQ0FBZ0IsS0FBYyxFQUFFLE9BRS9ELEVBQUU7SUFFTCxPQUFPLEtBQUs7U0FDVixNQUFNLENBQUMsS0FBSyxFQUFFO1FBQ2QsS0FBSyxFQUFFLEdBQUc7UUFDVixJQUFJLEVBQUUsc0NBQXNDO1FBQzVDLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZixLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSx1Q0FBdUM7UUFDN0MsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRTtRQUNuQixLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSwyQ0FBMkM7UUFDakQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNoQixLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSwrQ0FBK0M7UUFDckQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNoQixLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSwrQ0FBK0M7UUFDckQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNoQixJQUFJLEVBQUUsK0NBQStDO1FBQ3JELE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZixJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjO0tBQ2xDLENBQUM7U0FDRCxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ2pCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUNaLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsNkJBQTZCLEVBQUU7UUFDdEMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ1osSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFqREQsa0RBaURDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBYTtJQUU3QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFFM0QsSUFBSSxDQUFDLEVBQ0w7UUFDQyxPQUFPO1lBQ04sS0FBSztZQUNMLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNiLENBQUE7S0FDRDtBQUNGLENBQUM7QUFiRCw0Q0FhQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxLQUFlLEVBQUUsY0FBd0I7SUFFcEUsT0FBTywyQ0FBc0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFeEQsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQy9CO1lBQ0MsSUFBSSxjQUFjLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxFQUFFLEVBQzNEO2dCQUNDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2FBQ3ZDO2lCQUVEO2dCQUNDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTthQUMxQjtTQUNEO1FBRUQsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDO0FBcEJELGtDQW9CQztBQUVELFNBQWdCLGtCQUFrQixDQUFDLElBQVksRUFDOUMsR0FBd0g7SUFHeEgsT0FBTyxHQUFHLENBQUMsWUFBWSxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO1dBQzdDLEdBQUcsQ0FBQyxlQUFlLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7V0FDaEQsR0FBRyxDQUFDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FDN0Q7QUFDRixDQUFDO0FBUkQsZ0RBUUM7QUFFRCxrQkFBZSxZQUFZLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzQvMzAuXG4gKi9cbmltcG9ydCB7IGxhenlGbGFncyB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCB7IEFyZ3YsIE9taXQgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGFycmF5X3VuaXF1ZV9vdmVyd3JpdGUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IElQYWNrYWdlSnNvbiBmcm9tICdAdHMtdHlwZS9wYWNrYWdlLWR0cy9wYWNrYWdlLWpzb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gZmxhZ3NZYXJuQWRkKGFyZ3Y6IHtcblx0W2s6IHN0cmluZ106IGJvb2xlYW4sXG59KTogc3RyaW5nW11cbntcblx0cmV0dXJuIGxhenlGbGFncyhbXG5cdFx0J2RldicsXG5cdFx0J3BlZXInLFxuXHRcdCdvcHRpb25hbCcsXG5cdFx0J2V4YWN0Jyxcblx0XHQndGlsZGUnLFxuXHRcdCdpZ25vcmUtd29ya3NwYWNlLXJvb3QtY2hlY2snLFxuXHRcdCdhdWRpdCcsXG5cdF0sIGFyZ3YpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFlhcm5BZGRUb1lhcmdzPFQgZXh0ZW5kcyBhbnk+KHlhcmdzOiBBcmd2PFQ+LCBvcHRzOiB7XG5cdGFsbG93RW1wdHlOYW1lPzogYm9vbGVhbixcbn0gPSB7fSlcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignZGV2Jywge1xuXHRcdFx0YWxpYXM6ICdEJyxcblx0XHRcdGRlc2M6IGBpbnN0YWxsIHBhY2thZ2VzIHRvIGRldkRlcGVuZGVuY2llcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3BlZXInLCB7XG5cdFx0XHRhbGlhczogJ1AnLFxuXHRcdFx0ZGVzYzogYGluc3RhbGwgcGFja2FnZXMgdG8gcGVlckRlcGVuZGVuY2llcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ29wdGlvbmFsJywge1xuXHRcdFx0YWxpYXM6ICdPJyxcblx0XHRcdGRlc2M6IGBpbnN0YWxsIHBhY2thZ2VzIHRvIG9wdGlvbmFsRGVwZW5kZW5jaWVzLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZXhhY3QnLCB7XG5cdFx0XHRhbGlhczogJ0UnLFxuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigndGlsZGUnLCB7XG5cdFx0XHRhbGlhczogJ1QnLFxuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignYXVkaXQnLCB7XG5cdFx0XHRkZXNjOiBgc2VlIGh0dHBzOi8veWFybnBrZy5jb20vbGFuZy9lbi9kb2NzL2NsaS9hZGQvYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKGBuYW1lYCwge1xuXHRcdFx0dHlwZTogJ3N0cmluZycsXG5cdFx0XHRkZW1hbmRPcHRpb246ICFvcHRzLmFsbG93RW1wdHlOYW1lLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZGVkdXBlJywge1xuXHRcdFx0YWxpYXM6IFsnZCddLFxuXHRcdFx0ZGVzYzogYERhdGEgZGVkdXBsaWNhdGlvbiBmb3IgeWFybi5sb2NrYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0XHRkZWZhdWx0OiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignaWdub3JlLXdvcmtzcGFjZS1yb290LWNoZWNrJywge1xuXHRcdFx0YWxpYXM6IFsnVyddLFxuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFyZ3ZQa2dOYW1lKGlucHV0OiBzdHJpbmcpXG57XG5cdGxldCBtID0gaW5wdXQubWF0Y2goL14oPzooQFteXFwvXSspXFwvKT8oW15AXSspKD86QCguKykpPyQvKTtcblxuXHRpZiAobSlcblx0e1xuXHRcdHJldHVybiB7XG5cdFx0XHRpbnB1dCxcblx0XHRcdG5hbWVzcGFjZTogbVsxXSxcblx0XHRcdG5hbWU6IG1bMl0sXG5cdFx0XHR2ZXJzaW9uOiBtWzNdLFxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdFRvVHlwZXMoaW5wdXQ6IHN0cmluZ1tdLCBpbmNsdWRlVmVyc2lvbj86IGJvb2xlYW4pXG57XG5cdHJldHVybiBhcnJheV91bmlxdWVfb3ZlcndyaXRlKGlucHV0LnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdGxldCBtID0gcGFyc2VBcmd2UGtnTmFtZShiKTtcblxuXHRcdGlmIChtICYmICFtLm5hbWVzcGFjZSAmJiBtLm5hbWUpXG5cdFx0e1xuXHRcdFx0aWYgKGluY2x1ZGVWZXJzaW9uICYmIG0udmVyc2lvbiAhPSBudWxsICYmIG0udmVyc2lvbiAhPT0gJycpXG5cdFx0XHR7XG5cdFx0XHRcdGEucHVzaChgQHR5cGVzLyR7bS5uYW1lfUAke20udmVyc2lvbn1gKVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRhLnB1c2goYEB0eXBlcy8ke20ubmFtZX1gKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhO1xuXHR9LCBbXSBhcyBzdHJpbmdbXSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzRGVwZW5kZW5jaWVzKG5hbWU6IHN0cmluZyxcblx0cGtnOiBJUGFja2FnZUpzb24gfCBQYXJ0aWFsPFJlY29yZDwnZGVwZW5kZW5jaWVzJyB8ICdkZXZEZXBlbmRlbmNpZXMnIHwgJ29wdGlvbmFsRGVwZW5kZW5jaWVzJywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4+LFxuKVxue1xuXHRyZXR1cm4gcGtnLmRlcGVuZGVuY2llcyAmJiBwa2cuZGVwZW5kZW5jaWVzW25hbWVdXG5cdFx0fHwgcGtnLmRldkRlcGVuZGVuY2llcyAmJiBwa2cuZGV2RGVwZW5kZW5jaWVzW25hbWVdXG5cdFx0fHwgcGtnLm9wdGlvbmFsRGVwZW5kZW5jaWVzICYmIHBrZy5vcHRpb25hbERlcGVuZGVuY2llc1tuYW1lXVxuXHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZsYWdzWWFybkFkZDtcbiJdfQ==