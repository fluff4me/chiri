var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeType", "../consumeWhiteSpace", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeType_1 = require("../consumeType");
    const consumeWhiteSpace_1 = __importDefault(require("../consumeWhiteSpace"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("function")
        .named()
        .consumeParameters(reader => {
        (0, consumeWhiteSpace_1.default)(reader);
        const generics = [];
        if (reader.consumeOptional("with")) {
            (0, consumeWhiteSpace_1.default)(reader);
            while (true) {
                if (reader.peek("returns"))
                    break;
                const type = (0, consumeType_1.consumeTypeOptional)(reader, true);
                if (!type)
                    break;
                if (!type.generics.length)
                    throw reader.error("Function type declarations must be generic");
                generics.push(type);
                (0, consumeWhiteSpace_1.default)(reader);
            }
            if (!generics.length)
                throw reader.error("Expected at least one type declaration");
        }
        reader.consume("returns");
        (0, consumeWhiteSpace_1.default)(reader);
        const returnType = reader.types.with(...generics)
            .do(() => (0, consumeType_1.consumeType)(reader));
        return { generics, returnType };
    })
        .body("function", ({ extra: { generics: types } }) => ({ types }))
        .consume(({ body, name, position, extra: { generics, returnType } }) => ({
        type: "function",
        name,
        content: body,
        position,
        generics,
        returnType,
    }));
});
//# sourceMappingURL=macroFunctionDeclaration.js.map