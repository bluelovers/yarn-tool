/**
 * Created by user on 2019/5/19.
 */
import { basenameStrip, createCommandModuleExports } from '../../lib/cmd_dir';
import path = require('upath2');
import { consoleDebug, findRoot } from '../../lib/index';
import { readPackageJson } from '@ts-type/package-dts';
import { writePackageJson } from '../../lib/pkg';

import { IUnpackMyYargsArgv } from '../../lib/cmd_dir';
import { crossSpawnOther, processArgvSlice } from '../../lib/spawn';
import { Argv } from 'yargs';

const cmdModule = createCommandModuleExports({

	command: basenameStrip(__filename),
	aliases: ['push'],
	describe: `publish a npm package`,

	builder(yargs)
	{
		return yargs
			.option('tag', {
				desc: `Registers the published package with the given tag, such that \`npm install @\` will install this version. By default, \`npm publish\` updates and \`npm install\` installs the \`latest\` tag.`,

				string: true,
			})
			.option('access', {
				desc: `Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.`,
				string: true,
			})
			.option('otp', {
				desc: `If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.`,
				string: true,
			})
			.option('dry-run', {
				desc: `As of npm@6, does everything publish would do except actually publishing to the registry. Reports the details of what would have been published.`,
				boolean: true,
			})
			;
	},

	handler(argv)
	{
		let cmd_list = processArgvSlice(['publish', 'push']).argv;

		crossSpawnOther('npm', [

			'publish',

			...cmd_list,
		], argv);
	}

});

export = cmdModule
