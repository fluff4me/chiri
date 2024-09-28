var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "./chc/type/ChiriType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LITERAL_STRING_ROOT = exports.LITERAL_FALSE = exports.LITERAL_TRUE = exports.INTERNAL_POSITION = exports.CHC_ROOT = exports.LIB_ROOT = exports.PACKAGE_ROOT = void 0;
    const path_1 = __importDefault(require("path"));
    const ChiriType_1 = require("./chc/type/ChiriType");
    exports.PACKAGE_ROOT = path_1.default.dirname(__dirname);
    exports.LIB_ROOT = path_1.default.join(exports.PACKAGE_ROOT, "lib");
    exports.CHC_ROOT = path_1.default.join(__dirname, "chc");
    exports.INTERNAL_POSITION = { file: "internal", line: 0, column: 0 };
    exports.LITERAL_TRUE = { type: "literal", subType: "bool", value: true, valueType: ChiriType_1.ChiriType.of("bool"), position: exports.INTERNAL_POSITION };
    exports.LITERAL_FALSE = { type: "literal", subType: "bool", value: false, valueType: ChiriType_1.ChiriType.of("bool"), position: exports.INTERNAL_POSITION };
    exports.LITERAL_STRING_ROOT = { type: "literal", subType: "string", segments: ["root"], valueType: ChiriType_1.ChiriType.of("string"), position: exports.INTERNAL_POSITION };
});
//# sourceMappingURL=constants.js.map