var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeBody", "../consumeValueText", "../consumeWhiteSpace", "../consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeValueText_1 = __importDefault(require("../consumeValueText"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    exports.default = async (reader) => {
        const restore = reader.savePosition();
        const prefix = reader.consumeOptional(":");
        if (!prefix)
            return;
        const position = reader.getPosition();
        if (!(0, consumeWordOptional_1.default)(reader, "container")) {
            reader.restorePosition(restore);
            return undefined;
        }
        (0, consumeWhiteSpace_1.default)(reader);
        const query = (0, consumeValueText_1.default)(reader, false, () => !!reader.peek(":"));
        reader.consume(":");
        return {
            type: "component",
            subType: "container",
            query,
            ...await (0, consumeBody_1.default)(reader, "state"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleStateContainerOptional.js.map