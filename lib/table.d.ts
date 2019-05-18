/**
 * Created by user on 2019/5/18.
 */
import { IDependency } from './cli/ncu';
import Table = require('cli-table3');
export declare function toDependencyTable(args: {
    from: IDependency;
    to: IDependency;
}): Table.GenericTable<Table.Cell[] | Table.VerticalTableRow | Table.CrossTableRow>;
