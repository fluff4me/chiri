var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeWord"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWord_1 = __importDefault(require("./consumeWord"));
    exports.default = (reader, ...expectedWords) => {
        if (expectedWords.length) {
            const restore = reader.savePosition();
            const e = reader.i;
            const word = reader.consumeOptional(...expectedWords);
            if (!word || reader.isWordChar() || reader.input[reader.i] === "#") {
                reader.restorePosition(restore);
                return undefined;
            }
            return {
                type: "word",
                value: word,
                position: reader.getPosition(e),
            };
        }
        return !reader.isLetter() ? undefined : (0, consumeWord_1.default)(reader);
    };
});
//# sourceMappingURL=consumeWordOptional.js.map