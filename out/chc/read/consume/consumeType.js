var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../type/ChiriType", "./consumeTypeNameOptional", "./consumeWhiteSpaceOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.consumeType = consumeType;
    exports.consumeTypeOptional = consumeTypeOptional;
    const ChiriType_1 = require("../../type/ChiriType");
    const consumeTypeNameOptional_1 = __importDefault(require("./consumeTypeNameOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    function consumeType(reader, genericDeclaration) {
        const e = reader.i;
        const type = consumeTypeOptional(reader, genericDeclaration);
        if (!type)
            throw reader.error(e, "Expected type");
        return type;
    }
    function consumeTypeOptional(reader, genericDeclaration) {
        const typeName = (0, consumeTypeNameOptional_1.default)(reader, genericDeclaration);
        if (!typeName)
            return undefined;
        const type = {
            type: "type",
            name: typeName,
            generics: [],
        };
        if (typeName.value === "*")
            return type;
        const definition = reader.getTypeOptional(typeName.value);
        if (definition?.type.isGeneric)
            return definition.type; // use exact generic types as defined
        if (definition?.generics)
            type.generics = consumeGenerics(reader, definition.generics === true ? undefined : definition.generics);
        else if (genericDeclaration)
            type.generics = consumeGenerics(reader, undefined, true);
        if (genericDeclaration)
            type.isGeneric = true;
        return type;
    }
    const consumeGenerics = (reader, generics, genericDeclaration = false) => {
        const result = [];
        if (typeof generics === "number") {
            for (let g = 0; g < generics; g++) {
                reader.consume("!");
                result.push(consumeType(reader));
            }
        }
        else if (generics) {
            for (const generic of generics) {
                reader.consume("!");
                const parenthesised = reader.consumeOptional("(");
                result.push(ChiriType_1.ChiriType.of(reader.consume(...generic)));
                if (parenthesised)
                    reader.consume(")");
            }
        }
        else {
            while (true) {
                if (!reader.consumeOptional("!"))
                    break;
                const parenthesised = reader.consumeOptional("(");
                while (genericDeclaration) {
                    if (result.length)
                        if (!(0, consumeWhiteSpaceOptional_1.default)(reader))
                            break;
                    const type = consumeTypeOptional(reader);
                    if (!type)
                        break;
                    result.push(type);
                }
                if (parenthesised)
                    reader.consume(")");
            }
            if (!result.length)
                throw reader.error("Expected type generic");
        }
        return result;
    };
});
//# sourceMappingURL=consumeType.js.map