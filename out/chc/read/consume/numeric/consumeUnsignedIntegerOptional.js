(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../type/ChiriType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ChiriType_1 = require("../../../type/ChiriType");
    exports.default = (reader) => {
        const i = reader.i;
        let intStr = "";
        for (; reader.i < reader.input.length; reader.i++)
            if (reader.isDigit())
                intStr += reader.input[reader.i];
            else
                break;
        if (!intStr.length)
            return undefined;
        return {
            type: "literal",
            subType: "uint",
            valueType: ChiriType_1.ChiriType.of("uint"),
            value: intStr,
            position: reader.getPosition(i),
        };
    };
});
//# sourceMappingURL=consumeUnsignedIntegerOptional.js.map