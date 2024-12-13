(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = consumeWord;
    function consumeWord(reader, ...expectedWords) {
        const e = reader.i;
        if (expectedWords.length) {
            const value = reader.consume(...expectedWords);
            return {
                type: "word",
                value,
                position: reader.getPosition(e),
            };
        }
        if (!reader.isLetter())
            throw reader.error("Words must start with a letter");
        const start = reader.i;
        for (; reader.i < reader.input.length; reader.i++)
            if (!reader.isWordChar())
                break;
        // words can't end in dashes so that you can do the decrement operator on a variable, ie `var--`
        let end = reader.i - 1;
        for (; end >= 0 && reader.input[end] === "-"; end--)
            reader.i--;
        const word = reader.input.slice(start, end + 1);
        if (reader.input[reader.i] === "#")
            throw reader.error(e, "This word cannot contain interpolations");
        return {
            type: "word",
            value: word,
            position: reader.getPosition(e),
        };
    }
});
//# sourceMappingURL=consumeWord.js.map