/**
 * Created by user on 2019/5/18.
 */
import { IDependency } from './cli/ncu';
import Table = require('cli-table3');
import { IStylesColorNames } from 'debug-color2/lib/styles';
export declare function createDependencyTable(): Table.Table;
export declare function toDependencyTable(args: {
    from: IDependency;
    to: IDependency;
}): Table.Table;
export declare function colorizeDiff(from: string, to: string, _colors?: [
    IStylesColorNames,
    IStylesColorNames,
    IStylesColorNames
], con?: import("debug-color2").Console2): string;
