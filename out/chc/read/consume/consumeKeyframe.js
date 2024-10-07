var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../type/typeDec", "../factory/literalDec", "./consumeBody", "./consumeWordOptional", "./expression/consumeExpression", "./numeric/consumeDecimalOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const typeDec_1 = __importDefault(require("../../type/typeDec"));
    const literalDec_1 = __importDefault(require("../factory/literalDec"));
    const consumeBody_1 = __importDefault(require("./consumeBody"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    const consumeDecimalOptional_1 = __importDefault(require("./numeric/consumeDecimalOptional"));
    exports.default = async (reader) => {
        const position = reader.getPosition();
        const at = consumeKeyframeAt(reader);
        reader.consume(":");
        return {
            type: "keyframe",
            at,
            ...await (0, consumeBody_1.default)(reader, "keyframe"),
            position,
        };
    };
    function consumeKeyframeAt(reader) {
        const keyword = (0, consumeWordOptional_1.default)(reader, "from", "to");
        switch (keyword?.value) {
            case "from": return (0, literalDec_1.default)(0);
            case "to": return (0, literalDec_1.default)(100);
        }
        const dec = (0, consumeDecimalOptional_1.default)(reader);
        if (dec) {
            reader.consume("%");
            return dec;
        }
        reader.consume("#{");
        const expr = consumeExpression_1.default.inline(reader, typeDec_1.default.type);
        reader.consume("}");
        return expr;
    }
});
//# sourceMappingURL=consumeKeyframe.js.map