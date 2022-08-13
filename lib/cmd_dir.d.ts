/// <reference types="node" />
import { Arguments, Argv, CommandModule, Options } from 'yargs';
import { SpawnSyncOptions } from 'cross-spawn-extra/type';
export interface IUnpackMyYargsArgv {
    cwd: string;
    skipCheckWorkspace?: boolean;
    ytDebugMode?: boolean;
}
export type IUnpackMyYargsArgvPartial = Partial<IUnpackMyYargsArgv>;
export type IUnpackYargsArgv<T extends Argv, D = any> = T extends Argv<infer U> ? U : D;
export type ICommandBuilderFn<T = object, U = object> = (args: Argv<T>) => Argv<U>;
export interface ICommandBuilderObject<T = object, U = object> {
    [key: string]: Options;
}
export type ICommandModuleOmit<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends {} = IUnpackMyYargsArgvPartial> = Omit<CommandModule, 'handler' | 'builder'>;
export type ICommandModuleExports<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv> = ICommandModuleOmit & ({
    builder(args: Argv<T>): Argv<U>;
    handler(args: Arguments<U>): any;
} | {
    builder: ICommandBuilderObject;
    handler(args: Arguments<U>): any;
} | {
    handler(args: Arguments<T>): any;
} | {
    builder(args: Argv<T>): Argv<U>;
});
export declare function createCommandModuleExports<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv>(module: ICommandModuleExports<T, U>): CommandModule<T, U>;
export declare function _dummyBuilder<T extends {}>(yarg: Argv<T>): Argv<T>;
export declare function _dummyHandler<T extends {}>(args: Arguments<T>): any;
export declare function basenameStrip(name: string): string;
export declare function commandDirStrip(name: string, suffix?: string): string;
export declare function commandDirJoin(root: string, name: string, suffix?: string): string;
export declare function lazySpawnArgvSlice(options: {
    bin: string;
    command: string | string[];
    cmd?: string | string[];
    argv: {
        cwd: string;
    };
    crossSpawnOptions?: SpawnSyncOptions;
}): import("cross-spawn-extra").SpawnSyncReturns<Buffer>;
