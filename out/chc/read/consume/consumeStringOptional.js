var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../constants", "../../type/ChiriType", "../assert/assertNotWhiteSpaceAndNewLine", "./consumeBlockEnd", "./consumeBlockStartOptional", "./consumeCustomPropertyInterpolation", "./consumeIndentOptional", "./consumeNewBlockLineOptional", "./expression/consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("../../../constants");
    const ChiriType_1 = require("../../type/ChiriType");
    const assertNotWhiteSpaceAndNewLine_1 = __importDefault(require("../assert/assertNotWhiteSpaceAndNewLine"));
    const consumeBlockEnd_1 = __importDefault(require("./consumeBlockEnd"));
    const consumeBlockStartOptional_1 = __importDefault(require("./consumeBlockStartOptional"));
    const consumeCustomPropertyInterpolation_1 = __importDefault(require("./consumeCustomPropertyInterpolation"));
    const consumeIndentOptional_1 = __importDefault(require("./consumeIndentOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("./consumeNewBlockLineOptional"));
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    exports.default = (reader) => {
        const position = reader.getPosition();
        if (reader.consumeOptional("$")) {
            const isName = reader.consumeOptional("$");
            const varType = isName ? "$$" : "$";
            return {
                type: "literal",
                subType: "string",
                valueType: ChiriType_1.ChiriType.of("string"),
                segments: [
                    {
                        type: "text",
                        valueType: ChiriType_1.ChiriType.of("string"),
                        content: [
                            (0, consumeCustomPropertyInterpolation_1.default)(reader, varType),
                        ],
                        position,
                    },
                ],
                position,
            };
        }
        if (!reader.consumeOptional('"'))
            return undefined;
        (0, assertNotWhiteSpaceAndNewLine_1.default)(reader);
        const block = (0, consumeBlockStartOptional_1.default)(reader);
        const segments = [""];
        let pendingNewlines = "";
        String: for (; reader.i < reader.input.length; reader.i++) {
            if (block)
                pendingNewlines += "\\n".repeat((0, consumeNewBlockLineOptional_1.default)(reader, true));
            const appendSegment = (text) => segments[segments.length - 1] += text;
            const char = reader.input[reader.i];
            switch (char) {
                case "\\": {
                    reader.i++;
                    if ((0, consumeNewBlockLineOptional_1.default)(reader, true)) {
                        (0, consumeIndentOptional_1.default)(reader);
                        reader.i--;
                        break;
                    }
                    const escapeChar = reader.input[reader.i];
                    switch (escapeChar) {
                        case "r":
                        case "n":
                        case "t":
                        case "\\":
                        case "$":
                            appendSegment(pendingNewlines + char + escapeChar);
                            pendingNewlines = "";
                            break;
                        case '"':
                            appendSegment(pendingNewlines + escapeChar);
                            pendingNewlines = "";
                            break;
                        default:
                            throw reader.error("Unexpected escape character");
                    }
                    break;
                }
                case "$": {
                    appendSegment(pendingNewlines);
                    pendingNewlines = "";
                    reader.i++;
                    const isName = reader.consumeOptional("$");
                    const varType = isName ? "$$" : "$";
                    segments.push({
                        type: "literal",
                        subType: "string",
                        valueType: ChiriType_1.ChiriType.of("string"),
                        segments: [
                            {
                                type: "text",
                                valueType: ChiriType_1.ChiriType.of("string"),
                                content: [
                                    (0, consumeCustomPropertyInterpolation_1.default)(reader, varType),
                                ],
                                position,
                            },
                        ],
                        position,
                    });
                    segments.push("");
                    reader.i--;
                    break;
                }
                // case "$":
                // case "`":
                // 	appendSegment(pendingNewlines + `\\${char}`)
                // 	pendingNewlines = ""
                // 	break
                case "#": {
                    if (reader.input[reader.i + 1] !== "{") {
                        appendSegment(pendingNewlines + `${char}`);
                        pendingNewlines = "";
                        break;
                    }
                    reader.i += 2;
                    appendSegment(pendingNewlines);
                    pendingNewlines = "";
                    const expr = consumeExpression_1.default.inline(reader);
                    segments.push(expr);
                    segments.push("");
                    reader.consume("}");
                    reader.i--;
                    break;
                }
                case "\r":
                    break;
                case "\n":
                    break String;
                case "\t":
                    pendingNewlines += pendingNewlines + "\\t";
                    break;
                case "\"":
                    if (!block) {
                        reader.i++;
                        break String;
                    }
                // maybe intentional fallthrough? this should be investigated
                default:
                    appendSegment(pendingNewlines + char);
                    pendingNewlines = "";
            }
        }
        if (block)
            (0, consumeBlockEnd_1.default)(reader);
        return {
            type: "literal",
            subType: "string",
            valueType: { type: "type", name: { type: "word", value: "string", position: constants_1.INTERNAL_POSITION }, generics: [] },
            segments,
            position,
        };
    };
});
//# sourceMappingURL=consumeStringOptional.js.map