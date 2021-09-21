/**
 * Created by user on 2019/4/30.
 */

import { Argv } from 'yargs';

export * from '@yarn-tool/ncu';
import { setupNcuToYargs } from '@yarn-tool/ncu';

export function setupNcuToYargs2<T extends any>(yargs: Argv<T>)
{
	return setupNcuToYargs(yargs)
			.option('resolutions', {
				alias: ['R'],
				desc: 'do with resolutions only',
				boolean: true,
			})
			.option('no-safe', {
				boolean: true,
			})
			.example(`$0 ncu -u`, `check new version and update package.json`)
			.example(`$0 ncu -R`, `check new version of resolutions in package.json`)
			.example(`$0 ncu -u -R`, `check new version of resolutions in package.json and update package.json`)
}

export default setupNcuToYargs
