var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeBody"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const consumeBody_1 = __importDefault(require("./consumeBody"));
    async function default_1(reader, ...args) {
        if (!reader.consumeOptional(":"))
            return undefined;
        const body = await (0, consumeBody_1.default)(reader, ...args);
        return body.content;
    }
});
//# sourceMappingURL=consumeBodyOptional.js.map