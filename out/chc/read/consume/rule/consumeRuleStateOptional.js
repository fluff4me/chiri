var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../util/componentStates", "../consumeBody", "../consumeWhiteSpaceOptional", "../consumeWord"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const componentStates_1 = require("../../../util/componentStates");
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWord_1 = __importDefault(require("../consumeWord"));
    exports.default = async (reader) => {
        const position = reader.getPosition();
        const states = [];
        do {
            const prefix = reader.consumeOptional(":");
            if (!prefix)
                break;
            states.push((0, consumeWord_1.default)(reader, ...componentStates_1.STATES));
        } while (reader.consumeOptional(",") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true));
        if (!states.length)
            return undefined;
        reader.consume(":");
        return {
            type: "component",
            subType: "state",
            states,
            ...await (0, consumeBody_1.default)(reader, "state"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleStateOptional.js.map