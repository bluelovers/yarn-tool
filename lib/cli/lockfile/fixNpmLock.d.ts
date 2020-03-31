export interface INpmLock {
    "name": string;
    "version": string;
    "lockfileVersion": number;
    "requires": boolean;
    "dependencies": {
        [name: string]: INpmLockEntry;
    };
}
export interface INpmLockEntry {
    "version": string;
    "requires"?: {
        [name: string]: string;
    };
    dependencies?: {
        [name: string]: INpmLockEntry;
    };
}
export declare function fixNpmLock(npmLock: INpmLock | INpmLockEntry): INpmLock | INpmLockEntry;
export declare function sortDeps<T>(record: Record<string, T>): string[];
export default fixNpmLock;
