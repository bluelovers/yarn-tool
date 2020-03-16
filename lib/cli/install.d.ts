import { Argv } from 'yargs';
export declare function setupYarnInstallToYargs<T extends any>(yargs: Argv<T>): Argv<T & {
    "check-files": boolean;
} & {
    flat: boolean;
} & {
    force: boolean;
} & {
    har: boolean;
} & {
    "ignore-scripts": boolean;
} & {
    "modules-folder": string;
} & {
    "no-lockfile": boolean;
} & {
    production: boolean;
} & {
    "pure-lockfile": boolean;
} & {
    focus: boolean;
} & {
    "frozen-lockfile": boolean;
} & {
    silent: boolean;
} & {
    "ignore-engines": boolean;
} & {
    "ignore-optional": boolean;
} & {
    offline: boolean;
} & {
    "non-interactive": boolean;
} & {
    "update-checksums": boolean;
} & {
    audit: boolean;
} & {
    "no-bin-links": boolean;
} & {
    "link-duplicates": boolean;
}>;
export default setupYarnInstallToYargs;
