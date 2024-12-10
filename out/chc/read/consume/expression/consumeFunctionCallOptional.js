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
        const fn = name && resolveFunctionFromName(reader, name);
        if (!fn) {
            reader.restorePosition(restore);
            return undefined;
        }
        const parameters = resolveFunctionParameters(reader, fn);
        const variableSharingName = reader.getVariableOptional(name.value);
        if (variableSharingName && variableSharingName.valueType.name.value !== "function" && parameters.length && !reader.consumeOptional("(")) {
            reader.restorePosition(restore);
            return undefined;
        }
        if (!parameters.length && !reader.peek("("))
            throw reader.error(e, `Ambiguous usage of name "${name.value}" — could be #${ChiriType_1.ChiriType.stringify(reader.getVariable(name.value).valueType)} ${name.value} or #function ${name.value} returns ${ChiriType_1.ChiriType.stringify(resolveFunctionReturnType(reader, fn))}`);
        return consumePartialFuntionCall(reader, position, name, fn, parameters, ...expectedTypes);
    };
    function consumePartialFuntionCall(reader, position, name, fn, parameters, ...expectedTypes) {
        const assignments = {};
        if (parameters.length) {
            reader.consume("(");
            for (let i = 0; i < parameters.length; i++) {
                const parameter = parameters[i];
                if (i > 0) {
                    if (!reader.consumeOptional(",") && (parameter.type === "type" || parameter.assignment !== "??=")) {
                        const missingParameters = parameters.slice(i)
                            .map(param => param.type === "type" ? ChiriType_1.ChiriType.stringify(param)
                            : `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                            .join(", ");
                        throw reader.error(`Missing parameters for #function ${fn.name.value}: ${missingParameters}`);
                    }
                    (0, consumeWhiteSpaceOptional_1.default)(reader);
                }
                if (reader.peek(")")) {
                    const missingParameters = parameters.slice(i)
                        .filter(param => param.type === "type" || !param.assignment)
                        .map(param => param.type === "type" ? ChiriType_1.ChiriType.stringify(param)
                        : `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                        .join(", ");
                    if (missingParameters)
                        throw reader.error(`Missing required parameters for #function ${fn.name.value}: ${missingParameters}`);
                    break;
                }
                const paramType = parameter.type === "type" ? parameter : parameter.valueType;
                const expectedType = [paramType];
                if (parameter.type === "variable" && parameter.assignment === "??=")
                    expectedType.push(ChiriType_1.ChiriType.of("undefined"));
                assignments[parameter.type === "type" ? i : parameter.name.value] =
                    paramType.name.value !== "raw" ? consumeExpression_1.default.inline(reader, ...expectedType)
                        : (0, consumeValueText_1.default)(reader, false, () => !!reader.peek(")"));
            }
            reader.consumeOptional(")");
        }
        else if (reader.consumeOptional("(")) {
            reader.consumeOptional(")");
        }
        const returnType = computeFunctionReturnType(reader, fn, assignments);
        if (!reader.types.isAssignable(returnType, ...expectedTypes))
            throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType_1.ChiriType.stringify(type)}"`).join(", ")}, but #function ${fn.name.value} will return "${ChiriType_1.ChiriType.stringify(returnType)}"`);
        return {
            type: "function-call",
            name,
            assignments,
            valueType: returnType,
            position,
        };
    }
    function resolveFunctionFromName(reader, name) {
        const variable = reader.getVariableOptional(name.value);
        if (variable && variable.valueType.name.value === "function")
            return variable;
        else if (variable)
            return undefined;
        return reader.getFunctionOptional(name.value);
    }
    function resolveFunctionParameters(reader, fn) {
        if (fn.type === "function")
            return (0, getFunctionParameters_1.default)(fn);
        return fn.valueType.generics.slice(0, -1); // params are every type up to the last (which is the return type)
    }
    function resolveFunctionReturnType(reader, fn) {
        if (fn.type === "function")
            return fn.returnType;
        return fn.valueType.generics.at(-1); // last = return type
    }
    function computeFunctionReturnType(reader, fn, assignments) {
        const returnType = resolveFunctionReturnType(reader, fn);
        if (!returnType.isGeneric)
            return returnType;
        if (fn.type === "function") {
            const parametersOfType = fn.content.filter((statement) => statement.type === "variable" && !!statement.valueType.isGeneric && statement.valueType.name.value === fn.returnType.name.value);
            return reader.types.intersection(...parametersOfType.map(parameter => assignments[parameter.name.value].valueType));
        }
        const parameters = resolveFunctionParameters(reader, fn);
        const parametersOfType = parameters
            .map((type, i) => [i, type])
            .filter(([, type]) => !!type.isGeneric && type.name.value === returnType.name.value);
        if (!parametersOfType.length)
            return returnType;
        return reader.types.intersection(...parametersOfType.map(([i]) => assignments[i].valueType));
    }
});
//# sourceMappingURL=consumeFunctionCallOptional.js.map