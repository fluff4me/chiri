var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumeWhiteSpaceOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    function ExpressionConstruct(name) {
        return {
            consume: consumer => {
                return {
                    consumeOptional: async (reader, consumeExpression, ...expectedTypes) => {
                        const position = reader.getPosition();
                        const restore = reader.savePosition();
                        if (!reader.consumeOptional(name))
                            return undefined;
                        if (!(0, consumeWhiteSpaceOptional_1.default)(reader))
                            return undefined;
                        const result = await consumer({ reader, consumeExpression, expectedTypes, position });
                        if (result === undefined)
                            reader.restorePosition(restore);
                        return result;
                    },
                };
            },
        };
    }
    exports.default = ExpressionConstruct;
});
//# sourceMappingURL=ExpressionConstruct.js.map