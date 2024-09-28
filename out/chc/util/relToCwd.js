var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "../../constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path_1 = __importDefault(require("path"));
    const constants_1 = require("../../constants");
    exports.default = (file, cwd = process.cwd()) => {
        file = file.startsWith(cwd) ? path_1.default.relative(cwd, file) : file;
        file = file.startsWith(constants_1.LIB_ROOT) ? `lib:${path_1.default.relative(constants_1.LIB_ROOT, file)}` : file;
        return file.replaceAll("\\", "/");
    };
});
//# sourceMappingURL=relToCwd.js.map