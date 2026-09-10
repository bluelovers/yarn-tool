/**
 * Created by user on 2026/3/10.
 */

import {
	_whichPackageManagerSyncGenerator,
	EnumPackageManager,
	IPackageManager,
} from '@yarn-tool/detect-package-manager';
import { ICliMainArgv } from './argv';

export type IDetectPackageManagerResult = {
	npmClients: EnumPackageManager.yarn | EnumPackageManager.pnpm;
	pmMap: Record<IPackageManager | "lerna" | "corepack", string>;
	pmIsYarn: boolean;
}

let _cachedDetectPackageManager: Record<EnumPackageManager, IDetectPackageManagerResult> = {} as any;

export function detectPackageManager(argv?: Pick<ICliMainArgv, 'npmClients'>): IDetectPackageManagerResult
{
	let input = argv?.npmClients;

	if (_cachedDetectPackageManager[input])
	{
		return _cachedDetectPackageManager[input]!;
	}

	const pmMap: Record<IPackageManager | 'lerna' | 'corepack', string> = {} as any;

	for (const client of _whichPackageManagerSyncGenerator([
		input,
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

	const result = _cachedDetectPackageManager[input] = {
		npmClients,
		pmMap,
		pmIsYarn: npmClients === EnumPackageManager.yarn,
	};

	return result!;
}
