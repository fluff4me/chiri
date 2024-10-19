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
    exports.STATES_SPECIAL = exports.STATE_MAP_SPECIAL = exports.STATES = exports.STATE_MAP = void 0;
    exports.STATE_MAP = {
        "hover": ":hover:not(:has(:hover))",
        "active": ":active:not(:has(:active))",
        "focus": ":focus-visible",
        "focus-any": ":focus",
        "popover": ":popover-open",
        ":hover": ":hover",
        ":active": ":active",
        ":focus": ":where(:focus-visible, :has(:focus-visible))",
        ":focus-any": ":focus-within",
    };
    exports.STATES = Object.keys(exports.STATE_MAP);
    exports.STATE_MAP_SPECIAL = {
        "start": "@starting-style",
    };
    exports.STATES_SPECIAL = Object.keys(exports.STATE_MAP_SPECIAL);
});
//# sourceMappingURL=componentStates.js.map