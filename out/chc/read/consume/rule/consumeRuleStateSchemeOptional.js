var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeWhiteSpace", "../consumeWord", "../consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    exports.default = async (reader) => {
        const restore = reader.savePosition();
        const prefix = reader.consumeOptional(":", "&:");
        if (!prefix)
            return;
        const position = reader.getPosition();
        if (!(0, consumeWordOptional_1.default)(reader, "scheme")) {
            reader.restorePosition(restore);
            return undefined;
        }
        (0, consumeWhiteSpace_1.default)(reader);
        const scheme = (0, consumeWord_1.default)(reader, "dark", "light");
        reader.consume(":");
        return {
            type: "component",
            subType: "scheme",
            spread: prefix === "&:",
            scheme: scheme.value,
            ...await (0, consumeBody_1.default)(reader, "state"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleStateSchemeOptional.js.map