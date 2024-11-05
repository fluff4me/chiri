var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../assert/assertNewLine", "./consumeWordInterpolatedOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const assertNewLine_1 = __importDefault(require("../assert/assertNewLine"));
    const consumeWordInterpolatedOptional_1 = __importDefault(require("./consumeWordInterpolatedOptional"));
    exports.default = (reader) => {
        const position = reader.getPosition();
        const start = reader.i;
        const operator = reader.consumeOptional("%", "..%");
        if (!operator)
            return undefined;
        const word = (0, consumeWordInterpolatedOptional_1.default)(reader);
        if (!word)
            return undefined;
        (0, assertNewLine_1.default)(reader);
        return {
            type: "mixin-use",
            name: word,
            spread: operator === "..%" ? true : undefined,
            // assignments: {},
            position,
        };
    };
});
//# sourceMappingURL=consumeMixinUseOptional.js.map