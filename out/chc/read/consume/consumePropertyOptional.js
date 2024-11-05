var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../constants", "../../type/ChiriType", "./consumeBody", "./consumeWord", "./consumeWordInterpolated"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("../../../constants");
    const ChiriType_1 = require("../../type/ChiriType");
    const consumeBody_1 = __importDefault(require("./consumeBody"));
    const consumeWord_1 = __importDefault(require("./consumeWord"));
    const consumeWordInterpolated_1 = __importDefault(require("./consumeWordInterpolated"));
    // https://developer.mozilla.org/en-US/docs/Web/CSS/@property
    const customPropertyDefinitionTypes = {
        "*": {
            syntax: "*",
            initialValue: "",
        },
        "length-percentage": {
            syntax: "<length-percentage>",
            initialValue: "0px",
        },
        length: {
            syntax: "<length>",
            initialValue: "0px",
        },
        percentage: {
            syntax: "<percentage>",
            initialValue: "0%",
        },
        number: {
            syntax: "<number>",
            initialValue: "0",
        },
        dec: {
            syntax: "<number>",
            initialValue: "0",
        },
        int: {
            syntax: "<integer>",
            initialValue: "0",
        },
        time: {
            syntax: "<time>",
            initialValue: "0s",
        },
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
    exports.default = async (reader) => {
        const e = reader.i;
        if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#" && reader.input[reader.i] !== "-")
            return undefined;
        if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
            return undefined;
        const position = reader.getPosition();
        const isCustomProperty = reader.consumeOptional("$");
        const isCustomPropertyDefinition = isCustomProperty && reader.consumeOptional("$");
        if (isCustomPropertyDefinition && reader.context.type !== "root")
            throw reader.error("Custom property definitions must be in the root context");
        const property = (0, consumeWordInterpolated_1.default)(reader, true);
        const typeWord = !isCustomPropertyDefinition ? undefined
            : reader.consume("!") && (0, consumeWord_1.default)(reader, ...typeNames);
        const type = !typeWord ? undefined : customPropertyDefinitionTypes[typeWord.value];
        let consumeValue;
        if (!isCustomPropertyDefinition || type?.initialValue === undefined)
            consumeValue = !!reader.consume(":");
        else
            consumeValue = !!reader.consumeOptional(":");
        let value;
        if (!consumeValue) {
            value = [{
                    type: "text",
                    subType: "text",
                    content: [type.initialValue],
                    position: constants_1.INTERNAL_POSITION,
                    valueType: ChiriType_1.ChiriType.of("string"),
                }];
        }
        else {
            const position = reader.getPosition();
            const textBody = await (0, consumeBody_1.default)(reader, "text");
            value = textBody.content;
        }
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