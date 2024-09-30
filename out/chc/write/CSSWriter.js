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
        define(["require", "exports", "path", "../../args", "./Writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path_1 = __importDefault(require("path"));
    const args_1 = __importDefault(require("../../args"));
    const Writer_1 = __importStar(require("./Writer"));
    class CSSWriter extends Writer_1.default {
        currentSection = "default";
        queues = {
            "imports": Writer_1.QueuedWrite.makeQueue(),
            "root-properties": Writer_1.QueuedWrite.makeQueue(),
            "root-styles": Writer_1.QueuedWrite.makeQueue(),
            "default": this.outputQueue,
        };
        get queue() {
            return this.queues[this.currentSection];
        }
        constructor(ast, dest, config) {
            super(ast, dest, { extension: ".css", ...config });
        }
        createDestPath(outFile) {
            return typeof args_1.default["out-css"] === "string" ? path_1.default.resolve(args_1.default["out-css"], outFile) : super.createDestPath(outFile);
        }
        writingTo(section, dowhile) {
            if (this.currentSection === section)
                return;
            const oldSection = this.currentSection;
            this.currentSection = section;
            dowhile();
            this.currentSection = oldSection;
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
            const headerQueue = Writer_1.QueuedWrite.makeQueue();
            headerQueue.push(...this.queues.imports);
            headerQueue.push({ output: "\n" });
            headerQueue.push({ output: ":root {\n\t" });
            headerQueue.push(...this.queues["root-properties"]
                .map(wr => ({ ...wr, output: wr.output.replaceAll("\n", "\n\t") })));
            headerQueue.at(-1).output = headerQueue.at(-1).output.slice(0, -1);
            headerQueue.push({ output: "\n\t" });
            headerQueue.push(...this.queues["root-styles"]
                .map(wr => ({ ...wr, output: wr.output.replaceAll("\n", "\n\t") })));
            headerQueue.at(-1).output = headerQueue.at(-1).output.slice(0, -1);
            headerQueue.push({ output: "}\n\n" });
            this.outputQueue.unshift(...headerQueue);
            if (this.currentSection !== "default")
                this.currentSection = "default";
            this.write(`\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`);
        }
    }
    exports.default = CSSWriter;
});
//# sourceMappingURL=CSSWriter.js.map