var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../type/ChiriType", "../../util/getFunctionParameters", "./consumeBlockEnd", "./consumeBlockStartOptional", "./consumeNewBlockLineOptional", "./consumeWhiteSpaceOptional", "./consumeWordOptional", "./expression/consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../type/ChiriType");
    const getFunctionParameters_1 = __importDefault(require("../../util/getFunctionParameters"));
    const consumeBlockEnd_1 = __importDefault(require("./consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("./consumeBlockStartOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("./consumeNewBlockLineOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    exports.default = (reader, start, fn) => {
        const fnTypeSymbol = fn.type === "mixin" ? "%"
            : fn.type === "function" || fn.type === "function:internal" ? "#"
                : "???";
        const parameters = (0, getFunctionParameters_1.default)(fn)
            .sort((a, b) => +!!a.expression - +!!b.expression)
            .filter(parameter => parameter.valueType.name.value !== "body");
        if (!parameters.length)
            return {};
        const assignments = {};
        function consumeParameterAssignment() {
            const e = reader.i;
            const word = (0, consumeWordOptional_1.default)(reader);
            const parameter = word && parameters.find(param => param.name.value === word.value);
            if (!parameter) {
                const expected = parameters
                    .filter(param => !assignments[param.name.value])
                    .map(param => `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                    .join(", ");
                if (!expected)
                    throw reader.error(e, `Unexpected parameter for ${fnTypeSymbol}${fn.name.value}`);
                throw reader.error(e, `Expected parameter for ${fnTypeSymbol}${fn.name.value}, any of: ${expected}`);
            }
            if (assignments[word.value])
                throw reader.error(`Already assigned ${word.value} for ${fnTypeSymbol}${fn.name.value}`);
            const expectedType = parameter.valueType;
            if (!reader.consumeOptional("=")) {
                const variableInScope = reader.getVariableOptional(word.value);
                if (variableInScope) {
                    if (!reader.types.isAssignable(variableInScope.valueType, expectedType))
                        throw reader.error(e, `Unable to set ${word.value} to variable of same name, expected ${ChiriType_1.ChiriType.stringify(expectedType)}, but variable is ${ChiriType_1.ChiriType.stringify(variableInScope.valueType)}`);
                    assignments[word.value] = {
                        type: "get",
                        name: word,
                        valueType: variableInScope.valueType,
                    };
                    return;
                }
                const valueType = ChiriType_1.ChiriType.of("bool");
                if (!reader.types.isAssignable(valueType, expectedType))
                    throw reader.error(e, `Unable to set ${word.value} to true, expected ${ChiriType_1.ChiriType.stringify(expectedType)}`);
                assignments[word.value] = {
                    type: "literal",
                    subType: "bool",
                    valueType,
                    value: true,
                    position: word.position,
                };
                return;
            }
            assignments[word.value] = consumeExpression_1.default.inline(reader, expectedType);
        }
        const multiline = (0, consumeBlockStartOptional_1.default)(reader);
        if (!multiline)
            (0, consumeWhiteSpaceOptional_1.default)(reader);
        const consumeParameterSeparatorOptional = multiline ? consumeNewBlockLineOptional_1.default : consumeWhiteSpaceOptional_1.default;
        do
            consumeParameterAssignment();
        while (consumeParameterSeparatorOptional(reader));
        const missing = parameters.filter(parameter => !parameter.expression && !assignments[parameter.name.value]);
        if (missing.length)
            throw reader.error(start, `Missing parameters for ${fnTypeSymbol}${fn.name.value}: ${parameters
                .filter(param => !assignments[param.name.value])
                .map(param => `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                .join(", ")}`);
        if (multiline)
            (0, consumeBlockEnd_1.default)(reader);
        return assignments;
    };
});
//# sourceMappingURL=consumeFunctionParameters.js.map