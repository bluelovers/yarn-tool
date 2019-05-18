#!/usr/bin/env node

import 'source-map-support/register';
import yargs = require('yargs');
import updateNotifier = require('update-notifier');
import pkg = require('../package.json');
import path = require('path');
import fs = require('fs-extra');
import crossSpawn = require('cross-spawn-extra');
import { console, consoleDebug, findRoot, fsYarnLock, yarnLockDiff } from '../lib/index';
import { Dedupe, infoFromDedupeCache, wrapDedupe } from '../lib/cli/dedupe';
import { existsDependencies, flagsYarnAdd, listToTypes, setupYarnAddToYargs } from '../lib/cli/add';
import setupYarnInstallToYargs from '../lib/cli/install';
import semver = require('semver');
import setupInitToYargs from 'npm-init2/lib/yargs-setting';
import { sortPackageJson } from 'sort-package-json';

import {
	create_command,
	create_command2,
	dummy_builder,
	getYargs,
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
	removeResolutionsCore, stripDepsName,
} from '../lib/yarnlock';
import { ITSIteratorLazy, ITSValueOfArray } from 'ts-type';
import { setupWorkspacesInitToYargs } from 'create-yarn-workspaces/yargs-setting';
import { checkModileExists, crossSpawnOther, processArgvSlice } from '../lib/spawn';

updateNotifier({ pkg }).notify();

let cli = getYargs()
	.commandDir(path.join(__dirname, 'cmds'))
	.help(true)
	.showHelpOnFail(true)
	.strict()
	.demandCommand()
;

cli.argv;

