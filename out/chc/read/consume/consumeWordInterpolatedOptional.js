var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../type/ChiriType", "./expression/consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../type/ChiriType");
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    exports.default = (reader, skipStartRequirements = false) => {
        const e = reader.i;
        if (!reader.isLetter() && !reader.peek("#{") && (!skipStartRequirements || (!reader.peek("-") && !reader.isDigit())))
            return undefined;
        const content = [];
        const start = reader.getPosition();
        let textStart = start;
        let text = "";
        for (; reader.i < reader.input.length;) {
            if (reader.isWordChar()) {
                text += reader.input[reader.i++];
                continue;
            }
            if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] !== "{")
                break;
            if (text)
                content.push({
                    type: "text-raw",
                    position: textStart,
                    text,
                });
            reader.consume("#{");
            content.push(consumeExpression_1.default.inline(reader));
            reader.consume("}");
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
//# sourceMappingURL=consumeWordInterpolatedOptional.js.map