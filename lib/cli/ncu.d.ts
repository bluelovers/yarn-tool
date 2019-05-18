/**
 * Created by user on 2019/4/30.
 */
import { IWrapDedupeCache } from './dedupe';
import IPackageJson from '@ts-type/package-dts/package-json';
import { Argv } from 'yargs';
import { IUnpackYargsArgv } from '../cli';
export declare type IOptions = IUnpackYargsArgv<ReturnType<typeof setupNcuToYargs>> & {
    json_old: IPackageJson;
    cwd?: string;
    packageData?: string;
    packageManager?: 'npm' | 'bower';
    json_new?: IPackageJson;
    json_changed?: boolean;
    list_updated?: Record<string, string>;
    loglevel?: 'silent' | 'verbose';
    current?: IDependency;
};
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
export declare type IDependency = Record<string, string>;
export default setupNcuToYargs;
