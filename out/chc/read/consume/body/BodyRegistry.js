var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./bodyFunction", "./bodyPaths", "./bodyPropertyName", "./bodyText"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const bodyFunction_1 = __importDefault(require("./bodyFunction"));
    const bodyPaths_1 = __importDefault(require("./bodyPaths"));
    const bodyPropertyName_1 = __importDefault(require("./bodyPropertyName"));
    const bodyText_1 = __importDefault(require("./bodyText"));
    const BodyRegistry = {
        function: bodyFunction_1.default,
        inherit: undefined,
        generic: undefined,
        root: undefined,
        mixin: undefined,
        component: undefined,
        state: undefined,
        pseudo: undefined,
        "property-name": bodyPropertyName_1.default,
        paths: bodyPaths_1.default,
        text: bodyText_1.default,
    };
    exports.default = BodyRegistry;
});
//# sourceMappingURL=BodyRegistry.js.map