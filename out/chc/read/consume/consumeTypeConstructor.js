var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeTypeConstructorOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeTypeConstructorOptional_1 = __importDefault(require("./consumeTypeConstructorOptional"));
    exports.default = (reader, type) => {
        const e = reader.i;
        const result = (0, consumeTypeConstructorOptional_1.default)(reader, type);
        if (result === undefined)
            throw reader.error(e, `Expected "${type.name.value}" constructor`);
        return result;
    };
});
//# sourceMappingURL=consumeTypeConstructor.js.map