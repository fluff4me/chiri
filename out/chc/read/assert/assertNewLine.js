var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consume/consumeCommentOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeCommentOptional_1 = __importDefault(require("../consume/consumeCommentOptional"));
    exports.default = (reader, message = "Expected newline") => {
        const savedPosition = reader.savePosition();
        (0, consumeCommentOptional_1.default)(reader);
        while (reader.consumeOptional("\r"))
            ;
        if (!reader.consumeOptional("\n") && reader.i < reader.input.length)
            throw reader.error(message);
        reader.restorePosition(savedPosition);
    };
});
//# sourceMappingURL=assertNewLine.js.map