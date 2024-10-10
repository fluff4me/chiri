var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    const resolveExpression_1 = __importStar(require("./resolveExpression"));
    const resolveLiteralValue_1 = __importDefault(require("./resolveLiteralValue"));
    const stringifyExpression = (compiler, expression) => {
        if (expression === undefined)
            return "";
        const resolved = typeof expression === "object" && !Array.isArray(expression) && !resolveExpression_1.Record.is(expression) ? (0, resolveExpression_1.default)(compiler, expression) : expression;
        switch (typeof resolved) {
            case "number":
            case "boolean":
                return `${resolved}`;
            case "undefined":
                return "";
            case "string":
                return resolved;
        }
        if (Array.isArray(resolved))
            return resolved.map(v => stringifyExpression(compiler, v)).join(" ");
        if (resolveExpression_1.Record.is(resolved))
            return Object.entries(resolved).map(([k, v]) => `${k}: ${stringifyExpression(compiler, v)}`).join(" ");
        throw compiler.error(undefined, `Expression resolved to unstringifiable type "${typeof resolved}"`);
    };
    resolveLiteralValue_1.default.stringifyExpression = stringifyExpression;
    exports.default = stringifyExpression;
});
//# sourceMappingURL=stringifyExpression.js.map