var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../consumeNewBlockLineOptional", "../consumeStringOptional", "../consumeTypeConstructorOptional", "../consumeWhiteSpace", "../consumeWhiteSpaceOptional", "../consumeWordOptional", "../numeric/consumeDecimalOptional", "../numeric/consumeIntegerOptional", "../numeric/consumeUnsignedIntegerOptional", "./consumeFunctionCallOptional", "./expressionMatch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.consumeOperatorOptional = void 0;
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeNewBlockLineOptional_1 = __importDefault(require("../consumeNewBlockLineOptional"));
    const consumeStringOptional_1 = __importDefault(require("../consumeStringOptional"));
    const consumeTypeConstructorOptional_1 = __importDefault(require("../consumeTypeConstructorOptional"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    const consumeDecimalOptional_1 = __importDefault(require("../numeric/consumeDecimalOptional"));
    const consumeIntegerOptional_1 = __importDefault(require("../numeric/consumeIntegerOptional"));
    const consumeUnsignedIntegerOptional_1 = __importDefault(require("../numeric/consumeUnsignedIntegerOptional"));
    const consumeFunctionCallOptional_1 = __importDefault(require("./consumeFunctionCallOptional"));
    const expressionMatch_1 = __importDefault(require("./expressionMatch"));
    const empy = {};
    async function consumeExpression(reader, ...expectedTypes) {
        return undefined
            ?? await expressionMatch_1.default.consumeOptional(reader, consumeExpression, ...expectedTypes)
            ?? (0, consumeFunctionCallOptional_1.default)(reader, ...expectedTypes)
            ?? consumeExpressionValidated(reader, ...expectedTypes);
    }
    (function (consumeExpression) {
        function inline(reader, ...expectedTypes) {
            return consumeExpressionValidated(reader, ...expectedTypes);
        }
        consumeExpression.inline = inline;
    })(consumeExpression || (consumeExpression = {}));
    exports.default = consumeExpression;
    const consumeExpressionValidated = (reader, ...expectedTypes) => {
        const e = reader.i;
        const operand = consumeExpressionInternal(reader);
        const valueType = operand.valueType;
        if (expectedTypes.length && !expectedTypes.some(expectedType => reader.types.isAssignable(valueType, expectedType)))
            throw reader.error(e, `Expected ${expectedTypes.map(type => `"${ChiriType_1.ChiriType.stringify(type)}"`).join(" or ")}, got "${ChiriType_1.ChiriType.stringify(valueType)}"`);
        return operand;
    };
    const consumeOperand = (reader) => {
        if (reader.consumeOptional("(")) {
            const expr = consumeExpressionInternal(reader);
            reader.consume(")");
            if (expr.type === "expression" && expr.subType === "binary")
                expr.wrapped = true;
            return expr;
        }
        const numeric = (0, consumeDecimalOptional_1.default)(reader) ?? (0, consumeUnsignedIntegerOptional_1.default)(reader) ?? (0, consumeIntegerOptional_1.default)(reader);
        if (numeric)
            return numeric;
        const string = (0, consumeStringOptional_1.default)(reader);
        if (string)
            return string;
        let e = reader.i;
        if (reader.consumeOptional("_"))
            return { type: "literal", subType: "undefined", valueType: ChiriType_1.ChiriType.of("undefined"), position: reader.getPosition(e) };
        const constructedType = (0, consumeTypeConstructorOptional_1.default)(reader);
        if (constructedType)
            return constructedType;
        e = reader.i;
        const word = (0, consumeWordOptional_1.default)(reader);
        if (word) {
            const variable = reader.getVariableOptional(word.value);
            if (variable)
                return {
                    type: "get",
                    name: word,
                    valueType: variable.valueType,
                };
            throw reader.error(e, `No variable "${word.value}"`);
        }
        throw reader.error("Unknown expression operand type");
    };
    const consumeOperatorOptional = (reader, operators) => {
        for (const o in operators)
            if (reader.consumeOptional(o))
                return o;
        return undefined;
    };
    exports.consumeOperatorOptional = consumeOperatorOptional;
    const consumeExpressionInternal = (reader) => {
        const e = reader.i;
        let operandA = consumeUnaryExpression(reader);
        const binaryOperators = reader.getBinaryOperators();
        while (true) {
            const p = reader.i;
            if (!(0, consumeWhiteSpaceOptional_1.default)(reader) || (0, consumeNewBlockLineOptional_1.default)(reader))
                return operandA;
            const operandATypeName = operandA.valueType.name.value;
            const operatorsForType = binaryOperators[operandATypeName] ?? empy;
            const operator = (0, exports.consumeOperatorOptional)(reader, operatorsForType);
            if (!operator) {
                reader.i = p;
                return operandA;
            }
            (0, consumeWhiteSpace_1.default)(reader);
            const resultTypesByOperandB = operatorsForType[operator] ?? empy;
            const operandB = consumeUnaryExpression(reader);
            const operandBTypeName = operandB.valueType.name.value;
            const resultType = resultTypesByOperandB[operandBTypeName];
            if (!resultType)
                throw reader.error(`Undefined operation ${operandATypeName}${operator}${operandBTypeName}`);
            operandA = {
                type: "expression",
                subType: "binary",
                operandA,
                operandB,
                operator,
                valueType: ChiriType_1.ChiriType.of(resultType),
            };
        }
    };
    const consumeUnaryExpression = (reader) => {
        const e = reader.i;
        const unaryOperators = reader.getUnaryOperators();
        const operator = (0, exports.consumeOperatorOptional)(reader, unaryOperators);
        const operand = consumeOperand(reader);
        if (!operator)
            return operand;
        const resultsByType = unaryOperators[operator] ?? empy;
        const typeName = operand.valueType.name.value;
        const returnType = resultsByType[typeName];
        if (!returnType)
            throw reader.error(e, `Undefined operation ${operator}${typeName}`);
        return {
            type: "expression",
            subType: "unary",
            operand,
            operator,
            valueType: ChiriType_1.ChiriType.of(returnType),
        };
    };
});
//# sourceMappingURL=consumeExpression.js.map