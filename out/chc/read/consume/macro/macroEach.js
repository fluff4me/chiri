var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../consumeBody", "../consumeCompilerVariableOptional", "../consumeWhiteSpace", "../consumeWord", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeCompilerVariableOptional_1 = __importDefault(require("../consumeCompilerVariableOptional"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("each")
        .consumeParameters(async (reader) => {
        (0, consumeWhiteSpace_1.default)(reader);
        let e = reader.i;
        const iterable = (0, consumeWord_1.default)(reader);
        const iterableVariable = reader.getVariable(iterable.value);
        if (!reader.types.isAssignable(iterableVariable.valueType, ChiriType_1.ChiriType.of("list", "*")))
            throw reader.error(e, `Expected list or record, was ${ChiriType_1.ChiriType.stringify(iterableVariable?.valueType)}`);
        (0, consumeWhiteSpace_1.default)(reader);
        reader.consume("as");
        (0, consumeWhiteSpace_1.default)(reader);
        e = reader.i;
        const variable = await (0, consumeCompilerVariableOptional_1.default)(reader, false);
        if (!variable)
            throw reader.error("Expected variable declaration");
        if (!reader.types.isAssignable(iterableVariable.valueType, variable.valueType))
            throw reader.error(e, `Iterable type "${ChiriType_1.ChiriType.stringify(iterableVariable.valueType)}" is not assignable to "${ChiriType_1.ChiriType.stringify(variable.valueType)}"`);
        return {
            iterable,
            variable,
        };
    })
        .consume(async ({ reader, extra: { iterable, variable }, position }) => {
        reader.consume(":");
        const body = await (0, consumeBody_1.default)(reader, "inherit", sub => sub.addOuterStatement(variable));
        return {
            type: "each",
            iterable,
            variable,
            ...body,
            position,
        };
    });
});
//# sourceMappingURL=macroEach.js.map