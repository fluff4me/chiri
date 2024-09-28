var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../../constants", "../../../type/ChiriType", "../../guard/isLiteral", "./MacroConstruct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const constants_1 = require("../../../../constants");
    const ChiriType_1 = require("../../../type/ChiriType");
    const isLiteral_1 = __importDefault(require("../../guard/isLiteral"));
    const MacroConstruct_1 = __importDefault(require("./MacroConstruct"));
    exports.default = (0, MacroConstruct_1.default)("export")
        .parameter("reusable", ChiriType_1.ChiriType.of("bool"), constants_1.LITERAL_FALSE)
        .parameter("in", ChiriType_1.ChiriType.of("string"), constants_1.LITERAL_STRING_ROOT)
        .consume(({ reader, assignments }) => {
        if (reader.isSubReader || reader.getStatements(true).length)
            throw reader.error("#export must be the first statement in a file");
        if (assignments.reusable) {
            if (!(0, isLiteral_1.default)(assignments.reusable))
                throw reader.error("\"reusable\" parameter of #export must be a literal boolean");
            reader.setReusable();
        }
        const contextAssignment = assignments.in;
        if (contextAssignment && (!(0, isLiteral_1.default)(contextAssignment, "string") || contextAssignment.segments.length !== 1 || typeof contextAssignment.segments[0] !== "string"))
            throw reader.error("\"in\" parameter of #export must be a literal, raw string");
        const context = contextAssignment?.segments[0] ?? "root";
        if (reader.context.type !== context)
            throw reader.error(`${reader.importName} is exported for use in ${context} context, but was imported into a ${reader.context.type} context`);
        return true;
    });
});
//# sourceMappingURL=macroExport.js.map