import { Arguments, Argv, CommandModule, Options } from 'yargs';
import { SpawnSyncOptions } from 'cross-spawn-extra';
/**
 * Yargs 參數解包接口
 * Yargs argument unpacking interface
 */
export interface IUnpackMyYargsArgv {
    cwd: string;
    skipCheckWorkspace?: boolean;
    ytDebugMode?: boolean;
}
/**
 * 部分 Yargs 參數解包類型
 * Partial Yargs argument unpacking type
 */
export type IUnpackMyYargsArgvPartial = Partial<IUnpackMyYargsArgv>;
/**
 * 從 Yargs Argv 類型中提取實際參數類型
 * Extract actual argument type from Yargs Argv type
 */
export type IUnpackYargsArgv<T extends Argv, D = any> = T extends Argv<infer U> ? U : D;
/**
 * 命令構建器函數類型
 * Command builder function type
 */
export type ICommandBuilderFn<T = object, U = object> = (args: Argv<T>) => Argv<U>;
/**
 * 命令構建器對象接口
 * Command builder object interface
 */
export interface ICommandBuilderObject<T = object, U = object> {
    [key: string]: Options;
}
/**
 * 命令模組省略類型
 * Command module omit type
 */
export type ICommandModuleOmit<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends {} = IUnpackMyYargsArgvPartial> = Omit<CommandModule, 'handler' | 'builder'>;
/**
 * 命令模組導出類型
 * Command module export type
 */
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
/**
 * 創建命令模組導出對象
 * Create command module export object
 * @param module 命令模組配置
 * @returns 命令模組
 */
export declare function createCommandModuleExports<T extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv, U extends IUnpackMyYargsArgvPartial = IUnpackMyYargsArgv>(module: ICommandModuleExports<T, U>): CommandModule<T, U>;
/**
 * 預設命令構建器
 * Default command builder
 * @param yarg Yargs 實例
 * @returns 原始 Yargs 實例
 */
export declare function _dummyBuilder<T extends {}>(yarg: Argv<T>): Argv<T>;
/**
 * 預設命令處理器
 * Default command handler
 * @param args 命令參數
 * @returns 原始參數
 */
export declare function _dummyHandler<T extends {}>(args: Arguments<T>): any;
/**
 * 去除文件擴展名的文件名
 * Filename without extension
 * @param name 文件名
 * @returns 去除擴展名的文件名
 */
export declare function basenameStrip(name: string): string;
/**
 * 命令目錄名稱處理
 * Command directory name processing
 * @param name 目錄名稱
 * @param suffix 後綴
 * @returns 處理後的目錄名稱
 */
export declare function commandDirStrip(name: string, suffix?: string): string;
/**
 * 命令目錄路徑組合
 * Command directory path joining
 * @param root 根目錄
 * @param name 目錄名稱
 * @param suffix 後綴
 * @returns 組合後的路徑
 */
export declare function commandDirJoin(root: string, name: string, suffix?: string): string;
/**
 * 懶加載子進程參數切片
 * Lazy load child process argument slicing
 * @param options 選項配置
 * @returns 子進程執行結果
 */
export declare function lazySpawnArgvSlice(options: {
    bin: string;
    command: string | string[];
    cmd?: string | string[];
    argv: {
        cwd: string;
    };
    crossSpawnOptions?: SpawnSyncOptions;
    fnCmdList?(cmd_list: string[]): string[];
}): import("cross-spawn-extra").SpawnSyncReturns<Buffer<ArrayBufferLike>>;
