/**
 * Created by user on 2019/4/30.
 */

import path  = require('upath2');

export const YT_ROOT = path.normalize(__dirname);

export const YT_BIN = path.join(YT_ROOT, 'bin/yarn-tool');

export default YT_ROOT;
