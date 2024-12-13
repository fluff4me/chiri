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
    exports.macroElse = exports.macroIfElse = void 0;
    const ChiriType_1 = require("../../../type/ChiriType");
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeExpression_1 = __importDefault(require("../expression/consumeExpression"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("if")
        .consumeParameters(reader => (0, consumeWhiteSpace_1.default)(reader) && consumeExpression_1.default.inline(reader, ChiriType_1.ChiriType.of("bool")))
        .body("inherit")
        .consume(({ extra: condition, body: content, position }) => {
        return {
            type: "if",
            isBlock: true,
            condition,
            content,
            position,
        };
    });
    exports.macroIfElse = (0, MacroConstruct_1.default)("else if")
        .consumeParameters(reader => (0, consumeWhiteSpace_1.default)(reader) && consumeExpression_1.default.inline(reader, ChiriType_1.ChiriType.of("bool")))
        .body("inherit")
        .consume(({ reader, extra: condition, body: content, position, start }) => {
        verifyFollowingIf(reader, start, "else if");
        return {
            type: "elseif",
            isBlock: true,
            condition,
            content,
            position,
        };
    });
    exports.macroElse = (0, MacroConstruct_1.default)("else")
        .body("inherit")
        .consume(({ reader, extra: condition, body: content, position, start }) => {
        verifyFollowingIf(reader, start, "else");
        return {
            type: "else",
            isBlock: true,
            content,
            position,
        };
    });
    function verifyFollowingIf(reader, start, constructName) {
        const previousStatementType = reader.getStatements(true).at(-1)?.type;
        if (previousStatementType !== "if" && previousStatementType !== "elseif") {
            reader.i = start + constructName.length + 1;
            throw reader.error(start, `#${constructName} macros must directly follow an #if or #else if macro`);
        }
    }
});
//# sourceMappingURL=macroIf.js.map