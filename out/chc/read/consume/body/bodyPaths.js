var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../consumePathOptional", "./BodyConsumer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumePathOptional_1 = __importDefault(require("../consumePathOptional"));
    const BodyConsumer_1 = __importDefault(require("./BodyConsumer"));
    exports.default = (0, BodyConsumer_1.default)("paths", reader => {
        const path = (0, consumePathOptional_1.default)(reader);
        if (!path)
            throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
                : "Expected file path");
        return path;
    });
});
//# sourceMappingURL=bodyPaths.js.map