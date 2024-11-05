var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeWhiteSpaceOptional", "../consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    exports.default = async (reader) => {
        const position = reader.getPosition();
        const e = reader.i;
        const result = undefined
            ?? consumePseudoType(reader, "pseudo", "before", "after")
            ?? consumePseudoType(reader, "view-transition", "view-transition!old", "view-transition!new", "view-transition!image-pair")
            ?? consumePseudoType(reader, "view-transition-class", "view-transition-class!old", "view-transition-class!new", "view-transition-class!group", "view-transition-class!image-pair");
        if (!result)
            return undefined;
        const duplicates = new Set(result.pseudos.map(e => e.value));
        if (result.pseudos.length > 2 || duplicates.size !== result.pseudos.length)
            throw reader.error(e, "Duplicate pseudoelement selector");
        reader.consume(":");
        return {
            type: "component",
            subType: result.type,
            spread: result.spread,
            pseudos: result.pseudos,
            ...await (0, consumeBody_1.default)(reader, "pseudo"),
            position,
        };
    };
    function consumePseudoType(reader, type, ...pseudos) {
        const restore = reader.savePosition();
        let prefix;
        const results = [];
        do {
            const thisPrefix = prefix ? reader.consumeOptional(prefix) : reader.consumeOptional("@", "&@");
            if (!thisPrefix)
                break;
            prefix = thisPrefix;
            const word = (0, consumeWordOptional_1.default)(reader, ...pseudos);
            if (!word) {
                reader.restorePosition(restore);
                return undefined;
            }
            results.push(word);
        } while (reader.consumeOptional(",") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true));
        if (!results.length) {
            reader.restorePosition(restore);
            return undefined;
        }
        return {
            type,
            spread: prefix === "&@",
            pseudos: results,
        };
    }
});
//# sourceMappingURL=consumeRulePseudoOptional.js.map