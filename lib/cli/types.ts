/**
 * Created by user on 2019/7/1.
 */

import packageJson = require('package-json');
import { PackageNotFoundError, VersionNotFoundError, FullMetadata, FullVersion } from 'package-json';
import { parseArgvPkgName } from './add';
import Bluebird = require('bluebird');

export async function fetchPackageJsonInfo(packageName: string | ReturnType<typeof parseArgvPkgName>, excludeVersion?: boolean)
{
	let m = (typeof packageName === 'string') ? parseArgvPkgName(packageName) : packageName;

	if (!m)
	{
		return null;
	}

	let { version, name, namespace } = m;

	if (excludeVersion || version === '')
	{
		version = undefined;
	}

	if (namespace)
	{
		name = namespace + '/' + name;
	}

	let pkg: FullVersion = await Bluebird.resolve(packageJson(name, {
			version: (version == null ? 'latest' : version),
			fullMetadata: true,
		}))
		.catch(VersionNotFoundError, err =>
		{
			if (version != null)
			{
				return packageJson(`${m.namespace}${m.name}`, {
					version: 'latest',
					fullMetadata: true,
				})
			}

			return null;
		})
		.catch(PackageNotFoundError, err => null)
	;

	return pkg;
}
