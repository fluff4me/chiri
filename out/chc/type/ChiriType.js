(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChiriType = void 0;
    const constants_1 = require("../../constants");
    var ChiriType;
    (function (ChiriType) {
        function of(name, ...generics) {
            return {
                type: "type",
                name: { type: "word", value: name, position: constants_1.INTERNAL_POSITION },
                generics: generics.map(generic => typeof generic === "string" ? of(generic) : generic),
            };
        }
        ChiriType.of = of;
        function stringify(type, stack = false) {
            if (type.isGeneric)
                return type.generics.map(type => stringify(type, true)).join(" ");
            const stringified = `${type.name.value}${type.generics.map(generic => `!${stringify(generic, true)}`).join("")}`;
            return stack && type.generics.length ? `(${stringified})` : stringified;
        }
        ChiriType.stringify = stringify;
    })(ChiriType || (exports.ChiriType = ChiriType = {}));
});
//# sourceMappingURL=ChiriType.js.map