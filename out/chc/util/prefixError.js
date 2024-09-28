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
    exports.default = (error, prefix) => {
        const message = error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
        let stack;
        if (error instanceof Error)
            stack = error.stack;
        else {
            stack = new Error().stack;
            stack = stack?.slice(stack.indexOf("\n") + 1);
        }
        return Object.assign(new Error(), {
            message: `${prefix}: ${message}`,
            stack,
        });
    };
});
//# sourceMappingURL=prefixError.js.map