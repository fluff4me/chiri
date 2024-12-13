var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeWhiteSpaceOptional", "./consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    function default_1(reader) {
        const i = reader.i;
        if (!(0, consumeWhiteSpaceOptional_1.default)(reader))
            return undefined;
        if (!reader.consumeOptional(":")) {
            reader.i = i;
            return undefined;
        }
        const label = (0, consumeWordOptional_1.default)(reader);
        if (!label) {
            reader.i = i;
            return undefined;
        }
        return label;
    }
});
//# sourceMappingURL=consumeLabelOptional.js.map