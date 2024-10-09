var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../constants", "../../type/typeString"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("../../../constants");
    const typeString_1 = __importDefault(require("../../type/typeString"));
    exports.default = (content, position = constants_1.INTERNAL_POSITION) => ({
        type: "text",
        valueType: typeString_1.default.type,
        content,
        position,
    });
});
//# sourceMappingURL=makeValueText.js.map