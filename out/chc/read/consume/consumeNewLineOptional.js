var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeCommentOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeCommentOptional_1 = __importDefault(require("./consumeCommentOptional"));
    exports.default = (reader) => {
        if (reader.i >= reader.input.length)
            return false;
        const e = reader.i;
        (0, consumeCommentOptional_1.default)(reader);
        while (reader.consumeOptional("\r"))
            ;
        if (reader.consumeOptional("\n"))
            return true;
        if (reader.i >= reader.input.length)
            return true;
        reader.i = e;
        return false;
    };
});
//# sourceMappingURL=consumeNewLineOptional.js.map