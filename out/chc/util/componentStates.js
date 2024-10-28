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
        "not:hover": ":where(:not(:hover), :has(:hover))",
        "active": ":where(:active:not(:has(:active)))",
        "not:active": ":where(:not(:active), :has(:active))",
        "focus": ":where(:focus-visible)",
        "not:focus": ":where(:not(:focus-visible))",
        "focus-any": ":where(:focus)",
        "not:focus-any": ":where(:not(:focus))",
        "popover": ":where(:popover-open)",
        "not:popover": ":where(:not(:popover-open))",
        "first": ":where(:first-child)",
        "not:first": ":where(:not(:first-child))",
        "last": ":where(:last-child)",
        "not:last": ":where(:not(:last-child))",
        ":hover": ":where(:hover)",
        "not::hover": ":where(:not(:hover))",
        ":active": ":where(:active)",
        "not::active": ":where(:not(:active))",
        ":focus": ":where(:focus-visible, :has(:focus-visible))",
        "not::focus": ":where(:not(:focus-visible, :has(:focus-visible)))",
        ":focus-any": ":where(:focus-within)",
        "not::focus-any": ":where(:not(:focus-within))",
    };
    exports.STATES = Object.keys(exports.STATE_MAP);
    exports.STATE_MAP_SPECIAL = {
        "start": "@starting-style",
    };
    exports.STATES_SPECIAL = Object.keys(exports.STATE_MAP_SPECIAL);
});
//# sourceMappingURL=componentStates.js.map