var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeBody", "./consumeWord"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBody_1 = __importDefault(require("./consumeBody"));
    const consumeWord_1 = __importDefault(require("./consumeWord"));
    exports.default = async (reader) => {
        const position = reader.getPosition();
        const restore = reader.savePosition();
        if (!reader.consumeOptional("%"))
            return undefined;
        const name = (0, consumeWord_1.default)(reader);
        if (!reader.consumeOptional(":")) {
            reader.restorePosition(restore);
            return undefined;
        }
        return {
            type: "mixin",
            name,
            ...await (0, consumeBody_1.default)(reader, "mixin"),
            position,
        };
    };
});
//# sourceMappingURL=consumeMixinOptional.js.map