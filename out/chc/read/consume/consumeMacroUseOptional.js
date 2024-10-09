var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../util/getFunctionParameters", "./body/Contexts", "./consumeBodyOptional", "./consumeCompilerVariableOptional", "./consumeMacroParameters", "./consumeWordOptional", "./macro/macroAfter", "./macro/macroAlias", "./macro/macroAnimate", "./macro/macroAnimation", "./macro/macroDebug", "./macro/macroDo", "./macro/macroEach", "./macro/macroExport", "./macro/macroFor", "./macro/macroFunctionDeclaration", "./macro/macroIf", "./macro/macroImport", "./macro/macroInclude", "./macro/macroMacroDeclaration", "./macro/macroSet", "./macro/macroShorthand", "./macro/macroWhile"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const getFunctionParameters_1 = __importDefault(require("../../util/getFunctionParameters"));
    const Contexts_1 = __importDefault(require("./body/Contexts"));
    const consumeBodyOptional_1 = __importDefault(require("./consumeBodyOptional"));
    const consumeCompilerVariableOptional_1 = __importDefault(require("./consumeCompilerVariableOptional"));
    const consumeMacroParameters_1 = __importDefault(require("./consumeMacroParameters"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    const macroAfter_1 = __importDefault(require("./macro/macroAfter"));
    const macroAlias_1 = __importDefault(require("./macro/macroAlias"));
    const macroAnimate_1 = __importDefault(require("./macro/macroAnimate"));
    const macroAnimation_1 = __importDefault(require("./macro/macroAnimation"));
    const macroDebug_1 = __importDefault(require("./macro/macroDebug"));
    const macroDo_1 = __importDefault(require("./macro/macroDo"));
    const macroEach_1 = __importDefault(require("./macro/macroEach"));
    const macroExport_1 = __importDefault(require("./macro/macroExport"));
    const macroFor_1 = __importDefault(require("./macro/macroFor"));
    const macroFunctionDeclaration_1 = __importDefault(require("./macro/macroFunctionDeclaration"));
    const macroIf_1 = __importStar(require("./macro/macroIf"));
    const macroImport_1 = __importStar(require("./macro/macroImport"));
    const macroInclude_1 = __importDefault(require("./macro/macroInclude"));
    const macroMacroDeclaration_1 = __importDefault(require("./macro/macroMacroDeclaration"));
    const macroSet_1 = __importDefault(require("./macro/macroSet"));
    const macroShorthand_1 = __importDefault(require("./macro/macroShorthand"));
    const macroWhile_1 = __importDefault(require("./macro/macroWhile"));
    async function default_1(reader, ...args) {
        if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
            return undefined;
        if (reader.peek("#return "))
            return undefined;
        const context = args;
        if (await macroExport_1.default.consumeOptional(reader, ...context))
            return undefined;
        const result = undefined
            ?? await macroImport_1.macroImportCSS.consumeOptional(reader, ...context)
            ?? await macroImport_1.default.consumeOptional(reader, ...context)
            ?? await macroDebug_1.default.consumeOptional(reader, ...context)
            ?? await macroMacroDeclaration_1.default.consumeOptional(reader, ...context)
            ?? await macroFunctionDeclaration_1.default.consumeOptional(reader, ...context)
            ?? await macroShorthand_1.default.consumeOptional(reader, ...context)
            ?? await macroAlias_1.default.consumeOptional(reader, ...context)
            ?? await macroEach_1.default.consumeOptional(reader, ...context)
            ?? await macroDo_1.default.consumeOptional(reader, ...context)
            ?? await macroSet_1.default.consumeOptional(reader, ...context)
            ?? await macroFor_1.default.consumeOptional(reader, ...context)
            ?? await macroWhile_1.default.consumeOptional(reader, ...context)
            ?? await macroIf_1.default.consumeOptional(reader, ...context)
            ?? await macroIf_1.macroIfElse.consumeOptional(reader, ...context)
            ?? await macroIf_1.macroElse.consumeOptional(reader, ...context)
            ?? await macroAnimation_1.default.consumeOptional(reader, ...context)
            ?? await macroAnimate_1.default.consumeOptional(reader, ...context)
            ?? await macroAfter_1.default.consumeOptional(reader, ...context)
            ?? await macroInclude_1.default.consumeOptional(reader, ...context)
            ?? await consumeDeclaredUse(reader)
            ?? await (0, consumeCompilerVariableOptional_1.default)(reader);
        if (!result) {
            if (reader.context?.type === "text")
                return undefined;
            const saved = reader.savePosition();
            const e = reader.i;
            reader.consume("#");
            const word = (0, consumeWordOptional_1.default)(reader);
            if (word) {
                const i = reader.i;
                reader.restorePosition(saved);
                reader.i = i;
                throw reader.error(e, "Unknown macro command");
            }
            reader.restorePosition(saved);
            throw reader.error("Indecipherable macro syntax");
        }
        return result;
    }
    async function consumeDeclaredUse(reader) {
        const position = reader.getPosition();
        const restore = reader.savePosition();
        if (!reader.consumeOptional("#"))
            return undefined;
        const word = (0, consumeWordOptional_1.default)(reader);
        const fn = word?.value && reader.getMacroOptional(word.value);
        if (!fn) {
            reader.restorePosition(restore);
            return undefined;
        }
        const assignments = (0, consumeMacroParameters_1.default)(reader, restore.i, fn);
        const bodyParameter = (0, getFunctionParameters_1.default)(fn)
            .sort((a, b) => +!!a.expression - +!!b.expression)
            .find(parameter => parameter.valueType.name.value === "body");
        const context = bodyParameter?.valueType.generics[0].name.value;
        if (context === "function" || (context && !Contexts_1.default.includes(context)))
            throw reader.error(`Invalid body context "${context}"`);
        const body = context && await (0, consumeBodyOptional_1.default)(reader, context);
        return {
            type: "macro-use",
            name: word,
            assignments,
            content: body ?? [],
            position,
        };
    }
});
//# sourceMappingURL=consumeMacroUseOptional.js.map