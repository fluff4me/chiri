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
    exports.default = (0, MacroConstruct_1.default)("select")
        .parameter("where", typeString_1.default.type)
        .body("mixin")
        .consume(({ reader, position, assignments, body }) => {
        return {
            type: "select",
            selector: assignments.where,
            content: body,
            position,
        };
    });
});
//# sourceMappingURL=macroSelect.js.map