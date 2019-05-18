/**
 * Created by user on 2019/5/17.
 */
import yargs = require('yargs');
export declare const cli: yargs.Argv<{
    cwd: string;
} & {
    skipCheckWorkspace: boolean;
}>;
export declare type IMyYargsArgv = typeof cli;
export declare type IUnpackMyYargsArgv = {
    cwd: string;
    skipCheckWorkspace: boolean;
};
export declare function getYargs(): yargs.Argv<IUnpackMyYargsArgv>;
export default cli;
export declare type IUnpackYargsArgv<T extends yargs.Argv> = T extends yargs.Argv<infer U> ? U : never;
export interface ICachedCommond {
    [cmd: string]: yargs.CommandModule;
}
export declare function dummy_builder<T>(yarg: T): T;
export declare function dummy_handler<T>(args: yargs.Arguments<T>): any;
export declare function create_command<T, U extends T>(yarg: yargs.Argv<T>, command: string, handler: (args: yargs.Arguments<U>) => void, builder?: (yarg: yargs.Argv<T>) => yargs.Argv<U>): readonly [(yarg: yargs.Argv<T>) => yargs.Argv<U>, (args: yargs.Arguments<U>) => void];
export declare function call_commond<T, U>(yarg: yargs.Argv<T>, commond: string, argv?: yargs.Arguments<U>): void;
export declare type ICommandBuilder<T, U> = (args: yargs.Argv<T>) => yargs.Argv<IUnpackMyYargsArgv & U>;
export declare type ICommandModule<T, U = IUnpackMyYargsArgv> = {
    command?: ReadonlyArray<string> | string;
    aliases?: ReadonlyArray<string> | string;
    describe?: string | false;
    builder?: ICommandBuilder<T, U>;
    handler(args: yargs.Arguments<IUnpackMyYargsArgv & U>): any;
};
export declare function create_command2<U extends any>(conf: ICommandModule<IUnpackMyYargsArgv, U> & {
    desc?: ICommandModule<IUnpackMyYargsArgv, U>["describe"];
}): yargs.CommandModule<IUnpackMyYargsArgv, U>;
