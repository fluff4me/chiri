var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeLabelOptional", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeLabelOptional_1 = __importDefault(require("../consumeLabelOptional"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("continue")
        .consume(({ reader, position }) => {
        const label = (0, consumeLabelOptional_1.default)(reader);
        return {
            type: "continue",
            label,
            position,
        };
    });
});
//# sourceMappingURL=macroContinue.js.map