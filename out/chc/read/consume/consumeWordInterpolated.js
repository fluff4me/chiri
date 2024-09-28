var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeWordInterpolatedOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWordInterpolatedOptional_1 = __importDefault(require("./consumeWordInterpolatedOptional"));
    exports.default = (reader) => {
        if (!reader.isLetter() && !reader.peek("#"))
            throw reader.error("Words must start with a letter");
        return (0, consumeWordInterpolatedOptional_1.default)(reader);
    };
});
//# sourceMappingURL=consumeWordInterpolated.js.map