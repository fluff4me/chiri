var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../read/consume/consumeBlockEnd", "../read/consume/consumeBlockStartOptional", "../read/consume/consumeNewBlockLineOptional", "../read/consume/consumeWhiteSpaceOptional", "../read/consume/expression/consumeExpression", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBlockEnd_1 = __importDefault(require("../read/consume/consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("../read/consume/consumeBlockStartOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("../read/consume/consumeNewBlockLineOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../read/consume/consumeWhiteSpaceOptional"));
    const consumeExpression_1 = __importDefault(require("../read/consume/expression/consumeExpression"));
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    exports.default = (0, TypeDefinition_1.default)({
        type: ChiriType_1.ChiriType.of("list"),
        stringable: true,
        generics: 1,
        consumeOptionalConstructor: (reader) => {
            const position = reader.getPosition();
            if (!reader.consumeOptional("["))
                return undefined;
            const expressions = [];
            const multiline = (0, consumeBlockStartOptional_1.default)(reader);
            if (!multiline) {
                (0, consumeWhiteSpaceOptional_1.default)(reader);
                do
                    expressions.push(consumeExpression_1.default.inline(reader));
                while (reader.consumeOptional(", "));
            }
            else {
                do
                    expressions.push(consumeExpression_1.default.inline(reader));
                while ((0, consumeNewBlockLineOptional_1.default)(reader));
                (0, consumeBlockEnd_1.default)(reader);
            }
            const stringifiedTypes = expressions.map(expr => ChiriType_1.ChiriType.stringify(expr.valueType));
            if (new Set(stringifiedTypes).size > 1)
                throw reader.error(`Lists can only contain a single type. This list contains: ${stringifiedTypes.join(", ")}`);
            if (!multiline) {
                (0, consumeWhiteSpaceOptional_1.default)(reader);
                reader.consume("]");
            }
            return {
                type: "literal",
                subType: "list",
                valueType: ChiriType_1.ChiriType.of("list", expressions[0]?.valueType ?? "*"),
                value: expressions,
                position,
            };
        },
        coerce: value => Array.isArray(value) ? value : [value],
        is: value => Array.isArray(value),
    });
});
//# sourceMappingURL=typeList.js.map