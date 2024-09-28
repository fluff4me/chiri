var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeWhiteSpace", "../consumeWord", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("include")
        .consumeParameters(reader => (0, consumeWhiteSpace_1.default)(reader) && { e: reader.i, word: (0, consumeWord_1.default)(reader) })
        .consume(({ reader, extra: { e, word }, position }) => {
        if (reader.getVariable(word.value).valueType.name.value !== "body")
            throw reader.error(e, "#include requires variable of type \"body\"");
        return {
            type: "include",
            name: word,
            position,
        };
    });
});
//# sourceMappingURL=macroInclude.js.map