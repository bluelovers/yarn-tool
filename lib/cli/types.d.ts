/**
 * Created by user on 2019/7/1.
 */
import packageJson = require('package-json');
import { parseArgvPkgName } from './add';
export declare function fetchPackageJsonInfo(packageName: string | ReturnType<typeof parseArgvPkgName>, excludeVersion?: boolean): Promise<packageJson.FullVersion>;
