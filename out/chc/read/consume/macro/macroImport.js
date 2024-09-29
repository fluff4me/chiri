var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.macroImportCSS = void 0;
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("import")
        .body("paths")
        .consume(({ reader, assignments, body, extra }) => {
        if (!body)
            throw reader.error("Expected paths to import");
        return {
            type: "import",
            paths: body,
        };
    });
    exports.macroImportCSS = (0, MacroConstruct_1.default)("import css")
        .body("text")
        .consume(({ body, position }) => ({
        type: "import-css",
        imports: body,
        position,
    }));
});
//# sourceMappingURL=macroImport.js.map