var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ChiriType", "./TypeDefinition"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BodyVariableContexts = void 0;
    const ChiriType_1 = require("./ChiriType");
    const TypeDefinition_1 = __importDefault(require("./TypeDefinition"));
    exports.BodyVariableContexts = [
        "text",
        "property-name",
        "component",
    ];
    exports.default = (0, TypeDefinition_1.default)({
        type: ChiriType_1.ChiriType.of("body"),
        generics: [
            exports.BodyVariableContexts,
        ],
    });
});
//# sourceMappingURL=typeBody.js.map