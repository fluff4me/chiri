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
        define(["require", "exports", "../../ansi", "../../constants", "../read/factory/makeWord", "../type/ChiriType", "../type/ChiriTypeManager", "../type/typeString", "../util/_", "../util/getFunctionParameters", "../util/relToCwd", "../util/resolveExpression", "../util/stringifyExpression", "../util/stringifyText", "../util/Strings", "./CSSWriter", "./DTSWriter", "./ESWriter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ansi_1 = __importDefault(require("../../ansi"));
    const constants_1 = require("../../constants");
    const makeWord_1 = __importDefault(require("../read/factory/makeWord"));
    const ChiriType_1 = require("../type/ChiriType");
    const ChiriTypeManager_1 = __importDefault(require("../type/ChiriTypeManager"));
    const typeString_1 = __importDefault(require("../type/typeString"));
    const _1 = __importDefault(require("../util/_"));
    const getFunctionParameters_1 = __importDefault(require("../util/getFunctionParameters"));
    const relToCwd_1 = __importDefault(require("../util/relToCwd"));
    const resolveExpression_1 = __importStar(require("../util/resolveExpression"));
    const stringifyExpression_1 = __importDefault(require("../util/stringifyExpression"));
    const stringifyText_1 = __importDefault(require("../util/stringifyText"));
    const Strings_1 = __importDefault(require("../util/Strings"));
    const CSSWriter_1 = __importDefault(require("./CSSWriter"));
    const DTSWriter_1 = __importDefault(require("./DTSWriter"));
    const ESWriter_1 = __importDefault(require("./ESWriter"));
    const EMPTY = [];
    function Scope(data) {
        return data;
    }
    (function (Scope) {
        function variables(variables) {
            return { variables };
        }
        Scope.variables = variables;
        function mixins(mixins) {
            return { mixins };
        }
        Scope.mixins = mixins;
    })(Scope || (Scope = {}));
    function ChiriCompiler(ast, dest) {
        const scopes = [];
        const selectorStack = [];
        const usedMixins = {};
        const components = {};
        const viewTransitions = [];
        const rootSpecials = [];
        const blocks = [];
        const callers = [];
        let usedMixinIndex = 0;
        let ifState = true;
        const css = new CSSWriter_1.default(ast, dest);
        const es = new ESWriter_1.default(ast, dest);
        const dts = new DTSWriter_1.default(ast, dest);
        const writers = [css, es, dts];
        const compiler = {
            types: undefined,
            ast,
            css, es, dts,
            writers,
            pipeValueStack: [],
            writeFiles,
            compile,
            error, logLine,
            getVariable, setVariable,
            getMixin, setMixin,
            getShorthand, setShorthand,
            getAlias, setAlias,
            getMacro, setMacro,
            getFunction, setFunction,
            callFunction,
        };
        const types = new ChiriTypeManager_1.default(compiler);
        Object.assign(compiler, { types });
        const blankContent = {
            type: "property",
            property: {
                type: "word",
                value: "content",
                position: constants_1.INTERNAL_POSITION,
            },
            value: "\"\"",
            position: constants_1.INTERNAL_POSITION,
        };
        return compiler;
        function compile() {
            typeString_1.default.coerce = value => (0, stringifyExpression_1.default)(compiler, value);
            try {
                for (const writer of writers)
                    writer.onCompileStart(compiler);
                compileStatements(ast.statements, undefined, compileRoot);
                for (const rootSpecial of rootSpecials)
                    css.writeMixin(compiler, rootSpecial);
                for (const mixin of Object.values(usedMixins))
                    css.writeMixin(compiler, mixin);
                for (const viewTransition of viewTransitions)
                    css.writeViewTransition(compiler, viewTransition);
                for (const animation of Object.values(root().animations ?? {}))
                    css.writeAnimation(compiler, animation);
                for (const component of Object.values(components))
                    es.emitComponent(compiler, component);
                for (const writer of writers)
                    writer.onCompileEnd(compiler);
            }
            catch (err) {
                logLine(undefined, err);
            }
        }
        async function writeFiles() {
            return Promise.all(writers.map(writer => writer.writeFile()));
        }
        ////////////////////////////////////
        //#region Scope
        ////////////////////////////////////
        //#region Blocks
        function pushBlock(block) {
            blocks.push(block);
            return block;
        }
        function popBlock(block) {
            const index = blocks.findIndex(b => b === block);
            if (index === -1)
                return;
            if (index < blocks.length - 1)
                throw error(block.position, `This #${block.type} is not the most recent block`);
            blocks.pop();
        }
        function blockBroken(block) {
            return !blocks.includes(block);
        }
        function blockContinuing() {
            return blocks.at(-1)?.continuing;
        }
        function breakBlock(position, name) {
            const blockIndex = findBlock(name);
            if (blockIndex === undefined)
                throw error(position, `Cannot #break ${name ? `:${name}` : ""}`);
            blocks.splice(blockIndex, Infinity);
        }
        function breakFunction(position) {
            const blockIndex = blocks.findLastIndex(block => block.type === "function-call");
            if (blockIndex === undefined)
                throw error(position, "Cannot #return outside of a function");
            blocks.splice(blockIndex, Infinity);
        }
        function continueBlock(position, name) {
            const blockIndex = findBlock(name);
            if (blockIndex === undefined)
                throw error(position, `Cannot #continue ${name ? `:${name}` : ""}`);
            blocks[blockIndex].continuing = true;
            blocks.splice(blockIndex + 1, Infinity);
        }
        function findBlock(name) {
            for (let i = blocks.length - 1; i >= 0; i--) {
                const block = blocks[i];
                switch (block.type) {
                    case "if":
                    case "else":
                    case "elseif":
                    case "do":
                        if (!name)
                            continue;
                        if (block.label?.value !== name)
                            continue;
                        return i;
                    case "each":
                    case "for":
                    case "while":
                        if (!name || block.label?.value === name)
                            return i;
                        continue;
                    case "function-call":
                    case "macro-use":
                        return i + 1;
                    default: {
                        const assertNever = block;
                    }
                }
            }
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Variables
        function getVariable(name, position, optional = false) {
            for (let i = scopes.length - 1; i >= 0; i--) {
                const variables = scopes[i].variables;
                if (variables && name in variables)
                    return variables[name].value;
            }
            if (!optional)
                throw error(position, `Variable ${name} is not defined`);
        }
        function getVariableType(name, position, optional = false) {
            for (let i = scopes.length - 1; i >= 0; i--) {
                const variables = scopes[i].variables;
                if (variables && name in variables)
                    return variables[name].type;
            }
            if (!optional)
                throw error(position, `Variable ${name} is not defined`);
        }
        function setVariable(name, value, type, defineNew) {
            if (!defineNew)
                for (let i = scopes.length - 1; i >= 0; i--) {
                    const variables = scopes[i].variables;
                    if (variables && name in variables) {
                        value = variables[name].type.name.value === type.name.value ? value : types.coerce(value, variables[name].type);
                        variables[name].value = value;
                        return;
                    }
                }
            scope().variables ??= {};
            scope().variables[name] = {
                type,
                value,
            };
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Macros
        function getMacro(name, position) {
            for (let i = scopes.length - 1; i >= 0; i--) {
                const macros = scopes[i].macros;
                if (macros && name in macros)
                    return macros[name];
            }
            throw error(position, `Macro ${name} is not defined`);
        }
        function setMacro(fn) {
            scope().macros ??= {};
            if (scope().macros[fn.name.value])
                throw error(fn.position, `Macro ${fn.name.value} has already been defined in this scope`);
            scope().macros[fn.name.value] = fn;
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Functions
        function getFunction(name, position) {
            for (let i = scopes.length - 1; i >= 0; i--) {
                const functions = scopes[i].functions;
                if (functions && name in functions)
                    return functions[name];
            }
            throw error(position, `Function ${name} is not defined`);
        }
        function isFunction(fn) {
            return fn?.type === "function";
        }
        function setFunction(fn) {
            scope().functions ??= {};
            if (scope().functions[fn.name.value])
                throw error(fn.position, `Function ${fn.name.value} has already been defined in this scope`);
            scope().functions[fn.name.value] = fn;
        }
        function getMixin(name, position, optional = false) {
            const mixin = root().mixins?.[name];
            if (mixin)
                return mixin;
            if (!optional)
                throw error(position, `Mixin ${name} is not defined`);
        }
        function setMixin(mixin) {
            const mixins = root().mixins ??= {};
            let baseMixin = mixins[mixin.name.value];
            if (mixin.spread && !baseMixin) {
                baseMixin = mixins[mixin.name.value] = {
                    type: "mixin",
                    name: mixin.name,
                    content: [],
                    pseudos: [undefined],
                    states: [undefined],
                    elementTypes: [undefined],
                    affects: [],
                    position: mixin.position,
                };
            }
            if (baseMixin) {
                if (mixin.spread) {
                    const baseMixin = mixins[mixin.name.value];
                    baseMixin.children ??= [];
                    baseMixin.children.push(mixin);
                    return mixin;
                }
                else if (mixin.name.value in usedMixins)
                    throw error(mixin.position, `%${mixin.name.value} cannot be redefined after being used`);
            }
            return mixins[mixin.name.value] = mixin;
        }
        function useMixin(preRegisteredMixin, after) {
            // if (preRegisteredMixin.used)
            // 	return usedMixins[preRegisteredMixin.name.value]
            // preRegisteredMixin.used = true
            const baseMixin = usedMixins[preRegisteredMixin.name.value];
            let mixin = baseMixin;
            if (!baseMixin) {
                // never used yet, so guaranteed to be after all the other mixins!
                mixin = { ...preRegisteredMixin, index: ++usedMixinIndex };
            }
            else {
                const intersectingMixin = after.sort((a, b) => b.index - a.index).find(mixin => mixin.affects.some(affect => baseMixin.affects.includes(affect)));
                const intersectingMixinIndex = intersectingMixin?.index ?? -1;
                let bump = 1;
                while (intersectingMixinIndex > mixin.index) {
                    bump++;
                    const bumpMixinNameString = `${preRegisteredMixin.name.value}__${bump}`;
                    mixin = usedMixins[bumpMixinNameString];
                    if (mixin)
                        continue;
                    const bumpMixinName = { type: "word", value: bumpMixinNameString, position: baseMixin.name.position };
                    mixin = {
                        ...preRegisteredMixin,
                        index: ++usedMixinIndex,
                        name: bumpMixinName,
                    };
                    break;
                }
            }
            const children = preRegisteredMixin.children;
            if (children)
                for (let i = 0; i < children.length; i++)
                    usedMixins[children[i].name.value + `:${i}`] = {
                        ...children[i],
                        index: ++usedMixinIndex,
                    };
            return usedMixins[mixin.name.value] = mixin;
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Shorthands
        function getShorthand(property) {
            return (root().shorthands?.[property] ?? [property])
                .flatMap(affect => getAlias(affect));
        }
        function setShorthand(property, affects, position) {
            const shorthands = root().shorthands ??= {};
            // allow redefining specific things that are in core lib
            // if (shorthands[property])
            // 	throw error(position, `#shorthand ${property} cannot be redefined`)
            shorthands[property] = affects;
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Aliases
        function getAlias(property) {
            return root().aliases?.[property] ?? [property];
        }
        function setAlias(property, properties, position) {
            const aliases = root().aliases ??= {};
            aliases[property] = properties;
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Animations
        function setAnimation(animation, dedupe = false) {
            const animations = root().animations ??= {};
            let name = animation.name.value;
            let i = 1;
            while (animations[name]) {
                if (!dedupe)
                    throw error(animation.position, `Cannot redefine animation "${name}"`);
                name = `${animation.name.value}_${++i}`;
            }
            animation.name.value = name;
            animations[name] = animation;
            return animation.name;
        }
        function error(position, message) {
            message = typeof position === "string" ? position : message;
            position = typeof position === "string" ? undefined : position;
            return Object.assign(new Error(message ?? "Compilation failed for an unknown reason"), { position });
        }
        function internalError(position, message) {
            message = typeof position === "string" ? position : message;
            position = typeof position === "string" ? undefined : position;
            return error(position, `Internal Error: ${message ?? "Compilation failed for an unknown reason"}`);
        }
        function logLine(position, message, stack = true, preview = true) {
            const err = message instanceof Error ? message : undefined;
            if (message instanceof Error) {
                position ??= message.position;
                message = ansi_1.default.err + message.message + ansi_1.default.reset;
            }
            message ??= "";
            const line = !position?.file ? "" : Strings_1.default.symbolise(getLine(ast.source[position.file] ?? "", position.line - 1));
            const positionBlock = !position || !preview ? "" : "\n"
                + ansi_1.default.label + "  " + `${position.line}`.padStart(5) + " " + ansi_1.default.reset + line + "\n"
                + (err ? ansi_1.default.err : ansi_1.default.filepos) + `        ${" ".repeat(position.column - 1)}${"^"}`
                + ansi_1.default.reset;
            const filename = !position?.file ? "Unknown location"
                : ansi_1.default.path + (0, relToCwd_1.default)(position.file)
                    + ansi_1.default.filepos + `:${position.line}:${position.column}` + ansi_1.default.reset;
            const stackString = err?.stack ?? new Error().stack ?? "";
            console[err ? "error" : "info"](filename
                + ansi_1.default.label + (message ? " - " : "")
                + ansi_1.default.reset + message
                + positionBlock
                + (!stack || (process.env.CHIRI_ENV !== "dev" && !(+process.env.CHIRI_STACK_LENGTH || 0)) ? ""
                    : `\n${stackString
                        .slice(stackString.indexOf("\n", !position ? 0 : stackString.indexOf("\n") + 1) + 1)
                        .split("\n")
                        .slice(0, +process.env.CHIRI_STACK_LENGTH || 3)
                        .map(path => path.replace(constants_1.PACKAGE_ROOT + "\\", "").replaceAll("\\", "/"))
                        .join("\n")}`));
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Contexts
        ////////////////////////////////////
        //#region Context: Root
        function compileRoot(statement) {
            switch (statement.type) {
                case "documentation":
                    for (const writer of writers)
                        writer.writeDocumentation(statement);
                    return true;
                case "mixin": {
                    const name = resolveWordLowercase(statement.name);
                    const properties = compileStatements(statement.content, undefined, compileMixinContent);
                    setMixin({
                        ...statement,
                        name,
                        states: [undefined],
                        pseudos: [undefined],
                        elementTypes: [undefined],
                        content: properties,
                        affects: properties.flatMap(getPropertyAffects),
                    });
                    return true;
                }
                case "shorthand": {
                    const property = (0, stringifyText_1.default)(compiler, statement.property);
                    const affects = compileStatements(statement.body, undefined, compileShorthand)
                        .filter(affected => !!affected);
                    setShorthand(property, affects, statement.position);
                    return true;
                }
                case "alias": {
                    const property = (0, stringifyText_1.default)(compiler, statement.property);
                    const properties = compileStatements(statement.body, undefined, compileShorthand)
                        .filter(affected => !!affected);
                    setAlias(property, properties, statement.position);
                    return true;
                }
                case "component": {
                    let results = compileComponent(statement);
                    if (results === undefined)
                        return undefined;
                    if (!Array.isArray(results))
                        results = [results];
                    for (const component of results) {
                        const registeredMixins = [];
                        const visited = component.after
                            .flatMap(selector => {
                            const afterComponent = components[selector.value];
                            if (!afterComponent)
                                throw error(selector.position, `Component .${selector.value} has not been defined`);
                            return afterComponent.mixins;
                        });
                        for (let i = 0; i < component.mixins.length; i++) {
                            const mixin = useMixin(getMixin(component.mixins[i].value, component.mixins[i].position), visited);
                            component.mixins[i] = mixin.name;
                            visited.push(mixin);
                            registeredMixins.push(mixin);
                        }
                        for (const selector of component.selector) {
                            const registered = components[selector.value] ??= {
                                selector,
                                mixins: [],
                            };
                            registered.mixins.push(...registeredMixins);
                            dts.write("\"");
                            dts.writeWord(selector);
                            dts.write("\"");
                            dts.writeLine(": string[],");
                        }
                    }
                    return true;
                }
                case "mixin-use": {
                    const mixin = getMixin((0, stringifyText_1.default)(compiler, statement.name), statement.name.position);
                    for (const property of mixin.content) {
                        css.writingTo(property.isCustomProperty ? "root-properties" : "root-styles", () => {
                            css.writeProperty(compiler, property);
                        });
                    }
                    return true;
                }
                case "property-definition":
                    css.writingTo("property-definitions", () => {
                        css.write("@property ");
                        const name = resolveWordLowercase(statement.property);
                        name.value = `--${name.value}`;
                        css.writeWord(name);
                        css.writeSpaceOptional();
                        css.writeBlock(() => {
                            css.write("syntax:");
                            css.writeSpaceOptional();
                            css.write("\"");
                            css.writeWord(statement.syntax);
                            css.writeLine("\";");
                            css.write("inherits:");
                            css.writeSpaceOptional();
                            css.writeLine("false;");
                            const initialValue = compileStatements(statement.value, undefined, compileText).join("").trim();
                            if (initialValue) {
                                css.write("initial-value:");
                                css.writeSpaceOptional();
                                css.write(initialValue);
                                css.writeLine(";");
                            }
                        });
                    });
                    return true;
                case "property":
                    css.writingTo(statement.isCustomProperty ? "root-properties" : "root-styles", () => {
                        css.writeProperty(compiler, {
                            ...statement,
                            property: resolveWordLowercase(statement.property),
                            value: compileStatements(statement.value, undefined, compileText).join(""),
                        });
                    });
                    return true;
                case "import-css": {
                    css.writingTo("imports", () => {
                        for (const imp of statement.imports) {
                            css.writeLine(`@import ${(0, stringifyText_1.default)(compiler, imp)};`);
                        }
                    });
                    return true;
                }
                case "font-face": {
                    css.writeFontFace(compiler, {
                        family: (0, makeWord_1.default)((0, stringifyExpression_1.default)(compiler, statement.family), statement.family.position),
                        content: compileStatements(statement.content, undefined, compileMixinContent),
                    });
                    return true;
                }
                case "select": {
                    css.writeSelect(compiler, {
                        type: "select",
                        selector: (0, stringifyExpression_1.default)(compiler, statement.selector),
                        content: compileStatements(statement.content, undefined, compileMixinContent),
                        position: statement.position,
                    });
                    return true;
                }
            }
        }
        function compileComponent(statement, allowMixins = false) {
            if (statement.type !== "component")
                return undefined;
            const containingSelector = selectorStack.at(-1);
            if (statement.subType === "component" || statement.subType === "custom-state") {
                const selector = createSelector(undefined, {
                    class: mergeWords(containingSelector?.class, statement.subType === "component" ? "-" : "--", statement.names),
                });
                const content = compileSelector(selector, statement.content, true);
                const component = {
                    type: "compiled-component",
                    selector: selector.class,
                    mixins: content.filter(item => item.type === "word"),
                    after: content.filter(item => item.type === "compiled-after")
                        .flatMap(after => after.selectors),
                };
                if ((component.mixins.some(m => m.value === "before") && component.mixins.some(m => m.value === "after")) || component.mixins.some(m => m.value === "before-after")) {
                    component.mixins = component.mixins.filter(mixin => mixin.value !== "before-after");
                    component.mixins.unshift({ type: "word", value: "before-after", position: constants_1.INTERNAL_POSITION });
                }
                if (component.mixins.some(m => m.value === "before-after"))
                    component.mixins = component.mixins.filter(m => m.value !== "before" && m.value !== "after");
                const results = content.filter(item => item.type === "compiled-component");
                results.unshift(component);
                return results;
            }
            if (statement.subType === "view-transition" || statement.subType === "view-transition-class") {
                const viewTransitionName = !containingSelector ? "root" : [
                    containingSelector.class.map(word => word.value).join("_"),
                    getStatesNameAffix(containingSelector.pseudo),
                    getWordsAffix(containingSelector.pseudo),
                ].filter(s => s).join("_");
                const selector = createSelector(containingSelector, {
                    class: mergeWords(containingSelector?.class, "_", [getWordsAffix(statement.pseudos)]),
                });
                selectorStack.push(selector);
                const content = compileStatements(statement.content, undefined, compileComponentContent);
                selectorStack.pop();
                const properties = [];
                for (const item of content) {
                    switch (item.type) {
                        case "compiled-after":
                            throw error("#after cannot be used in this context");
                        case "compiled-component":
                            throw error("Sub-component selectors cannot be used in this context");
                        case "property":
                            properties.push(item);
                            continue;
                        case "word": {
                            const mixin = getMixin(item.value, item.position);
                            properties.push(...mixin.content);
                            continue;
                        }
                    }
                }
                viewTransitions.push({
                    type: statement.subType,
                    subTypes: statement.pseudos.map(w => w.value.slice(w.value.lastIndexOf("!") + 1)),
                    name: (0, makeWord_1.default)(viewTransitionName, statement.position),
                    content: properties,
                    position: statement.position,
                });
                return [{
                        type: "property",
                        property: (0, makeWord_1.default)(statement.subType === "view-transition-class" ? "view-transition-class" : "view-transition-name", statement.position),
                        value: viewTransitionName,
                        position: statement.position,
                    }];
            }
            let selector;
            switch (statement.subType) {
                case "state":
                    selector = createSelector(containingSelector, {
                        class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getStatesNameAffix(statement.states)]),
                        state: mergeWords(containingSelector?.state, ":", statement.states),
                        spread: statement.spread || undefined,
                    });
                    break;
                case "state-special":
                    selector = createSelector(containingSelector, {
                        class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getStatesNameAffix([statement.state])]),
                        specialState: statement.state,
                        spread: statement.spread || undefined,
                    });
                    break;
                case "container": {
                    const query = (0, stringifyText_1.default)(compiler, statement.query);
                    selector = createSelector(containingSelector, {
                        containerQueries: [query],
                    });
                    break;
                }
                case "element": {
                    const names = statement.names.map(resolveWordLowercase);
                    selector = createSelector(containingSelector, {
                        class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getWordsAffix(names)]),
                        elementTypes: names,
                        spread: statement.spread || undefined,
                    });
                    break;
                }
                case "pseudo":
                    selector = createSelector(containingSelector, {
                        class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getWordsAffix(statement.pseudos)]),
                        pseudo: mergeWords(containingSelector?.pseudo, "::", statement.pseudos),
                        spread: statement.spread || undefined,
                    });
                    break;
            }
            const result = compileSelector(selector, statement.content);
            if (statement.subType === "pseudo" && allowMixins) {
                const pseudoClassName = statement.pseudos.map(p => p.value).sort((a, b) => b.localeCompare(a)).join("-");
                if (pseudoClassName === "before" || pseudoClassName === "after")
                    result.unshift({ type: "word", value: pseudoClassName, position: statement.pseudos[0].position });
            }
            // if (statement.subType === "state-special")
            // 	throw error("stop here!")
            if (!allowMixins) {
                rootSpecials.push({
                    type: "mixin",
                    content: result.flatMap(name => getMixin(name.value, name.position).content),
                    pseudos: selector.pseudo.map(pseudo => pseudo?.value),
                    states: selector.state.map(state => state?.value),
                    elementTypes: EMPTY,
                    specialState: selector.specialState?.value,
                    position: statement.position,
                });
                return EMPTY;
            }
            return result.map((name) => ({
                ...name,
                pseudo: selector.pseudo,
                state: selector.state,
            }));
        }
        function getStatesNameAffix(states) {
            return !states.length ? "" : "_" + states
                .map(state => state.value.replace(/[:)]/g, "").replace(/[^\w-]+/g, "-"))
                .join("_");
        }
        function getWordsAffix(words) {
            return !words.length ? "" : "_" + words
                .map(pseudo => pseudo.value)
                .join("-");
        }
        function compileSelector(selector, content, allowComponents = false) {
            selectorStack.push(selector);
            const compiledContent = compileStatements(content, undefined, compileComponentContent);
            // console.log(compiledContent)
            const results = [];
            const affects = [];
            let propertyGroup;
            let groupIndex = 0;
            const className = selector.class.map(cls => cls.value).join("_");
            const getDedupedClassName = () => `${className}${groupIndex <= 1 ? "" : `_${groupIndex}`}`;
            for (const item of [...compiledContent, { type: "end" }]) {
                switch (item.type) {
                    case "compiled-after":
                        results.push(item);
                        break; // irrelevant for this mixin generation
                    case "compiled-component":
                        if (!allowComponents)
                            throw internalError(item.selector[0].position, "Unexpected component in this context");
                        results.push(item);
                        break;
                    case "property": {
                        // a CSS property assignment rather than a mixin usage — add it to a group that will be made into a dynamic mixin
                        propertyGroup ??= [];
                        propertyGroup.push(item);
                        break;
                    }
                    case "end":
                    case "word": {
                        // mixin use — end the dynamic mixin CSS property group, if it exists
                        if (!propertyGroup?.length) {
                            if (item.type === "word")
                                addWord(item);
                            break;
                        }
                        const position = propertyGroup[0].position;
                        let nameString;
                        do {
                            if (!selector.spread)
                                groupIndex++;
                            nameString = getDedupedClassName();
                        } while (!selector.spread && getMixin(nameString, position, true));
                        const name = { type: "word", value: nameString, position };
                        setMixin({
                            type: "mixin",
                            name,
                            states: selector.state.map(state => state?.value),
                            pseudos: selector.pseudo.map(pseudo => pseudo?.value),
                            containerQueries: selector.containerQueries,
                            elementTypes: selector.elementTypes.map(t => t.value),
                            specialState: selector.specialState?.value,
                            position,
                            content: propertyGroup,
                            affects: propertyGroup.flatMap(getPropertyAffects),
                            spread: selector.spread,
                        });
                        results.push(name);
                        propertyGroup = undefined;
                        if (!selector.spread)
                            groupIndex++;
                        if (item.type === "word")
                            addWord(item);
                    }
                }
            }
            if (affects.length) {
                const mixin = getMixin(className, selector.class[0].position, true);
                const mixinAffects = [...new Set([...mixin?.affects ?? [], ...affects])];
                if (mixin) {
                    mixin.affects = mixinAffects;
                }
                else {
                    const name = (0, makeWord_1.default)(className, selector.class[0].position);
                    setMixin({
                        type: "mixin",
                        name,
                        affects: mixinAffects,
                        content: [],
                        position: selector.class[0].position,
                        states: [],
                        pseudos: [],
                        containerQueries: [],
                        elementTypes: [],
                        skip: true,
                    });
                    results.push(name);
                }
            }
            selectorStack.pop();
            return results;
            function addWord(item) {
                results.push(item);
                if (item.pseudo?.length || item.state?.length) {
                    const affix = false
                        || (item.pseudo && getWordsAffix(item.pseudo))
                        || (item.state && getStatesNameAffix(item.state));
                    const mixin = getMixin(item.value, item.position);
                    affects.push(...mixin.affects.map(property => `${affix}:${property}`));
                }
            }
        }
        function compileComponentContent(statement) {
            const componentResults = compileComponent(statement, true);
            if (componentResults !== undefined)
                return componentResults;
            switch (statement.type) {
                case "after":
                    return {
                        type: "compiled-after",
                        selectors: compileStatements(statement.content, undefined, statement => {
                            if (statement.type === "text" && statement.subType === "word-interpolated")
                                return resolveWordLowercase(statement);
                        }),
                    };
                case "property":
                    return {
                        ...statement,
                        property: resolveWordLowercase(statement.property),
                        value: compileStatements(statement.value, undefined, compileText).join(" "),
                    };
                case "mixin-use": {
                    let name = resolveWordLowercase(statement.name);
                    const baseName = name.value;
                    const selector = selectorStack.at(-1);
                    if (!selector)
                        throw error(name.position, "Unable to use mixin here, no selector");
                    if (selector.containerQueries.length || selector.elementTypes.length || statement.spread || selector.spread) {
                        const mixin = getMixin(name.value, name.position);
                        return mixin.content;
                    }
                    if (!selector.state.length && !selector.pseudo.length && !selector.specialState)
                        return name;
                    if (selector.state.length)
                        name = {
                            type: "word",
                            value: `${name.value}_${getStatesNameAffix(selector.state)}`,
                            position: name.position,
                        };
                    if (selector.specialState)
                        name = {
                            type: "word",
                            value: `${name.value}_${getStatesNameAffix([selector.specialState])}`,
                            position: name.position,
                        };
                    if (selector.pseudo.length)
                        name = {
                            type: "word",
                            value: `${name.value}_${getWordsAffix(selector.pseudo)}`,
                            position: name.position,
                        };
                    const existingMixin = getMixin(name.value, name.position, true);
                    if (!existingMixin)
                        setMixin({
                            ...getMixin(baseName, statement.name.position),
                            name,
                            states: selector.state.map(state => state?.value),
                            pseudos: selector.pseudo.map(pseudo => pseudo?.value),
                            specialState: selector.specialState?.value,
                            used: undefined,
                            spread: selector.spread,
                        });
                    return name;
                }
                case "animate": {
                    const selector = selectorStack.at(-1);
                    if (!selector)
                        throw error(statement.position, "#animate cannot be used in this context");
                    const baseAnimationName = [
                        selector.class.map(word => word.value).join("_"),
                        getStatesNameAffix(selector.pseudo),
                        getWordsAffix(selector.pseudo),
                    ].filter(s => s).join("_");
                    const keyframes = compileStatements(statement.content, undefined, compileKeyframes);
                    const dedupedName = setAnimation({
                        type: "animation",
                        name: (0, makeWord_1.default)(baseAnimationName, statement.position),
                        content: keyframes,
                        position: statement.position,
                    }, true);
                    return {
                        type: "property",
                        property: (0, makeWord_1.default)("animation", statement.position),
                        value: `${(0, stringifyText_1.default)(compiler, statement.shorthand)} ${dedupedName.value}`,
                        position: statement.position,
                        merge: true,
                    };
                }
            }
        }
        function createSelector(selector, assignFrom) {
            if (!selector && !assignFrom.class?.length)
                throw internalError("Unable to construct a selector with no class name");
            return {
                type: "selector",
                class: (assignFrom.class ?? selector?.class),
                state: assignFrom.state ?? selector?.state ?? [],
                pseudo: assignFrom.pseudo ?? selector?.pseudo ?? [],
                specialState: assignFrom.specialState ?? selector?.specialState,
                containerQueries: assignFrom.containerQueries ?? selector?.containerQueries ?? [],
                elementTypes: assignFrom.elementTypes ?? selector?.elementTypes ?? [],
                spread: assignFrom.spread ?? selector?.spread,
            };
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Mixins
        function compileMixinContent(statement) {
            switch (statement.type) {
                case "property":
                    return compileProperty(statement);
                case "mixin-use": {
                    const mixin = getMixin((0, stringifyText_1.default)(compiler, statement.name), statement.name.position);
                    return mixin.content;
                }
            }
        }
        function compileProperty(property) {
            return {
                ...property,
                property: resolveWordLowercase(property.property),
                value: compileStatements(property.value, undefined, compileText).join(" "),
            };
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Macros
        function compileMacros(statement, contextConsumer) {
            switch (statement.type) {
                case "variable": {
                    if (!statement.assignment)
                        return true;
                    if (statement.assignment === "??=" && getVariable(statement.name.value, statement.position, true) !== undefined)
                        return true;
                    if (!statement.expression && statement.assignment === "??=") {
                        scope().variables ??= {};
                        scope().variables[statement.name.value] = { type: statement.valueType, value: undefined };
                        return true;
                    }
                    let result = (0, resolveExpression_1.default)(compiler, statement.expression);
                    result = types.coerce(result, statement.valueType, statement.expression?.valueType);
                    setVariable(statement.name.value, result, statement.valueType, true);
                    return true;
                }
                case "assignment": {
                    if (statement.assignment === "??=" && getVariable(statement.name.value, statement.position) !== undefined)
                        // already assigned
                        return true;
                    const value = (0, resolveExpression_1.default)(compiler, statement.expression);
                    setVariable(statement.name.value, value, statement.expression?.valueType ?? ChiriType_1.ChiriType.of("undefined"));
                    return true;
                }
                case "macro":
                    setMacro(statement);
                    return true;
                case "function":
                    setFunction(statement);
                    return true;
                case "macro-use": {
                    switch (statement.name.value) {
                        case "debug": {
                            const lines = compileStatements(statement.content, undefined, compileText);
                            logLine(statement.position, ansi_1.default.label + "debug" + (lines.length === 1 ? " - " : "") + ansi_1.default.reset + (lines.length <= 1 ? "" : "\n") + lines.join("\n"), false, false);
                            return true;
                        }
                        case "error": {
                            const lines = compileStatements(statement.content, undefined, compileText);
                            const position = _1.default
                                ?? (!(0, resolveExpression_1.default)(compiler, statement.assignments.function) ? undefined : blocks.findLast(block => block.type === "function-call")?.position)
                                ?? (!(0, resolveExpression_1.default)(compiler, statement.assignments.macro) ? undefined : blocks.findLast(block => block.type === "macro-use")?.position)
                                ?? statement.position;
                            throw error(position, (lines.length <= 1 ? "" : "\n") + lines.join("\n"));
                        }
                    }
                    const fn = getMacro(statement.name.value, statement.position);
                    if (!fn)
                        return undefined;
                    const assignments = resolveAssignments(statement.assignments);
                    const bodyParameter = fn.content.find((statement) => statement.type === "variable" && statement.valueType.name.value === "body");
                    if (bodyParameter) {
                        assignments.variables ??= {};
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        assignments.variables[bodyParameter.name.value] = {
                            type: bodyParameter.valueType,
                            value: Object.assign([...statement.content], { isBody: true }),
                        };
                    }
                    blocks.push(statement);
                    const result = compileStatements(fn.content, assignments, contextConsumer);
                    popBlock(statement);
                    return result;
                }
                case "each": {
                    let list = (0, resolveExpression_1.default)(compiler, statement.iterable);
                    if (typeof list !== "string" && !Array.isArray(list) && (!resolveExpression_1.Record.is(list) || !statement.keyVariable))
                        throw error(statement.iterable.position, "Variable is not iterable");
                    list = !statement.keyVariable ? list
                        : typeof list !== "string" && !Array.isArray(list) ? Object.entries(list)
                            : Object.values(list).map((v, i) => [i, v]);
                    const block = pushBlock(statement);
                    const result = [];
                    for (const entry of list) {
                        block.continuing = undefined;
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        const key = statement.keyVariable ? entry[0] : undefined;
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        const value = statement.keyVariable ? entry[1] : entry;
                        result.push(...compileStatements(statement.content, Scope.variables({
                            [statement.variable.name.value]: { type: statement.variable.valueType, value },
                            ...statement.keyVariable && {
                                [statement.keyVariable.name.value]: { type: statement.keyVariable.valueType, value: key },
                            },
                        }), contextConsumer));
                        if (blockBroken(statement))
                            break;
                    }
                    popBlock(statement);
                    return result;
                }
                case "for": {
                    scopes.push({});
                    setVariable(statement.variable.name.value, (0, resolveExpression_1.default)(compiler, statement.variable.expression), statement.variable.valueType, true);
                    const block = pushBlock(statement);
                    const result = [];
                    while ((0, resolveExpression_1.default)(compiler, statement.condition)) {
                        block.continuing = undefined;
                        const statements = statement.content.slice();
                        if (statement.update)
                            statements.push(statement.update);
                        result.push(...compileStatements(statements, undefined, contextConsumer));
                        if (blockBroken(statement))
                            break;
                    }
                    popBlock(statement);
                    scopes.pop();
                    return result;
                }
                case "while": {
                    scopes.push({});
                    const block = pushBlock(statement);
                    const result = [];
                    while ((0, resolveExpression_1.default)(compiler, statement.condition)) {
                        block.continuing = undefined;
                        const statements = statement.content.slice();
                        result.push(...compileStatements(statements, undefined, contextConsumer));
                        if (blockBroken(statement))
                            break;
                    }
                    popBlock(statement);
                    scopes.pop();
                    return result;
                }
                case "elseif":
                    if (ifState)
                        return EMPTY;
                // eslint-disable-next-line no-fallthrough
                case "if": {
                    ifState = !!(0, resolveExpression_1.default)(compiler, statement.condition);
                    if (!ifState)
                        return EMPTY;
                    const block = pushBlock(statement);
                    const result = [];
                    do {
                        block.continuing = undefined;
                        result.push(...compileStatements(statement.content, undefined, contextConsumer));
                    } while (block.continuing);
                    popBlock(statement);
                    return result;
                }
                case "else": {
                    if (ifState)
                        return EMPTY;
                    const block = pushBlock(statement);
                    const result = [];
                    do {
                        block.continuing = undefined;
                        result.push(...compileStatements(statement.content, undefined, contextConsumer));
                    } while (block.continuing);
                    popBlock(statement);
                    return result;
                }
                case "do": {
                    const block = pushBlock(statement);
                    const result = [];
                    do {
                        block.continuing = undefined;
                        result.push(...compileStatements(statement.content, undefined, contextConsumer));
                    } while (block.continuing);
                    popBlock(statement);
                    return result;
                }
                case "break": {
                    breakBlock(statement.position, statement.label?.value);
                    return EMPTY;
                }
                case "continue": {
                    continueBlock(statement.position, statement.label?.value);
                    return EMPTY;
                }
                case "include": {
                    const statements = getVariable(statement.name.value, statement.name.position) ?? [];
                    const type = getVariableType(statement.name.value, statement.name.position);
                    const bodyType = type.generics[0].name.value;
                    return compileStatements(statements, undefined, getContextConsumer(bodyType));
                }
                case "animation": {
                    const name = resolveWordLowercase(statement.name);
                    const keyframes = compileStatements(statement.content, undefined, compileKeyframes);
                    setAnimation({
                        ...statement,
                        name,
                        content: keyframes,
                    });
                    return EMPTY;
                }
            }
        }
        function getContextConsumer(context) {
            switch (context) {
                case "text":
                case "property-name":
                    return compileText;
                case "component":
                    return compileComponentContent;
            }
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Text
        function compileText(statement) {
            if (statement.type !== "text")
                throw error(statement.position, `Expected text, got ${debugStatementString(statement)}`);
            return (0, stringifyText_1.default)(compiler, statement);
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Shorthand
        function compileShorthand(statement) {
            if (statement.type !== "text")
                throw error(statement.position, `Expected text, got ${debugStatementString(statement)}`);
            return (0, stringifyText_1.default)(compiler, statement);
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Function
        function compileFunction(statement) {
            switch (statement.type) {
                case "return": {
                    breakFunction(statement.position);
                    return { type: "result", value: (0, resolveExpression_1.default)(compiler, statement.expression) };
                }
            }
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Animation
        function compileKeyframes(statement) {
            switch (statement.type) {
                case "keyframe":
                    return {
                        ...statement,
                        at: +(0, resolveExpression_1.default)(compiler, statement.at) || 0,
                        content: compileStatements(statement.content, undefined, compileMixinContent),
                    };
            }
        }
        //#endregion
        ////////////////////////////////////
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Internals
        function compileStatements(statements, using, contextCompiler) {
            scopes.push(using ?? {});
            if (scopes.length === 1) {
                setMixin({
                    type: "mixin",
                    pseudos: ["before"],
                    states: [undefined],
                    elementTypes: [undefined],
                    content: [blankContent],
                    affects: ["content"],
                    name: { type: "word", value: "before", position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                });
                setMixin({
                    type: "mixin",
                    pseudos: ["after"],
                    states: [undefined],
                    elementTypes: [undefined],
                    content: [blankContent],
                    affects: ["content"],
                    name: { type: "word", value: "after", position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                });
                setMixin({
                    type: "mixin",
                    pseudos: ["before", "after"],
                    states: [undefined],
                    elementTypes: [undefined],
                    content: [blankContent],
                    affects: ["content"],
                    name: { type: "word", value: "before-after", position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                });
            }
            // console.log(inspect(scopes, undefined, 3, true))
            // logLine(undefined, error(statements[0].position, ""))
            const block = blocks.at(-1);
            const blockIndex = blocks.length - 1;
            const results = [];
            for (const statement of statements) {
                if (blocks.length - 1 > blockIndex)
                    throw failedToExitBlocksError(blockIndex);
                if (block && blockBroken(block) || blockContinuing())
                    break;
                const macroResult = compileMacros(statement, contextCompiler);
                if (macroResult) {
                    if (macroResult === true)
                        continue;
                    if (Array.isArray(macroResult))
                        results.push(...macroResult);
                    else
                        results.push(macroResult);
                    continue;
                }
                if (blocks.length - 1 > blockIndex)
                    throw failedToExitBlocksError(blockIndex);
                if (block && blockBroken(block) || blockContinuing())
                    break;
                const result = contextCompiler(statement);
                if (result !== undefined) {
                    if (Array.isArray(result))
                        results.push(...result);
                    else
                        results.push(result);
                }
                if (result === undefined)
                    throw internalError(statement.position, `Failed to compile ${debugStatementString(statement)} in context "${contextCompiler.name || "unknown"}"`);
            }
            if (scopes.length > 1) // don't remove the root scope once it's set up
                scopes.pop();
            return results;
        }
        function failedToExitBlocksError(blockId) {
            return error(`Failed to exit block(s): ${blocks
                .slice(blockId)
                .map(b => `${b.type}${b.label ? `:${b.label?.value}` : ""}`)
                .join(", ")}`);
        }
        function callFunction(call) {
            const fnVar = getVariable(call.name.value, call.position, true);
            const fn = isFunction(fnVar) ? fnVar : getFunction(call.name.value, call.position);
            const assignments = resolveAssignments(call.assignments, call.indexedAssignments ? (0, getFunctionParameters_1.default)(fn).map(p => p.name.value) : undefined);
            blocks.push(call);
            const result = compileStatements(fn.content, assignments, compileFunction);
            popBlock(call);
            if (result.length > 1)
                throw internalError(call.position, "Function call returned multiple values");
            if (result.length === 0)
                throw internalError(call.position, "Function call did not return a value");
            return result[0]?.value;
        }
        function getPropertyAffects(property) {
            return property.isCustomProperty ? [`--${property.property.value}`] : getShorthand(property.property.value);
        }
        function debugStatementString(statement) {
            const name = "name" in statement ? ` "${(0, stringifyText_1.default)(compiler, statement.name)}"` : "";
            return statement.type + name;
        }
        function resolveAssignments(assignments, indicesIntoParams) {
            return Scope.variables(Object.fromEntries(Object.entries(assignments)
                .map(([name, expr]) => [indicesIntoParams?.[+name] ?? name, { type: expr.valueType, value: (0, resolveExpression_1.default)(compiler, expr) }])));
        }
        function resolveWordLowercase(word) {
            return typeof word === "object" && word.type === "word" ? word : {
                type: "word",
                value: typeof word === "string" ? word : (0, stringifyText_1.default)(compiler, word).replace(/[^\w-]+/g, "-").toLowerCase(),
                position: typeof word === "string" ? constants_1.INTERNAL_POSITION : word.position,
            };
        }
        function resolveWordPreserve(word) {
            return typeof word === "object" && word.type === "word" ? word : {
                type: "word",
                value: typeof word === "string" ? word : (0, stringifyText_1.default)(compiler, word).replace(/[^\w-]+/g, "-"),
                position: typeof word === "string" ? constants_1.INTERNAL_POSITION : word.position,
            };
        }
        function mergeWords(words, separator, newSegment) {
            return !words?.length ? newSegment.map(resolveWordPreserve) : words.flatMap(selector => newSegment.map((newSegment) => resolveWordPreserve({
                type: "text",
                subType: "word-interpolated",
                valueType: ChiriType_1.ChiriType.of("string"),
                content: [
                    selector.value,
                    ...!separator ? [] : [separator],
                    ...typeof newSegment === "string" ? [newSegment] : newSegment.type === "word" ? [newSegment.value] : newSegment.content,
                ],
                position: typeof newSegment === "string" ? constants_1.INTERNAL_POSITION : newSegment.position,
            })));
        }
        function mergeText(position, ...texts) {
            return {
                type: "text",
                subType: "text",
                valueType: ChiriType_1.ChiriType.of("string"),
                content: texts.flatMap(text => text.content),
                position,
            };
        }
        function root() {
            return scopes[0];
        }
        function scope() {
            return scopes[scopes.length - 1];
        }
        function getLine(file, line) {
            let cursor = 0;
            for (let i = 0; i < line; i++) {
                const newlineIndex = file.indexOf("\n", cursor);
                if (newlineIndex === -1)
                    return "";
                cursor = newlineIndex + 1;
            }
            const lineEnd = file.indexOf("\n", cursor);
            return file.slice(cursor, lineEnd === -1 ? undefined : lineEnd);
        }
        //#endregion
        ////////////////////////////////////
    }
    exports.default = ChiriCompiler;
});
//# sourceMappingURL=ChiriCompiler.js.map