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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../type/ChiriType", "./resolveExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveLiteralRange = resolveLiteralRange;
    const ChiriType_1 = require("../type/ChiriType");
    const resolveExpression_1 = __importStar(require("./resolveExpression"));
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
            case "range":
                return resolveLiteralRange(compiler, expression);
            case "list":
                return expression.value
                    .flatMap(content => {
                    if (content.type !== "list-spread")
                        return [(0, resolveExpression_1.default)(compiler, content)];
                    const value = (0, resolveExpression_1.default)(compiler, content.value);
                    if (!Array.isArray(value))
                        throw compiler.error(content.position, `Unable to spread a value of type "${ChiriType_1.ChiriType.stringify(content.value.valueType)}"`);
                    return value;
                });
            case "record":
                return Object.assign(Object.fromEntries(expression.value
                    .flatMap(content => {
                    if (Array.isArray(content)) {
                        const [key, value] = content;
                        return [[resolveLiteralValue.stringifyExpression(compiler, key), (0, resolveExpression_1.default)(compiler, value)]];
                    }
                    const value = resolveLiteralValue.resolveExpression(compiler, content);
                    if (!resolveExpression_1.Record.is(value))
                        throw compiler.error(content.position, `Unable to spread a value of type "${ChiriType_1.ChiriType.stringify(content.valueType)}"`);
                    return Object.entries(value);
                })), { [resolveExpression_1.SYMBOL_IS_RECORD]: true });
            default: {
                const e2 = expression;
                throw compiler.error(e2.position, `Unable to resolve literal value type ${e2.subType}`);
            }
        }
    }
    function resolveLiteralRange(compiler, range, list) {
        let startRaw = resolveLiteralValue.resolveExpression(compiler, range.start);
        if (startRaw !== undefined && !Number.isInteger(startRaw))
            throw compiler.error(range.position, "Invalid value for range start bound");
        let endRaw = resolveLiteralValue.resolveExpression(compiler, range.end);
        if (endRaw !== undefined && !Number.isInteger(endRaw))
            throw compiler.error(range.position, "Invalid value for range end bound");
        if (endRaw < 0 || list && startRaw >= list.length)
            return [];
        startRaw ??= 0;
        endRaw ??= list?.length;
        const listLength = list?.length ?? 0;
        let start = startRaw;
        start = start < 0 ? listLength + start : start;
        start = !list ? start : Math.max(0, Math.min(start, listLength - 1));
        let end = endRaw;
        end = end < 0 ? listLength + end : end;
        end = !list ? end
            : range.inclusive ? Math.max(0, Math.min(end, listLength - 1))
                : Math.max(-1, Math.min(end, listLength));
        const result = [];
        if (range.inclusive)
            if (start < end)
                for (let i = start; i <= end; i++)
                    result.push(i);
            else
                for (let i = start; i >= end; i--)
                    result.push(i);
        else if (start < end)
            for (let i = start; i < end; i++)
                result.push(i);
        else
            for (let i = start; i > end; i--)
                result.push(i);
        return result;
    }
    (function (resolveLiteralValue) {
    })(resolveLiteralValue || (resolveLiteralValue = {}));
    exports.default = resolveLiteralValue;
});
//# sourceMappingURL=resolveLiteralValue.js.map