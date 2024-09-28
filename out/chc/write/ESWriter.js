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
    const UMD_PREFIX = `
(factory => {
	if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports)
        if (v !== undefined) module.exports = v
    }
    else if (typeof define === "function" && define.amd)
        define(["require", "exports"], factory)
})((require, exports) => {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })`
        .trimStart();
    const UMD_SUFFIX = `
})`
        .trimStart();
    class ESWriter extends Writer_1.default {
        constructor(ast, dest, config) {
            super(ast, dest, { extension: ".js", ...config });
        }
        createDestPath(outFile) {
            return typeof args_1.default["out-es"] === "string" ? path_1.default.resolve(args_1.default["out-es"], outFile) : super.createDestPath(outFile);
        }
        onCompileStart(compiler) {
            this.writeLineStartBlock(UMD_PREFIX);
            this.writeLineStartBlock("exports.default = {");
        }
        onCompileEnd(compiler) {
            this.writeLineEndBlock("};");
            this.writeLineEndBlock(UMD_SUFFIX);
            this.write(`\n//# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())}`);
        }
    }
    exports.default = ESWriter;
});
//# sourceMappingURL=ESWriter.js.map