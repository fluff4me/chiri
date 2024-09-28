var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consume/consumeNewLineOptional", "../consume/consumeWhiteSpaceOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeNewLineOptional_1 = __importDefault(require("../consume/consumeNewLineOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consume/consumeWhiteSpaceOptional"));
    exports.default = (reader) => {
        const s = reader.i;
        const savedPosition = reader.savePosition();
        if (!(0, consumeWhiteSpaceOptional_1.default)(reader))
            return;
        const e = reader.i;
        if ((0, consumeNewLineOptional_1.default)(reader)) {
            reader.i = e;
            throw reader.error(s, "Extraneous whitespace before newline");
        }
        reader.restorePosition(savedPosition);
    };
});
//# sourceMappingURL=assertNotWhiteSpaceAndNewLine.js.map