"use strict";
/**
 * Created by user on 2019/4/30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const npm_check_updates_1 = require("npm-check-updates");
//import versionUtil = require('npm-check-updates/lib/version-util');
//import chalk = require('chalk');
const index_1 = require("../index");
const table_1 = require("../table");
async function npmCheckUpdates(cache, ncuOptions) {
    //ncuOptions.silent = false;
    //ncuOptions.json = false;
    //ncuOptions.cli = true;
    //ncuOptions.args = [];
    //ncuOptions.loglevel = 'verbose';
    delete ncuOptions.upgrade;
    ncuOptions.packageData = JSON.stringify(ncuOptions.json_old);
    ncuOptions.cwd = cache.cwd;
    ncuOptions.jsonUpgraded = true;
    ncuOptions.json_new = JSON.parse(ncuOptions.packageData);
    ncuOptions.list_updated = await npm_check_updates_1.run(ncuOptions);
    let ks = Object.keys(ncuOptions.list_updated);
    ncuOptions.json_changed = !!ks.length;
    let current = {};
    if (ks.length) {
        ks.forEach(name => {
            [
                'dependencies',
                'devDependencies',
                'peerDependencies',
                'optionalDependencies',
            ].forEach(key => {
                let data = ncuOptions.json_new[key];
                if (data) {
                    let value = data[name];
                    if (value && value != '*') {
                        current[name] = value;
                        data[name] = ncuOptions.list_updated[name];
                    }
                }
            });
        });
    }
    ncuOptions.current = current;
    let table = table_1.toDependencyTable({
        from: ncuOptions.current,
        to: ncuOptions.list_updated,
    }).toString();
    table && index_1.console.log(table);
    return ncuOptions;
}
exports.npmCheckUpdates = npmCheckUpdates;
function setupNcuToYargs(yargs) {
    return yargs
        .option('dep', {
        desc: `check only a specific section(s) of dependencies: prod|dev|peer|optional|bundle (comma-delimited)`,
        string: true,
    })
        .option('minimal', {
        alias: ['m'],
        desc: `do not upgrade newer versions that are already satisfied by the version range according to semver`,
        boolean: true,
    })
        .option('newest', {
        alias: ['n'],
        desc: `find the newest versions available instead of the latest stable versions`,
        boolean: true,
    })
        .option('packageManager', {
        alias: ['p'],
        desc: `npm (default) or bower`,
        default: 'npm',
        string: true,
    })
        .option('registry', {
        alias: ['r'],
        desc: `specify third-party npm registry`,
        string: true,
    })
        .option('silent', {
        alias: ['s'],
        desc: `don't output anything (--loglevel silent)`,
        boolean: true,
    })
        .option('greatest', {
        alias: ['g'],
        desc: `find the highest versions available instead of the latest stable versions`,
        boolean: true,
    })
        .option('upgrade', {
        alias: ['u'],
        desc: `overwrite package file`,
        boolean: true,
    })
        .option('semverLevel', {
        desc: `find the highest version within "major" or "minor"`,
        string: true,
    })
        .option('removeRange', {
        desc: `remove version ranges from the final package version`,
        boolean: true,
    })
        .option('dedupe', {
        desc: `remove upgrade module from resolutions`,
        boolean: true,
        default: true,
    });
}
exports.setupNcuToYargs = setupNcuToYargs;
exports.default = setupNcuToYargs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmN1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmN1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCx5REFBNEQ7QUFHNUQscUVBQXFFO0FBQ3JFLGtDQUFrQztBQUNsQyxvQ0FBbUM7QUFDbkMsb0NBQTZDO0FBb0J0QyxLQUFLLFVBQVUsZUFBZSxDQUE2QixLQUFpQixFQUFFLFVBQW9CO0lBRXhHLDRCQUE0QjtJQUU1QiwwQkFBMEI7SUFDMUIsd0JBQXdCO0lBRXhCLHVCQUF1QjtJQUV2QixrQ0FBa0M7SUFFbEMsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDO0lBRTFCLFVBQVUsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFN0QsVUFBVSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0lBQzNCLFVBQVUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBRS9CLFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFekQsVUFBVSxDQUFDLFlBQVksR0FBRyxNQUFNLHVCQUFnQixDQUFDLFVBQVUsQ0FBMkIsQ0FBQztJQUV2RixJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUU5QyxVQUFVLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0lBRXRDLElBQUksT0FBTyxHQUFnQixFQUFFLENBQUM7SUFFOUIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUNiO1FBQ0MsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUdRO2dCQUN4QixjQUFjO2dCQUNkLGlCQUFpQjtnQkFDakIsa0JBQWtCO2dCQUNsQixzQkFBc0I7YUFDckIsQ0FBQyxPQUFPLENBQUMsR0FBRyxD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LGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNC8zMC5cbiAqL1xuXG5pbXBvcnQgeyBydW4gYXMgX25wbUNoZWNrVXBkYXRlcyB9IGZyb20gJ25wbS1jaGVjay11cGRhdGVzJztcbmltcG9ydCB7IElXcmFwRGVkdXBlQ2FjaGUgfSBmcm9tICcuL2RlZHVwZSc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG4vL2ltcG9ydCB2ZXJzaW9uVXRpbCA9IHJlcXVpcmUoJ25wbS1jaGVjay11cGRhdGVzL2xpYi92ZXJzaW9uLXV0aWwnKTtcbi8vaW1wb3J0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmltcG9ydCB7IGNvbnNvbGUgfSBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgeyB0b0RlcGVuZGVuY3lUYWJsZSB9IGZyb20gJy4uL3RhYmxlJztcbmltcG9ydCB7IEFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBJVW5wYWNrWWFyZ3NBcmd2IH0gZnJvbSAnLi4vY2xpJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSBJVW5wYWNrWWFyZ3NBcmd2PFJldHVyblR5cGU8dHlwZW9mIHNldHVwTmN1VG9ZYXJncz4+ICYgIHtcblx0anNvbl9vbGQ6IElQYWNrYWdlSnNvbjtcblx0Y3dkPzogc3RyaW5nO1xuXHRwYWNrYWdlRGF0YT86IHN0cmluZztcblx0cGFja2FnZU1hbmFnZXI/OiAnbnBtJyB8ICdib3dlcic7XG5cblx0anNvbl9uZXc/OiBJUGFja2FnZUpzb247XG5cdGpzb25fY2hhbmdlZD86IGJvb2xlYW47XG5cblx0bGlzdF91cGRhdGVkPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuXHRsb2dsZXZlbD86ICdzaWxlbnQnIHwgJ3ZlcmJvc2UnO1xuXG5cdGN1cnJlbnQ/OiBJRGVwZW5kZW5jeTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUNoZWNrVXBkYXRlczxDIGV4dGVuZHMgSVdyYXBEZWR1cGVDYWNoZT4oY2FjaGU6IFBhcnRpYWw8Qz4sIG5jdU9wdGlvbnM6IElPcHRpb25zKVxue1xuXHQvL25jdU9wdGlvbnMuc2lsZW50ID0gZmFsc2U7XG5cblx0Ly9uY3VPcHRpb25zLmpzb24gPSBmYWxzZTtcblx0Ly9uY3VPcHRpb25zLmNsaSA9IHRydWU7XG5cblx0Ly9uY3VPcHRpb25zLmFyZ3MgPSBbXTtcblxuXHQvL25jdU9wdGlvbnMubG9nbGV2ZWwgPSAndmVyYm9zZSc7XG5cblx0ZGVsZXRlIG5jdU9wdGlvbnMudXBncmFkZTtcblxuXHRuY3VPcHRpb25zLnBhY2thZ2VEYXRhID0gSlNPTi5zdHJpbmdpZnkobmN1T3B0aW9ucy5qc29uX29sZCk7XG5cblx0bmN1T3B0aW9ucy5jd2QgPSBjYWNoZS5jd2Q7XG5cdG5jdU9wdGlvbnMuanNvblVwZ3JhZGVkID0gdHJ1ZTtcblxuXHRuY3VPcHRpb25zLmpzb25fbmV3ID0gSlNPTi5wYXJzZShuY3VPcHRpb25zLnBhY2thZ2VEYXRhKTtcblxuXHRuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCA9IGF3YWl0IF9ucG1DaGVja1VwZGF0ZXMobmN1T3B0aW9ucykgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuXHRsZXQga3MgPSBPYmplY3Qua2V5cyhuY3VPcHRpb25zLmxpc3RfdXBkYXRlZCk7XG5cblx0bmN1T3B0aW9ucy5qc29uX2NoYW5nZWQgPSAhIWtzLmxlbmd0aDtcblxuXHRsZXQgY3VycmVudDogSURlcGVuZGVuY3kgPSB7fTtcblxuXHRpZiAoa3MubGVuZ3RoKVxuXHR7XG5cdFx0a3MuZm9yRWFjaChuYW1lID0+XG5cdFx0e1xuXG5cdFx0XHQoPChrZXlvZiBJUGFja2FnZUpzb24pW10+W1xuXHRcdFx0XHQnZGVwZW5kZW5jaWVzJyxcblx0XHRcdFx0J2RldkRlcGVuZGVuY2llcycsXG5cdFx0XHRcdCdwZWVyRGVwZW5kZW5jaWVzJyxcblx0XHRcdFx0J29wdGlvbmFsRGVwZW5kZW5jaWVzJyxcblx0XHRcdF0pLmZvckVhY2goa2V5ID0+XG5cdFx0XHR7XG5cblx0XHRcdFx0bGV0IGRhdGEgPSBuY3VPcHRpb25zLmpzb25fbmV3W2tleV07XG5cblx0XHRcdFx0aWYgKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdmFsdWUgPSBkYXRhW25hbWVdO1xuXG5cdFx0XHRcdFx0aWYgKHZhbHVlICYmIHZhbHVlICE9ICcqJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjdXJyZW50W25hbWVdID0gdmFsdWU7XG5cblx0XHRcdFx0XHRcdGRhdGFbbmFtZV0gPSBuY3VPcHRpb25zLmxpc3RfdXBkYXRlZFtuYW1lXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fSlcblxuXHRcdH0pO1xuXG5cdH1cblxuXHRuY3VPcHRpb25zLmN1cnJlbnQgPSBjdXJyZW50O1xuXG5cdGxldCB0YWJsZSA9IHRvRGVwZW5kZW5jeVRhYmxlKHtcblx0XHRmcm9tOiBuY3VPcHRpb25zLmN1cnJlbnQsXG5cdFx0dG86IG5jdU9wdGlvbnMubGlzdF91cGRhdGVkLFxuXHR9KS50b1N0cmluZygpO1xuXG5cdHRhYmxlICYmIGNvbnNvbGUubG9nKHRhYmxlKTtcblxuXHRyZXR1cm4gbmN1T3B0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTmN1VG9ZYXJnczxUIGV4dGVuZHMgYW55Pih5YXJnczogQXJndjxUPilcbntcblx0cmV0dXJuIHlhcmdzXG5cdFx0Lm9wdGlvbignZGVwJywge1xuXHRcdFx0ZGVzYzogYGNoZWNrIG9ubHkgYSBzcGVjaWZpYyBzZWN0aW9uKHMpIG9mIGRlcGVuZGVuY2llczogcHJvZHxkZXZ8cGVlcnxvcHRpb25hbHxidW5kbGUgKGNvbW1hLWRlbGltaXRlZClgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignbWluaW1hbCcsIHtcblx0XHRcdGFsaWFzOiBbJ20nXSxcblx0XHRcdGRlc2M6IGBkbyBub3QgdXBncmFkZSBuZXdlciB2ZXJzaW9ucyB0aGF0IGFyZSBhbHJlYWR5IHNhdGlzZmllZCBieSB0aGUgdmVyc2lvbiByYW5nZSBhY2NvcmRpbmcgdG8gc2VtdmVyYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCduZXdlc3QnLCB7XG5cdFx0XHRhbGlhczogWyduJ10sXG5cdFx0XHRkZXNjOiBgZmluZCB0aGUgbmV3ZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdwYWNrYWdlTWFuYWdlcicsIHtcblx0XHRcdGFsaWFzOiBbJ3AnXSxcblx0XHRcdGRlc2M6IGBucG0gKGRlZmF1bHQpIG9yIGJvd2VyYCxcblx0XHRcdGRlZmF1bHQ6ICducG0nLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbigncmVnaXN0cnknLCB7XG5cdFx0XHRhbGlhczogWydyJ10sXG5cdFx0XHRkZXNjOiBgc3BlY2lmeSB0aGlyZC1wYXJ0eSBucG0gcmVnaXN0cnlgLFxuXHRcdFx0c3RyaW5nOiB0cnVlLFxuXHRcdH0pXG5cdFx0Lm9wdGlvbignc2lsZW50Jywge1xuXHRcdFx0YWxpYXM6IFsncyddLFxuXHRcdFx0ZGVzYzogYGRvbid0IG91dHB1dCBhbnl0aGluZyAoLS1sb2dsZXZlbCBzaWxlbnQpYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdncmVhdGVzdCcsIHtcblx0XHRcdGFsaWFzOiBbJ2cnXSxcblx0XHRcdGRlc2M6IGBmaW5kIHRoZSBoaWdoZXN0IHZlcnNpb25zIGF2YWlsYWJsZSBpbnN0ZWFkIG9mIHRoZSBsYXRlc3Qgc3RhYmxlIHZlcnNpb25zYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCd1cGdyYWRlJywge1xuXHRcdFx0YWxpYXM6IFsndSddLFxuXHRcdFx0ZGVzYzogYG92ZXJ3cml0ZSBwYWNrYWdlIGZpbGVgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHR9KVxuXHRcdC5vcHRpb24oJ3NlbXZlckxldmVsJywge1xuXHRcdFx0ZGVzYzogYGZpbmQgdGhlIGhpZ2hlc3QgdmVyc2lvbiB3aXRoaW4gXCJtYWpvclwiIG9yIFwibWlub3JcImAsXG5cdFx0XHRzdHJpbmc6IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdyZW1vdmVSYW5nZScsIHtcblx0XHRcdGRlc2M6IGByZW1vdmUgdmVyc2lvbiByYW5nZXMgZnJvbSB0aGUgZmluYWwgcGFja2FnZSB2ZXJzaW9uYCxcblx0XHRcdGJvb2xlYW46IHRydWUsXG5cdFx0fSlcblx0XHQub3B0aW9uKCdkZWR1cGUnLCB7XG5cdFx0XHRkZXNjOiBgcmVtb3ZlIHVwZ3JhZGUgbW9kdWxlIGZyb20gcmVzb2x1dGlvbnNgLFxuXHRcdFx0Ym9vbGVhbjogdHJ1ZSxcblx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0fSlcblx0O1xufVxuXG5leHBvcnQgdHlwZSBJRGVwZW5kZW5jeSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbmV4cG9ydCBkZWZhdWx0IHNldHVwTmN1VG9ZYXJnc1xuIl19