/**
 * Created by user on 2019/5/17.
 */
/// <reference types="node" />
import { ITSArrayListMaybeReadonly, ITSValueOfArray } from 'ts-type';
import * as deepDiff from 'deep-diff';
import { Chalk } from 'chalk';
import { IVersionValue } from './cli/ncu';
export interface IYarnLockfileParseFull<T extends ITSArrayListMaybeReadonly<string> = string[]> {
    type: string;
    object: IYarnLockfileParseObject<T>;
}
export declare type IYarnLockfileParseObject<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<string, IYarnLockfileParseObjectRow<T>>;
/**
 * yarn.lock 資料
 */
export interface IYarnLockfileParseObjectRow<T extends ITSArrayListMaybeReadonly<string> = string[]> {
    version: string;
    /**
     * 安裝來源網址
     */
    resolved: string;
    /**
     * hash key
     */
    integrity: string;
    /**
     * 依賴列表
     */
    dependencies?: IDependencies<T>;
}
export declare type IDependencies<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<ITSValueOfArray<T>, string>;
export declare function parseFull(text: string | Buffer): IYarnLockfileParseFull;
export declare function parse(text: string | Buffer): Record<string, IYarnLockfileParseObjectRow<string[]>>;
export declare function stringify(json: IYarnLockfileParseObject): string;
export declare function readYarnLockfile(file: string): Record<string, IYarnLockfileParseObjectRow<string[]>>;
export declare function writeYarnLockfile(file: string, data: IYarnLockfileParseObject): void;
export declare function stripDepsName<T = string>(name: string): [T, IVersionValue];
export interface IFilterResolutions<T extends ITSArrayListMaybeReadonly<string>> {
    /**
     * yarn.lock key 列表
     */
    names: T;
    /**
     * 過濾後的 yarn lock deps
     */
    deps: {
        [P in (keyof ITSValueOfArray<T> | string)]: {
            [P in IVersionValue]: IYarnLockfileParseObjectRow<T>;
        };
    };
    /**
     * 實際安裝的版本編號
     */
    installed?: {
        [P in ITSValueOfArray<T>]: IVersionValue[];
    };
    /**
     * 每個模組最大的安裝版本
     */
    max?: {
        [P in ITSValueOfArray<T>]: {
            key: ITSValueOfArray<T>;
            value: IYarnLockfileParseObjectRow<T>;
        };
    };
}
export declare function filterResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
    resolutions?: IDependencies<T>;
}, yarnlock: IYarnLockfileParseObject<T>): IFilterResolutions<T>;
export interface IRemoveResolutions<T extends ITSArrayListMaybeReadonly<string>> {
    /**
     * 執行前的 yarn.lock
     */
    yarnlock_old: IYarnLockfileParseObject<T>;
    /**
     * 執行後的 yarn.lock
     */
    yarnlock_new: IYarnLockfileParseObject<T>;
    /**
     * yarn.lock 是否有變動
     */
    yarnlock_changed: boolean;
    result: IFilterResolutions<T>;
}
/**
 *
 * @example ```
 let pkg = readPackageJson('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/package.json');

 let y = readYarnLockfile('G:/Users/The Project/nodejs-yarn/ws-create-yarn-workspaces/yarn.lock')

 console.dir(removeResolutions(pkg, y), {
    depth: null,
});
 ```
 */
export declare function removeResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
    resolutions?: IDependencies<T>;
}, yarnlock_old: IYarnLockfileParseObject<T>): IRemoveResolutions<T>;
export declare function removeResolutionsCore<T extends ITSArrayListMaybeReadonly<string>>(result: IFilterResolutions<T>, yarnlock_old: IYarnLockfileParseObject<T>): IRemoveResolutions<T>;
export declare function yarnLockDiff(yarnlock_old: string, yarnlock_new: string): string;
export declare function _diffArray(array: deepDiff.DiffArray<{}, {}>, chalk: Chalk): string[];
