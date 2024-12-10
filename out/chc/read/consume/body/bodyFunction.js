var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../util/_", "../macro/macroReturn", "./BodyConsumer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const _1 = __importDefault(require("../../../util/_"));
    const macroReturn_1 = __importDefault(require("../macro/macroReturn"));
    const BodyConsumer_1 = __importDefault(require("./BodyConsumer"));
    exports.default = (0, BodyConsumer_1.default)("function", async (reader) => _1.default
        ?? await macroReturn_1.default.consumeOptional(reader)
        ?? undefined);
});
//# sourceMappingURL=bodyFunction.js.map