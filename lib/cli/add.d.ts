import { Argv, Omit } from 'yargs';
import IPackageJson from '@ts-type/package-dts/package-json';
export declare function flagsYarnAdd(argv: {
    [k: string]: boolean;
}): string[];
export declare function setupYarnAddToYargs<T extends any>(yargs: Argv<T>): Argv<Omit<T, "dev"> & {
    dev: boolean;
} & {
    peer: boolean;
} & {
    optional: boolean;
} & {
    exact: boolean;
} & {
    tilde: boolean;
} & {
    audit: boolean;
} & {
    name: string;
} & {
    dedupe: boolean;
} & {
    "ignore-workspace-root-check": boolean;
}>;
export declare function parseArgvPkgName(input: string): {
    input: string;
    namespace: string;
    name: string;
    version: string;
};
export declare function listToTypes(input: string[], includeVersion?: boolean): string[];
export declare function existsDependencies(name: string, pkg: IPackageJson | Partial<Record<'dependencies' | 'devDependencies' | 'optionalDependencies', Record<string, string>>>): string;
export default flagsYarnAdd;
