var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeIndent", "./consumeNewLineOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeIndent_1 = __importDefault(require("./consumeIndent"));
    const consumeNewLineOptional_1 = __importDefault(require("./consumeNewLineOptional"));
    exports.default = (reader) => {
        const e1 = reader.i;
        if (!(0, consumeNewLineOptional_1.default)(reader))
            return false;
        while ((0, consumeNewLineOptional_1.default)(reader))
            ;
        reader.indent++;
        const e2 = reader.i;
        const consumedIndent = (0, consumeIndent_1.default)(reader);
        if (consumedIndent < reader.indent) {
            reader.indent--;
            reader.i = e1;
            return false;
        }
        else if (consumedIndent > reader.indent)
            throw reader.error(e2, `Too much indentation. Expected ${reader.indent}, found ${consumedIndent}`);
        return true;
    };
});
//# sourceMappingURL=consumeBlockStartOptional.js.map