var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../read/consume/consumeWordOptional", "../util/getFunctionParameters", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWordOptional_1 = __importDefault(require("../read/consume/consumeWordOptional"));
    const getFunctionParameters_1 = __importDefault(require("../util/getFunctionParameters"));
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    const TYPE_FUNCTION = ChiriType_1.ChiriType.of("function", "*");
    exports.default = (0, TypeDefinition_1.default)({
        type: TYPE_FUNCTION,
        stringable: true,
        generics: true,
        isAssignable(types, type, toType) {
            if (type.name.value !== toType.name.value)
                return false;
            if (type.generics.length > toType.generics.length)
                return false;
            const parametersEnd = type.generics.length - 1;
            for (let i = 0; i < parametersEnd; i++)
                if (!types.isAssignable(type.generics[i], toType.generics[i]))
                    return false;
            return true;
        },
        consumeOptionalConstructor: (reader) => {
            const i = reader.i;
            const name = (0, consumeWordOptional_1.default)(reader);
            if (!name)
                return undefined;
            const fn = reader.getFunctionOptional(name.value);
            if (!fn || reader.getVariableOptional(name.value)) {
                reader.i = i;
                return undefined;
            }
            const parameterTypes = (0, getFunctionParameters_1.default)(fn).map(param => param.valueType);
            return {
                type: "literal",
                subType: "function",
                valueType: ChiriType_1.ChiriType.of("function", ...parameterTypes, fn.returnType),
                name: name,
                position: name.position,
            };
        },
    });
});
//# sourceMappingURL=typeFunction.js.map