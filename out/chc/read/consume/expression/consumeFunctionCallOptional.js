var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../consumeFunctionParameters", "../consumeWhiteSpace", "../consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeFunctionParameters_1 = __importDefault(require("../consumeFunctionParameters"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    exports.default = (reader, ...expectedTypes) => {
        const position = reader.getPosition();
        const restore = reader.savePosition();
        const start = reader.i;
        if (!reader.consumeOptional("#"))
            return undefined;
        const name = (0, consumeWordOptional_1.default)(reader);
        const fn = name && reader.getFunctionOptional(name.value);
        if (!fn) {
            reader.restorePosition(restore);
            return undefined;
        }
        (0, consumeWhiteSpace_1.default)(reader);
        const assignments = (0, consumeFunctionParameters_1.default)(reader, start, fn);
        const returnType = resolveReturnType(reader, fn, assignments);
        if (!reader.types.isAssignable(returnType, ...expectedTypes))
            throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType_1.ChiriType.stringify(type)}"`).join(", ")}, but #${fn.name.value} will return "${ChiriType_1.ChiriType.stringify(returnType)}"`);
        return {
            type: "function-call",
            name,
            assignments,
            valueType: fn.returnType,
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