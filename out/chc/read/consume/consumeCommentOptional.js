var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeWhiteSpaceOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    exports.default = (reader) => {
        const e = reader.i;
        (0, consumeWhiteSpaceOptional_1.default)(reader, false);
        if (!reader.consumeOptional("; ")) {
            reader.i = e;
            return false;
        }
        for (; reader.i < reader.input.length; reader.i++)
            if (reader.input[reader.i] === "\n")
                break;
        return true;
    };
});
//# sourceMappingURL=consumeCommentOptional.js.map