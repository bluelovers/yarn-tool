/**
 * Created by user on 2026/3/10.
 */

import {
	_whichPackageManagerSyncGenerator,
	EnumPackageManager,
	IPackageManager,
} from '@yarn-tool/detect-package-manager';
import { ICliMainArgv } from './argv';

export function detectPackageManager(argv?: ICliMainArgv)
{
	const pmMap: Record<IPackageManager | 'lerna' | 'corepack', string> = {} as any;

	for (const client of _whichPackageManagerSyncGenerator([
		argv?.npmClients,
		EnumPackageManager.pnpm,
		'lerna' as any,
		EnumPackageManager.yarn,
		'corepack' as any,
	], {
		returnDefault: true,
		noUseDefaultClients: true,
	}))
	{
		pmMap[client[0]] = client[1];
	}

	const npmClients = EnumPackageManager.pnpm in pmMap
		? EnumPackageManager.pnpm as const
		: EnumPackageManager.yarn as const
	;

	return {
		npmClients,
		pmMap,
		pmIsYarn: npmClients === EnumPackageManager.yarn,
	}
}
