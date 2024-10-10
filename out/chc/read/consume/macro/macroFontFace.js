var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/typeString", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const typeString_1 = __importDefault(require("../../../type/typeString"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("font-face")
        .parameter("family", typeString_1.default.type)
        .body("mixin")
        .consume(({ assignments, body, position }) => {
        return {
            type: "font-face",
            family: assignments.family,
            content: body,
            position,
        };
    });
});
//# sourceMappingURL=macroFontFace.js.map