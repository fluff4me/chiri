var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeCompilerVariableOptional", "../consumeInlineMacroUseOptional", "../consumeWhiteSpace", "../consumeWhiteSpaceOptional", "../expression/consumeExpression", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeCompilerVariableOptional_1 = __importDefault(require("../consumeCompilerVariableOptional"));
    const consumeInlineMacroUseOptional_1 = __importDefault(require("../consumeInlineMacroUseOptional"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeExpression_1 = __importDefault(require("../expression/consumeExpression"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("for")
        .consumeParameters(async (reader) => {
        (0, consumeWhiteSpace_1.default)(reader);
        const variable = await (0, consumeCompilerVariableOptional_1.default)(reader, false);
        if (!variable)
            throw reader.error("Expected variable declaration");
        reader.consume(",");
        (0, consumeWhiteSpaceOptional_1.default)(reader);
        const [condition, update] = await reader
            .with(variable)
            .do(async () => {
            const condition = consumeExpression_1.default.inline(reader);
            reader.consume(",");
            (0, consumeWhiteSpaceOptional_1.default)(reader);
            const update = await (0, consumeInlineMacroUseOptional_1.default)(reader);
            return [condition, update];
        });
        return {
            variable,
            condition,
            update,
        };
    })
        .consume(async ({ reader, extra: { variable, condition, update }, position }) => {
        reader.consume(":");
        const body = await (0, consumeBody_1.default)(reader, "inherit", sub => sub.addOuterStatement(variable));
        return {
            type: "for",
            isBlock: true,
            variable,
            condition,
            update,
            ...body,
            position,
        };
    });
});
//# sourceMappingURL=macroFor.js.map