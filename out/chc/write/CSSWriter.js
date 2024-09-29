var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "../../args", "./Writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path_1 = __importDefault(require("path"));
    const args_1 = __importDefault(require("../../args"));
    const Writer_1 = __importDefault(require("./Writer"));
    class CSSWriter extends Writer_1.default {
        writingToType = "default";
        rootQueue = [{
                output: "",
            }];
        importsQueue = [{
                output: "",
            }];
        get queue() {
            switch (this.writingToType) {
                case "root": return this.rootQueue;
                case "imports": return this.importsQueue;
                default: return super.queue;
            }
        }
        constructor(ast, dest, config) {
            super(ast, dest, { extension: ".css", ...config });
        }
        createDestPath(outFile) {
            return typeof args_1.default["out-css"] === "string" ? path_1.default.resolve(args_1.default["out-css"], outFile) : super.createDestPath(outFile);
        }
        writingTo(writingTo, dowhile) {
            if (this.writingToType === writingTo)
                return;
            const oldWritingTo = this.writingToType;
            this.writingToType = writingTo;
            dowhile();
            this.writingToType = oldWritingTo;
        }
        emitProperty(compiler, property) {
            if (property.isCustomProperty)
                this.write("--");
            const aliases = property.isCustomProperty ? [property.property.value] : compiler.getAlias(property.property.value);
            for (const alias of aliases) {
                this.writeWord({ type: "word", value: alias, position: property.property.position });
                this.write(":");
                this.writeSpaceOptional();
                this.write(property.value);
                this.writeLine(";");
            }
        }
        onCompileEnd(compiler) {
            for (const rootWrite of this.rootQueue)
                rootWrite.output = rootWrite.output.replaceAll("\n", "\n\t");
            this.rootQueue.unshift({ output: ":root {\n\t" });
            const lastRootProperty = this.rootQueue.at(-1);
            lastRootProperty.output = lastRootProperty.output.slice(0, -1);
            this.rootQueue.push({ output: "}\n\n" });
            this.outputQueue.unshift(...this.rootQueue);
            // imports above :root
            this.importsQueue.push({ output: "\n" });
            this.outputQueue.unshift(...this.importsQueue);
            if (this.writingToType !== "default")
                this.writingToType = "default";
            this.write(`\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`);
        }
    }
    exports.default = CSSWriter;
});
//# sourceMappingURL=CSSWriter.js.map