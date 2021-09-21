/**
 * Created by user on 2019/4/30.
 */
import { Argv } from 'yargs';
export * from '@yarn-tool/ncu';
import { setupNcuToYargs } from '@yarn-tool/ncu';
export declare function setupNcuToYargs2<T extends any>(yargs: Argv<T>): Argv<T & {
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
} & {
    resolutions: boolean;
} & {
    "no-safe": boolean;
}>;
export default setupNcuToYargs;
