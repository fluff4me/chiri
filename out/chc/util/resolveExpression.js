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
        define(["require", "exports", "../read/factory/makeLiteralInt", "./resolveLiteralValue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Record = exports.SYMBOL_IS_RECORD = void 0;
    const makeLiteralInt_1 = __importDefault(require("../read/factory/makeLiteralInt"));
    const resolveLiteralValue_1 = __importStar(require("./resolveLiteralValue"));
    exports.SYMBOL_IS_RECORD = Symbol("IS_RECORD");
    var Record;
    (function (Record) {
        function is(value) {
            return typeof value === "object" && !!value && value[exports.SYMBOL_IS_RECORD];
        }
        Record.is = is;
    })(Record || (exports.Record = Record = {}));
    function resolveExpression(compiler, expression) {
        if (!expression)
            return undefined;
        switch (expression.type) {
            case "literal":
                return (0, resolveLiteralValue_1.default)(compiler, expression);
            case "text":
                return resolveExpression.stringifyText(compiler, expression);
            case "get":
                return compiler.getVariable(expression.name.value, expression.name.position);
            case "function":
                return compiler.getFunction(expression.name.value, expression.name.position);
            case "function-call":
                return compiler.callFunction(expression);
            case "get-by-key": {
                const obj = resolveExpression(compiler, expression.value);
                let key = resolveExpression.stringifyExpression(compiler, expression.key);
                if (!Record.is(obj) && !Array.isArray(obj))
                    throw compiler.error(`Cannot access value in "${key}" of "${resolveExpression.stringifyExpression(compiler, expression.value)}"`);
                if (Array.isArray(obj)) {
                    let index = +key;
                    index = index < 0 ? obj.length + index : index;
                    key = `${index}`;
                }
                return obj[key];
            }
            case "list-slice": {
                const list = resolveExpression(compiler, expression.list);
                if (!Array.isArray(list))
                    throw compiler.error("Cannot create list slice, invalid list");
                expression.range.end ??= (0, makeLiteralInt_1.default)(list.length);
                const range = (0, resolveLiteralValue_1.resolveLiteralRange)(compiler, expression.range, list);
                if (!Array.isArray(range))
                    throw compiler.error("Cannot create list slice, invalid range");
                const result = [];
                for (let index of range) {
                    if (typeof index !== "number")
                        throw compiler.error("Cannot create list slice, provided index is not an integer");
                    index = index < 0 ? range.length + index : index;
                    result.push(list[Math.max(0, Math.min(index, list.length - 1))]);
                }
                return result;
            }
            case "match": {
                const value = resolveExpression(compiler, expression.value);
                for (const matchCase of expression.cases)
                    if (resolveExpression(compiler, matchCase.condition) === value)
                        return resolveExpression(compiler, matchCase.expression);
                if (!expression.elseCase)
                    throw compiler.error(expression.position, "No cases of match expression matched, add an else case");
                return resolveExpression(compiler, expression.elseCase.expression);
            }
            case "pipe": {
                const left = resolveExpression(compiler, expression.left);
                compiler.pipeValueStack.push(left);
                const result = resolveExpression(compiler, expression.right);
                compiler.pipeValueStack.pop();
                return result;
            }
            case "pipe-use-left":
                return compiler.pipeValueStack.at(-1);
            case "conditional":
                return resolveExpression(compiler, expression.condition)
                    ? resolveExpression(compiler, expression.ifTrue)
                    : resolveExpression(compiler, expression.ifFalse);
            case "expression":
                switch (expression.subType) {
                    case "unary": {
                        const operand = resolveExpression(compiler, expression.operand);
                        switch (expression.operator) {
                            case "!":
                                return !operand;
                            case "+":
                                return +operand;
                            case "-":
                                return -operand;
                            case "~":
                                return ~operand;
                            case "exists":
                                return operand !== undefined;
                            default:
                                throw compiler.error(undefined, `Unable to resolve unary operator "${expression.operator}"`);
                        }
                    }
                    case "binary": {
                        const operandA = resolveExpression(compiler, expression.operandA);
                        const operandB = resolveExpression(compiler, expression.operandB);
                        switch (expression.operator) {
                            case "+":
                                return operandA + operandB;
                            case "-":
                                return operandA - operandB;
                            case "*":
                                return operandA * operandB;
                            case "/":
                                if (operandB === 0)
                                    return Infinity;
                                return operandA / operandB;
                            case "%":
                                // TODO maybe add an operator for normal %?
                                return ((operandA % operandB) + operandB) % operandB;
                            case "**":
                                return operandA ** operandB;
                            case "==":
                                return operandA === operandB;
                            case "!=":
                                return operandA !== operandB;
                            case "||":
                                return operandA || operandB;
                            case "&&":
                                return operandA && operandB;
                            case "|":
                                return operandA | operandB;
                            case "&":
                                return operandA & operandB;
                            case "^":
                                return operandA ^ operandB;
                            case "<=":
                                return operandA <= operandB;
                            case ">=":
                                return operandA >= operandB;
                            case "<":
                                return operandA < operandB;
                            case ">":
                                return operandA > operandB;
                            case ".":
                                return `${operandA}${operandB}`;
                            case "x":
                                return `${operandA}`.repeat(+operandB || 1);
                            case "??":
                                return operandA ?? operandB;
                            case "<<":
                                return operandA << operandB;
                            case ">>":
                                return operandA >> operandB;
                            case ">>>":
                                return operandA >>> operandB;
                            case "is":
                                return compiler.types.types[operandB].is?.(operandA) ?? false;
                            default:
                                throw compiler.error(undefined, `Unable to resolve binary operator "${expression.operator}"`);
                        }
                    }
                }
        }
        // @ts-expect-error Assert we never get here
        expression = expression;
        // @ts-expect-error ___
        throw compiler.error(expression.position, `Cannot compile expression result type "${expression.type}" yet`);
    }
    (function (resolveExpression) {
    })(resolveExpression || (resolveExpression = {}));
    resolveLiteralValue_1.default.resolveExpression = resolveExpression;
    exports.default = resolveExpression;
});
//# sourceMappingURL=resolveExpression.js.map