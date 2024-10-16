var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../util/componentStates", "../consumeBody", "../consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const componentStates_1 = require("../../../util/componentStates");
    const consumeBody_1 = __importDefault(require("../consumeBody"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    exports.default = async (reader) => {
        const restore = reader.savePosition();
        const prefix = reader.consumeOptional(":");
        if (!prefix)
            return;
        const position = reader.getPosition();
        const state = (0, consumeWordOptional_1.default)(reader, ...componentStates_1.STATES_SPECIAL);
        if (!state) {
            reader.restorePosition(restore);
            return undefined;
        }
        reader.consume(":");
        return {
            type: "component",
            subType: "state-special",
            state,
            ...await (0, consumeBody_1.default)(reader, "state"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleStateSpecialOptional.js.map