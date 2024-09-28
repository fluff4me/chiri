var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeBlockStartOptional", "./consumeValueText", "./consumeWhiteSpace", "./consumeWordInterpolated"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeBlockStartOptional_1 = __importDefault(require("./consumeBlockStartOptional"));
    const consumeValueText_1 = __importDefault(require("./consumeValueText"));
    const consumeWhiteSpace_1 = __importDefault(require("./consumeWhiteSpace"));
    const consumeWordInterpolated_1 = __importDefault(require("./consumeWordInterpolated"));
    exports.default = (reader) => {
        const e = reader.i;
        if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#")
            return undefined;
        if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
            return undefined;
        const position = reader.getPosition();
        const isCustomProperty = reader.consumeOptional("$");
        const property = (0, consumeWordInterpolated_1.default)(reader);
        reader.consume(":");
        (0, consumeWhiteSpace_1.default)(reader);
        const value = (0, consumeValueText_1.default)(reader, !!(0, consumeBlockStartOptional_1.default)(reader));
        return {
            type: "property",
            isCustomProperty: isCustomProperty ? true : undefined,
            position,
            property,
            value,
        };
    };
});
//# sourceMappingURL=consumePropertyOptional.js.map