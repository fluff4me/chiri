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
        define(["require", "exports", "../../../type/ChiriType", "../../../type/typeInt", "../../../type/typeList", "../../../type/typeRecord", "../../../type/typeString", "../../../util/getFunctionParameters", "../consumeBlockEnd", "../consumeBlockStartOptional", "../consumeNewBlockLineOptional", "../consumeStringOptional", "../consumeTypeConstructorOptional", "../consumeWhiteSpace", "../consumeWhiteSpaceOptional", "../consumeWord", "../consumeWordOptional", "../numeric/consumeDecimalOptional", "../numeric/consumeIntegerOptional", "../numeric/consumeUnsignedIntegerOptional", "./consumeFunctionCallOptional", "./consumeRangeOptional", "./expressionMatch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.consumeOperatorOptional = consumeOperatorOptional;
    const ChiriType_1 = require("../../../type/ChiriType");
    const typeInt_1 = __importDefault(require("../../../type/typeInt"));
    const typeList_1 = __importDefault(require("../../../type/typeList"));
    const typeRecord_1 = __importDefault(require("../../../type/typeRecord"));
    const typeString_1 = __importDefault(require("../../../type/typeString"));
    const getFunctionParameters_1 = __importDefault(require("../../../util/getFunctionParameters"));
    const consumeBlockEnd_1 = __importDefault(require("../consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("../consumeBlockStartOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("../consumeNewBlockLineOptional"));
    const consumeStringOptional_1 = __importDefault(require("../consumeStringOptional"));
    const consumeTypeConstructorOptional_1 = __importDefault(require("../consumeTypeConstructorOptional"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    const consumeDecimalOptional_1 = __importDefault(require("../numeric/consumeDecimalOptional"));
    const consumeIntegerOptional_1 = __importDefault(require("../numeric/consumeIntegerOptional"));
    const consumeUnsignedIntegerOptional_1 = __importDefault(require("../numeric/consumeUnsignedIntegerOptional"));
    const consumeFunctionCallOptional_1 = __importStar(require("./consumeFunctionCallOptional"));
    const consumeRangeOptional_1 = __importDefault(require("./consumeRangeOptional"));
    const expressionMatch_1 = __importDefault(require("./expressionMatch"));
    const empy = {};
    async function consumeExpression(reader, ...expectedTypes) {
        return undefined
            ?? await expressionMatch_1.default.consumeOptional(reader, consumeExpression, ...expectedTypes)
            ?? await consumeExpressionValidatedPipe(reader, ...expectedTypes);
    }
    (function (consumeExpression) {
        function inline(reader, ...expectedTypes) {
            return consumeExpressionValidated(reader, ...expectedTypes);
        }
        consumeExpression.inline = inline;
    })(consumeExpression || (consumeExpression = {}));
    exports.default = consumeExpression;
    function validate(reader, e, operand, ...expectedTypes) {
        const valueType = operand.valueType;
        if (expectedTypes.length && !expectedTypes.some(expectedType => reader.types.isAssignable(valueType, expectedType)))
            throw reader.error(Math.max(e, reader.getLineStart()), `Expected ${expectedTypes.map(type => `"${ChiriType_1.ChiriType.stringify(type)}"`).join(" or ")}, got "${ChiriType_1.ChiriType.stringify(valueType)}"`);
    }
    async function consumeExpressionValidatedPipe(reader, ...expectedTypes) {
        const e = reader.i;
        const operand = await consumeExpressionPipe(reader);
        validate(reader, e, operand, ...expectedTypes);
        return operand;
    }
    function consumeExpressionValidated(reader, ...expectedTypes) {
        const e = reader.i;
        const operand = consumeExpressionInternal(reader, undefined);
        validate(reader, e, operand, ...expectedTypes);
        return operand;
    }
    async function consumeExpressionPipe(reader) {
        let operand = consumeExpressionInternal(reader, undefined);
        if (!(0, consumeBlockStartOptional_1.default)(reader))
            return operand;
        reader.pipeValueStack.push({ type: operand.valueType, used: false });
        do {
            const pipeStackIndex = reader.pipeValueStack.length - 1;
            reader.pipeValueStack[pipeStackIndex].type = operand.valueType;
            reader.pipeValueStack[pipeStackIndex].used = false;
            const position = reader.getPosition();
            reader.consume("->");
            (0, consumeWhiteSpace_1.default)(reader);
            const restore = reader.savePosition();
            const name = (0, consumeWordOptional_1.default)(reader);
            const fn = name && reader.getFunctionOptional(name.value);
            if (fn) {
                const parameters = (0, getFunctionParameters_1.default)(fn);
                if (!reader.peek("(") && reader.types.isAssignable(operand.valueType, parameters[0].valueType) && parameters.every((parameter, i) => i === 0 || parameter.assignment)) {
                    // value \n -> function-name \n
                    operand = {
                        type: "function-call",
                        name,
                        assignments: {
                            [parameters[0].name.value]: operand,
                        },
                        valueType: fn.returnType,
                        position: name.position,
                    };
                    continue;
                }
            }
            reader.restorePosition(restore);
            const e = reader.i;
            const right = await consumeExpression(reader);
            if (!reader.pipeValueStack[pipeStackIndex].used)
                throw reader.error(e, "Piped value is not used in this expression");
            operand = {
                type: "pipe",
                left: operand,
                right,
                valueType: right.valueType,
                position,
            };
        } while ((0, consumeNewBlockLineOptional_1.default)(reader));
        (0, consumeBlockEnd_1.default)(reader);
        reader.pipeValueStack.pop();
        return operand;
    }
    function consumeOperatorOptional(reader, operators, precedence) {
        for (const o in operators) {
            if (precedence !== undefined && !reader.types.precedence[precedence].includes(o))
                // not correct precedence, skip for now
                continue;
            if (reader.consumeOptional(o))
                return o;
        }
        return undefined;
    }
    function consumeConditionalOptional(reader) {
        const position = reader.getPosition();
        const e = reader.i;
        if (!reader.consumeOptional("if "))
            return undefined;
        const condition = consumeExpression.inline(reader);
        reader.consume(":");
        (0, consumeWhiteSpaceOptional_1.default)(reader);
        const ifTrue = consumeExpression.inline(reader);
        (0, consumeWhiteSpace_1.default)(reader);
        reader.consume("else:");
        (0, consumeWhiteSpaceOptional_1.default)(reader);
        const ifFalse = consumeExpression.inline(reader);
        if (ifTrue.valueType.name.value !== ifFalse.valueType.name.value || ifTrue.valueType.generics.some((generic, i) => generic.name.value !== ifFalse.valueType.generics[i].name.value))
            throw reader.error(e, `Conditional expression must return the same value type for both branches. Currently returning "${ChiriType_1.ChiriType.stringify(ifTrue.valueType)}" and "${ChiriType_1.ChiriType.stringify(ifFalse.valueType)}"`);
        return {
            type: "conditional",
            valueType: ifTrue.valueType,
            condition,
            ifTrue,
            ifFalse,
            position,
        };
    }
    function consumeExpressionInternal(reader, precedence = 0) {
        const ternary = consumeConditionalOptional(reader);
        if (ternary)
            return ternary;
        if (precedence >= reader.types.precedence.length)
            return consumeUnaryExpression(reader);
        const position = reader.getPosition();
        const e = reader.i;
        let operandA = consumeExpressionInternal(reader, precedence + 1);
        const binaryOperators = reader.types.binaryOperators;
        while (true) {
            const p = reader.i;
            if (!(0, consumeWhiteSpaceOptional_1.default)(reader) /* || consumeNewBlockLineOptional(reader) */)
                return operandA;
            const operandATypeName = operandA.valueType.name.value;
            const operatorsForType = binaryOperators[operandATypeName] ?? empy;
            const operator = consumeOperatorOptional(reader, operatorsForType, precedence);
            if (!operator) {
                reader.i = p;
                return operandA;
            }
            (0, consumeWhiteSpace_1.default)(reader);
            const resultTypesByOperandB = operatorsForType[operator] ?? empy;
            const operandB = consumeExpressionInternal(reader, precedence + 1);
            const operandBTypeName = operandB.valueType.name.value;
            const resultType = resultTypesByOperandB[operandBTypeName];
            if (!resultType)
                throw reader.error(e, `Undefined operation ${operandATypeName}${operator}${operandBTypeName}`);
            // const coercion = reader.types.binaryOperatorCoercion[operandATypeName]?.[operator]?.[operandBTypeName]
            // const coerce = typeof coercion === "string" ? [coercion, coercion] as const : coercion
            // operandATypeName = coerce?.[0] ?? operandATypeName
            // operandBTypeName = coerce?.[0] ?? operandBTypeName
            operandA = {
                type: "expression",
                subType: "binary",
                operandA,
                operandB,
                operator,
                valueType: ChiriType_1.ChiriType.of(resultType),
                position,
            };
        }
    }
    function consumeOperand(reader) {
        if (reader.consumeOptional("(")) {
            const expr = consumeExpressionInternal(reader);
            reader.consume(")");
            return expr;
        }
        let e = reader.i;
        const pipeValueToken = (0, consumeWordOptional_1.default)(reader, "@");
        if (pipeValueToken) {
            const pipeValue = reader.pipeValueStack.at(-1);
            if (!pipeValue)
                throw reader.error(e, "@ can only be used in the right operand of a pipe expression");
            pipeValue.used = true;
            return { type: "pipe-use-left", valueType: pipeValue.type, position: pipeValueToken.position };
        }
        const numeric = (0, consumeDecimalOptional_1.default)(reader) ?? (0, consumeUnsignedIntegerOptional_1.default)(reader) ?? (0, consumeIntegerOptional_1.default)(reader);
        if (numeric)
            return numeric;
        const string = (0, consumeStringOptional_1.default)(reader);
        if (string)
            return string;
        e = reader.i;
        if (reader.consumeOptional("_"))
            return { type: "literal", subType: "undefined", valueType: ChiriType_1.ChiriType.of("undefined"), position: reader.getPosition(e) };
        const constructedType = (0, consumeTypeConstructorOptional_1.default)(reader);
        if (constructedType)
            return constructedType;
        const fnCall = (0, consumeFunctionCallOptional_1.default)(reader);
        if (fnCall)
            return fnCall;
        e = reader.i;
        const word = (0, consumeWordOptional_1.default)(reader);
        if (word) {
            const variable = reader.getVariableOptional(word.value);
            if (variable?.valueType.name.value === "body")
                throw reader.error(e, "Cannot use a variable of type \"body\" in an expression");
            if (variable)
                return {
                    type: "get",
                    name: word,
                    valueType: variable.valueType.name.value === "raw" ? ChiriType_1.ChiriType.of("string") : variable.valueType,
                    position: word.position,
                };
            throw reader.error(e, `No variable "${word.value}"`);
        }
        throw reader.error("Unknown expression operand type");
    }
    function consumeUnaryExpression(reader) {
        const position = reader.getPosition();
        const e = reader.i;
        const unaryOperators = reader.types.unaryOperators;
        const operator = consumeOperatorOptional(reader, unaryOperators);
        const operand = consumeInlineChain(reader);
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
            position,
        };
    }
    function consumeInlineChain(reader) {
        let operand = consumeOperand(reader);
        while (true) {
            const newOperand = consumeGetByKeyOrListSlice(reader, operand) ?? consumeInlinePipe(reader, operand);
            if (!newOperand)
                return operand;
            operand = newOperand;
        }
    }
    function consumeInlinePipe(reader, operand) {
        if (!reader.consumeOptional("::"))
            return undefined;
        const e = reader.i;
        const name = (0, consumeWord_1.default)(reader);
        const fn = reader.getFunction(name.value, e);
        const parameters = (0, getFunctionParameters_1.default)(fn);
        const firstParameter = parameters.shift();
        const paren = reader.peek("(");
        if (!paren && reader.types.isAssignable(operand.valueType, firstParameter.valueType) && parameters.every((parameter, i) => i === 0 || parameter.assignment)) {
            // value \n -> function-name \n
            return {
                type: "function-call",
                name,
                assignments: {
                    [firstParameter.name.value]: operand,
                },
                valueType: fn.returnType,
                position: name.position,
            };
        }
        const fnCall = (0, consumeFunctionCallOptional_1.consumePartialFuntionCall)(reader, name.position, name, fn, parameters);
        fnCall.assignments[firstParameter.name.value] = operand;
        return fnCall;
    }
    function consumeGetByKeyOrListSlice(reader, operand) {
        const isListOperand = reader.types.isAssignable(operand.valueType, typeList_1.default.type);
        if (!isListOperand && !reader.types.isAssignable(operand.valueType, typeRecord_1.default.type))
            return undefined;
        if (!reader.consumeOptional("["))
            return undefined;
        const position = reader.getPosition(reader.i - 1);
        const range = !isListOperand ? undefined : (0, consumeRangeOptional_1.default)(reader, true);
        if (range) {
            reader.consume("]");
            return {
                type: "list-slice",
                list: operand,
                range: range,
                valueType: operand.valueType,
                position,
            };
        }
        const expr = consumeExpression.inline(reader, isListOperand ? typeInt_1.default.type : typeString_1.default.type);
        reader.consume("]");
        return {
            type: "get-by-key",
            value: operand,
            key: expr,
            valueType: operand.valueType.generics[0],
            position,
        };
    }
});
//# sourceMappingURL=consumeExpression.js.map