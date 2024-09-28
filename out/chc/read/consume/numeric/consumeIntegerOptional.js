var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "./consumeUnsignedIntegerOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeUnsignedIntegerOptional_1 = __importDefault(require("./consumeUnsignedIntegerOptional"));
    exports.default = (reader) => {
        const e = reader.i;
        const position = reader.getPosition(e);
        const negative = reader.consumeOptional("-") ?? "";
        const numeric = (0, consumeUnsignedIntegerOptional_1.default)(reader);
        if (!numeric)
            reader.i = e;
        return !numeric ? undefined : {
            type: "literal",
            subType: "int",
            valueType: ChiriType_1.ChiriType.of("int"),
            value: negative + numeric.value,
            position,
        };
    };
});
//# sourceMappingURL=consumeIntegerOptional.js.map