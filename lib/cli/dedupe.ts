/**
 * Created by user on 2019/4/30.
 */

import { fixDuplicates } from 'yarn-deduplicate';

export function Dedupe(yarnlock_old: string)
{
	let yarnlock_new: string = fixDuplicates(yarnlock_old);

	return {
		yarnlock_old,
		yarnlock_new,
		yarnlock_changed: yarnlock_old !== yarnlock_new,
	}
}

export default Dedupe;
