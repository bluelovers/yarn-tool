/**
 * Created by user on 2019/4/30.
 */
import { lazyFlags } from '../index';
import { Argv, Omit } from 'yargs';
import { array_unique, array_unique_overwrite } from 'array-hyper-unique';

export function flagsYarnAdd(argv: {
	[k: string]: boolean,
}): string[]
{
	return lazyFlags([
		'dev',
		'peer',
		'optional',
		'exact',
		'tilde',
		'ignore-workspace-root-check',
		'audit',
	], argv)
}

export function setupYarnAddToYargs<T extends any>(yargs: Argv<T>)
{
	return yargs
		.option('dev', {
			alias: 'D',
			desc: `install packages to devDependencies.`,
			boolean: true,
		})
		.option('peer', {
			alias: 'P',
			desc: `install packages to peerDependencies.`,
			boolean: true,
		})
		.option('optional', {
			alias: 'O',
			desc: `install packages to optionalDependencies.`,
			boolean: true,
		})
		.option('exact', {
			alias: 'E',
			desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
			boolean: true,
		})
		.option('tilde', {
			alias: 'T',
			desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
			boolean: true,
		})
		.option('audit', {
			desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
			boolean: true,
		})
		.option(`name`, {
			type: 'string',
			demandOption: true,
		})
		.option('dedupe', {
			alias: ['d'],
			desc: `Data deduplication for yarn.lock`,
			boolean: true,
			default: true,
		})
		.option('ignore-workspace-root-check', {
			alias: ['W'],
			desc: `see https://yarnpkg.com/lang/en/docs/cli/add/`,
			boolean: true,
		})
}

export function parseArgvPkgName(input: string)
{
	let m = input.match(/^(?:(@[^\/]+)\/)?([^@]+)(?:@(.+))?$/);

	if (m)
	{
		return {
			input,
			namespace: m[1],
			name: m[2],
			version: m[3],
		}
	}
}

export function listToTypes(input: string[])
{
	return array_unique_overwrite(input.reduce(function (a, b)
	{
		let m = parseArgvPkgName(b);

		if (m && !m.namespace && m.name)
		{
			a.push(`@types/${m.name}`)
		}

		return a;
	}, [] as string[]));
}

export function existsDependencies(name: string,
	pkg: Record<'dependencies' | 'devDependencies' | 'optionalDependencies', Record<string, string>>,
)
{
	return pkg.dependencies[name]
		|| pkg.devDependencies[name]
		|| pkg.optionalDependencies[name]
	;
}

export default flagsYarnAdd;
