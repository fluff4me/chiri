var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "../../args", "./Writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path_1 = __importDefault(require("path"));
    const args_1 = __importDefault(require("../../args"));
    const Writer_1 = __importDefault(require("./Writer"));
    class DTSWriter extends Writer_1.default {
        constructor(ast, dest, config) {
            super(ast, dest, { extension: ".d.ts", ...config });
        }
        createDestPath(outFile) {
            return typeof args_1.default["out-dts"] === "string" ? path_1.default.resolve(args_1.default["out-dts"], outFile) : super.createDestPath(outFile);
        }
        onCompileStart(compiler) {
            this.writeLineStartBlock("declare const _default: {");
        }
        onCompileEnd(compiler) {
            this.writeLineEndBlock("};");
            this.writeLine("export default _default");
        }
    }
    exports.default = DTSWriter;
});
//# sourceMappingURL=DTSWriter.js.map