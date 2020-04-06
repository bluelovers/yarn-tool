"use strict";
/**
 * Created by user on 2019/5/18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorizeDiff = exports.toDependencyTable = exports.createDependencyTable = void 0;
const index_1 = require("./index");
const debug_color2_1 = require("debug-color2");
const Table = require("cli-table3");
const _ = require("lodash");
function createDependencyTable() {
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
exports.createDependencyTable = createDependencyTable;
function toDependencyTable(args) {
    const table = createDependencyTable();
    const rows = Object.keys(args.to).map(dep => {
        const from = args.from[dep] || '';
        const to = colorizeDiff(args.from[dep], args.to[dep] || '');
        return [dep, from, '→', to];
    });
    rows.forEach(row => table.push(row));
    return table;
}
exports.toDependencyTable = toDependencyTable;
function colorizeDiff(from, to, _colors = ['red', 'cyan', 'green'], con = index_1.console) {
    return debug_color2_1.chalkByConsole(function (chalk) {
        let leadingWildcard = '';
        // separate out leading ^ or ~
        if (/^[~^]/.test(to) && to[0] === from[0]) {
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
        const color = i === 0 || partsToColor[0] === '0' ? _colors[0] :
            i === 1 ? _colors[1] :
                _colors[2];
        // if we are colorizing only part of the word, add a dot in the middle
        const middot = i > 0 && i < partsToColor.length ? '.' : '';
        return leadingWildcard +
            partsToColor.slice(0, i).join('.') +
            middot +
            chalk[color](partsToColor.slice(i).join('.'));
    }, con);
}
exports.colorizeDiff = colorizeDiff;
//# sourceMappingURL=table.js.map