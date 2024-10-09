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
    exports.default = (bool, position = constants_1.INTERNAL_POSITION) => ({
        type: "literal",
        subType: "bool",
        valueType: ChiriType_1.ChiriType.of("bool"),
        value: bool,
        position,
    });
});
//# sourceMappingURL=makeLiteralBool.js.map