var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "util", "../../ansi"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const util_1 = require("util");
    const ansi_1 = __importDefault(require("../../ansi"));
    var Strings;
    (function (Strings) {
        function symbolise(text) {
            return text
                .replace(/\r/g, ansi_1.default.whitespace + "\u240D" + ansi_1.default.reset)
                .replace(/\n/g, ansi_1.default.whitespace + "\u240A" + ansi_1.default.reset)
                .replace(/ /g, ansi_1.default.whitespace + "\u00B7" + ansi_1.default.reset)
                .replace(/\t/g, ansi_1.default.whitespace + "\u2192" + ansi_1.default.reset);
        }
        Strings.symbolise = symbolise;
        function debug(value) {
            return (0, util_1.inspect)(value, undefined, Infinity, true);
        }
        Strings.debug = debug;
    })(Strings || (Strings = {}));
    exports.default = Strings;
});
//# sourceMappingURL=Strings.js.map