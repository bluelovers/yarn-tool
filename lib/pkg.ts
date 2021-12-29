/**
 * Created by user on 2019/5/17.
 */

import * as fs from 'fs-extra';
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { IWriteOptions, writeJSONSync as _writeJSONSync } from '@bluelovers/fs-json';

export { readPackageJson }

export function parsePackageJson(text: string): IPackageJson
{
	return JSON.parse(text);
}

export function writePackageJson(file: string, data, options: IWriteOptions = {})
{
	let { spaces = 2 } = options;

	return _writeJSONSync(file, data, {
		...options,
		spaces
	});
}

export function writeJSONSync(file: string, data, options: IWriteOptions = {})
{
	let { spaces = 2 } = options;

	return fs.writeJSONSync(file, data, {
		...options,
		spaces
	});
}
