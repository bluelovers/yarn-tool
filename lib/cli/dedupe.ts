/**
 * Created by user on 2019/4/30.
 */

export { wrapDedupe, infoFromDedupeCache } from '@yarn-tool/yarnlock/lib/wrap';
export { yarnDedupe, Dedupe } from '@yarn-tool/yarnlock/lib/dedupe';
export { IWrapDedupeCache } from '@yarn-tool/yarnlock/lib/types';

import { yarnDedupe, Dedupe } from '@yarn-tool/yarnlock/lib/dedupe';

export default yarnDedupe;

/*
wrapDedupe(null, null, {
	cache: {
		cwd: '.',
	},
	main(yarg, argv, cache)
	{
		console.log(yarg, argv, cache);

		return true;
	}
});
*/
