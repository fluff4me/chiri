var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../read/consume/consumeBlockEnd", "../read/consume/consumeBlockStartOptional", "../read/consume/consumeNewBlockLineOptional", "../read/consume/consumeWhiteSpaceOptional", "../read/consume/expression/consumeExpression", "../read/consume/expression/consumeRangeOptional", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBlockEnd_1 = __importDefault(require("../read/consume/consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("../read/consume/consumeBlockStartOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("../read/consume/consumeNewBlockLineOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../read/consume/consumeWhiteSpaceOptional"));
    const consumeExpression_1 = __importDefault(require("../read/consume/expression/consumeExpression"));
    const consumeRangeOptional_1 = __importDefault(require("../read/consume/expression/consumeRangeOptional"));
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    const TYPE_LIST = ChiriType_1.ChiriType.of("list", "*");
    exports.default = (0, TypeDefinition_1.default)({
        type: TYPE_LIST,
        stringable: true,
        generics: 1,
        consumeOptionalConstructor: (reader) => consumeLiteralList(reader) ?? (0, consumeRangeOptional_1.default)(reader),
        coerce: value => Array.isArray(value) ? value : [value],
        is: value => Array.isArray(value),
    });
    function consumeLiteralList(reader) {
        const position = reader.getPosition();
        if (!reader.consumeOptional("["))
            return undefined;
        const expressions = [];
        const multiline = (0, consumeBlockStartOptional_1.default)(reader);
        if (!multiline) {
            if (!reader.peek("\r\n", "\n")) {
                (0, consumeWhiteSpaceOptional_1.default)(reader);
                do
                    expressions.push(consumeOptionalSpread(reader) ?? consumeExpression_1.default.inline(reader));
                while (reader.consumeOptional(", "));
            }
        }
        else {
            do
                expressions.push(consumeOptionalSpread(reader) ?? consumeExpression_1.default.inline(reader));
            while ((0, consumeNewBlockLineOptional_1.default)(reader));
            (0, consumeBlockEnd_1.default)(reader);
        }
        const valueTypes = expressions.map(expr => expr.type === "list-spread" ? expr.value.valueType.generics[0] : expr.valueType);
        const stringifiedTypes = valueTypes.map(type => ChiriType_1.ChiriType.stringify(type));
        if (new Set(stringifiedTypes).size > 1 && !reader.types.isEveryType(valueTypes))
            throw reader.error(`Lists can only contain a single type. This list contains:\n  - ${stringifiedTypes.join("\n  - ")}`);
        if (!multiline) {
            (0, consumeWhiteSpaceOptional_1.default)(reader);
            reader.consumeOptional("]");
        }
        return {
            type: "literal",
            subType: "list",
            valueType: ChiriType_1.ChiriType.of("list", valueTypes[0] ?? "*"),
            value: expressions,
            position,
        };
    }
    function consumeOptionalSpread(reader) {
        const position = reader.getPosition();
        if (!reader.consumeOptional("..."))
            return undefined;
        return {
            type: "list-spread",
            value: consumeExpression_1.default.inline(reader, TYPE_LIST),
            position,
        };
    }
});
//# sourceMappingURL=typeList.js.map