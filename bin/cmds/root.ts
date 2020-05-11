/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports, lazySpawnArgvSlice } from '../../lib/cmd_dir';
import path = require('upath2');
import { chalkByConsole, consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';
import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { processArgvSlice } from '../../lib/spawn';
import { spawnWsRootRunSync, spawnWsRootExecSync } from 'ws-root-spawn';
import {
	console,
} from '../../lib/index';
import findWorkspaceRoot from 'find-yarn-workspace-root2/core';

const command = basenameStrip(__filename);

const cmdModule = createCommandModuleExports({

	command,
	//aliases: [],
	describe: `run/exec in workspaces root`,

	builder(yargs)
	{
		return yargs
			.option('silent', {
				alias: ['s'],
				description: `skip Yarn console logs, other types of logs (script output) will be
printed`,
				boolean: true,
			})
			.example(`yarn-tool root run test`, `run in workspaces root`)
			.example(`yarn-tool root exec node -v`, `exec in workspaces root`)
			.help(true)
			.version(false)
			.strict(false)
	},

	handler(argv)
	{
		let cmd_list = processArgvSlice(command).argv;
		let cmd = cmd_list[0];

		let cwd = argv.cwd;
		let root = findWorkspaceRoot(cwd);

		if (!argv.silent)
		{
			if (cwd)
			{
				consoleDebug.info(`cwd: ${cwd}`)
			}

			if (cwd !== root)
			{
				consoleDebug.info(`root: ${root}`)
			}
		}

		if (cmd === 'run')
		{
			let cp = spawnWsRootRunSync(cmd_list.slice(1), {
				cwd: root,
			})
			if (cp.status)
			{
				!argv.silent && consoleDebug.error(`Command failed with exit code ${cp.status}.`)
				process.exit(cp.status)
			}
		}
		else if (cmd === 'exec')
		{
			let cp = spawnWsRootExecSync(cmd_list.slice(1), {
				cwd: root,
			})
			if (cp.status)
			{
				!argv.silent && consoleDebug.error(`Command failed with exit code ${cp.status}.`)
				process.exit(cp.status)
			}
		}
		else
		{
			consoleDebug.error(`not support this command: ${cmd}`)
			process.exit(1)
		}
	},

});

export = cmdModule
