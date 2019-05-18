/**
 * Created by user on 2019/4/30.
 */

import findYarnWorkspaceRoot = require('find-yarn-workspace-root2');
import pkgDir = require('pkg-dir');
import { DiffService } from 'yarn-lock-diff/lib/diff-service';
import { FormatterService } from 'yarn-lock-diff/lib/formatter';
import { Console2 } from 'debug-color2';
import path = require('path');
import fs = require('fs-extra');
import { createFnChalkByConsole } from 'debug-color2/lib/util';

export const console = new Console2();

export const consoleDebug = new Console2(null, {
	label: true,
	time: true,
});

export function findRoot(options: {
	cwd: string,
	skipCheckWorkspace?: boolean | string,
	throwError?: boolean,
}, throwError?: boolean)
{
	if (!options.cwd)
	{
		throw new TypeError(`options.cwd is '${options.cwd}'`)
	}

	let ws: string;

	if (!options.skipCheckWorkspace)
	{
		ws = findYarnWorkspaceRoot(options.cwd);
	}

	let pkg = pkgDir.sync(options.cwd);

	if (pkg == null && (options.throwError || (options.throwError == null && throwError)))
	{
		let err = new TypeError(`can't found package root from target directory '${options.cwd}'`);
		throw err;
	}

	let hasWorkspace = ws && ws != null;
	let isWorkspace = hasWorkspace && ws === pkg;
	let root = hasWorkspace ? ws : pkg;

	return {
		pkg,
		ws,
		hasWorkspace,
		isWorkspace,
		root,
	}
}

export function yarnLockDiff(yarnlock_old: string, yarnlock_new: string): string
{
	let r2: string[] = [];

	let r = DiffService.buildDiff([yarnlock_old], [yarnlock_new])
		.map(FormatterService.buildDiffTable)
		.map(r => r2.push(r))
	;

	return r2[0];
}

export function fsYarnLock(root: string)
{
	let yarnlock_file = path.join(root, 'yarn.lock');

	let yarnlock_exists = fs.existsSync(yarnlock_file);

	let yarnlock_old = yarnlock_exists && fs.readFileSync(yarnlock_file, 'utf8') || null;

	return {
		yarnlock_file,
		yarnlock_exists,
		yarnlock_old,
	}
}

export function lazyFlags(keys: string[], argv: {
	[k: string]: boolean,
})
{
	return keys.map(key => argv[key] && '--' + key)
}

export const chalkByConsole = createFnChalkByConsole(console);

export default exports as typeof import('./index');
