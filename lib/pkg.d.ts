/**
 * Created by user on 2019/5/17.
 */
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { WriteOptions } from 'fs-extra';
export { readPackageJson };
export declare function parsePackageJson(text: string): IPackageJson;
export declare function writePackageJson(file: string, data: any, options?: WriteOptions): void;
export declare function writeJSONSync(file: string, data: any, options?: WriteOptions): void;
