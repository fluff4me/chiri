var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeWhiteSpaceOptional", "../consumeWordInterpolated"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordInterpolated_1 = __importDefault(require("../consumeWordInterpolated"));
    exports.default = async (reader) => {
        if (reader.context.type === "mixin")
            return undefined;
        const position = reader.getPosition();
        const names = [];
        let validPrefixes = reader.context.type === "component" ? ["&--", "&-", "& ", "&& "] : ["."];
        do {
            const prefix = reader.consumeOptional(...validPrefixes);
            if (!prefix)
                return undefined;
            validPrefixes = [prefix]; // only allow one kind of prefix
            names.push((0, consumeWordInterpolated_1.default)(reader, true));
        } while (reader.consumeOptional(",") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true));
        reader.consume(":");
        return {
            type: "component",
            subType: validPrefixes[0].endsWith("& ") ? "element" : validPrefixes[0] === "&--" ? "custom-state" : "component",
            spread: validPrefixes[0] === "&& " ? true : undefined,
            names,
            ...await (0, consumeBody_1.default)(reader, "component"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleMainOptional.js.map