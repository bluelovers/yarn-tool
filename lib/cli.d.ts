/**
 * Created by user on 2019/5/17.
 */
import yargs = require('yargs');
import { Argv } from 'yargs';
export declare const cli: yargs.Argv<{
    cwd: string;
} & {
    skipCheckWorkspace: boolean;
}>;
export declare type IMyYargsArgv = typeof cli;
export declare function getYargs<T = IUnpackYargsArgv<IMyYargsArgv>>(): yargs.Argv<T>;
export default cli;
export declare type IUnpackYargsArgv<T extends yargs.Argv> = T extends yargs.Argv<infer U> ? U : never;
export interface ICachedCommond {
    [cmd: string]: yargs.CommandModule;
}
export declare function create_command<T, U extends T>(yarg: yargs.Argv<T>, command: string, handler: (args: yargs.Arguments<U>) => void, builder?: (yarg: yargs.Argv<T>) => yargs.Argv<U>): readonly [(yarg: yargs.Argv<T>) => yargs.Argv<U>, (args: yargs.Arguments<U>) => void];
export declare function call_commond<T, U>(yarg: yargs.Argv<T>, commond: string, argv?: yargs.Arguments<U>): void;
export declare type ICommandModule<T, U> = Omit<yargs.CommandModule<T, U>, 'handler' | 'builder'> & ({
    handler?: yargs.CommandModule<T, U>["handler"];
    builder(args: Argv<T>): Argv<U>;
} | {
    handler: yargs.CommandModule<T, U>["handler"];
    builder?: yargs.CommandModule<T, U>["builder"];
});
export declare function create_command2<T, U extends T = T>(conf: ICommandModule<T, U | T> & {
    yarg?: yargs.Argv<T>;
    desc?: yargs.CommandModule<T, U>["describe"];
}): yargs.CommandModule<T, U>;
