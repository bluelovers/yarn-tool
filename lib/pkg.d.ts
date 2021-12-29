/**
 * Created by user on 2019/5/17.
 */
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { IWriteOptions } from '@bluelovers/fs-json';
export { readPackageJson };
export declare function parsePackageJson(text: string): IPackageJson;
export declare function writePackageJson(file: string, data: any, options?: IWriteOptions): void;
export declare function writeJSONSync(file: string, data: any, options?: IWriteOptions): void;
