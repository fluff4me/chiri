var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../../constants", "../body/Contexts", "../consumeBodyOptional", "../consumeFunctionParameters", "../consumeWhiteSpaceOptional", "../consumeWordOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const constants_1 = require("../../../../constants");
    const Contexts_1 = __importDefault(require("../body/Contexts"));
    const consumeBodyOptional_1 = __importDefault(require("../consumeBodyOptional"));
    const consumeFunctionParameters_1 = __importDefault(require("../consumeFunctionParameters"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("../consumeWhiteSpaceOptional"));
    const consumeWordOptional_1 = __importDefault(require("../consumeWordOptional"));
    function default_1(macroName) {
        const parameters = [];
        let parametersConsumer;
        let bodyContext;
        let named = false;
        let usability = Contexts_1.default.slice();
        return {
            usability(...types) {
                usability = types;
                return this;
            },
            named() {
                named = true;
                return this;
            },
            consumeParameters(consumer) {
                parametersConsumer = consumer;
                return this;
            },
            parameter(name, type, value) {
                parameters.push({
                    type: "variable",
                    name: { type: "word", value: name, position: constants_1.INTERNAL_POSITION },
                    valueType: type,
                    assignment: "??=",
                    position: constants_1.INTERNAL_POSITION,
                    expression: value,
                });
                return this;
            },
            body(...data) {
                bodyContext = data;
                return this;
            },
            consume(consumer) {
                const macro = {
                    type: "macro:internal",
                    name: { type: "word", value: macroName, position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                    content: parameters,
                    async consumeOptional(reader, ...contextTuple) {
                        const [useContextType, useContextData] = contextTuple;
                        const useContext = !useContextType || useContextType === "inherit" ? reader.context : { type: useContextType, data: useContextData };
                        const position = reader.getPosition();
                        const savedPosition = reader.savePosition();
                        const start = reader.i;
                        if (!reader.consumeOptional(`#${macroName}`))
                            return undefined;
                        if (!usability.includes(useContext.type))
                            throw reader.error(`#${useContextType} cannot be used in "${useContext.type}" context`);
                        let name;
                        if (named) {
                            if (!(0, consumeWhiteSpaceOptional_1.default)(reader))
                                throw reader.error("Expected declaration name");
                            name = (0, consumeWordOptional_1.default)(reader);
                            if (!name)
                                throw reader.error("Expected declaration name");
                        }
                        const extra = await parametersConsumer?.(reader);
                        const assignments = parametersConsumer ? {} : (0, consumeFunctionParameters_1.default)(reader, start, macro);
                        const info = {
                            reader,
                            assignments,
                            name: name,
                            extra,
                            position,
                            start,
                        };
                        const [contextType, contextData] = bodyContext ?? [];
                        const context = !contextType ? undefined : contextType === "inherit" ? reader.context : { type: contextType, data: contextData?.(info) };
                        const body = context ? await (0, consumeBodyOptional_1.default)(reader, ...[context.type, context.data]) : [];
                        info.body = body;
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        const result = await consumer(info);
                        if (!result)
                            reader.restorePosition(savedPosition);
                        return result;
                    },
                };
                return macro;
            },
        };
    }
});
//# sourceMappingURL=MacroConstruct.js.map