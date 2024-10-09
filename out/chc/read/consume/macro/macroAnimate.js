var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeValueText", "../consumeWhiteSpace", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeValueText_1 = __importDefault(require("../consumeValueText"));
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("animate")
        .consumeParameters(reader => (0, consumeWhiteSpace_1.default)(reader) && (0, consumeValueText_1.default)(reader, false, () => !!reader.peek(":")))
        .body("keyframes")
        .consume(({ extra: shorthand, body, position }) => {
        return {
            type: "animate",
            shorthand,
            content: body,
            position,
        };
    });
});
//# sourceMappingURL=macroAnimate.js.map