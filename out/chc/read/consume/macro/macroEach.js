var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../../../type/typeString", "../../../type/typeUint", "../consumeBody", "../consumeCompilerVariableOptional", "../consumeWhiteSpace", "../consumeWhiteSpaceOptional", "../consumeWord", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const typeString_1 = __importDefault(require("../../../type/typeString"));
    const typeUint_1 = __importDefault(require("../../../type/typeUint"));
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeCompilerVariableOptional_1 = __importDefault(require("../consumeCompilerVariableOptional"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("each")
        .consumeParameters(async (reader) => {
        (0, consumeWhiteSpace_1.default)(reader);
        reader.consumeOptional("in ");
        const e = reader.i;
        const iterable = (0, consumeWord_1.default)(reader);
        const iterableVariable = reader.getVariable(iterable.value);
        if (!reader.types.isAssignable(iterableVariable.valueType, ChiriType_1.ChiriType.of("list", "*"), ChiriType_1.ChiriType.of("record", "*")))
            throw reader.error(e, `Expected list or record, was ${ChiriType_1.ChiriType.stringify(iterableVariable?.valueType)}`);
        (0, consumeWhiteSpace_1.default)(reader);
        reader.consume("as");
        (0, consumeWhiteSpace_1.default)(reader);
        const variable1 = await (0, consumeCompilerVariableOptional_1.default)(reader, false);
        if (!variable1)
            throw reader.error("Expected variable declaration");
        let variable2;
        if (reader.consumeOptional(",")) {
            (0, consumeWhiteSpaceOptional_1.default)(reader);
            variable2 = await (0, consumeCompilerVariableOptional_1.default)(reader, false);
            if (!variable2)
                throw reader.error("Expected variable declaration");
        }
        if (!variable2 && iterableVariable.valueType.name.value === "record")
            throw reader.error("Expected variable declarations for both a key and its associated value");
        if (iterableVariable.valueType.name.value === "record" && !reader.types.isAssignable(variable1.valueType, typeString_1.default.type))
            throw reader.error(e, `Iterable value of type "${ChiriType_1.ChiriType.stringify(variable1.valueType)}" is not assignable to "${ChiriType_1.ChiriType.stringify(typeString_1.default.type)}"`);
        if (!reader.types.isAssignable(iterableVariable.valueType.generics[0], (variable2 ?? variable1).valueType))
            throw reader.error(e, `Iterable value of type "${ChiriType_1.ChiriType.stringify(iterableVariable.valueType.generics[0])}" is not assignable to "${ChiriType_1.ChiriType.stringify((variable2 ?? variable1).valueType)}"`);
        const keyVariable = variable2 ? variable1 : undefined;
        if (keyVariable)
            keyVariable.valueType = iterableVariable.valueType.name.value === "list" ? typeUint_1.default.type : typeString_1.default.type;
        const variable = variable2 ?? variable1;
        variable.valueType = iterableVariable.valueType.generics[0];
        return {
            iterable,
            keyVariable,
            variable,
        };
    })
        .consume(async ({ reader, extra: { iterable, variable, keyVariable }, position }) => {
        reader.consume(":");
        const body = await (0, consumeBody_1.default)(reader, "inherit", sub => {
            if (keyVariable)
                sub.addOuterStatement(keyVariable);
            sub.addOuterStatement(variable);
        });
        return {
            type: "each",
            iterable,
            keyVariable,
            variable,
            ...body,
            position,
        };
    });
});
//# sourceMappingURL=macroEach.js.map