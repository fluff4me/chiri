var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../../../type/typeInt", "../consumeWordOptional", "../numeric/consumeIntegerOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const ChiriType_1 = require("../../../type/ChiriType");
    const typeInt_1 = __importDefault(require("../../../type/typeInt"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    const consumeIntegerOptional_1 = __importDefault(require("../numeric/consumeIntegerOptional"));
    function default_1(reader, listSlice) {
        const restore = reader.savePosition();
        const position = reader.getPosition();
        const start = consumeRangeBound(reader);
        const operator = reader.consumeOptional("...", "..");
        const end = operator && consumeRangeBound(reader);
        if (!operator || (!end && !listSlice)) {
            reader.restorePosition(restore);
            return undefined;
        }
        return {
            type: "literal",
            subType: "range",
            start,
            end,
            inclusive: operator === "..." ? true : undefined,
            valueType: ChiriType_1.ChiriType.of("list", "int"),
            position,
        };
    }
    function consumeRangeBound(reader) {
        const int = (0, consumeIntegerOptional_1.default)(reader);
        if (int)
            return int;
        const varName = (0, consumeWordOptional_1.default)(reader);
        if (!varName)
            return undefined;
        const position = reader.getPosition();
        const variable = reader.getVariableOptional(varName.value);
        if (!variable || !reader.types.isAssignable(variable.valueType, typeInt_1.default.type))
            return undefined;
        return {
            type: "get",
            name: varName,
            valueType: variable.valueType,
            position,
        };
    }
});
//# sourceMappingURL=consumeRangeOptional.js.map