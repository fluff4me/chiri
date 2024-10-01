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
    exports.default = (reader, ...expectedWords) => {
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
        let word = reader.input[reader.i++];
        for (; reader.i < reader.input.length; reader.i++)
            if (reader.isWordChar() && (reader.input[reader.i] !== "-" || reader.input[reader.i + 1] !== ">"))
                word += reader.input[reader.i];
            else
                break;
        if (reader.input[reader.i] === "#")
            throw reader.error(e, "This word cannot contain interpolations");
        return {
            type: "word",
            value: word,
            position: reader.getPosition(e),
        };
    };
});
//# sourceMappingURL=consumeWord.js.map