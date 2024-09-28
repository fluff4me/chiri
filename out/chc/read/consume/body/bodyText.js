var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeValueText", "./BodyConsumer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeValueText_1 = __importDefault(require("../consumeValueText"));
    const BodyConsumer_1 = __importDefault(require("./BodyConsumer"));
    exports.default = (0, BodyConsumer_1.default)("text", reader => (0, consumeValueText_1.default)(reader, false));
});
//# sourceMappingURL=bodyText.js.map