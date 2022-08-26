/**
 * Created by user on 2019/5/17.
 */
import yargs = require('yargs');
import { IUnpackMyYargsArgv } from './cmd_dir';
export { IUnpackMyYargsArgv };
export type IUnpackYargsArgv<T extends yargs.Argv> = T extends yargs.Argv<infer U> ? U : never;
export interface ICachedCommond {
    [cmd: string]: yargs.CommandModule;
}
export declare function dummy_builder<T extends {}>(yarg: yargs.Argv<T>): yargs.Argv<T>;
export declare function dummy_handler<T extends {}>(args: yargs.Arguments<T>): any;
export declare function create_command<T, U extends T>(yarg: yargs.Argv<T>, command: string, handler: (args: yargs.Arguments<U>) => void, builder?: (yarg: yargs.Argv<T>) => yargs.Argv<U>): readonly [(yarg: yargs.Argv<T>) => yargs.Argv<U>, (args: yargs.Arguments<U>) => void];
export declare function call_commond<T, U>(yarg: yargs.Argv<T>, commond: string, argv?: yargs.Arguments<U>): void | Promise<void>;
export type ICommandBuilder<T extends {}, U extends {}> = (args: yargs.Argv<T>) => yargs.Argv<IUnpackMyYargsArgv & U>;
export type ICommandModule<T extends {}, U extends {} = IUnpackMyYargsArgv> = {
    command?: ReadonlyArray<string> | string;
    aliases?: ReadonlyArray<string> | string;
    describe?: string | false;
    builder?: ICommandBuilder<T, U>;
    handler(args: yargs.Arguments<IUnpackMyYargsArgv & U>): any;
};
export declare function create_command2<U extends {}>(conf: ICommandModule<IUnpackMyYargsArgv, U> & {
    desc?: ICommandModule<IUnpackMyYargsArgv, U>["describe"];
}): yargs.CommandModule<IUnpackMyYargsArgv, U>;
