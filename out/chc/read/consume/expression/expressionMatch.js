var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBlockEnd", "../consumeBlockStartOptional", "../consumeNewBlockLineOptional", "../consumeWhiteSpaceOptional", "../consumeWordOptional", "./ExpressionConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBlockEnd_1 = __importDefault(require("../consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("../consumeBlockStartOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("../consumeNewBlockLineOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    const ExpressionConstruct_1 = __importDefault(require("./ExpressionConstruct"));
    exports.default = (0, ExpressionConstruct_1.default)("match")
        .consume(async ({ reader, consumeExpression, expectedTypes, position }) => {
        const value = consumeExpression.inline(reader);
        reader.consume(":");
        if (!(0, consumeBlockStartOptional_1.default)(reader))
            throw reader.error("Expected start of match cases block");
        const cases = [];
        let elseCase;
        do {
            const position = reader.getPosition();
            const isElseCase = (0, consumeWordOptional_1.default)(reader, "else");
            const condition = isElseCase ? undefined : consumeExpression.inline(reader);
            reader.consume(":");
            (0, consumeWhiteSpaceOptional_1.default)(reader);
            const expression = await consumeExpression(reader, ...expectedTypes);
            if (isElseCase)
                elseCase = {
                    type: "match-else",
                    expression,
                    position,
                };
            else
                cases.push({
                    type: "match-case",
                    condition: condition,
                    expression,
                    position,
                });
        } while ((0, consumeNewBlockLineOptional_1.default)(reader));
        (0, consumeBlockEnd_1.default)(reader);
        const valueTypes = cases.map(c => c.expression.valueType);
        if (elseCase)
            valueTypes.push(elseCase.expression.valueType);
        const intersection = reader.types.intersection(...valueTypes);
        return {
            type: "match",
            value,
            cases,
            elseCase,
            position,
            valueType: intersection,
        };
    });
});
//# sourceMappingURL=expressionMatch.js.map