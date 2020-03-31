/**
 * Created by user on 2020/3/31.
 */
import naturalCompare = require('string-natural-compare');

export interface INpmLock
{
	"name": string,
	"version": string,
	"lockfileVersion": number,
	"requires": boolean,
	"dependencies": {
		[name: string]: INpmLockEntry
	},
}

export interface INpmLockEntry
{
	"version": string,
	"requires"?: {
		[name: string]: string
	},
	dependencies?: {
		[name: string]: INpmLockEntry
	}
}

export function fixNpmLock(npmLock: INpmLock | INpmLockEntry)
{
	if (npmLock.dependencies && typeof npmLock.dependencies === 'object')
	{
		let keys = sortDeps(npmLock.dependencies);

		for (let key of keys)
		{
			if (key === 'dependencies')
			{
				delete npmLock.dependencies[key];
				continue;
			}

			let entry = npmLock.dependencies[key];

			fixNpmLock(entry);
		}
	}

	if (npmLock.requires && typeof npmLock.requires === 'object')
	{
		sortDeps(npmLock.requires);
	}

	// @ts-ignore
	//delete npmLock.resolved;
	// @ts-ignore
	//delete npmLock.integrity;

	return npmLock
}

export function sortDeps<T>(record: Record<string, T>)
{
	let keys = Object.keys(record)
		.sort((a, b) =>
		{

			let at1 = a.startsWith('@') ? 1 : 0;
			let at2 = b.startsWith('@') ? 1 : 0;

			let c = (at2 - at1)

			return c || naturalCompare(a, b)
		})
	;

	for (let key of keys)
	{
		let old = record[key];

		delete record[key]
		record[key] = old;
	}

	return keys
}

export default fixNpmLock
