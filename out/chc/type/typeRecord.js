var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../read/consume/consumeBlockEnd", "../read/consume/consumeBlockStartOptional", "../read/consume/consumeNewBlockLineOptional", "../read/consume/consumeStringOptional", "../read/consume/consumeWhiteSpaceOptional", "../read/consume/consumeWordInterpolated", "../read/consume/expression/consumeExpression", "../util/resolveExpression", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBlockEnd_1 = __importDefault(require("../read/consume/consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("../read/consume/consumeBlockStartOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("../read/consume/consumeNewBlockLineOptional"));
    const consumeStringOptional_1 = __importDefault(require("../read/consume/consumeStringOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../read/consume/consumeWhiteSpaceOptional"));
    const consumeWordInterpolated_1 = __importDefault(require("../read/consume/consumeWordInterpolated"));
    const consumeExpression_1 = __importDefault(require("../read/consume/expression/consumeExpression"));
    const resolveExpression_1 = require("../util/resolveExpression");
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    const TYPE_RECORD = ChiriType_1.ChiriType.of("record");
    exports.default = (0, TypeDefinition_1.default)({
        type: TYPE_RECORD,
        stringable: true,
        generics: 1,
        consumeOptionalConstructor: (reader) => {
            const position = reader.getPosition();
            if (!reader.consumeOptional("{"))
                return undefined;
            const expressions = [];
            const multiline = (0, consumeBlockStartOptional_1.default)(reader);
            if (!multiline) {
                (0, consumeWhiteSpaceOptional_1.default)(reader);
                do
                    expressions.push(consumeOptionalSpread(reader) ?? consumeRecordKeyValue(reader));
                while (reader.consumeOptional(", "));
            }
            else {
                do
                    expressions.push(consumeOptionalSpread(reader) ?? consumeRecordKeyValue(reader));
                while ((0, consumeNewBlockLineOptional_1.default)(reader));
                (0, consumeBlockEnd_1.default)(reader);
            }
            const valueTypes = expressions.map(expr => Array.isArray(expr) ? expr[1].valueType : expr.valueType);
            const stringifiedTypes = valueTypes.map(valueType => ChiriType_1.ChiriType.stringify(valueType));
            if (new Set(stringifiedTypes).size > 1)
                throw reader.error(`Records can only contain a single type. This record contains: ${stringifiedTypes.join(", ")}`);
            if (!multiline) {
                (0, consumeWhiteSpaceOptional_1.default)(reader);
                reader.consume("}");
            }
            return {
                type: "literal",
                subType: "record",
                valueType: ChiriType_1.ChiriType.of("record", valueTypes[0] ?? "*"),
                value: expressions,
                position,
            };
        },
        is: value => resolveExpression_1.Record.is(value),
    });
    function consumeOptionalSpread(reader) {
        if (!reader.consumeOptional("..."))
            return undefined;
        return consumeExpression_1.default.inline(reader, TYPE_RECORD);
    }
    function consumeRecordKeyValue(reader) {
        const key = (0, consumeStringOptional_1.default)(reader) ?? (0, consumeWordInterpolated_1.default)(reader, true);
        reader.consume(":");
        (0, consumeWhiteSpaceOptional_1.default)(reader);
        const expr = consumeExpression_1.default.inline(reader);
        return [key, expr];
    }
});
//# sourceMappingURL=typeRecord.js.map