var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./consumeNewBlockLineOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const consumeNewBlockLineOptional_1 = __importDefault(require("./consumeNewBlockLineOptional"));
    exports.default = (reader) => {
        const position = reader.getPosition();
        if (!reader.consumeOptional(";; "))
            return undefined;
        let documentation = "";
        while (true) {
            if (documentation && !reader.consumeOptional("  "))
                documentation += "\n";
            for (; reader.i < reader.input.length; reader.i++) {
                if (reader.input[reader.i] === "\n") {
                    documentation += "\n";
                    break;
                }
                else if (reader.input[reader.i] !== "\r")
                    documentation += reader.input[reader.i];
            }
            const beforeConsumeNewline = reader.savePosition();
            if (!(0, consumeNewBlockLineOptional_1.default)(reader))
                throw reader.error("Expected additional documentation or documented declaration");
            if (!reader.consumeOptional(";; ")) {
                reader.restorePosition(beforeConsumeNewline);
                return {
                    type: "documentation",
                    content: documentation.slice(0, -1),
                    position,
                };
            }
        }
    };
});
//# sourceMappingURL=consumeDocumentationOptional.js.map