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
        "hover": ":where(:hover:not(:has(:hover)))",
        "active": ":where(:active:not(:has(:active)))",
        "focus": ":where(:focus-visible)",
        "focus-any": ":where(:focus)",
        "popover": ":where(:popover-open)",
        ":hover": ":where(:hover)",
        ":active": ":where(:active)",
        ":focus": ":where(:focus-visible, :has(:focus-visible))",
        ":focus-any": ":where(:focus-within)",
    };
    exports.STATES = Object.keys(exports.STATE_MAP);
    exports.STATE_MAP_SPECIAL = {
        "start": "@starting-style",
    };
    exports.STATES_SPECIAL = Object.keys(exports.STATE_MAP_SPECIAL);
});
//# sourceMappingURL=componentStates.js.map