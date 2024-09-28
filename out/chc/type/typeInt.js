var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../read/consume/numeric/consumeIntegerOptional", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeIntegerOptional_1 = __importDefault(require("../read/consume/numeric/consumeIntegerOptional"));
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    exports.default = (0, TypeDefinition_1.default)({
        type: ChiriType_1.ChiriType.of("int"),
        stringable: true,
        consumeOptionalConstructor: reader => (0, consumeIntegerOptional_1.default)(reader),
        coerce: (value, error) => {
            if (typeof value === "boolean")
                return value ? 1 : 0;
            if (value === undefined || value === null)
                return 0;
            if (typeof value === "number")
                return Math.trunc(value);
            throw error();
        },
    });
});
//# sourceMappingURL=typeInt.js.map