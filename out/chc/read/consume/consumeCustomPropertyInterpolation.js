var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeWhiteSpaceOptional", "./consumeWordInterpolated"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consumeWhiteSpaceOptional"));
    const consumeWordInterpolated_1 = __importDefault(require("./consumeWordInterpolated"));
    function consumeCustomPropertyInterpolation(reader, varType) {
        const wrapped = reader.consumeOptional("{");
        const property = (0, consumeWordInterpolated_1.default)(reader);
        let defaultValue;
        if (wrapped) {
            if (varType !== "$$" && reader.consumeOptional(":")) {
                (0, consumeWhiteSpaceOptional_1.default)(reader);
                defaultValue = consumeCustomPropertyInterpolation.consumeValueText(reader, false, () => !!reader.peek("}"));
            }
            reader.consume("}");
        }
        if (varType === "$$") {
            return {
                type: "interpolation-property-name",
                name: property,
                position: property.position,
            };
        }
        else {
            return {
                type: "interpolation-property",
                name: property,
                defaultValue,
                position: property.position,
            };
        }
    }
    (function (consumeCustomPropertyInterpolation) {
    })(consumeCustomPropertyInterpolation || (consumeCustomPropertyInterpolation = {}));
    exports.default = consumeCustomPropertyInterpolation;
});
//# sourceMappingURL=consumeCustomPropertyInterpolation.js.map