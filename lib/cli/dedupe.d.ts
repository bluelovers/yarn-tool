/**
 * Created by user on 2019/4/30.
 */
export { wrapDedupe } from '@yarn-tool/yarnlock/lib/wrapDedupe/wrapDedupe';
export { infoFromDedupeCache } from '@yarn-tool/yarnlock/lib/wrapDedupe/infoFromDedupeCache';
export { yarnDedupe, Dedupe } from '@yarn-tool/yarnlock/lib/dedupe';
export { IWrapDedupeCache } from '@yarn-tool/yarnlock/lib/types';
import { yarnDedupe } from '@yarn-tool/yarnlock/lib/dedupe';
export default yarnDedupe;
