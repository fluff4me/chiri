var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../assert/assertNewLine", "./consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const assertNewLine_1 = __importDefault(require("../assert/assertNewLine"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    exports.default = (reader) => {
        const position = reader.getPosition();
        const start = reader.i;
        if (!reader.consumeOptional("%"))
            return undefined;
        const word = (0, consumeWordOptional_1.default)(reader);
        if (!word)
            return undefined;
        if (reader.getStatements(true).some(statement => statement.type === "mixin-use" && statement.name.value === word.value))
            throw reader.error(start, `%${word.value} is already included in this context`);
        // const assignments = consumeFunctionParameters(reader, start, mixin)
        (0, assertNewLine_1.default)(reader);
        return {
            type: "mixin-use",
            name: word,
            assignments: {},
            position,
        };
    };
});
//# sourceMappingURL=consumeMixinUseOptional.js.map