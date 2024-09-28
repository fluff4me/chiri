var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeCommentOptional", "./consumeIndentOptional", "./consumeNewLineOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeCommentOptional_1 = __importDefault(require("./consumeCommentOptional"));
    const consumeIndentOptional_1 = __importDefault(require("./consumeIndentOptional"));
    const consumeNewLineOptional_1 = __importDefault(require("./consumeNewLineOptional"));
    /**
     * Loop:
     * - Consumes newline. If not encountering a newline, return number of consumed newlines
     * - Consumes indentation to expected #
     * 	- If encountering more, throw
     * 	- If encountering less, return number of consumed newlines and return to before consuming most recent newline
     * 	- If encountering right amount
     * 		- If the rest of the line is blank, throw
     * 		- Else continue
     * @param ignoreExtraIndentation `true` to disable throwing on extra indentation
     * @returns Lines consumed
     */
    exports.default = (reader, ignoreExtraIndentation = false) => {
        let consumed = 0;
        while (true) {
            const iPreConsumeLine = reader.i;
            if (!(0, consumeNewLineOptional_1.default)(reader))
                // no more newlines! return the number of newlines that we consumed
                return consumed;
            const iPreConsumeIndent = reader.i;
            let encounteredIndent;
            while (true) {
                encounteredIndent = (0, consumeIndentOptional_1.default)(reader, reader.indent);
                if (encounteredIndent !== reader.indent) {
                    if (reader.consumeOptional("\r") || reader.consumeOptional("\n"))
                        continue;
                    reader.i = iPreConsumeLine;
                    return consumed;
                }
                break;
            }
            if (!ignoreExtraIndentation) {
                const iBeforeExtraIndentation = reader.i;
                if ((0, consumeIndentOptional_1.default)(reader))
                    throw reader.error(iBeforeExtraIndentation, "Too much indentation");
            }
            const e = reader.i;
            if (encounteredIndent && !(0, consumeCommentOptional_1.default)(reader) && (0, consumeNewLineOptional_1.default)(reader)) {
                reader.i = e;
                throw reader.error(iPreConsumeIndent, "Unexpected indentation on empty line");
            }
            consumed++;
        }
    };
});
//# sourceMappingURL=consumeNewBlockLineOptional.js.map