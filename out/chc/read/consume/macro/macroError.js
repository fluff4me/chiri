var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/typeBool", "../../factory/makeLiteralBool", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const typeBool_1 = __importDefault(require("../../../type/typeBool"));
    const makeLiteralBool_1 = __importDefault(require("../../factory/makeLiteralBool"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("error")
        .body("text")
        .parameter("function", typeBool_1.default.type, (0, makeLiteralBool_1.default)(false))
        .parameter("macro", typeBool_1.default.type, (0, makeLiteralBool_1.default)(false))
        .consume(({ reader, assignments, body, position }) => ({
        type: "macro-use",
        name: { type: "word", value: "error", position: { file: "internal", line: 0, column: 0 } },
        assignments,
        content: body,
        position,
    }));
});
//# sourceMappingURL=macroError.js.map