"use strict";
/**
 * Created by user on 2019/5/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJSONSync = exports.writePackageJson = exports.parsePackageJson = exports.readPackageJson = void 0;
const fs = require("fs-extra");
const package_dts_1 = require("@ts-type/package-dts");
Object.defineProperty(exports, "readPackageJson", { enumerable: true, get: function () { return package_dts_1.readPackageJson; } });
function parsePackageJson(text) {
    return JSON.parse(text);
}
exports.parsePackageJson = parsePackageJson;
function writePackageJson(file, data, options = {}) {
    let { spaces = 2 } = options;
    return fs.writeJSONSync(file, data, {
        ...options,
        spaces
    });
}
exports.writePackageJson = writePackageJson;
function writeJSONSync(file, data, options = {}) {
    let { spaces = 2 } = options;
    return fs.writeJSONSync(file, data, {
        ...options,
        spaces
    });
}
exports.writeJSONSync = writeJSONSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGtnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGtnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRUgsK0JBQWdDO0FBQ2hDLHNEQUFxRTtBQUc1RCxnR0FIYyw2QkFBZSxPQUdkO0FBRXhCLFNBQWdCLGdCQUFnQixDQUFDLElBQVk7SUFFNUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFIRCw0Q0FHQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLElBQVksRUFBRSxJQUFJLEVBQUUsVUFBd0IsRUFBRTtJQUU5RSxJQUFJLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU3QixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtRQUNuQyxHQUFHLE9BQU87UUFDVixNQUFNO0tBQ04sQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVJELDRDQVFDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEVBQUUsVUFBd0IsRUFBRTtJQUUzRSxJQUFJLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUU3QixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtRQUNuQyxHQUFHLE9BQU87UUFDVixNQUFNO0tBQ04sQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVJELHNDQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzE3LlxuICovXG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgSVBhY2thZ2VKc29uLCB7IHJlYWRQYWNrYWdlSnNvbiB9IGZyb20gJ0B0cy10eXBlL3BhY2thZ2UtZHRzJztcbmltcG9ydCB7IFdyaXRlT3B0aW9ucyB9IGZyb20gJ2ZzLWV4dHJhJztcblxuZXhwb3J0IHsgcmVhZFBhY2thZ2VKc29uIH1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGFja2FnZUpzb24odGV4dDogc3RyaW5nKTogSVBhY2thZ2VKc29uXG57XG5cdHJldHVybiBKU09OLnBhcnNlKHRleHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVQYWNrYWdlSnNvbihmaWxlOiBzdHJpbmcsIGRhdGEsIG9wdGlvbnM6IFdyaXRlT3B0aW9ucyA9IHt9KVxue1xuXHRsZXQgeyBzcGFjZXMgPSAyIH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiBmcy53cml0ZUpTT05TeW5jKGZpbGUsIGRhdGEsIHtcblx0XHQuLi5vcHRpb25zLFxuXHRcdHNwYWNlc1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlSlNPTlN5bmMoZmlsZTogc3RyaW5nLCBkYXRhLCBvcHRpb25zOiBXcml0ZU9wdGlvbnMgPSB7fSlcbntcblx0bGV0IHsgc3BhY2VzID0gMiB9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gZnMud3JpdGVKU09OU3luYyhmaWxlLCBkYXRhLCB7XG5cdFx0Li4ub3B0aW9ucyxcblx0XHRzcGFjZXNcblx0fSk7XG59XG4iXX0=