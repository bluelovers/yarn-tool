/**
 * yarn-tool 主模組入口文件
 * Main module entry file for yarn-tool
 *
 * @author user
 * @created 2019/4/30
 */

import { normalize, join } from 'upath2';

/**
 * yarn-tool 項目的根目錄路徑
 * Root directory path of the yarn-tool project
 */
export const YT_ROOT = normalize(__dirname);

/**
 * yarn-tool 可執行文件的路徑
 * Path to the yarn-tool executable file
 */
export const YT_BIN = join(YT_ROOT, 'bin/yarn-tool');

/**
 * 預設導出根目錄路徑
 * Default export of the root directory path
 */
export default YT_ROOT;
