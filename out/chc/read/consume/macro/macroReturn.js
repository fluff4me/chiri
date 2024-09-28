var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeWhiteSpace", "../expression/consumeExpression", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeExpression_1 = __importDefault(require("../expression/consumeExpression"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("return")
        .consume(async ({ reader, position }) => {
        (0, consumeWhiteSpace_1.default)(reader);
        if (reader.context.type !== "function")
            throw reader.error("#return cannot be used in this context");
        const expression = await (0, consumeExpression_1.default)(reader, ...reader.context.data.types);
        return {
            type: "return",
            expression,
            position,
        };
    });
});
//# sourceMappingURL=macroReturn.js.map