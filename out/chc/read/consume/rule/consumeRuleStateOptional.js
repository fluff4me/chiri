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
        const restore = reader.savePosition();
        const position = reader.getPosition();
        const states = [];
        let prefix;
        do {
            const thisPrefix = prefix ? reader.consumeOptional(prefix) : reader.consumeOptional(":", "&:");
            if (!thisPrefix)
                break;
            prefix = thisPrefix;
            const state = (0, consumeWord_1.default)(reader, ...componentStates_1.STATES, "not");
            if (state.value === "not") {
                while ((0, consumeWhiteSpaceOptional_1.default)(reader)) {
                    reader.consume(":");
                    const substate = reader.consume(...componentStates_1.STATES);
                    state.value += ` ${componentStates_1.STATE_MAP[substate]}`;
                }
                state.value = `:not(${state.value.slice(4).replaceAll(" ", ",")})`;
            }
            else {
                state.value = componentStates_1.STATE_MAP[state.value].replaceAll(" ", ",");
            }
            states.push(state);
        } while (reader.consumeOptional(",") && ((0, consumeWhiteSpaceOptional_1.default)(reader) || true));
        if (!states.length) {
            reader.restorePosition(restore);
            return undefined;
        }
        reader.consume(":");
        return {
            type: "component",
            subType: "state",
            spread: prefix === "&:",
            states,
            ...await (0, consumeBody_1.default)(reader, "state"),
            position,
        };
    };
});
//# sourceMappingURL=consumeRuleStateOptional.js.map