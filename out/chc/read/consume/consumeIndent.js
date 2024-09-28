var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeIndentOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeIndentOptional_1 = __importDefault(require("./consumeIndentOptional"));
    exports.default = (reader, expected) => {
        const result = (0, consumeIndentOptional_1.default)(reader, expected);
        if (result === undefined) {
            if (reader.consumeOptional("  "))
                throw reader.error("Indentation must be with tab characters");
            throw reader.error("Not enough indentation");
        }
        return result;
    };
});
//# sourceMappingURL=consumeIndent.js.map