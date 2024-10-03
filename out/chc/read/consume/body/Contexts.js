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
    const Contexts = [
        "inherit",
        "root",
        "generic",
        "function",
        "paths",
        "text",
        "mixin",
        "component",
        "state",
        "pseudo",
        "property-name",
    ];
    exports.default = Contexts;
});
//# sourceMappingURL=Contexts.js.map