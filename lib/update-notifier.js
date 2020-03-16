"use strict";
/**
 * Created by user on 2019/5/22.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotifier = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLW5vdGlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXBkYXRlLW5vdGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRUgsZ0NBQWlDO0FBRWpDLFNBQWdCLGNBQWM7SUFFN0IsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO1FBQ0MsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDN0QsZUFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNsQztBQUNGLENBQUM7QUFURCx3Q0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8yMi5cbiAqL1xuXG5pbXBvcnQgaXNOcHggPSByZXF1aXJlKCdpcy1ucHgnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZU5vdGlmaWVyKClcbntcblx0aWYgKCFpc05weCgpKVxuXHR7XG5cdFx0Y29uc3QgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuXHRcdGNvbnN0IF91cGRhdGVOb3RpZmllciA9IHJlcXVpcmUoJ3VwZGF0ZS1ub3RpZmllcicpO1xuXHRcdGNvbnN0IHBrZyA9IHJlcXVpcmUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpKTtcblx0XHRfdXBkYXRlTm90aWZpZXIoeyBwa2cgfSkubm90aWZ5KCk7XG5cdH1cbn1cbiJdfQ==