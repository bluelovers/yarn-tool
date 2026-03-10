/**
 * Created by user on 2026/3/10.
 */
import { EnumPackageManager, IPackageManager } from '@yarn-tool/detect-package-manager';
import { ICliMainArgv } from './argv';
export declare function detectPackageManager(argv?: ICliMainArgv): {
    npmClients: EnumPackageManager.yarn | EnumPackageManager.pnpm;
    pmMap: Record<IPackageManager | "lerna" | "corepack", string>;
    pmIsYarn: boolean;
};
