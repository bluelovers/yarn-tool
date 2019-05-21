#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const updateNotifier = require("update-notifier");
const pkg = require("../package.json");
const path = require("upath2");
const osLocale = require("os-locale");
const isNpx = require("is-npx");
if (path.extname(__filename) === '.js' && !process.argv.filter(v => {
    if (typeof v === 'string') {
        return v.includes('ts-node') || v.includes('source-map-support');
    }
}).length) {
    require('source-map-support').install({
        hookRequire: true
    });
}
!isNpx() && updateNotifier({ pkg }).notify();
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
    .option('yt-debug-mode', {
    boolean: true,
})
    .alias('v', 'version')
    .alias('h', 'help')
    .help('help')
    .recommendCommands()
    .locale(osLocale.sync())
    .commandDir(path.join(__dirname, 'cmds'))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand()
    .scriptName('yt');
cli.argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi10b29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieWFybi10b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLCtCQUFnQztBQUNoQyxrREFBbUQ7QUFDbkQsdUNBQXdDO0FBQ3hDLCtCQUFnQztBQWdDaEMsc0NBQXVDO0FBQ3ZDLGdDQUFpQztBQUVqQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDbEUsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQ3pCO1FBQ0MsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtLQUNoRTtBQUNGLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDVDtJQUNDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNyQyxXQUFXLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7Q0FDSDtBQUVELENBQUMsS0FBSyxFQUFFLElBQUksY0FBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUU3QyxJQUFJLEdBQUcsR0FBRyxLQUFLO0tBQ2IsTUFBTSxDQUFDLEtBQUssRUFBRTtJQUNkLElBQUksRUFBRSxnREFBZ0Q7SUFDdEQsU0FBUyxFQUFFLElBQUk7SUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRTtDQUN0QixDQUFDO0tBQ0QsTUFBTSxDQUFDLG9CQUFvQixFQUFFO0lBQzdCLElBQUksRUFBRSwyR0FBMkc7SUFDakgsT0FBTyxFQUFFLElBQUk7Q0FDYixDQUFDO0tBQ0QsTUFBTSxDQUFDLGVBQWUsRUFBRTtJQUN4QixPQUFPLEVBQUUsSUFBSTtDQUNiLENBQUM7S0FDRCxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztLQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztLQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ1osaUJBQWlCLEVBQUU7S0FDbkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN2QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNWLGNBQWMsQ0FBQyxJQUFJLENBQUM7S0FDcEIsTUFBTSxFQUFFO0tBQ1IsYUFBYSxFQUFFO0tBQ2YsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUNqQjtBQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cblxuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB1cGRhdGVOb3RpZmllciA9IHJlcXVpcmUoJ3VwZGF0ZS1ub3RpZmllcicpO1xuaW1wb3J0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrfSBmcm9tICcuLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgRGVkdXBlLCBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgZXhpc3RzRGVwZW5kZW5jaWVzLCBmbGFnc1lhcm5BZGQsIGxpc3RUb1R5cGVzLCBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IHNldHVwWWFybkluc3RhbGxUb1lhcmdzIGZyb20gJy4uL2xpYi9jbGkvaW5zdGFsbCc7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgc2V0dXBJbml0VG9ZYXJncyBmcm9tICducG0taW5pdDIvbGliL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuXG5pbXBvcnQge1xuXHRjcmVhdGVfY29tbWFuZCxcblx0Y3JlYXRlX2NvbW1hbmQyLFxuXHRkdW1teV9idWlsZGVyLCBkdW1teV9oYW5kbGVyLFxuXHRJVW5wYWNrTXlZYXJnc0FyZ3YsXG5cdElVbnBhY2tZYXJnc0FyZ3YsXG59IGZyb20gJy4uL2xpYi9jbGknO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uLCB3cml0ZUpTT05TeW5jLCB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vbGliL3BrZyc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IG5wbUNoZWNrVXBkYXRlcyB9IGZyb20gJy4uL2xpYi9jbGkvbmN1JztcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJRGVwZW5kZW5jaWVzLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssXG5cdHN0cmluZ2lmeSBhcyBzdHJpbmdpZnlZYXJuTG9jayxcblx0cmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpcERlcHNOYW1lLCB5YXJuTG9ja0RpZmYsXG59IGZyb20gJy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBJVFNJdGVyYXRvckxhenksIElUU1ZhbHVlT2ZBcnJheSB9IGZyb20gJ3RzLXR5cGUnO1xuaW1wb3J0IHsgc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MgfSBmcm9tICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgY2hlY2tNb2RpbGVFeGlzdHMsIGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uL2xpYi9zcGF3bic7XG5pbXBvcnQgb3NMb2NhbGUgPSByZXF1aXJlKCdvcy1sb2NhbGUnKTtcbmltcG9ydCBpc05weCA9IHJlcXVpcmUoJ2lzLW5weCcpO1xuXG5pZiAocGF0aC5leHRuYW1lKF9fZmlsZW5hbWUpID09PSAnLmpzJyAmJiAhcHJvY2Vzcy5hcmd2LmZpbHRlcih2ID0+IHtcblx0aWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJylcblx0e1xuXHRcdHJldHVybiB2LmluY2x1ZGVzKCd0cy1ub2RlJykgfHwgdi5pbmNsdWRlcygnc291cmNlLW1hcC1zdXBwb3J0Jylcblx0fVxufSkubGVuZ3RoKVxue1xuXHRyZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQnKS5pbnN0YWxsKHtcblx0XHRob29rUmVxdWlyZTogdHJ1ZVxuXHR9KTtcbn1cblxuIWlzTnB4KCkgJiYgdXBkYXRlTm90aWZpZXIoeyBwa2cgfSkubm90aWZ5KCk7XG5cbmxldCBjbGkgPSB5YXJnc1xuXHQub3B0aW9uKCdjd2QnLCB7XG5cdFx0ZGVzYzogYGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnkgb3IgcGFja2FnZSBkaXJlY3RvcnlgLFxuXHRcdG5vcm1hbGl6ZTogdHJ1ZSxcblx0XHRkZWZhdWx0OiBwcm9jZXNzLmN3ZCgpLFxuXHR9KVxuXHQub3B0aW9uKCdza2lwQ2hlY2tXb3Jrc3BhY2UnLCB7XG5cdFx0ZGVzYzogYHRoaXMgb3B0aW9ucyBpcyBmb3Igc2VhcmNoIHlhcm4ubG9jaywgcGtnIHJvb3QsIHdvcmtzcGFjZSByb290LCBub3Qgc2FtZSBhcyAtLWlnbm9yZS13b3Jrc3BhY2Utcm9vdC1jaGVja2AsXG5cdFx0Ym9vbGVhbjogdHJ1ZSxcblx0fSlcblx0Lm9wdGlvbigneXQtZGVidWctbW9kZScsIHtcblx0XHRib29sZWFuOiB0cnVlLFxuXHR9KVxuXHQuYWxpYXMoJ3YnLCAndmVyc2lvbicpXG5cdC5hbGlhcygnaCcsICdoZWxwJylcblx0LmhlbHAoJ2hlbHAnKVxuXHQucmVjb21tZW5kQ29tbWFuZHMoKVxuXHQubG9jYWxlKG9zTG9jYWxlLnN5bmMoKSlcblx0LmNvbW1hbmREaXIocGF0aC5qb2luKF9fZGlybmFtZSwgJ2NtZHMnKSlcblx0LmhlbHAodHJ1ZSlcblx0LnNob3dIZWxwT25GYWlsKHRydWUpXG5cdC5zdHJpY3QoKVxuXHQuZGVtYW5kQ29tbWFuZCgpXG5cdC5zY3JpcHROYW1lKCd5dCcpXG47XG5cbmNsaS5hcmd2O1xuXG4iXX0=