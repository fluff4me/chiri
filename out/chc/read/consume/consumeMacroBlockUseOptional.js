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
        define(["require", "exports", "../../util/_", "./consumeWordOptional", "./macro/macroDo", "./macro/macroEach", "./macro/macroFor", "./macro/macroIf", "./macro/macroWhile"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = consumeMacroBlockUseOptional;
    const _1 = __importDefault(require("../../util/_"));
    const consumeWordOptional_1 = __importDefault(require("./consumeWordOptional"));
    const macroDo_1 = __importDefault(require("./macro/macroDo"));
    const macroEach_1 = __importDefault(require("./macro/macroEach"));
    const macroFor_1 = __importDefault(require("./macro/macroFor"));
    const macroIf_1 = __importStar(require("./macro/macroIf"));
    const macroWhile_1 = __importDefault(require("./macro/macroWhile"));
    async function consumeMacroBlockUseOptional(reader, context) {
        const savedPosition = reader.savePosition();
        const label = consumeLabelOptional(reader);
        const result = _1.default
            ?? await macroDo_1.default.consumeOptional(reader, ...context)
            ?? await macroEach_1.default.consumeOptional(reader, ...context)
            ?? await macroIf_1.default.consumeOptional(reader, ...context)
            ?? await macroIf_1.macroIfElse.consumeOptional(reader, ...context)
            ?? await macroIf_1.macroElse.consumeOptional(reader, ...context)
            ?? await macroFor_1.default.consumeOptional(reader, ...context)
            ?? await macroWhile_1.default.consumeOptional(reader, ...context);
        if (!result) {
            reader.restorePosition(savedPosition);
            return undefined;
        }
        result.label = label;
        return result;
    }
    function consumeLabelOptional(reader) {
        const savedPosition = reader.savePosition();
        if (!reader.consumeOptional("#:"))
            return undefined;
        const label = (0, consumeWordOptional_1.default)(reader);
        if (!label?.value)
            return undefined;
        if (!reader.consumeOptional(" ")) {
            reader.restorePosition(savedPosition);
            return undefined;
        }
        return label;
    }
});
//# sourceMappingURL=consumeMacroBlockUseOptional.js.map