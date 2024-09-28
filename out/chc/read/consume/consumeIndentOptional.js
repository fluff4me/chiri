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
    /**
     * Consume indent up to expected #
     * @returns Undefined if not enough indentation found, otherwise indentations consumed
     */
    exports.default = (reader, expected) => {
        let indent = 0;
        for (; reader.i < reader.input.length; reader.i++) {
            if (indent === expected)
                break;
            if (reader.input[reader.i] !== "\t")
                break;
            indent++;
        }
        if (expected !== undefined && indent !== expected)
            return undefined;
        return indent;
    };
});
//# sourceMappingURL=consumeIndentOptional.js.map