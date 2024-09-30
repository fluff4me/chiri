var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs/promises", "path", "../../ansi", "../../constants", "../type/ChiriType", "../type/ChiriTypeManager", "../util/Arrays", "../util/Errors", "../util/relToCwd", "../util/Strings", "./consume/consumeBlockEnd", "./consume/consumeDocumentationOptional", "./consume/consumeMacroUseOptional", "./consume/consumeMixinOptional", "./consume/consumeMixinUseOptional", "./consume/consumeNewBlockLineOptional", "./consume/consumePropertyOptional", "./consume/consumeWhiteSpaceOptional", "./consume/rule/consumeRuleMainOptional", "./consume/rule/consumeRuleStateOptional"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const promises_1 = __importDefault(require("fs/promises"));
    const path_1 = __importDefault(require("path"));
    const ansi_1 = __importDefault(require("../../ansi"));
    const constants_1 = require("../../constants");
    const ChiriType_1 = require("../type/ChiriType");
    const ChiriTypeManager_1 = __importDefault(require("../type/ChiriTypeManager"));
    const Arrays_1 = __importDefault(require("../util/Arrays"));
    const Errors_1 = __importDefault(require("../util/Errors"));
    const relToCwd_1 = __importDefault(require("../util/relToCwd"));
    const Strings_1 = __importDefault(require("../util/Strings"));
    const consumeBlockEnd_1 = __importDefault(require("./consume/consumeBlockEnd"));
    const consumeDocumentationOptional_1 = __importDefault(require("./consume/consumeDocumentationOptional"));
    const consumeMacroUseOptional_1 = __importDefault(require("./consume/consumeMacroUseOptional"));
    const consumeMixinOptional_1 = __importDefault(require("./consume/consumeMixinOptional"));
    const consumeMixinUseOptional_1 = __importDefault(require("./consume/consumeMixinUseOptional"));
    const consumeNewBlockLineOptional_1 = __importDefault(require("./consume/consumeNewBlockLineOptional"));
    const consumePropertyOptional_1 = __importDefault(require("./consume/consumePropertyOptional"));
    const consumeWhiteSpaceOptional_1 = __importDefault(require("./consume/consumeWhiteSpaceOptional"));
    const consumeRuleMainOptional_1 = __importDefault(require("./consume/rule/consumeRuleMainOptional"));
    const consumeRuleStateOptional_1 = __importDefault(require("./consume/rule/consumeRuleStateOptional"));
    class ChiriReader {
        filename;
        input;
        context;
        stack;
        source;
        static async load(filename, reader) {
            filename = path_1.default.resolve(filename);
            if (!filename.endsWith(".chiri"))
                filename += ".chiri";
            if (reader?.used.has(filename) && !reader.reusable.has(filename))
                throw reader.error("This source file is not exported as reusable");
            const ch = await promises_1.default.readFile(filename, "utf8");
            const result = new ChiriReader(filename, ch, reader?.cwd, undefined, reader?.stack.slice(), reader?.source);
            result.used = reader?.used ?? result.used;
            result.reusable = reader?.reusable ?? result.reusable;
            result.used.add(filename);
            return result;
        }
        types = new ChiriTypeManager_1.default(this);
        #outerStatements = [];
        #statements = [];
        #errorStart;
        i = 0;
        indent = 0;
        #multiline = true;
        #isSubReader = false;
        #errored = false;
        used = new Set();
        reusable = new Set();
        importName;
        basename;
        dirname;
        cwd;
        get errored() {
            return this.#errored;
        }
        get isSubReader() {
            return this.#isSubReader;
        }
        constructor(filename, input, cwd, context = { type: "root" }, stack = [], source = {}) {
            this.filename = filename;
            this.input = input;
            this.context = context;
            this.stack = stack;
            this.source = source;
            this.basename = path_1.default.join(path_1.default.dirname(filename), path_1.default.basename(filename, path_1.default.extname(filename)));
            this.dirname = path_1.default.dirname(filename);
            this.cwd = cwd ?? this.dirname;
            this.stack.push(filename);
            this.source[filename] = this.input;
            this.consumeBodyDefault = this.consumeBodyDefault.bind(this);
        }
        setReusable() {
            this.reusable.add(this.filename);
            return true;
        }
        sub(multiline, context, ...data) {
            // this.logLine(undefined, `sub for ${context}`)
            const contextData = { type: context, data: data[0] };
            const reader = new ChiriReader(this.filename, this.input, undefined, contextData, this.stack.slice(), this.source);
            reader.i = this.i;
            reader.indent = this.indent;
            reader.#multiline = multiline;
            reader.#lastLineNumber = this.#lastLineNumber;
            reader.#lastLineNumberPosition = this.#lastLineNumberPosition;
            reader.#outerStatements = [...this.#outerStatements, ...this.#statements];
            reader.types = this.types.clone(reader);
            if (reader.context.type === "function")
                reader.types.registerGenerics(...reader.context.data.types);
            reader.used = this.used;
            reader.reusable = this.reusable;
            reader.#isSubReader = true;
            return reader;
        }
        addOuterStatement(statement) {
            this.#outerStatements.push(statement);
            return this;
        }
        /**
         * Update this reader to the position of the subreader
         */
        update(reader) {
            this.i = reader.i;
            this.indent = reader.indent;
            this.#errored ||= reader.#errored;
        }
        getVariables(onlyThisBlock) {
            return (onlyThisBlock ? this.#statements : [...this.#outerStatements, ...this.#statements])
                .filter((statement) => statement.type === "variable");
        }
        getVariableOptional(name) {
            return undefined
                ?? this.#statements.findLast((statement) => statement.type === "variable" && statement.name.value === name)
                ?? this.#outerStatements.findLast((statement) => statement.type === "variable" && statement.name.value === name);
        }
        getVariable(name, start = this.i) {
            const variable = this.getVariableOptional(name);
            if (!variable)
                throw this.error(start, `No variable "${name}" exists`);
            return variable;
        }
        getFunctionOptional(name) {
            return undefined
                ?? this.#statements.findLast((statement) => statement.type === "function" && statement.name.value === name)
                ?? this.#outerStatements.findLast((statement) => statement.type === "function" && statement.name.value === name);
        }
        getFunction(name, start = this.i) {
            const variable = this.getVariableOptional(name);
            if (!variable)
                throw this.error(start, `No variable "${name}" exists`);
            return variable;
        }
        getMacroOptional(name) {
            return undefined
                ?? this.#statements.findLast((statement) => statement.type === "macro" && statement.name.value === name)
                ?? this.#outerStatements.findLast((statement) => statement.type === "macro" && statement.name.value === name);
        }
        with(...scopeStatements) {
            return {
                do: async (callback) => {
                    this.#statements.push(...scopeStatements);
                    try {
                        return callback();
                    }
                    finally {
                        this.#statements.splice(-scopeStatements.length, scopeStatements.length);
                    }
                },
            };
        }
        getType(name) {
            name = typeof name === "string" ? name : name.name.value;
            const type = this.types.types[name];
            if (!type)
                throw this.error(`There is no type by name "${name}"`);
            return type;
        }
        getTypeOptional(name) {
            return this.types.types[name];
        }
        getUnaryOperators() {
            return this.types.unaryOperators;
        }
        getBinaryOperators() {
            return this.types.binaryOperators;
        }
        getStatements(onlyThisBlock) {
            return !onlyThisBlock ? [...this.#outerStatements, ...this.#statements] : this.#statements;
        }
        setExport() {
        }
        async read(configuredConsumer = this.consumeBodyDefault) {
            const consumer = async () => undefined
                ?? await configuredConsumer(this)
                ?? await (0, consumeMacroUseOptional_1.default)(this);
            try {
                if (!this.#multiline) {
                    (0, consumeWhiteSpaceOptional_1.default)(this);
                    const e = this.i;
                    const consumed = await consumer();
                    if (!consumed)
                        throw this.error(e, `Expected ${this.context.type} content`);
                    this.#statements.push(...Arrays_1.default.resolve(consumed).filter(Arrays_1.default.filterNullish));
                }
                else {
                    do {
                        // if (this.#errored)
                        // 	break
                        // this.logLine(undefined, this.stack.join(" -> "))
                        const e = this.i;
                        const consumed = await consumer();
                        if (!consumed)
                            throw this.error(e, `Expected ${this.context.type} content`);
                        this.#statements.push(...Arrays_1.default.resolve(consumed).filter(Arrays_1.default.filterNullish));
                    } while ((0, consumeNewBlockLineOptional_1.default)(this));
                    if (this.i < this.input.length)
                        if (!(0, consumeBlockEnd_1.default)(this))
                            throw this.error("Expected block end");
                }
                if (!this.#isSubReader && this.i < this.input.length)
                    throw this.error("Failed to continue parsing input file");
            }
            catch (err) {
                this.#errored = true;
                if (!this.#subError)
                    this.logLine(this.#errorStart, err);
            }
            // this.logLine(undefined, `read end (${this.context})`)
            return {
                source: this.source,
                statements: this.#statements,
            };
        }
        async consumeBodyDefault() {
            const documentation = (0, consumeDocumentationOptional_1.default)(this);
            if (documentation)
                return documentation;
            const e = this.i;
            ////////////////////////////////////
            //#region Macro
            const macro = await (0, consumeMacroUseOptional_1.default)(this, this.#isSubReader ? "generic" : "root");
            if (macro?.type === "variable")
                return macro;
            if (macro?.type === "import") {
                for (const imp of macro.paths) {
                    const raw = (imp.module ? `${imp.module}:` : "") + imp.path;
                    const dirname = !imp.module ? this.dirname : imp.module === "chiri" ? constants_1.LIB_ROOT : require.resolve(imp.module);
                    const filename = imp.path.startsWith("/") ? path_1.default.join(this.cwd, imp.path) : path_1.default.resolve(dirname, imp.path);
                    if (this.stack.includes(filename))
                        throw this.error(`Cannot recursively import file "${raw}"`);
                    let sub;
                    try {
                        sub = await ChiriReader.load(filename, this);
                        sub.importName = raw;
                    }
                    catch (e) {
                        const err = e;
                        this.#errorStart = this.i;
                        this.i = imp.i;
                        const message = err.message?.includes("no such file") ? "does not exist" : (err.message ?? "unknown error");
                        throw this.error(`Cannot import file "${raw}": ${message}`);
                    }
                    if (sub) {
                        sub.#outerStatements = [...this.#outerStatements, ...this.#statements];
                        const ast = await sub.read();
                        // sub.logLine(undefined, `imp end (${sub.context})`)
                        if (this.reusable.has(this.filename) && !this.reusable.has(sub.filename))
                            throw this.error(imp.i, `${this.importName} is exported as reusable, it can only import other files exported as reusable`);
                        this.#statements.push(...ast.statements);
                        if (sub.errored)
                            this.subError();
                    }
                }
                return [];
            }
            if (macro)
                return macro;
            // if (macro)
            // 	throw this.error(e, `Macro result type "${(macro as MacroResult).type}" is not supported yet`)
            //#endregion
            ////////////////////////////////////
            const mixin = await (0, consumeMixinOptional_1.default)(this);
            if (mixin)
                return mixin;
            const mixinUse = (0, consumeMixinUseOptional_1.default)(this);
            if (mixinUse) {
                if (this.context.type === "root")
                    throw this.error("Cannot use mixins in root context");
                return mixinUse;
            }
            const property = (0, consumePropertyOptional_1.default)(this);
            if (property)
                return property;
            const rule = this.context.type === "state" ? undefined : (await (0, consumeRuleMainOptional_1.default)(this)) || (await (0, consumeRuleStateOptional_1.default)(this));
            if (rule)
                return rule;
            return [];
        }
        logState() {
            console.log(Object.entries({
                variables: [...this.#outerStatements, ...this.#statements].filter(statement => statement.type === "variable")
                    .map(statement => `${ansi_1.default.path + statement.name.value}: ${ansi_1.default.ok + ChiriType_1.ChiriType.stringify(statement.valueType)}`).join(ansi_1.default.label + ", "),
            }).map(([k, v]) => `${ansi_1.default.label + k}: ${v}` + ansi_1.default.reset).join("\n"));
        }
        logLine(start, errOrMessage) {
            const line = Strings_1.default.symbolise(this.getCurrentLine(undefined, true));
            const lineNumber = this.getLineNumber(undefined, true);
            const columnNumber = this.getColumnNumber();
            const err = typeof errOrMessage === "string" ? undefined : errOrMessage;
            const message = typeof errOrMessage === "string" ? errOrMessage : undefined;
            const filename = this.formatFilePosAtFromScratch(this.i);
            console[err ? "error" : "info"](filename
                + ansi_1.default.label + (errOrMessage ? " - " : "")
                + ansi_1.default.reset + (!err ? message ?? "" : ansi_1.default.err + err.message) + "\n"
                + ansi_1.default.label + "  " + `${lineNumber + 1}`.padStart(5) + " " + ansi_1.default.reset + line + "\n"
                + (err ? ansi_1.default.err : ansi_1.default.filepos) + `        ${" ".repeat(columnNumber)}${"^".repeat((start ?? this.i) - this.i || 1)}`
                + ansi_1.default.reset
                + (!err?.stack || (process.env.CHIRI_ENV !== "dev" && !(+process.env.CHIRI_STACK_LENGTH || 0)) ? ""
                    : `\n${err.stack
                        .slice(err.stack.indexOf("\n", start === undefined ? 0 : err.stack.indexOf("\n") + 1) + 1)
                        .split("\n")
                        .slice(0, +process.env.CHIRI_STACK_LENGTH || 3)
                        .map(path => path.replace(constants_1.PACKAGE_ROOT + "\\", "").replaceAll("\\", "/"))
                        .join("\n")}`));
        }
        formatFilename() {
            return ansi_1.default.path + (0, relToCwd_1.default)(this.filename);
        }
        formatFilePos(lineNumber = this.getLineNumber(), columnNumber = this.getColumnNumber()) {
            return this.formatFilename() + ansi_1.default.filepos + `:${lineNumber + 1}:${columnNumber + 1}` + ansi_1.default.reset;
        }
        formatFilePosAt(at = this.i) {
            return this.formatFilePos(this.getLineNumber(at), this.getColumnNumber(at));
        }
        formatFilePosAtFromScratch(at) {
            let newlines = 0;
            let columns = 0;
            for (let j = 0; j < at; j++) {
                if (this.input[j] === "\n") {
                    newlines++;
                    columns = 0;
                    continue;
                }
                columns++;
            }
            return this.formatFilePos(newlines, columns);
        }
        consume(...strings) {
            NextString: for (const string of strings) {
                for (let j = 0; j < string.length; j++)
                    if (this.input[this.i + j] !== string[j])
                        continue NextString;
                this.i += string.length;
                return string;
            }
            strings = strings.map(string => string
                .replace(/\r/g, "\u240D")
                .replace(/\n/g, "\u240A")
                .replace(/ /g, "\u00B7")
                .replace(/\t/g, "\u2192"));
            throw this.error("Expected "
                + (strings.length === 1 ? strings[0]
                    : "any of" + strings.map(string => `"${string}"`).join(", ")));
        }
        consumeOptional(...strings) {
            NextString: for (const string of strings) {
                for (let j = 0; j < string.length; j++)
                    if (this.input[this.i + j] !== string[j])
                        continue NextString;
                this.i += string.length;
                return string;
            }
            return undefined;
        }
        /**
         * @param  {...string} strings
         */
        consumeUntil(...strings) {
            let consumed = "";
            for (; this.i < this.input.length; this.i++) {
                if (this.peek(...strings))
                    break;
                consumed += this.input[this.i];
            }
            return consumed;
        }
        peek(...strings) {
            NextString: for (const string of strings) {
                for (let j = 0; j < string.length; j++)
                    if (this.input[this.i + j] !== string[j])
                        continue NextString;
                return string;
            }
            return undefined;
        }
        error(errorPositionOrMessage, message) {
            this.#errorStart = this.i;
            if (typeof errorPositionOrMessage === "number")
                this.i = errorPositionOrMessage;
            else
                message = errorPositionOrMessage;
            return new Error(message ?? "Compilation failed for an unknown reason");
        }
        #subError = false;
        subError() {
            this.#subError = true;
            throw new Error("if this is logged something is very wrong");
        }
        getLineStart(at = this.i) {
            return this.input.lastIndexOf("\n", at - 1) + 1;
        }
        getLineEnd(at = this.i, includeNewline = false) {
            let index = this.input.indexOf("\n", at);
            if (index === -1)
                return this.input.length;
            if (!includeNewline)
                while (this.input[--index] === "\r")
                    ;
            return index + 1;
        }
        savePosition() {
            return {
                i: this.i,
                lastLineNumber: this.#lastLineNumber,
                lastLineNumberPosition: this.#lastLineNumberPosition,
            };
        }
        restorePosition(state) {
            this.#lastLineNumberPosition = state.lastLineNumberPosition;
            this.#lastLineNumber = state.lastLineNumber;
            this.i = state.i;
        }
        getPosition(at = this.i) {
            return {
                file: this.filename,
                line: this.getLineNumber(at) + 1,
                column: this.getColumnNumber(at) + 1,
            };
        }
        #lastLineNumber = 0;
        #lastLineNumberPosition = 0;
        getLineNumber(at = this.i, allowRecalc = false) {
            const lastLineNumberPosition = this.#lastLineNumberPosition;
            const recalc = at < lastLineNumberPosition;
            let newlines = recalc ? 0 : this.#lastLineNumber;
            let j = recalc ? 0 : lastLineNumberPosition;
            for (; j < at; j++)
                if (this.input[j] === "\n")
                    newlines++;
            this.#lastLineNumber = newlines;
            this.#lastLineNumberPosition = at;
            if (recalc && !allowRecalc) {
                const lastPos = this.formatFilePosAtFromScratch(lastLineNumberPosition);
                const newPos = this.formatFilePosAtFromScratch(at);
                console.warn(`${ansi_1.default.err}Forced to recalculate line number! ${ansi_1.default.label}Was: ${lastPos} ${ansi_1.default.label}Now: ${newPos}${ansi_1.default.reset}\n${Errors_1.default.stack(3)}`);
            }
            return newlines;
        }
        getColumnNumber(at = this.i) {
            return at - this.getLineStart(at);
        }
        getCurrentLine(at = this.i, includeNewline = false) {
            return this.input.slice(this.getLineStart(at), this.getLineEnd(at, includeNewline));
        }
        isWordChar = (charCode = this.input.charCodeAt(this.i)) => false
            || charCode === 45 // -
            || this.isLetter(charCode)
            || this.isDigit(charCode);
        isLetter = (charCode = this.input.charCodeAt(this.i)) => false
            || (charCode >= 65 && charCode <= 90) // A-Z
            || (charCode >= 97 && charCode <= 122); // a-z
        isDigit = (charCode = this.input.charCodeAt(this.i)) => false
            || (charCode >= 48 && charCode <= 57); // 0-9
    }
    exports.default = ChiriReader;
});
//# sourceMappingURL=ChiriReader.js.map