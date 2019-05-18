/**
 * Created by user on 2019/5/17.
 */
/// <reference types="node" />
import { ITSValueOfArray, ITSArrayListMaybeReadonly } from 'ts-type';
export interface IYarnLockfileParseFull<T extends ITSArrayListMaybeReadonly<string> = string[]> {
    type: string;
    object: IYarnLockfileParseObject<T>;
}
export declare type IYarnLockfileParseObject<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<string, IYarnLockfileParseObjectRow<T>>;
export interface IYarnLockfileParseObjectRow<T extends ITSArrayListMaybeReadonly<string> = string[]> {
    version: string;
    resolved: string;
    integrity: string;
    dependencies?: IDependencies<T>;
}
export declare type IDependencies<T extends ITSArrayListMaybeReadonly<string> = string[]> = Record<ITSValueOfArray<T>, string>;
export declare function parseFull(text: string | Buffer): IYarnLockfileParseFull;
export declare function parse(text: string | Buffer): Record<string, IYarnLockfileParseObjectRow<string[]>>;
export declare function stringify(json: object): string;
export declare function readYarnLockfile(file: string): Record<string, IYarnLockfileParseObjectRow<string[]>>;
export declare function stripDepsName(name: string): [string, string];
export declare function filterResolutions<T extends ITSArrayListMaybeReadonly<string>>(pkg: {
    resolutions?: IDependencies<T>;
}, yarnlock: IYarnLockfileParseObject<T>): {
    names: T;
    deps: Record<T[Exclude<keyof T, string | symbol>], Record<string, IYarnLockfileParseObjectRow<string[]>>>;
};
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
}, yarnlock_old: IYarnLockfileParseObject<T>): {
    /**
     * 執行前的 yarn.lock
     */
    yarnlock_old: Record<string, IYarnLockfileParseObjectRow<T>>;
    /**
     * 執行後的 yarn.lock
     */
    yarnlock_new: Record<string, IYarnLockfileParseObjectRow<T>>;
    /**
     * yarn.lock 是否有變動
     */
    yarnlock_changed: boolean;
    result: {
        names: ITSArrayListMaybeReadonly<string>;
        deps: Record<string, Record<string, IYarnLockfileParseObjectRow<string[]>>>;
    };
};
export declare function removeResolutionsCore<T extends ITSArrayListMaybeReadonly<string>>(result: ReturnType<typeof filterResolutions>, yarnlock_old: IYarnLockfileParseObject<T>): {
    /**
     * 執行前的 yarn.lock
     */
    yarnlock_old: Record<string, IYarnLockfileParseObjectRow<T>>;
    /**
     * 執行後的 yarn.lock
     */
    yarnlock_new: Record<string, IYarnLockfileParseObjectRow<T>>;
    /**
     * yarn.lock 是否有變動
     */
    yarnlock_changed: boolean;
    result: {
        names: ITSArrayListMaybeReadonly<string>;
        deps: Record<string, Record<string, IYarnLockfileParseObjectRow<string[]>>>;
    };
};
