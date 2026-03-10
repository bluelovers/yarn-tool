import yargs from 'yargs';
import { IUnpackYargsArgv } from './cmd_dir';
export type ICliMainArgv = IUnpackYargsArgv<ReturnType<typeof cliArgv>>;
export declare function cliArgv(): yargs.Argv<{
    cwd: string;
} & {
    skipCheckWorkspace: boolean;
} & {
    "yt-debug-mode": boolean;
} & {
    npmClients: string;
}>;
