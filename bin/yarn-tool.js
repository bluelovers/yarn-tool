#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const yargs = require("yargs");
const updateNotifier = require("update-notifier");
const pkg = require("../package.json");
const path = require("upath2");
const index_1 = require("../lib/index");
const cli_1 = require("../lib/cli");
const osLocale = require("os-locale");
updateNotifier({ pkg }).notify();
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
    .command({
    command: 'help',
    describe: 'Show help',
    aliases: ['h'],
    builder(yarg) {
        yarg.showHelp('log');
        return yarg;
    },
    handler: cli_1.dummy_handler,
})
    .command({
    command: 'version',
    describe: 'Show version',
    builder(yarg) {
        return yarg;
    },
    async handler() {
        return Promise.resolve().then(() => require('../package.json')).then(v => index_1.console.log(v.version));
    },
})
    .recommendCommands()
    .locale(osLocale.sync())
    .commandDir(path.join(__dirname, 'cmds'))
    .help(true)
    .showHelpOnFail(true)
    .strict()
    .demandCommand();
cli.argv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi10b29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsieWFybi10b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHVDQUFxQztBQUNyQywrQkFBZ0M7QUFDaEMsa0RBQW1EO0FBQ25ELHVDQUF3QztBQUN4QywrQkFBZ0M7QUFHaEMsd0NBQTBFO0FBUTFFLG9DQU1vQjtBQWVwQixzQ0FBdUM7QUFFdkMsY0FBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVqQyxJQUFJLEdBQUcsR0FBRyxLQUFLO0tBQ2IsTUFBTSxDQUFDLEtBQUssRUFBRTtJQUNkLElBQUksRUFBRSxnREFBZ0Q7SUFDdEQsU0FBUyxFQUFFLElBQUk7SUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRTtDQUN0QixDQUFDO0tBQ0QsTUFBTSxDQUFDLG9CQUFvQixFQUFFO0lBQzdCLElBQUksRUFBRSwyR0FBMkc7SUFDakgsT0FBTyxFQUFFLElBQUk7Q0FDYixDQUFDO0tBQ0QsTUFBTSxDQUFDLGVBQWUsRUFBRTtJQUN4QixPQUFPLEVBQUUsSUFBSTtDQUNiLENBQUM7S0FDRCxPQUFPLENBQUM7SUFDUixPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNkLE9BQU8sQ0FBQyxJQUFJO1FBRVgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFDRCxPQUFPLEVBQUUsbUJBQWE7Q0FDdEIsQ0FBQztLQUNELE9BQU8sQ0FBQztJQUNSLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLE9BQU8sQ0FBQyxJQUFJO1FBRVgsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU87UUFFWixPQUFPLHFDQUFPLGlCQUFpQixHQUM3QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUNqQztJQUNILENBQUM7Q0FDRCxDQUFDO0tBQ0QsaUJBQWlCLEVBQUU7S0FDbkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN2QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNWLGNBQWMsQ0FBQyxJQUFJLENBQUM7S0FDcEIsTUFBTSxFQUFFO0tBQ1IsYUFBYSxFQUFFLENBQ2hCO0FBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0IHlhcmdzID0gcmVxdWlyZSgneWFyZ3MnKTtcbmltcG9ydCB1cGRhdGVOb3RpZmllciA9IHJlcXVpcmUoJ3VwZGF0ZS1ub3RpZmllcicpO1xuaW1wb3J0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG5pbXBvcnQgeyBjb25zb2xlLCBjb25zb2xlRGVidWcsIGZpbmRSb290LCBmc1lhcm5Mb2NrfSBmcm9tICcuLi9saWIvaW5kZXgnO1xuaW1wb3J0IHsgRGVkdXBlLCBpbmZvRnJvbURlZHVwZUNhY2hlLCB3cmFwRGVkdXBlIH0gZnJvbSAnLi4vbGliL2NsaS9kZWR1cGUnO1xuaW1wb3J0IHsgZXhpc3RzRGVwZW5kZW5jaWVzLCBmbGFnc1lhcm5BZGQsIGxpc3RUb1R5cGVzLCBzZXR1cFlhcm5BZGRUb1lhcmdzIH0gZnJvbSAnLi4vbGliL2NsaS9hZGQnO1xuaW1wb3J0IHNldHVwWWFybkluc3RhbGxUb1lhcmdzIGZyb20gJy4uL2xpYi9jbGkvaW5zdGFsbCc7XG5pbXBvcnQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5pbXBvcnQgc2V0dXBJbml0VG9ZYXJncyBmcm9tICducG0taW5pdDIvbGliL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgc29ydFBhY2thZ2VKc29uIH0gZnJvbSAnc29ydC1wYWNrYWdlLWpzb24nO1xuXG5pbXBvcnQge1xuXHRjcmVhdGVfY29tbWFuZCxcblx0Y3JlYXRlX2NvbW1hbmQyLFxuXHRkdW1teV9idWlsZGVyLCBkdW1teV9oYW5kbGVyLFxuXHRJVW5wYWNrTXlZYXJnc0FyZ3YsXG5cdElVbnBhY2tZYXJnc0FyZ3YsXG59IGZyb20gJy4uL2xpYi9jbGknO1xuaW1wb3J0IHsgcmVhZFBhY2thZ2VKc29uLCB3cml0ZUpTT05TeW5jLCB3cml0ZVBhY2thZ2VKc29uIH0gZnJvbSAnLi4vbGliL3BrZyc7XG5pbXBvcnQgSVBhY2thZ2VKc29uIGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzL3BhY2thZ2UtanNvbic7XG5pbXBvcnQgc2V0dXBOY3VUb1lhcmdzLCB7IG5wbUNoZWNrVXBkYXRlcyB9IGZyb20gJy4uL2xpYi9jbGkvbmN1JztcbmltcG9ydCB7XG5cdGZpbHRlclJlc29sdXRpb25zLFxuXHRJRGVwZW5kZW5jaWVzLFxuXHRJWWFybkxvY2tmaWxlUGFyc2VPYmplY3RSb3csXG5cdHBhcnNlIGFzIHBhcnNlWWFybkxvY2ssXG5cdHN0cmluZ2lmeSBhcyBzdHJpbmdpZnlZYXJuTG9jayxcblx0cmVtb3ZlUmVzb2x1dGlvbnNDb3JlLCBzdHJpcERlcHNOYW1lLCB5YXJuTG9ja0RpZmYsXG59IGZyb20gJy4uL2xpYi95YXJubG9jayc7XG5pbXBvcnQgeyBJVFNJdGVyYXRvckxhenksIElUU1ZhbHVlT2ZBcnJheSB9IGZyb20gJ3RzLXR5cGUnO1xuaW1wb3J0IHsgc2V0dXBXb3Jrc3BhY2VzSW5pdFRvWWFyZ3MgfSBmcm9tICdjcmVhdGUteWFybi13b3Jrc3BhY2VzL3lhcmdzLXNldHRpbmcnO1xuaW1wb3J0IHsgY2hlY2tNb2RpbGVFeGlzdHMsIGNyb3NzU3Bhd25PdGhlciwgcHJvY2Vzc0FyZ3ZTbGljZSB9IGZyb20gJy4uL2xpYi9zcGF3bic7XG5pbXBvcnQgb3NMb2NhbGUgPSByZXF1aXJlKCdvcy1sb2NhbGUnKTtcblxudXBkYXRlTm90aWZpZXIoeyBwa2cgfSkubm90aWZ5KCk7XG5cbmxldCBjbGkgPSB5YXJnc1xuXHQub3B0aW9uKCdjd2QnLCB7XG5cdFx0ZGVzYzogYGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnkgb3IgcGFja2FnZSBkaXJlY3RvcnlgLFxuXHRcdG5vcm1hbGl6ZTogdHJ1ZSxcblx0XHRkZWZhdWx0OiBwcm9jZXNzLmN3ZCgpLFxuXHR9KVxuXHQub3B0aW9uKCdza2lwQ2hlY2tXb3Jrc3BhY2UnLCB7XG5cdFx0ZGVzYzogYHRoaXMgb3B0aW9ucyBpcyBmb3Igc2VhcmNoIHlhcm4ubG9jaywgcGtnIHJvb3QsIHdvcmtzcGFjZSByb290LCBub3Qgc2FtZSBhcyAtLWlnbm9yZS13b3Jrc3BhY2Utcm9vdC1jaGVja2AsXG5cdFx0Ym9vbGVhbjogdHJ1ZSxcblx0fSlcblx0Lm9wdGlvbigneXQtZGVidWctbW9kZScsIHtcblx0XHRib29sZWFuOiB0cnVlLFxuXHR9KVxuXHQuY29tbWFuZCh7XG5cdFx0Y29tbWFuZDogJ2hlbHAnLFxuXHRcdGRlc2NyaWJlOiAnU2hvdyBoZWxwJyxcblx0XHRhbGlhc2VzOiBbJ2gnXSxcblx0XHRidWlsZGVyKHlhcmcpXG5cdFx0e1xuXHRcdFx0eWFyZy5zaG93SGVscCgnbG9nJyk7XG5cdFx0XHRyZXR1cm4geWFyZztcblx0XHR9LFxuXHRcdGhhbmRsZXI6IGR1bW15X2hhbmRsZXIsXG5cdH0pXG5cdC5jb21tYW5kKHtcblx0XHRjb21tYW5kOiAndmVyc2lvbicsXG5cdFx0ZGVzY3JpYmU6ICdTaG93IHZlcnNpb24nLFxuXHRcdGJ1aWxkZXIoeWFyZylcblx0XHR7XG5cdFx0XHRyZXR1cm4geWFyZztcblx0XHR9LFxuXHRcdGFzeW5jIGhhbmRsZXIoKVxuXHRcdHtcblx0XHRcdHJldHVybiBpbXBvcnQoJy4uL3BhY2thZ2UuanNvbicpXG5cdFx0XHRcdC50aGVuKHYgPT4gY29uc29sZS5sb2codi52ZXJzaW9uKSlcblx0XHRcdFx0O1xuXHRcdH0sXG5cdH0pXG5cdC5yZWNvbW1lbmRDb21tYW5kcygpXG5cdC5sb2NhbGUob3NMb2NhbGUuc3luYygpKVxuXHQuY29tbWFuZERpcihwYXRoLmpvaW4oX19kaXJuYW1lLCAnY21kcycpKVxuXHQuaGVscCh0cnVlKVxuXHQuc2hvd0hlbHBPbkZhaWwodHJ1ZSlcblx0LnN0cmljdCgpXG5cdC5kZW1hbmRDb21tYW5kKClcbjtcblxuY2xpLmFyZ3Y7XG5cbiJdfQ==