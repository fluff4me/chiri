var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeWordInterpolated"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWordInterpolated_1 = __importDefault(require("../consumeWordInterpolated"));
    exports.default = async (reader) => {
        if (reader.context.type === "mixin")
            return undefined;
        const position = reader.getPosition();
        const prefix = reader.consumeOptional(reader.context.type === "component" ? "&-" : ".");
        if (!prefix)
            return undefined;
        const className = (0, consumeWordInterpolated_1.default)(reader, prefix === "&-");
        reader.consume(":");
        return {
            type: "component",
            className,
            states: [],
            pseudoElements: [],
            ...await (0, consumeBody_1.default)(reader, "component"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleMainOptional.js.map