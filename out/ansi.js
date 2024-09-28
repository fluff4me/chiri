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
    exports.default = {
        reset: "\x1b[0m",
        label: "\x1b[90m",
        path: "\x1b[96m",
        filepos: "\x1b[34m",
        err: "\x1b[91m",
        ok: "\x1b[92m",
        whitespace: "\x1b[38;5;240m",
    };
});
//# sourceMappingURL=ansi.js.map