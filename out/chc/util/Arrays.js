(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Arrays;
    (function (Arrays) {
        function resolve(arrayOr) {
            return Array.isArray(arrayOr) ? arrayOr : [arrayOr];
        }
        Arrays.resolve = resolve;
        function filterNullish(value, index, array) {
            return value !== null && value !== undefined;
        }
        Arrays.filterNullish = filterNullish;
        function insertBefore(array, value, referenceValue) {
            const index = array.indexOf(referenceValue);
            if (index === -1)
                array.push(value);
            else
                array.splice(index, 0, value);
            return array;
        }
        Arrays.insertBefore = insertBefore;
    })(Arrays || (Arrays = {}));
    exports.default = Arrays;
});
//# sourceMappingURL=Arrays.js.map