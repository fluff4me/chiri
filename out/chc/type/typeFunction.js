var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../read/consume/consumeWordOptional", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWordOptional_1 = __importDefault(require("../read/consume/consumeWordOptional"));
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    const TYPE_FUNCTION = ChiriType_1.ChiriType.of("function", "*");
    exports.default = (0, TypeDefinition_1.default)({
        type: TYPE_FUNCTION,
        stringable: true,
        generics: true,
        consumeOptionalConstructor: (reader) => {
            const i = reader.i;
            const name = (0, consumeWordOptional_1.default)(reader);
            if (!name || !reader.getFunctionOptional(name.value) || reader.getVariableOptional(name.value)) {
                reader.i = i;
                return undefined;
            }
            return {
                type: "function",
                valueType: TYPE_FUNCTION,
                name: name,
                position: name.position,
            };
        },
    });
});
//# sourceMappingURL=typeFunction.js.map