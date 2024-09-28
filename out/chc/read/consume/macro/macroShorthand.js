var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeWhiteSpace", "../consumeWordInterpolated", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const consumeWordInterpolated_1 = __importDefault(require("../consumeWordInterpolated"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("shorthand")
        .consumeParameters(reader => (0, consumeWhiteSpace_1.default)(reader) && (0, consumeWordInterpolated_1.default)(reader))
        .body("property-name")
        .consume(({ reader, body, position, extra }) => ({
        type: "shorthand",
        property: extra,
        body,
        position,
    }));
});
//# sourceMappingURL=macroShorthand.js.map