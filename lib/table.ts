/**
 * Created by user on 2019/5/18.
 */

import { console } from './index';
import { chalkByConsole } from 'debug-color2';
import { IDependency } from './cli/ncu';

import Table = require('cli-table3');
import _ = require('lodash');

function createDependencyTable()
{
	return new Table({
		colAligns: ['left', 'right', 'right', 'right'],
		chars: {
			top: '',
			'top-mid': '',
			'top-left': '',
			'top-right': '',
			bottom: '',
			'bottom-mid': '',
			'bottom-left': '',
			'bottom-right': '',
			left: '',
			'left-mid': '',
			mid: '',
			'mid-mid': '',
			right: '',
			'right-mid': '',
			middle: '',
		},
	});
}

export function toDependencyTable(args: {
	from: IDependency,
	to: IDependency,
})
{
	const table = createDependencyTable();
	const rows = Object.keys(args.to).map(dep =>
	{
		const from = args.from[dep] || '';
		const to = colorizeDiff(args.from[dep], args.to[dep] || '');
		return [dep, from, '→', to];
	});
	rows.forEach(row => table.push(row as any));
	return table;
}

function colorizeDiff(from: string, to: string, con = console)
{
	return chalkByConsole(function (chalk)
	{
		let leadingWildcard = '';

		// separate out leading ^ or ~
		if (/^[~^]/.test(to) && to[0] === from[0])
		{
			leadingWildcard = to[0];
			to = to.slice(1);
			from = from.slice(1);
		}

		// split into parts
		const partsToColor = to.split('.');
		const partsToCompare = from.split('.');

		let i = _.findIndex(partsToColor, (part, i) => part !== partsToCompare[i]);
		i = i >= 0 ? i : partsToColor.length;

		// major = red (or any change before 1.0.0)
		// minor = cyan
		// patch = green
		const color = i === 0 || partsToColor[0] === '0' ? 'red' :
			i === 1 ? 'cyan' :
				'green';

		// if we are colorizing only part of the word, add a dot in the middle
		const middot = i > 0 && i < partsToColor.length ? '.' : '';

		return leadingWildcard +
			partsToColor.slice(0, i).join('.') +
			middot +
			chalk[color](partsToColor.slice(i).join('.'));
	}, con);
}
