#!/usr/bin/env node


import yargs = require('yargs');
//import updateNotifier = require('update-notifier');
//import pkg = require('../package.json');
import path = require('upath2');
import fs = require('fs-extra');
import crossSpawn = require('cross-spawn-extra');
import { console, consoleDebug, findRoot, fsYarnLock} from '../lib/index';
import { Dedupe, infoFromDedupeCache, wrapDedupe } from '../lib/cli/dedupe';
import { existsDependencies, flagsYarnAdd, listToTypes, setupYarnAddToYargs } from '../lib/cli/add';
import setupYarnInstallToYargs from '../lib/cli/install';
import semver = require('semver');
import setupInitToYargs from 'npm-init2/lib/yargs-setting';
import { sortPackageJson } from 'sort-package-json';

import {
	create_command,
	create_command2,
	dummy_builder, dummy_handler,
	IUnpackMyYargsArgv,
	IUnpackYargsArgv,
} from '../lib/cli';
import { readPackageJson, writeJSONSync, writePackageJson } from '../lib/pkg';
import IPackageJson from '@ts-type/package-dts/package-json';
import setupNcuToYargs, { npmCheckUpdates } from '../lib/cli/ncu';
import {
	filterResolutions,
	IDependencies,
	IYarnLockfileParseObjectRow,
	parse as parseYarnLock,
	stringify as stringifyYarnLock,
	removeResolutionsCore, stripDepsName, yarnLockDiff,
} from '../lib/yarnlock';
import { ITSIteratorLazy, ITSValueOfArray } from 'ts-type';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../lib/spawn';
import osLocale = require('os-locale');
import { updateNotifier } from '../lib/update-notifier';
//import isNpx = require('is-npx');

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

updateNotifier();

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
	.scriptName('yt')
;

cli.argv;

