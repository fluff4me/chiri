var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeMacroUseOptional", "./BodyConsumer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeMacroUseOptional_1 = __importDefault(require("../consumeMacroUseOptional"));
    const BodyConsumer_1 = __importDefault(require("./BodyConsumer"));
    exports.default = (0, BodyConsumer_1.default)("inherit", (reader, ...context) => (0, consumeMacroUseOptional_1.default)(reader, ...context));
});
//# sourceMappingURL=bodyMacros.js.map