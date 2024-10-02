var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resolveExpression", "./stringifyExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolveExpression_1 = __importDefault(require("./resolveExpression"));
    const stringifyExpression_1 = __importDefault(require("./stringifyExpression"));
    const stringifyText = (compiler, text) => {
        if (text.type === "word")
            return text.value;
        let result = "";
        for (const value of text.content) {
            if (typeof value === "string") {
                result += value;
                continue;
            }
            switch (value.type) {
                case "text":
                    result += stringifyText(compiler, value);
                    continue;
                case "text-raw":
                    result += value.text;
                    continue;
                case "interpolation-property":
                    result += `var(--${stringifyText(compiler, value.name)}${!value.defaultValue ? "" : `,${compiler.css.getSpaceOptional()}${stringifyText(compiler, value.defaultValue)}`})`;
                    continue;
                case "interpolation-variable":
                    result += (0, stringifyExpression_1.default)(compiler, compiler.getVariable(value.name.value, value.name.position));
                    continue;
                default:
                    result += (0, stringifyExpression_1.default)(compiler, value);
            }
        }
        return result;
    };
    resolveExpression_1.default.stringifyText = stringifyText;
    exports.default = stringifyText;
});
//# sourceMappingURL=stringifyText.js.map