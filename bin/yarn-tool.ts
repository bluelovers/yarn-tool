#!/usr/bin/env node


import yargs from 'yargs';
import path from 'upath2';
import osLocale from 'os-locale';
import { updateNotifier } from '@yarn-tool/update-notifier';
import { fsYarnLock } from '../lib/fsYarnLock';
import { osLocaleSync } from '../lib/osLocaleSync';

if (path.extname(__filename) === '.js' && !process.argv.filter(v => {
	if (typeof v === 'string')
	{
		return v.includes('ts-node') || v.includes('source-map-support')
	}
}).length)
{
	require('source-map-support').install({
		hookRequire: true
	});
}

updateNotifier(path.join(__dirname, '..'));

let cli = yargs
	.option('cwd', {
		desc: `current working directory or package directory`,
		normalize: true,
		default: process.cwd(),
	})
	.option('skipCheckWorkspace', {
		alias: ['W'],
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
	.locale(osLocaleSync())
	.commandDir(path.join(__dirname, 'cmds'))
	.help(true)
	.showHelpOnFail(true)
	.strict()
	.demandCommand()
	.scriptName('yt')
;

cli.argv;

