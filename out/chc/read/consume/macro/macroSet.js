var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../../constants", "../../../type/ChiriType", "../consumeWhiteSpace", "../consumeWhiteSpaceOptional", "../consumeWord", "../expression/consumeExpression", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.consumeAssignmentOptional = void 0;
    const constants_1 = require("../../../../constants");
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    const consumeExpression_1 = __importStar(require("../expression/consumeExpression"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    const empy = {};
    const consumeAssignmentData = async (reader, skipInitialWhitespace = false, inline = false) => {
        if (!skipInitialWhitespace)
            (0, consumeWhiteSpace_1.default)(reader);
        let e = reader.i;
        const varName = (0, consumeWord_1.default)(reader);
        const variable = reader.getVariable(varName.value);
        if (variable.valueType.name.value === "body")
            throw reader.error(e, "Cannot reassign a variable of type \"body\"");
        (0, consumeWhiteSpaceOptional_1.default)(reader);
        const binaryOperators = reader.types.binaryOperators;
        const type = variable.valueType;
        const operatorsForType = binaryOperators[type.name.value] ?? empy;
        let operator = undefined
            ?? reader.consumeOptional("??")
            ?? reader.consumeOptional("++")
            ?? reader.consumeOptional("--")
            ?? (0, consumeExpression_1.consumeOperatorOptional)(reader, operatorsForType);
        if (operator !== "++" && operator !== "--")
            reader.consume("=");
        (0, consumeWhiteSpaceOptional_1.default)(reader);
        e = reader.i;
        const expr = operator === "++" || operator === "--" ? undefined
            : inline ? consumeExpression_1.default.inline(reader) : await (0, consumeExpression_1.default)(reader);
        const coercible = expr && operator && reader.types.canCoerceOperandB(type.name.value, operator, expr.valueType.name.value);
        if (expr && !coercible && !reader.types.isAssignable(expr.valueType, type))
            throw reader.error(e, `Expression of type "${ChiriType_1.ChiriType.stringify(expr.valueType)}" is not assignable to "${ChiriType_1.ChiriType.stringify(variable.valueType)}"`);
        if (operator === "++")
            operator = "+";
        if (operator === "--")
            operator = "-";
        return {
            name: varName,
            assignment: operator === "??" ? "??=" : "=",
            expression: !operator ? expr
                : {
                    type: "expression",
                    subType: "binary",
                    operator,
                    operandA: { type: "get", name: varName, valueType: variable.valueType },
                    operandB: expr ? expr : { type: "literal", subType: "int", valueType: ChiriType_1.ChiriType.of("int"), value: "1", position: constants_1.INTERNAL_POSITION },
                    valueType: ChiriType_1.ChiriType.of(reader.types.binaryOperators[variable.valueType.name.value]?.[operator]?.[expr?.valueType.name.value ?? "int"] ?? "*"),
                },
        };
    };
    const consumeAssignmentOptional = async (reader, inline = false) => {
        const position = reader.getPosition();
        if (!reader.consumeOptional("set"))
            return undefined;
        if (!(0, consumeWhiteSpaceOptional_1.default)(reader))
            return undefined;
        const data = await consumeAssignmentData(reader, true, inline);
        return {
            type: "assignment",
            ...data,
            position,
        };
    };
    exports.consumeAssignmentOptional = consumeAssignmentOptional;
    exports.default = (0, MacroConstruct_1.default)("set")
        .consumeParameters(consumeAssignmentData)
        .consume(({ extra, position }) => {
        return {
            type: "assignment",
            ...extra,
            position,
        };
    });
});
//# sourceMappingURL=macroSet.js.map