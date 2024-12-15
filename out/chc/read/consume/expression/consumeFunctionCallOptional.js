var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../../../type/typeFunction", "../../../util/getFunctionParameters", "../consumeBlockEnd", "../consumeBlockStartOptional", "../consumeValueText", "../consumeWhiteSpaceOptional", "../consumeWordOptional", "./consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.consumePartialFuntionCall = consumePartialFuntionCall;
    const ChiriType_1 = require("../../../type/ChiriType");
    const typeFunction_1 = __importDefault(require("../../../type/typeFunction"));
    const getFunctionParameters_1 = __importDefault(require("../../../util/getFunctionParameters"));
    const consumeBlockEnd_1 = __importDefault(require("../consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("../consumeBlockStartOptional"));
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
        if (!reader.peek("(")) {
            reader.restorePosition(restore);
            return undefined;
        }
        return consumePartialFuntionCall(reader, position, name, fn, true, undefined, parameters, ...expectedTypes);
    };
    function consumePartialFuntionCall(reader, position, name, fn, requireParens, boundFirstParam, parameters, ...expectedTypes) {
        const assignments = {};
        let parens = true;
        if (requireParens)
            reader.consume("(");
        else
            parens = !!reader.consumeOptional("(");
        if (parameters.length) {
            for (let i = 0; i < parameters.length; i++) {
                const parameter = parameters[i];
                if (i > 0) {
                    if (!parens || !reader.consumeOptional(",") && (parameter.type === "type" || parameter.assignment !== "??=")) {
                        const missingParameters = parameters.slice(i)
                            .map(param => param.type === "type" ? ChiriType_1.ChiriType.stringify(param)
                            : `${param.expression ? "[" : ""}${ChiriType_1.ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
                            .join(", ");
                        throw reader.error(`Missing parameters for #function ${fn.name.value}: ${missingParameters}`);
                    }
                    (0, consumeWhiteSpaceOptional_1.default)(reader);
                }
                if (!parens || reader.peek(")")) {
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
                const key = parameter.type === "type" ? i : parameter.name.value;
                if (paramType.name.value !== "raw")
                    assignments[key] = consumeExpression_1.default.inline(reader, ...expectedType);
                else {
                    const multiline = (0, consumeBlockStartOptional_1.default)(reader);
                    assignments[key] = (0, consumeValueText_1.default)(reader, multiline, () => !!reader.peek(")"));
                    if (multiline)
                        (0, consumeBlockEnd_1.default)(reader);
                }
            }
        }
        reader.consumeOptional(")");
        const returnType = computeFunctionReturnType(reader, fn, assignments, boundFirstParam);
        if (!reader.types.isAssignable(returnType, ...expectedTypes))
            throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType_1.ChiriType.stringify(type)}"`).join(", ")}, but #function ${fn.name.value} will return "${ChiriType_1.ChiriType.stringify(returnType)}"`);
        return {
            type: "function-call",
            name,
            indexedAssignments: fn.type !== "function",
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
    function computeFunctionReturnType(reader, fn, assignments, boundFirstParam) {
        const returnType = resolveFunctionReturnType(reader, fn);
        if (returnType.isGeneric) {
            const matches = getMatchingGenericTypeParameters(reader, returnType, fn, assignments, boundFirstParam);
            if (!matches.length)
                return returnType;
            return reader.types.intersection(...matches);
        }
        if (!returnType.generics.some(type => type.isGeneric))
            return returnType;
        const mappedGenerics = returnType.generics
            .map(type => {
            if (!type.isGeneric)
                return type;
            const matches = getMatchingGenericTypeParameters(reader, type, fn, assignments, boundFirstParam);
            // console.log(Strings.debug({
            // 	fnType: fn.type,
            // 	type,
            // 	assignments,
            // 	boundFirstParam,
            // 	matches,
            // }))
            if (!matches.length)
                return type;
            return reader.types.intersection(...matches);
        });
        return ChiriType_1.ChiriType.of(returnType.name.value, ...mappedGenerics);
    }
    function getMatchingGenericTypeParameters(reader, matching, fn, assignments, boundFirstParam) {
        if (fn.type === "function") {
            const matches = [];
            let firstParam = true;
            for (const statement of fn.content) {
                if (statement.type !== "variable")
                    continue;
                let assignment;
                if (firstParam) {
                    firstParam = false;
                    assignment = boundFirstParam;
                    // console.log("first param", Strings.debug({
                    // 	boundFirstParam,
                    // 	varType: statement.valueType,
                    // }))
                }
                assignment ??= assignments[statement.name.value];
                if (!assignment)
                    continue;
                if (!!statement.valueType.isGeneric && statement.valueType.name.value === matching.name.value) {
                    if (assignment)
                        matches.push(assignment.valueType);
                    continue;
                }
                if (statement.valueType.name.value === typeFunction_1.default.type.name.value)
                    pushMatchingFunctionGenericTypeParameters(reader, matches, matching, statement.valueType.generics, assignment.valueType.generics);
                else
                    pushMatchingNonFunctionGenericTypeParameters(reader, matches, matching, statement.valueType.generics, assignment.valueType.generics);
            }
            return matches;
        }
        const matches = [];
        const parameters = resolveFunctionParameters(reader, fn);
        for (let i = 0; i < parameters.length; i++) {
            let assignment;
            if (i === 0)
                assignment = boundFirstParam ?? assignments[0];
            assignment ??= assignments[i];
            if (!assignment)
                continue;
            const parameter = parameters[i];
            if (!!parameter.isGeneric && parameter.name.value === matching.name.value) {
                matches.push(assignment.valueType);
                continue;
            }
            if (parameter.name.value === typeFunction_1.default.type.name.value)
                pushMatchingFunctionGenericTypeParameters(reader, matches, matching, parameter.generics, assignment.valueType.generics);
            else
                pushMatchingNonFunctionGenericTypeParameters(reader, matches, matching, parameter.generics, assignment.valueType.generics);
        }
        return matches;
    }
    function pushMatchingNonFunctionGenericTypeParameters(reader, pushTo, matching, generics, assignments) {
        if (!generics.length)
            return;
        for (let j = 0; j < generics.length; j++) {
            const generic = generics[j];
            if (!!generic.isGeneric && generic.name.value === matching.name.value) {
                pushTo.push(assignments[j]);
                continue;
            }
        }
    }
    function pushMatchingFunctionGenericTypeParameters(reader, pushTo, matching, generics, assignments) {
        if (!generics.length)
            return;
        const returnType = generics[generics.length - 1];
        if (!!returnType.isGeneric && returnType.name.value === matching.name.value)
            pushTo.push(assignments[assignments.length - 1]);
        const length = Math.max(generics.length - 1, assignments.length - 1);
        for (let j = 0; j < length; j++) {
            const generic = generics[j];
            if (!!generic.isGeneric && generic.name.value === matching.name.value) {
                pushTo.push(assignments[j]);
                continue;
            }
        }
    }
});
//# sourceMappingURL=consumeFunctionCallOptional.js.map