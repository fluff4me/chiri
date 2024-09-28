var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType", "../consumeWhiteSpace", "../expression/consumeExpression", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeExpression_1 = __importDefault(require("../expression/consumeExpression"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("while")
        .consumeParameters(reader => (0, consumeWhiteSpace_1.default)(reader) && consumeExpression_1.default.inline(reader, ChiriType_1.ChiriType.of("bool")))
        .body("inherit")
        .consume(({ extra: condition, body: content, position }) => {
        return {
            type: "while",
            condition,
            content,
            position,
        };
    });
});
//# sourceMappingURL=macroWhile.js.map