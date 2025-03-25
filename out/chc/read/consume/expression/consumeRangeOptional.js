var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../../../type/typeInt"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const typeInt_1 = __importDefault(require("../../../type/typeInt"));
    let checkingForRange = false;
    let consumeExpression;
    exports.default = Object.assign(function (reader, listSlice, start) {
        if (checkingForRange)
            return undefined;
        checkingForRange = true;
        const restore = reader.savePosition();
        const position = reader.getPosition();
        start ??= consumeExpression.inlineOptional(reader, typeInt_1.default.type);
        const operator = reader.consumeOptional("...", "..");
        const end = operator && consumeExpression.inlineOptional(reader, typeInt_1.default.type);
        checkingForRange = false;
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
    }, {
        setConsumeExpression(ExpressionIn) {
            consumeExpression = ExpressionIn;
        },
        setCheckingForRange(checkingForRangeIn) {
            checkingForRange = checkingForRangeIn;
        },
    });
});
//# sourceMappingURL=consumeRangeOptional.js.map