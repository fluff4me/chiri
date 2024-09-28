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
    exports.default = (reader, errorOnIndentation = true) => {
        let consumed = false;
        for (; reader.i < reader.input.length; reader.i++)
            if (reader.input[reader.i] === " ")
                consumed = true;
            else if (reader.input[reader.i] === "\t" && errorOnIndentation)
                throw reader.error("Indentation may only be used at the start of lines");
            else
                break;
        return consumed;
    };
});
//# sourceMappingURL=consumeWhiteSpaceOptional.js.map