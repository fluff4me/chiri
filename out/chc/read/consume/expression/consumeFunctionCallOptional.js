var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../../../util/getFunctionParameters", "../consumeValueText", "../consumeWhiteSpaceOptional", "../consumeWordOptional", "./consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.consumePartialFuntionCall = consumePartialFuntionCall;
    const ChiriType_1 = require("../../../type/ChiriType");
    const getFunctionParameters_1 = __importDefault(require("../../../util/getFunctionParameters"));
    const consumeValueText_1 = __importDefault(require("../consumeValueText"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    const consumeExpression_1 = __importDefault(require("./consumeExpression"));
    exports.default = (reader, ...expectedTypes) => {
        const position = reader.getPosition();
        const restore = reader.savePosition();
        const e = reader.i;
        const name = (0, consumeWordOptional_1.default)(reader);
        const fn = name && reader.getFunctionOptional(name.value);
        if (!fn) {
            reader.restorePosition(restore);
            return undefined;
        }
        const parameters = (0, getFunctionParameters_1.default)(fn);
        const variableSharingName = reader.getVariableOptional(name.value);
        if (variableSharingName && parameters.length && !reader.consumeOptional("(")) {
            reader.restorePosition(restore);
            return undefined;
        }
        if (!parameters.length && !reader.peek("("))
            throw reader.error(e, `Ambiguous usage of name "${name.value}" — could be #${ChiriType_1.ChiriType.stringify(reader.getVariable(name.value).valueType)} ${name.value} or #function ${name.value} returns ${ChiriType_1.ChiriType.stringify(fn.returnType)}`);
        return consumePartialFuntionCall(reader, position, name, fn, parameters, ...expectedTypes);
    };
    function consumePartialFuntionCall(reader, position, name, fn, parameters, ...expectedTypes) {
        const assignments = {};
        if (parameters.length) {
            reader.consume("(");
            for (let i = 0; i < parameters.length; i++) {
                const parameter = parameters[i];
                if (i > 0) {
                    if (!reader.consumeOptional(",") && parameter.assignment !== "??=") {
                        const missingParameters = parameters.slice(i)
                            .map(param => `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                            .join(", ");
                        throw reader.error(`Missing parameters for #function ${fn.name.value}: ${missingParameters}`);
                    }
                    (0, consumeWhiteSpaceOptional_1.default)(reader);
                }
                if (reader.peek(")")) {
                    const missingParameters = parameters.slice(i)
                        .filter(param => !param.assignment)
                        .map(param => `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                        .join(", ");
                    if (missingParameters)
                        throw reader.error(`Missing required parameters for #function ${fn.name.value}: ${missingParameters}`);
                    break;
                }
                const expectedType = [parameter.valueType];
                if (parameter.assignment === "??=")
                    expectedType.push(ChiriType_1.ChiriType.of("undefined"));
                assignments[parameter.name.value] =
                    parameter.valueType.name.value !== "raw" ? consumeExpression_1.default.inline(reader, ...expectedType)
                        : (0, consumeValueText_1.default)(reader, false, () => !!reader.peek(")"));
            }
            reader.consumeOptional(")");
        }
        else if (reader.consumeOptional("(")) {
            reader.consumeOptional(")");
        }
        const returnType = resolveReturnType(reader, fn, assignments);
        if (!reader.types.isAssignable(returnType, ...expectedTypes))
            throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType_1.ChiriType.stringify(type)}"`).join(", ")}, but #${fn.name.value} will return "${ChiriType_1.ChiriType.stringify(returnType)}"`);
        return {
            type: "function-call",
            name,
            assignments,
            valueType: returnType,
            position,
        };
    }
    function resolveReturnType(reader, fn, assignments) {
        if (!fn.returnType.isGeneric)
            return fn.returnType;
        const parametersOfType = fn.content.filter((statement) => statement.type === "variable" && !!statement.valueType.isGeneric && statement.valueType.name.value === fn.returnType.name.value);
        return reader.types.intersection(...parametersOfType.map(parameter => assignments[parameter.name.value].valueType));
    }
});
//# sourceMappingURL=consumeFunctionCallOptional.js.map