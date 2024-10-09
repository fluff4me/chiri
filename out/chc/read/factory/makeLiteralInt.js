(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../constants", "../../type/ChiriType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("../../../constants");
    const ChiriType_1 = require("../../type/ChiriType");
    exports.default = (int, position = constants_1.INTERNAL_POSITION) => ({
        type: "literal",
        subType: "int",
        valueType: ChiriType_1.ChiriType.of("int"),
        value: `${int}`,
        position,
    });
});
//# sourceMappingURL=makeLiteralInt.js.map