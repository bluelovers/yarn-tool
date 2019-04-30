/**
 * Created by user on 2019/4/30.
 */
import { lazyFlags } from '../index';

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

export default flagsYarnAdd;
