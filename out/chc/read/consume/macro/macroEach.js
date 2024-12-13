var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../../../type/typeList", "../../../type/typeRecord", "../../../type/typeString", "../../../type/typeUint", "../consumeBody", "../consumeCompilerVariableOptional", "../consumeWhiteSpace", "../consumeWhiteSpaceOptional", "../expression/consumeExpression", "../expression/consumeRangeOptional", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const typeList_1 = __importDefault(require("../../../type/typeList"));
    const typeRecord_1 = __importDefault(require("../../../type/typeRecord"));
    const typeString_1 = __importDefault(require("../../../type/typeString"));
    const typeUint_1 = __importDefault(require("../../../type/typeUint"));
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeCompilerVariableOptional_1 = __importDefault(require("../consumeCompilerVariableOptional"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeExpression_1 = __importDefault(require("../expression/consumeExpression"));
    const consumeRangeOptional_1 = __importDefault(require("../expression/consumeRangeOptional"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("each")
        .consumeParameters(async (reader) => {
        (0, consumeWhiteSpace_1.default)(reader);
        reader.consumeOptional("in ");
        const e = reader.i;
        const iterable = (0, consumeRangeOptional_1.default)(reader) ?? consumeExpression_1.default.inline(reader, typeList_1.default.type, typeRecord_1.default.type, typeString_1.default.type);
        const isRecord = reader.types.isAssignable(iterable.valueType, typeRecord_1.default.type);
        const isString = reader.types.isAssignable(iterable.valueType, typeString_1.default.type);
        (0, consumeWhiteSpace_1.default)(reader);
        reader.consume("as");
        (0, consumeWhiteSpace_1.default)(reader);
        const variable1 = await (0, consumeCompilerVariableOptional_1.default)(reader, false, true);
        if (!variable1)
            throw reader.error("Expected variable declaration");
        let variable2;
        if (reader.consumeOptional(",")) {
            (0, consumeWhiteSpaceOptional_1.default)(reader);
            variable2 = await (0, consumeCompilerVariableOptional_1.default)(reader, false, true);
            if (!variable2)
                throw reader.error("Expected variable declaration");
        }
        if (!variable2 && isRecord)
            throw reader.error("Expected variable declarations for both a key and its associated value");
        if (isRecord && !reader.types.isAssignable(typeString_1.default.type, variable1.valueType))
            throw reader.error(e, `Iterable value of type "${ChiriType_1.ChiriType.stringify(typeString_1.default.type)}" is not assignable to "${ChiriType_1.ChiriType.stringify(variable1.valueType)}"`);
        const valueType = isString ? typeString_1.default.type : iterable.valueType.generics[0];
        if (!reader.types.isAssignable(valueType, (variable2 ?? variable1).valueType))
            throw reader.error(e, `Iterable value of type "${ChiriType_1.ChiriType.stringify(valueType)}" is not assignable to "${ChiriType_1.ChiriType.stringify((variable2 ?? variable1).valueType)}"`);
        const keyVariable = variable2 ? variable1 : undefined;
        if (keyVariable)
            keyVariable.valueType = isRecord ? typeString_1.default.type : typeUint_1.default.type;
        const variable = variable2 ?? variable1;
        variable.valueType = valueType;
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
            isBlock: true,
            iterable,
            keyVariable,
            variable,
            ...body,
            position,
        };
    });
});
//# sourceMappingURL=macroEach.js.map