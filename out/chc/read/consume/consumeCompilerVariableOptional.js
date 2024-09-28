var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeType", "./consumeWhiteSpace", "./consumeWhiteSpaceOptional", "./consumeWord", "./consumeWordOptional", "./expression/consumeExpression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeType_1 = require("./consumeType");
    const consumeWhiteSpace_1 = __importDefault(require("./consumeWhiteSpace"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("./consumeWord"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    const consumeExpression_1 = __importDefault(require("./expression/consumeExpression"));
    exports.default = async (reader, prefix = true) => {
        const save = reader.savePosition();
        const position = reader.getPosition();
        if (prefix)
            reader.consume("#");
        const varWord = (0, consumeWordOptional_1.default)(reader, "var");
        let valueType = !varWord ? (0, consumeType_1.consumeTypeOptional)(reader)
            : {
                type: "type",
                name: { ...varWord, value: "*" },
                generics: [],
            };
        if (!valueType) {
            reader.restorePosition(save);
            return undefined;
        }
        if (valueType.name.value === "body" && reader.getVariables().find(variable => variable.valueType.name.value === "body"))
            throw reader.error(save.i, "A macro cannot declare multiple body parameters");
        (0, consumeWhiteSpace_1.default)(reader);
        const name = (0, consumeWord_1.default)(reader);
        const postType = reader.i;
        if (valueType)
            (0, consumeWhiteSpaceOptional_1.default)(reader);
        let assignment = reader.consumeOptional("??=", "=");
        if (assignment === "??=" && reader.context.type === "mixin")
            throw reader.error(save.i, "Mixins cannot accept parameters");
        let expression;
        if (assignment) {
            (0, consumeWhiteSpaceOptional_1.default)(reader);
            expression = await (0, consumeExpression_1.default)(reader, valueType);
            if (valueType.name.value === "*")
                valueType = expression.valueType;
        }
        else {
            reader.i = postType;
            if (!assignment && reader.consumeOptional("?"))
                assignment = "??=";
            else if (reader.context.type === "mixin")
                throw reader.error(save.i, "Mixins cannot accept parameters");
        }
        return {
            type: "variable",
            valueType,
            name,
            expression,
            position,
            assignment,
        };
    };
});
//# sourceMappingURL=consumeCompilerVariableOptional.js.map