var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    exports.default = (reader, genericDeclaration = false) => {
        const type = (0, consumeWordOptional_1.default)(reader);
        if (!type)
            return undefined;
        const typeExists = !!reader.getTypeOptional(type.value);
        if (typeExists && genericDeclaration)
            throw reader.error(`Cannot declare type "${type.value}", a type already exists with that name`);
        if (!genericDeclaration && !typeExists)
            return undefined;
        return type;
    };
});
//# sourceMappingURL=consumeTypeNameOptional.js.map