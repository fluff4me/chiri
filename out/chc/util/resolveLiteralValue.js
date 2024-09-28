var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resolveExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolveExpression_1 = __importDefault(require("./resolveExpression"));
    function resolveLiteralValue(compiler, expression) {
        const subType = expression.subType;
        switch (subType) {
            case "dec":
            case "int":
            case "uint":
                return +expression.value;
            case "bool":
                return expression.value;
            case "undefined":
                return undefined;
            case "string":
                return expression.segments
                    .map(segment => typeof segment === "string" ? segment : resolveLiteralValue.stringifyExpression?.(compiler, segment))
                    .join("");
            case "list":
                return expression.value
                    .map(value => (0, resolveExpression_1.default)(compiler, value));
            default: {
                const e2 = expression;
                throw compiler.error(e2.position, `Unable to resolve literal value type ${e2.subType}`);
            }
        }
    }
    (function (resolveLiteralValue) {
    })(resolveLiteralValue || (resolveLiteralValue = {}));
    exports.default = resolveLiteralValue;
});
//# sourceMappingURL=resolveLiteralValue.js.map