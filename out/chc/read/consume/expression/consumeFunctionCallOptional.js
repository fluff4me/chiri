var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../consumeWhiteSpaceOptional", "../consumeWordOptional", "./consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    const consumeExpression_1 = __importDefault(require("./consumeExpression"));
    exports.default = (reader, ...expectedTypes) => {
        const position = reader.getPosition();
        const restore = reader.savePosition();
        const name = (0, consumeWordOptional_1.default)(reader);
        const fn = name && reader.getFunctionOptional(name.value);
        if (!fn) {
            reader.restorePosition(restore);
            return undefined;
        }
        const assignments = {};
        const parameters = fn.content.filter((statement) => statement.type === "variable" && statement.assignment !== "=");
        const variableSharingName = reader.getVariableOptional(name.value);
        if (variableSharingName && parameters.length && !reader.consumeOptional("(")) {
            reader.restorePosition(restore);
            return undefined;
        }
        if (parameters.length) {
            reader.consume("(");
            for (const parameter of parameters) {
                if (parameter !== parameters[0]) {
                    reader.consume(",");
                    (0, consumeWhiteSpaceOptional_1.default)(reader);
                }
                assignments[parameter.name.value] = consumeExpression_1.default.inline(reader, parameter.valueType);
            }
            reader.consumeOptional(")");
        }
        else if (reader.consumeOptional("(")) {
            reader.consumeOptional(")");
        }
        else if (variableSharingName) {
            throw reader.error(`Ambiguous usage of name "${name.value}" — could be #${ChiriType_1.ChiriType.stringify(reader.getVariable(name.value).valueType)} ${name.value} or #function ${name.value} returns ${ChiriType_1.ChiriType.stringify(fn.returnType)}`);
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
    };
    function resolveReturnType(reader, fn, assignments) {
        if (!fn.returnType.isGeneric)
            return fn.returnType;
        const parametersOfType = fn.content.filter((statement) => statement.type === "variable" && !!statement.valueType.isGeneric && statement.valueType.name.value === fn.returnType.name.value);
        return reader.types.intersection(...parametersOfType.map(parameter => assignments[parameter.name.value].valueType));
    }
});
//# sourceMappingURL=consumeFunctionCallOptional.js.map