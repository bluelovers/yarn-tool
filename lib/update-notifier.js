"use strict";
/**
 * Created by user on 2019/5/22.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const isNpx = require("is-npx");
function updateNotifier() {
    if (!isNpx()) {
        const path = require('upath2');
        const _updateNotifier = require('update-notifier');
        const pkg = require(path.join(__dirname, '../package.json'));
        _updateNotifier({ pkg }).notify();
    }
}
exports.updateNotifier = updateNotifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLW5vdGlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXBkYXRlLW5vdGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCxnQ0FBaUM7QUFFakMsU0FBZ0IsY0FBYztJQUU3QixJQUFJLENBQUMsS0FBSyxFQUFFLEVBQ1o7UUFDQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUM3RCxlQUFlLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2xDO0FBQ0YsQ0FBQztBQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzIyLlxuICovXG5cbmltcG9ydCBpc05weCA9IHJlcXVpcmUoJ2lzLW5weCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTm90aWZpZXIoKVxue1xuXHRpZiAoIWlzTnB4KCkpXG5cdHtcblx0XHRjb25zdCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5cdFx0Y29uc3QgX3VwZGF0ZU5vdGlmaWVyID0gcmVxdWlyZSgndXBkYXRlLW5vdGlmaWVyJyk7XG5cdFx0Y29uc3QgcGtnID0gcmVxdWlyZShwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJykpO1xuXHRcdF91cGRhdGVOb3RpZmllcih7IHBrZyB9KS5ub3RpZnkoKTtcblx0fVxufVxuIl19