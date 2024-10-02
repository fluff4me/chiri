var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../constants", "../../type/ChiriType", "./consumeBlockStartOptional", "./consumeValueText", "./consumeWhiteSpace", "./consumeWhiteSpaceOptional", "./consumeWord", "./consumeWordInterpolated"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("../../../constants");
    const ChiriType_1 = require("../../type/ChiriType");
    const consumeBlockStartOptional_1 = __importDefault(require("./consumeBlockStartOptional"));
    const consumeValueText_1 = __importDefault(require("./consumeValueText"));
    const consumeWhiteSpace_1 = __importDefault(require("./consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("./consumeWord"));
    const consumeWordInterpolated_1 = __importDefault(require("./consumeWordInterpolated"));
    const customPropertyDefinitionTypes = {
        color: {
            syntax: "<color>",
            initialValue: "#000",
        },
        colour: {
            syntax: "<color>",
            initialValue: "#000",
        },
    };
    const typeNames = Object.keys(customPropertyDefinitionTypes);
    exports.default = (reader) => {
        const e = reader.i;
        if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#")
            return undefined;
        if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
            return undefined;
        const position = reader.getPosition();
        const isCustomProperty = reader.consumeOptional("$");
        const isCustomPropertyDefinition = isCustomProperty && reader.consumeOptional("$");
        if (isCustomPropertyDefinition && reader.context.type !== "root")
            throw reader.error("Custom property definitions must be in the root context");
        const property = (0, consumeWordInterpolated_1.default)(reader);
        const typeWord = !isCustomPropertyDefinition ? undefined
            : reader.consume("!") && (0, consumeWord_1.default)(reader, ...typeNames);
        const type = !typeWord ? undefined : customPropertyDefinitionTypes[typeWord.value];
        let consumeValue;
        if (!isCustomPropertyDefinition || type?.initialValue === undefined)
            consumeValue = reader.consume(":") && (0, consumeWhiteSpace_1.default)(reader);
        else
            consumeValue = !!reader.consumeOptional(":") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true);
        const value = consumeValue ? (0, consumeValueText_1.default)(reader, !!(0, consumeBlockStartOptional_1.default)(reader))
            : {
                type: "text",
                content: [type.initialValue],
                position: constants_1.INTERNAL_POSITION,
                valueType: ChiriType_1.ChiriType.of("string"),
            };
        if (type)
            return {
                type: "property-definition",
                property,
                syntax: {
                    type: "word",
                    value: type.syntax,
                    position: typeWord.position,
                },
                value,
                position,
            };
        return {
            type: "property",
            isCustomProperty: isCustomProperty ? true : undefined,
            position,
            property,
            value,
        };
    };
});
//# sourceMappingURL=consumePropertyOptional.js.map