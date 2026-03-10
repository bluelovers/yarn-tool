import { Argv } from 'yargs';
/**
 * 設置 Yarn 安裝命令的 Yargs 選項
 * Setup Yargs options for Yarn install command
 *
 * @param yargs Yargs 實例
 * @returns 配置了選項的 Yargs 實例
 */
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
/**
 * 預設導出 Yarn 安裝命令配置函數
 * Default export of Yarn install command configuration function
 */
export default setupYarnInstallToYargs;
