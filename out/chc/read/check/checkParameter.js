var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consume/consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWordOptional_1 = __importDefault(require("../consume/consumeWordOptional"));
    exports.default = (reader) => {
        const savedPosition = reader.savePosition();
        if (!(0, consumeWordOptional_1.default)(reader))
            return false;
        const result = reader.consumeOptional("=", "\r\n", " ");
        reader.restorePosition(savedPosition);
        return result;
    };
});
//# sourceMappingURL=checkParameter.js.map