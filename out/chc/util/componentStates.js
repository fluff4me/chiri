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
    exports.STATES = exports.STATE_MAP = void 0;
    exports.STATE_MAP = {
        "hover": ":hover:not(:has(:hover))",
        "active": ":active:not(:has(:active))",
        "focus": ":focus-visible",
        "focus-any": ":focus",
        ":hover": ":hover",
        ":active": ":active",
        ":focus": ":has(:focus-visible)",
        ":focus-any": ":focus-within",
    };
    exports.STATES = Object.keys(exports.STATE_MAP);
});
//# sourceMappingURL=componentStates.js.map