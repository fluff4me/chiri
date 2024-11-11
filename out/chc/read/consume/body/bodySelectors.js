var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeWhiteSpaceOptional", "../consumeWordInterpolated", "./BodyConsumer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordInterpolated_1 = __importDefault(require("../consumeWordInterpolated"));
    const BodyConsumer_1 = __importDefault(require("./BodyConsumer"));
    exports.default = (0, BodyConsumer_1.default)("selectors", reader => {
        const selectors = [];
        do {
            reader.consume(".");
            selectors.push((0, consumeWordInterpolated_1.default)(reader));
        } while (reader.consumeOptional(",") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true));
        return selectors;
    });
});
//# sourceMappingURL=bodySelectors.js.map