(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (reader, type) => {
        if (type !== undefined)
            return consumeTypeConstructorOptional(reader, type.name.value, reader.getType(type.name.value));
        for (const [typename, type] of Object.entries(reader.types.types)) {
            const result = consumeTypeConstructorOptional(reader, typename, type);
            if (result)
                return result;
        }
        // return {
        // 	type: "literal",
        // 	subType: "other",
        // 	valueType: type.name.value,
        // 	value: result,
        // };
    };
    function consumeTypeConstructorOptional(reader, typename, type) {
        const result = type.consumeOptionalConstructor?.(reader);
        if (!result)
            return undefined;
        if ("type" in result && result.type === "literal")
            return result;
        throw reader.error(`Invalid result from ${typename} constructor`);
    }
});
//# sourceMappingURL=consumeTypeConstructorOptional.js.map