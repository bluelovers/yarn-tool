/**
 * Created by user on 2019/4/30.
 */
import { IWrapDedupeCache } from './dedupe';
import IPackageJson from '@ts-type/package-dts/package-json';
import { Argv } from 'yargs';
import { IUnpackYargsArgv } from '../cli';
import Bluebird = require('bluebird');
import { IYarnLockfileParseObject } from '../yarnlock';
export declare type IVersionValue = 'latest' | '*' | string | EnumVersionValue | EnumVersionValue2;
export interface IVersionCacheMapKey {
    name: string;
    versionTarget: EnumVersionValue;
    version_old: IVersionValue;
}
export declare enum EnumVersionValue {
    'major' = "major",
    'minor' = "minor",
    'latest' = "latest",
    'greatest' = "greatest",
    'newest' = "newest"
}
export declare enum EnumPackageManagersNpmMethod {
    'major' = "greatestMajor",
    'minor' = "greatestMinor",
    'latest' = "latest",
    'greatest' = "greatest",
    'newest' = "newest"
}
export declare const enum EnumVersionValue2 {
    any = "*"
}
export declare type IDependency = IPackageMap;
export interface IPackageMap {
    [name: string]: IVersionValue;
}
export interface IVersionCacheMapValue extends IVersionCacheMapKey {
    version_new: IVersionValue;
}
export declare const versionCacheMap: Map<string, IVersionCacheMapValue>;
export declare type IOptions = IUnpackYargsArgv<ReturnType<typeof setupNcuToYargs>> & {
    json_old: IPackageJson;
    cwd?: string;
    packageData?: string;
    packageManager?: 'npm' | 'bower';
    json_new?: IPackageJson;
    json_changed?: boolean;
    list_updated?: Record<string, string>;
    loglevel?: 'silent' | 'verbose';
    semverLevel?: EnumVersionValue.major | EnumVersionValue.minor;
    versionTarget?: EnumVersionValue;
    current?: IDependency;
};
export declare function getVersionTarget(options: Partial<IOptions> | string | IOptions['versionTarget']): IOptions['versionTarget'];
export declare function objVersionCache({ name, versionTarget, version_old, }: IVersionCacheMapKey): IVersionCacheMapKey;
export declare function objVersionCacheValue({ name, versionTarget, version_old, version_new, }: IVersionCacheMapValue): IVersionCacheMapValue;
export declare function strVersionCache(key: IVersionCacheMapKey): string;
export declare function hasQueryedVersionCache(key: IVersionCacheMapKey): boolean;
export declare function keyObjectToPackageMap(obj: IVersionCacheMapKey[] | IVersionCacheMapValue[], useVarsionNew?: boolean): IPackageMap;
export declare function packageMapToKeyObject(packageMap: IPackageMap, versionTarget: IVersionCacheMapKey["versionTarget"]): IVersionCacheMapKey[];
export declare function queryPackageManagersNpm(name: string, version?: IVersionValue, versionTarget?: EnumVersionValue): Bluebird<IVersionValue>;
export declare function setVersionCacheMap(data: IVersionCacheMapValue): Map<string, IVersionCacheMapValue>;
export declare function queryRemoteVersions(packageMap: IPackageMap | string[], options?: Partial<IOptions>): Bluebird<IVersionCacheMapValue[]>;
export declare function isBadVersion(version: IVersionValue): boolean;
export declare function npmCheckUpdates<C extends IWrapDedupeCache>(cache: Partial<C>, ncuOptions: IOptions): Promise<IOptions>;
export declare function setupNcuToYargs<T extends any>(yargs: Argv<T>): Argv<import("yargs").Omit<T, "dep"> & {
    dep: string;
} & {
    minimal: boolean;
} & {
    newest: boolean;
} & {
    packageManager: string;
} & {
    registry: string;
} & {
    silent: boolean;
} & {
    greatest: boolean;
} & {
    upgrade: boolean;
} & {
    semverLevel: string;
} & {
    removeRange: boolean;
} & {
    dedupe: boolean;
}>;
export declare function checkResolutionsUpdate(resolutions: IPackageMap, yarnlock_old_obj: IYarnLockfileParseObject | string, options?: Partial<IOptions>): Bluebird<{
    yarnlock_old_obj: Record<string, import("../yarnlock").IYarnLockfileParseObjectRow<string[]>>;
    yarnlock_new_obj: {
        [x: string]: import("../yarnlock").IYarnLockfileParseObjectRow<string[]>;
    };
    update_list: string[];
    yarnlock_changed: boolean;
    deps: IVersionCacheMapValue[];
    deps2: IPackageMap;
}>;
export default setupNcuToYargs;
