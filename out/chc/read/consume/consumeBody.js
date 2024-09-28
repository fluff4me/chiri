var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../assert/assertNotWhiteSpaceAndNewLine", "./body/BodyRegistry", "./consumeBlockStartOptional", "./consumeWhiteSpaceOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const assertNotWhiteSpaceAndNewLine_1 = __importDefault(require("../assert/assertNotWhiteSpaceAndNewLine"));
    const BodyRegistry_1 = __importDefault(require("./body/BodyRegistry"));
    const consumeBlockStartOptional_1 = __importDefault(require("./consumeBlockStartOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    async function consumeBody(reader, type, initialiserOrData, initialiserOrSingleLineOnly, singleLineOnly) {
        const data = typeof initialiserOrData === "function" ? undefined : initialiserOrData;
        const initialiser = typeof initialiserOrData === "function" ? initialiserOrData : initialiserOrSingleLineOnly;
        singleLineOnly ||= initialiserOrSingleLineOnly === true ? true : undefined;
        const context = type === "inherit" ? reader.context : { type, data };
        (0, assertNotWhiteSpaceAndNewLine_1.default)(reader);
        const multiline = !singleLineOnly && (0, consumeBlockStartOptional_1.default)(reader);
        const whitespace = multiline || (0, consumeWhiteSpaceOptional_1.default)(reader);
        if (!whitespace)
            return {
                content: [],
            };
        if (reader.peek("\r\n", "\n"))
            throw reader.error(reader.i - reader.getColumnNumber(), "Unexpected indentation on empty line");
        const sub = reader.sub(multiline, context.type, context.data);
        initialiser?.(sub);
        const consumer = BodyRegistry_1.default[context.type];
        const ast = await sub.read(consumer);
        if (sub.errored)
            throw reader.subError();
        const content = ast.statements;
        reader.update(sub);
        return {
            content,
        };
    }
    exports.default = consumeBody;
});
//# sourceMappingURL=consumeBody.js.map