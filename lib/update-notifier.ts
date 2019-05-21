/**
 * Created by user on 2019/5/22.
 */

import isNpx = require('is-npx');

export function updateNotifier()
{
	if (!isNpx())
	{
		const path = require('upath2');
		const _updateNotifier = require('update-notifier');
		const pkg = require(path.join(__dirname, '../package.json'));
		_updateNotifier({ pkg }).notify();
	}
}
