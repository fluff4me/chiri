var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resolveLiteralValue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolveLiteralValue_1 = __importDefault(require("./resolveLiteralValue"));
    const resolveExpression = (compiler, expression) => {
        if (!expression)
            return undefined;
        switch (expression.type) {
            case "literal":
                return (0, resolveLiteralValue_1.default)(compiler, expression);
            case "get":
                return compiler.getVariable(expression.name.value, expression.name.position);
            case "function-call":
                return compiler.callFunction(expression);
            case "match": {
                const value = resolveExpression(compiler, expression.value);
                for (const matchCase of expression.cases)
                    if (resolveExpression(compiler, matchCase.condition) === value)
                        return resolveExpression(compiler, matchCase.expression);
                if (!expression.elseCase)
                    throw compiler.error(expression.position, "No cases of match expression matched, add an else case");
                return resolveExpression(compiler, expression.elseCase.expression);
            }
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
                            default:
                                throw compiler.error(undefined, `Unable to resolve binary operator "${expression.operator}"`);
                        }
                    }
                }
        }
        throw compiler.error(expression.position, `Cannot compile expression result type "${expression.type}" yet`);
    };
    resolveLiteralValue_1.default.resolveExpression = resolveExpression;
    exports.default = resolveExpression;
});
//# sourceMappingURL=resolveExpression.js.map