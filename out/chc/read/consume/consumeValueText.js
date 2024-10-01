var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../type/ChiriType", "./consumeNewBlockLineOptional", "./consumeWordInterpolated", "./expression/consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../type/ChiriType");
    const consumeNewBlockLineOptional_1 = __importDefault(require("./consumeNewBlockLineOptional"));
    const consumeWordInterpolated_1 = __importDefault(require("./consumeWordInterpolated"));
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    exports.default = (reader, multiline, until) => {
        const start = reader.getPosition();
        const content = [];
        let stringChar;
        let paren = 0;
        let textStart = start;
        let text = "";
        for (; reader.i < reader.input.length;) {
            if (reader.peek("\r\n", "\n")) {
                if (!multiline || !(0, consumeNewBlockLineOptional_1.default)(reader))
                    break;
                text += " ";
                continue;
            }
            const varType = reader.consumeOptional("#{", "$");
            if (!varType) {
                const char = reader.input[reader.i];
                if (char === stringChar) {
                    stringChar = undefined;
                }
                else if (!stringChar && (char === "\"" || char === "'")) {
                    stringChar = char;
                }
                else if (!stringChar && char === "(") {
                    paren++;
                }
                else if (!stringChar && paren && char === ")") {
                    paren--;
                }
                if (!stringChar && !paren && until?.())
                    break;
                text += char;
                reader.i++;
                continue;
            }
            if (text) {
                content.push({
                    type: "text-raw",
                    position: textStart,
                    text,
                });
            }
            if (varType === "$") {
                const wrapped = reader.consumeOptional("{");
                const property = (0, consumeWordInterpolated_1.default)(reader);
                content.push({
                    type: "interpolation-property",
                    name: property,
                    position: property.position,
                });
                if (wrapped)
                    reader.consume("}");
            }
            else {
                content.push(consumeExpression_1.default.inline(reader));
                reader.consume("}");
            }
            text = "";
            textStart = reader.getPosition();
        }
        if (text)
            content.push({
                type: "text-raw",
                position: textStart,
                text,
            });
        return {
            type: "text",
            valueType: ChiriType_1.ChiriType.of("string"),
            content,
            position: start,
        };
    };
});
//# sourceMappingURL=consumeValueText.js.map