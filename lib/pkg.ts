/**
 * Created by user on 2019/5/17.
 */

import fs = require('fs-extra');
import IPackageJson, { readPackageJson } from '@ts-type/package-dts';
import { WriteOptions } from 'fs-extra';

export { readPackageJson }

export function parsePackageJson(text: string): IPackageJson
{
	return JSON.parse(text);
}

export function writeJSONSync(file: string, data, options: WriteOptions = {})
{
	let { spaces = 2 } = options;

	return fs.writeJSONSync(file, data, {
		...options,
		spaces
	});
}
