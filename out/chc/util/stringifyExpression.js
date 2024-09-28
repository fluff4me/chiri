var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resolveExpression", "./resolveLiteralValue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolveExpression_1 = __importDefault(require("./resolveExpression"));
    const resolveLiteralValue_1 = __importDefault(require("./resolveLiteralValue"));
    const stringifyExpression = (compiler, expression) => {
        if (expression === undefined)
            return "";
        const resolved = typeof expression === "object" && !Array.isArray(expression) ? (0, resolveExpression_1.default)(compiler, expression) : expression;
        switch (typeof resolved) {
            case "number":
            case "boolean":
                return `${resolved}`;
            case "undefined":
                return "";
            case "string":
                return resolved;
            case "object":
                return resolved.map(v => stringifyExpression(compiler, v)).join(" ");
            default:
                throw compiler.error(undefined, `Expression resolved to unstringifiable type "${typeof resolved}"`);
        }
    };
    resolveLiteralValue_1.default.stringifyExpression = stringifyExpression;
    exports.default = stringifyExpression;
});
//# sourceMappingURL=stringifyExpression.js.map