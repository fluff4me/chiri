var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs/promises", "path", "source-map", "../../ansi", "../../args", "../util/relToCwd", "../util/stringifyText"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const promises_1 = __importDefault(require("fs/promises"));
    const path_1 = __importDefault(require("path"));
    const source_map_1 = require("source-map");
    const ansi_1 = __importDefault(require("../../ansi"));
    const args_1 = __importDefault(require("../../args"));
    const relToCwd_1 = __importDefault(require("../util/relToCwd"));
    const stringifyText_1 = __importDefault(require("../util/stringifyText"));
    class Writer {
        config;
        static writeBlocks(writers, inside) {
            writeBlocksRecursive();
            function writeBlocksRecursive() {
                const writer = writers.pop();
                if (!writer)
                    return inside();
                writer.writeBlock(writeBlocksRecursive);
            }
        }
        #indent = 0;
        dest;
        output = "";
        outputQueue = [{
                output: "",
            }];
        map;
        get queue() {
            return this.outputQueue;
        }
        get currentWrite() {
            return this.queue.at(-1);
        }
        constructor(ast, dest, config) {
            this.config = config;
            this.dest = this.createDestPath((0, relToCwd_1.default)(dest)) + config.extension;
            this.map = new source_map_1.SourceMapGenerator({ file: this.dest });
            for (const [filename, source] of Object.entries(ast.source))
                this.map.setSourceContent(filename, source);
        }
        createDestPath(outFile) {
            if (typeof args_1.default.out === "string")
                outFile = path_1.default.join(args_1.default.out, outFile);
            return path_1.default.resolve(outFile);
        }
        indent(amount = 1) {
            this.#indent += amount;
        }
        unindent(amount = 1) {
            this.#indent -= amount;
            for (let i = 0; i < amount; i++)
                if (this.currentWrite.output.at(-1) === "\t")
                    this.currentWrite.output = this.currentWrite.output.slice(0, -1);
        }
        async writeFile() {
            this.output = "";
            for (const queued of this.queue) {
                if (queued.mapping) {
                    this.map.addMapping({
                        generated: this.getPosition(),
                        source: queued.mapping.sourcePosition.file,
                        original: queued.mapping.sourcePosition,
                        name: queued.mapping.tokenName,
                    });
                }
                this.output += queued.output;
            }
            await promises_1.default.mkdir(path_1.default.dirname(this.dest), { recursive: true });
            return promises_1.default.writeFile(this.dest, this.output);
        }
        write(text) {
            this.currentWrite.output += text;
        }
        writeLine(text) {
            this.currentWrite.output += text;
            this.writeNewLine();
        }
        writeLineStartBlock(text) {
            this.currentWrite.output += text;
            this.indent();
            this.writeNewLine();
        }
        writeLineEndBlock(text) {
            this.unindent();
            this.currentWrite.output += text;
            this.writeNewLine();
        }
        writeTextInterpolated(compiler, source) {
            this.addMapping((0, stringifyText_1.default)(compiler, source), source.position);
        }
        writeWord(source) {
            this.addMapping(source.value, source.position, source.value);
        }
        writeNewLine() {
            this.currentWrite.output += "\n" + "\t".repeat(this.#indent);
        }
        writeNewLineOptional() {
            this.writeNewLine();
        }
        writeSpaceOptional() {
            this.currentWrite.output += " ";
        }
        writeBlock(inside) {
            const startIndex = this.currentWrite.output.length;
            this.indent();
            this.writeLine("{");
            const currentWrite = this.currentWrite;
            const insideStartIndex = this.currentWrite.output.length;
            inside();
            if (currentWrite === this.currentWrite && this.currentWrite.output.length === insideStartIndex) {
                this.currentWrite.output = this.currentWrite.output.slice(0, startIndex);
                this.write("{}");
                this.#indent--;
                return;
            }
            this.unindent();
            this.writeLine("}");
        }
        writeDocumentation(documentation) {
            this.writeLine("/**");
            const lines = documentation.content.split("\n");
            for (const line of lines)
                this.writeLine(` * ${line}`);
            this.writeLine(" */");
        }
        onCompileStart(compiler) { }
        onCompileEnd(compiler) { }
        addMapping(output, sourcePosition, tokenName) {
            this.queue.push({
                output,
                mapping: {
                    sourcePosition,
                    tokenName,
                },
            });
            this.queue.push({ output: "" });
        }
        getLineStart(at = this.output.length) {
            return this.output.lastIndexOf("\n", at - 1) + 1;
        }
        getLineEnd(at = this.output.length) {
            let index = this.output.indexOf("\n", at);
            if (index === -1)
                return this.output.length;
            while (this.output[--index] === "\r")
                ;
            return index + 1;
        }
        getPosition(at = this.output.length) {
            return {
                line: this.getLineNumber(at) + 1,
                column: this.getColumnNumber(at) + 1,
            };
        }
        #lastLineNumber = 0;
        #lastLineNumberPosition = 0;
        getLineNumber(at = this.output.length) {
            const recalc = at < this.#lastLineNumberPosition;
            if (recalc)
                console.warn(ansi_1.default.err + "Recalculating line number from start :(");
            let newlines = recalc ? 0 : this.#lastLineNumber;
            let j = recalc ? 0 : this.#lastLineNumberPosition;
            for (; j < at; j++)
                if (this.output[j] === "\n")
                    newlines++;
            if (!recalc) {
                this.#lastLineNumber = newlines;
                this.#lastLineNumberPosition = at;
            }
            return newlines;
        }
        getColumnNumber(at = this.output.length - 1) {
            return at - this.getLineStart(at);
        }
    }
    exports.default = Writer;
});
//# sourceMappingURL=Writer.js.map