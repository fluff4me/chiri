(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./macro/macroSet"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const macroSet_1 = require("./macro/macroSet");
    exports.default = async (reader) => {
        return undefined
            ?? await (0, macroSet_1.consumeAssignmentOptional)(reader, true);
    };
});
//# sourceMappingURL=consumeInlineMacroUseOptional.js.map