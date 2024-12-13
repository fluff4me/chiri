var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../type/ChiriType", "../assert/assertNewLine", "./consumeCustomPropertyInterpolation", "./consumeNewBlockLineOptional", "./expression/consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = consumeValueText;
    const ChiriType_1 = require("../../type/ChiriType");
    const assertNewLine_1 = __importDefault(require("../assert/assertNewLine"));
    const consumeCustomPropertyInterpolation_1 = __importDefault(require("./consumeCustomPropertyInterpolation"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("./consumeNewBlockLineOptional"));
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    function consumeValueText(reader, multiline, until) {
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
            const varType = reader.consumeOptional("#{", "$$", "$");
            if (!varType) {
                if (!stringChar && !paren && until?.())
                    break;
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
            if (varType === "$" || varType === "$$") {
                content.push((0, consumeCustomPropertyInterpolation_1.default)(reader, varType));
            }
            else {
                content.push(consumeExpression_1.default.inline(reader));
                if (!reader.consumeOptional("}")) {
                    (0, assertNewLine_1.default)(reader);
                    text = "";
                }
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
            subType: "text",
            valueType: ChiriType_1.ChiriType.of("string"),
            content,
            position: start,
        };
    }
    consumeCustomPropertyInterpolation_1.default.consumeValueText = consumeValueText;
});
//# sourceMappingURL=consumeValueText.js.map