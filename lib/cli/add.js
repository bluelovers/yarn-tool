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
    return pkg.dependencies && pkg.dependencies[name]
        || pkg.devDependencies && pkg.devDependencies[name]
        || pkg.optionalDependencies && pkg.optionalDependencies[name];
}
exports.existsDependencies = existsDependencies;
exports.default = flagsYarnAdd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0dBRUc7QUFDSCxvQ0FBcUM7QUFFckMsMkRBQTBFO0FBRzFFLFNBQWdCLFlBQVksQ0FBQyxJQUU1QjtJQUVBLE9BQU8saUJBQVMsQ0FBQztRQUNoQixLQUFLO1FBQ0wsTUFBTTtRQUNOLFVBQVU7UUFDVixPQUFPO1FBQ1AsT0FBTztRQUNQLDZCQUE2QjtRQUM3QixPQUFPO0tBQ1AsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNULENBQUM7QUFiRCxvQ0FhQztBQUVELFNBQWdCLG1CQUFtQixDQUFnQixLQUFjO0lBRWhFLE9BQU8sS0FBSztTQUNWLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDZCxLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxzQ0FBc0M7UUFDNUMsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLHVDQUF1QztRQUM3QyxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsVUFBVSxFQUFFO1FBQ25CLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLDJDQUEyQztRQUNqRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLCtDQUErQztRQUNyRCxPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7U0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2hCLElBQUksRUFBRSwrQ0FBK0M7UUFDckQsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7S0FDbEIsQ0FBQztTQUNELE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDakIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ1osSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztTQUNELE1BQU0sQ0FBQyw2QkFBNkIsRUFBRTtRQUN0QyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixJQUFJLEVBQUUsK0NBQStDO1FBQ3JELE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQS9DRCxrREErQ0M7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxLQUFhO0lBRTdDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUUzRCxJQUFJLENBQUMsRUFDTDtRQUNDLE9BQU87WUFDTixLQUFLO1lBQ0wsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNWLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2IsQ0FBQTtLQUNEO0FBQ0YsQ0FBQztBQWJELDRDQWFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEtBQWU7SUFFMUMsT0FBTywyQ0FBc0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFeEQsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQy9CO1lBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQzFCO1FBRUQsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDO0FBYkQsa0NBYUM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxJQUFZLEVBQzlDLEdBQXdIO0lBR3hILE9BQU8sR0FBRyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztXQUM3QyxHQUFHLENBQUMsZUFBZSxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO1dBQ2hELEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxHQUFHLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQzdEO0FBQ0YsQ0FBQztBQVJELGdEQVFDO0FBRUQsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS80LzMwLlxuICovXG5pbXBvcnQgeyBsYXp5RmxhZ3MgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyBBcmd2LCBPbWl0IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlLCBhcnJheV91bmlxdWVfb3ZlcndyaXRlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBJUGFja2FnZUpzb24gZnJvbSAnQHRzLXR5cGUvcGFja2FnZS1kdHMvcGFja2FnZS1qc29uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGZsYWdzWWFybkFkZChhcmd2OiB7XG5cdFtrOiBzdHJpbmddOiBib29sZWFuLFxufSk6IHN0cmluZ1tdXG57XG5cdHJldHVybiBsYXp5RmxhZ3MoW1xuXHRcdCdkZXYnLFxuXHRcdCdwZWVyJyxcblx0XHQnb3B0aW9uYWwnLFxuXHRcdCdleGFjdCcsXG5cdFx0J3RpbGRlJyxcblx0XHQnaWdub3JlLXdvcmtzcGFjZS1yb290LWNoZWNrJyxcblx0XHQnYXVkaXQnLFxuXHRdLCBhcmd2KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBZYXJuQWRkVG9ZYXJnczxUIGV4dGVuZHMgYW55Pih5YXJnczogQXJndjxUPilcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignZGV2Jywge1xuXHRcdFx0YWxpYXM6ICdEJyxcblx0XHRcdGRlc2M6IGBpbnN0YWxsIHBhY2thZ2VzIHRvIGRldkRlcGVuZGVuY2llcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3BlZXInLCB7XG5cdFx0XHRhbGlhczogJ1AnLFxuXHRcdFx0ZGVzYzogYGluc3RhbGwgcGFja2FnZXMgdG8gcGVlckRlcGVuZGVuY2llcy5gLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ29wdGlvbmFsJywge1xuXHRcdFx0YWxpYXM6ICdPJyxcblx0XHRcdGRlc2M6IGBpbnN0YWxsIHBhY2thZ2VzIHRvIG9wdGlvbmFsRGVwZW5kZW5jaWVzLmAsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignZXhhY3QnLCB7XG5cdFx0XHRhbGlhczogJ0UnLFxuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigndGlsZGUnLCB7XG5cdFx0XHRhbGlhczogJ1QnLFxuXHRcdFx0ZGVzYzogYHNlZSBodHRwczovL3lhcm5wa2cuY29tL2xhbmcvZW4vZG9jcy9jbGkvYWRkL2AsXG5cdFx0XHRib29sZWFuOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignYXVkaXQnLCB7XG5cdFx0XHRkZXNjOiBgc2VlIGh0dHBzOi8veWFybnBrZy5jb20vbGFuZy9lbi9kb2NzL2NsaS9hZGQvYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKGBuYW1lYCwge1xuXHRcdFx0dHlwZTogJ3N0cmluZycsXG5cdFx0XHRkZW1hbmRPcHRpb246IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdkZWR1cGUnLCB7XG5cdFx0XHRhbGlhczogWydkJ10sXG5cdFx0XHRkZXNjOiBgRGF0YSBkZWR1cGxpY2F0aW9uIGZvciB5YXJuLmxvY2tgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdpZ25vcmUtd29ya3NwYWNlLXJvb3QtY2hlY2snLCB7XG5cdFx0XHRhbGlhczogWydXJ10sXG5cdFx0XHRkZXNjOiBgc2VlIGh0dHBzOi8veWFybnBrZy5jb20vbGFuZy9lbi9kb2NzL2NsaS9hZGQvYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXJndlBrZ05hbWUoaW5wdXQ6IHN0cmluZylcbntcblx0bGV0IG0gPSBpbnB1dC5tYXRjaCgvXig/OihAW15cXC9dKylcXC8pPyhbXkBdKykoPzpAKC4rKSk/JC8pO1xuXG5cdGlmIChtKVxuXHR7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlucHV0LFxuXHRcdFx0bmFtZXNwYWNlOiBtWzFdLFxuXHRcdFx0bmFtZTogbVsyXSxcblx0XHRcdHZlcnNpb246IG1bM10sXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0VG9UeXBlcyhpbnB1dDogc3RyaW5nW10pXG57XG5cdHJldHVybiBhcnJheV91bmlxdWVfb3ZlcndyaXRlKGlucHV0LnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdGxldCBtID0gcGFyc2VBcmd2UGtnTmFtZShiKTtcblxuXHRcdGlmIChtICYmICFtLm5hbWVzcGFjZSAmJiBtLm5hbWUpXG5cdFx0e1xuXHRcdFx0YS5wdXNoKGBAdHlwZXMvJHttLm5hbWV9YClcblx0XHR9XG5cblx0XHRyZXR1cm4gYTtcblx0fSwgW10gYXMgc3RyaW5nW10pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0c0RlcGVuZGVuY2llcyhuYW1lOiBzdHJpbmcsXG5cdHBrZzogSVBhY2thZ2VKc29uIHwgUGFydGlhbDxSZWNvcmQ8J2RlcGVuZGVuY2llcycgfCAnZGV2RGVwZW5kZW5jaWVzJyB8ICdvcHRpb25hbERlcGVuZGVuY2llcycsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+Pixcbilcbntcblx0cmV0dXJuIHBrZy5kZXBlbmRlbmNpZXMgJiYgcGtnLmRlcGVuZGVuY2llc1tuYW1lXVxuXHRcdHx8IHBrZy5kZXZEZXBlbmRlbmNpZXMgJiYgcGtnLmRldkRlcGVuZGVuY2llc1tuYW1lXVxuXHRcdHx8IHBrZy5vcHRpb25hbERlcGVuZGVuY2llcyAmJiBwa2cub3B0aW9uYWxEZXBlbmRlbmNpZXNbbmFtZV1cblx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmbGFnc1lhcm5BZGQ7XG4iXX0=