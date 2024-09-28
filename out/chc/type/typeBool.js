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
    exports.default = (0, TypeDefinition_1.default)({
        type: ChiriType_1.ChiriType.of("bool"),
        stringable: true,
        consumeOptionalConstructor: (reader) => {
            const bool = (0, consumeWordOptional_1.default)(reader, "true", "false");
            return !bool ? undefined : {
                type: "literal",
                subType: "bool",
                valueType: ChiriType_1.ChiriType.of("bool"),
                value: bool.value === "true" ? true : false,
                position: bool.position,
            };
        },
        coerce: value => !!value,
    });
});
//# sourceMappingURL=typeBool.js.map