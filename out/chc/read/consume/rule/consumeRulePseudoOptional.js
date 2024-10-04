var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeWhiteSpaceOptional", "../consumeWord"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    exports.default = async (reader) => {
        const position = reader.getPosition();
        const e = reader.i;
        const pseudos = [];
        do {
            const prefix = reader.consumeOptional("@");
            if (!prefix)
                break;
            pseudos.push((0, consumeWord_1.default)(reader, "before", "after"));
        } while (reader.consumeOptional(",") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true));
        if (!pseudos.length)
            return undefined;
        const duplicates = new Set(pseudos.map(e => e.value));
        if (pseudos.length > 2 || duplicates.size !== pseudos.length)
            throw reader.error(e, "Duplicate pseudoelement selector");
        reader.consume(":");
        return {
            type: "component",
            subType: "pseudo",
            pseudos,
            ...await (0, consumeBody_1.default)(reader, "pseudo"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRulePseudoOptional.js.map