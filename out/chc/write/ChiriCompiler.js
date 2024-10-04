var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../ansi", "../../constants", "../type/ChiriType", "../type/ChiriTypeManager", "../type/typeString", "../util/componentStates", "../util/relToCwd", "../util/resolveExpression", "../util/stringifyExpression", "../util/stringifyText", "../util/Strings", "./CSSWriter", "./DTSWriter", "./ESWriter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ansi_1 = __importDefault(require("../../ansi"));
    const constants_1 = require("../../constants");
    const ChiriType_1 = require("../type/ChiriType");
    const ChiriTypeManager_1 = __importDefault(require("../type/ChiriTypeManager"));
    const typeString_1 = __importDefault(require("../type/typeString"));
    const componentStates_1 = require("../util/componentStates");
    const relToCwd_1 = __importDefault(require("../util/relToCwd"));
    const resolveExpression_1 = __importDefault(require("../util/resolveExpression"));
    const stringifyExpression_1 = __importDefault(require("../util/stringifyExpression"));
    const stringifyText_1 = __importDefault(require("../util/stringifyText"));
    const Strings_1 = __importDefault(require("../util/Strings"));
    const CSSWriter_1 = __importDefault(require("./CSSWriter"));
    const DTSWriter_1 = __importDefault(require("./DTSWriter"));
    const ESWriter_1 = __importDefault(require("./ESWriter"));
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
                compileStatements(ast.statements, undefined, statement => compileRoot(statement));
                for (const mixin of Object.values(usedMixins))
                    emitMixin(mixin);
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
            root().mixins ??= {};
            if (root())
                for (let i = scopes.length - 1; i >= 0; i--) {
                    const mixins = scopes[i].mixins;
                    if (mixins && mixin.name.value in mixins)
                        if (mixin.name.value in usedMixins)
                            throw error(mixin.position, `%${mixin.name.value} cannot be redefined after being used`);
                }
            return root().mixins[mixin.name.value] = mixin;
        }
        function useMixin(preRegisteredMixin, after) {
            const baseMixin = usedMixins[preRegisteredMixin.name.value];
            if (!baseMixin)
                // never used yet, so guaranteed to be after all the other mixins!
                return usedMixins[preRegisteredMixin.name.value] = { ...preRegisteredMixin, index: ++usedMixinIndex };
            const intersectingMixinIndex = after.findLast(mixin => mixin.affects.some(affect => baseMixin.affects.includes(affect)))?.index ?? -1;
            let bump = 1;
            let mixin = baseMixin;
            while (intersectingMixinIndex > mixin.index) {
                bump++;
                const bumpMixinNameString = `${preRegisteredMixin.name.value}__${bump}`;
                mixin = usedMixins[bumpMixinNameString];
                if (mixin)
                    continue;
                const bumpMixinName = { type: "word", value: bumpMixinNameString, position: baseMixin.name.position };
                mixin = {
                    ...baseMixin,
                    name: bumpMixinName,
                };
                break;
            }
            const registered = mixin;
            registered.index = ++usedMixinIndex;
            return usedMixins[registered.name.value] = registered;
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Shorthands
        function getShorthand(property) {
            return root().shorthands?.[property] ?? [property];
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
                    const properties = compileStatements(statement.content, undefined, compileMixinContent);
                    setMixin({
                        ...statement,
                        name: resolveWord(statement.name),
                        states: [undefined],
                        pseudos: [undefined],
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
                    let components = compileComponent(statement);
                    if (components === undefined)
                        return undefined;
                    if (!Array.isArray(components))
                        components = [components];
                    for (const component of components) {
                        const visited = [];
                        for (let i = 0; i < component.mixins.length; i++) {
                            const mixin = useMixin(getMixin(component.mixins[i].value, component.mixins[i].position), visited);
                            component.mixins[i] = mixin.name;
                            visited.push(mixin);
                        }
                        for (const selector of component.selector) {
                            es.write("\"");
                            es.writeWord(selector);
                            es.write("\"");
                            es.writeLineStartBlock(": [");
                            for (const mixin of new Set(component.mixins)) {
                                es.write("\"");
                                es.writeWord(mixin);
                                es.writeLine("\",");
                            }
                            es.writeLineEndBlock("],");
                            dts.write("\"");
                            dts.writeWord(selector);
                            dts.write("\"");
                            dts.writeLine(": string[],");
                        }
                    }
                    return true;
                }
                case "mixin-use": {
                    const mixin = getMixin(statement.name.value, statement.name.position);
                    for (const property of mixin.content) {
                        css.writingTo(property.isCustomProperty ? "root-properties" : "root-styles", () => {
                            css.emitProperty(compiler, property);
                        });
                    }
                    return true;
                }
                case "property-definition":
                    css.writingTo("property-definitions", () => {
                        css.write("@property ");
                        const name = resolveWord(statement.property);
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
                            css.write("initial-value:");
                            css.writeSpaceOptional();
                            css.write(compileStatements(statement.value, undefined, compileText).join(""));
                            css.writeLine(";");
                        });
                    });
                    return true;
                case "property":
                    css.writingTo(statement.isCustomProperty ? "root-properties" : "root-styles", () => {
                        css.emitProperty(compiler, {
                            ...statement,
                            property: resolveWord(statement.property),
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
            }
        }
        function compileComponent(statement) {
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
                };
                if ((component.mixins.some(m => m.value === "before") && component.mixins.some(m => m.value === "after")) || component.mixins.some(m => m.value === "before-after")) {
                    component.mixins = component.mixins.filter(mixin => mixin.value !== "before-after");
                    component.mixins.unshift({ type: "word", value: "before-after", position: constants_1.INTERNAL_POSITION });
                }
                if (component.mixins.some(m => m.value === "before-after"))
                    component.mixins = component.mixins.filter(m => m.value !== "before" && m.value !== "after");
                const components = content.filter(item => item.type === "compiled-component");
                components.unshift(component);
                return components;
            }
            let selector;
            switch (statement.subType) {
                case "state":
                    selector = createSelector(containingSelector, {
                        class: mergeWords(containingSelector?.class, "_", [getStatesClassNameAffix(statement.states)]),
                        state: mergeWords(containingSelector?.state, ":", statement.states),
                    });
                    break;
                case "pseudo":
                    selector = createSelector(containingSelector, {
                        class: mergeWords(containingSelector?.class, "_", [getPseudosClassNameAffix(statement.pseudos)]),
                        pseudo: mergeWords(containingSelector?.pseudo, "::", statement.pseudos),
                    });
                    break;
            }
            const result = compileSelector(selector, statement.content);
            if (statement.subType === "pseudo") {
                const pseudoClassName = statement.pseudos.map(p => p.value).sort((a, b) => b.localeCompare(a)).join("-");
                result.unshift({ type: "word", value: pseudoClassName, position: statement.pseudos[0].position });
            }
            return result;
        }
        function getStatesClassNameAffix(states) {
            return !states.length ? "" : "_" + states
                .map(state => state.value.startsWith(":") ? `${state.value.slice(1)}-any` : state.value)
                .join("_");
        }
        function getPseudosClassNameAffix(pseudos) {
            return !pseudos.length ? "" : "_" + pseudos
                .map(pseudo => pseudo.value)
                .join("-");
        }
        function compileSelector(selector, content, allowComponents = false) {
            selectorStack.push(selector);
            const compiledContent = compileStatements(content, undefined, compileComponentContent);
            const results = [];
            let propertyGroup;
            let groupIndex = 1;
            for (const item of [...compiledContent, { type: "end" }]) {
                switch (item.type) {
                    case "compiled-component":
                        if (!allowComponents)
                            throw internalError(item.selector[0].position, "Unexpected component in this context");
                        results.push(item);
                        break; // irrelevant for this mixin generation
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
                                results.push(item);
                            break;
                        }
                        const position = propertyGroup[0].position;
                        const nameString = `${selector.class.map(cls => cls.value).join("_")}${groupIndex === 1 ? "" : `_${groupIndex}`}`;
                        const name = { type: "word", value: nameString, position };
                        setMixin({
                            type: "mixin",
                            name,
                            states: selector.state.map(state => state?.value),
                            pseudos: selector.pseudo.map(pseudo => pseudo?.value),
                            position,
                            content: propertyGroup,
                            affects: propertyGroup.flatMap(getPropertyAffects),
                        });
                        results.push(name);
                        propertyGroup = undefined;
                        groupIndex++;
                        if (item.type === "word")
                            results.push(item);
                    }
                }
            }
            selectorStack.pop();
            return results;
        }
        function compileComponentContent(statement) {
            const componentResults = compileComponent(statement, true);
            if (componentResults !== undefined)
                return componentResults;
            switch (statement.type) {
                case "property":
                    return {
                        ...statement,
                        property: resolveWord(statement.property),
                        value: compileStatements(statement.value, undefined, compileText).join(""),
                    };
                case "mixin-use": {
                    let name = statement.name;
                    const selector = selectorStack.at(-1);
                    if (!selector)
                        throw error(name.position, "Unable to use mixin here, no selector");
                    if (!selector.state.length && !selector.pseudo.length)
                        return name;
                    if (selector.state.length)
                        name = {
                            type: "word",
                            value: `${name.value}_${getStatesClassNameAffix(selector.state)}`,
                            position: name.position,
                        };
                    if (selector.pseudo.length)
                        name = {
                            type: "word",
                            value: `${name.value}_${getPseudosClassNameAffix(selector.pseudo)}`,
                            position: name.position,
                        };
                    const existingMixin = getMixin(name.value, name.position, true);
                    if (!existingMixin)
                        setMixin({
                            ...getMixin(statement.name.value, statement.name.position),
                            name,
                            states: selector.state.map(state => state?.value),
                            pseudos: selector.pseudo.map(pseudo => pseudo?.value),
                        });
                    return name;
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
                    const mixin = getMixin(statement.name.value, statement.name.position);
                    return mixin.content;
                }
            }
        }
        function compileProperty(property) {
            return {
                ...property,
                property: resolveWord(property.property),
                value: compileStatements(property.value, undefined, compileText).join(""),
            };
        }
        function emitMixin(mixin) {
            let i = 0;
            if (!mixin.states.length)
                mixin.states.push(undefined);
            if (!mixin.pseudos.length)
                mixin.pseudos.push(undefined);
            for (const state of mixin.states) {
                for (const pseudo of mixin.pseudos) {
                    if (i) {
                        css.write(",");
                        css.writeSpaceOptional();
                    }
                    css.write(".");
                    css.writeWord(mixin.name);
                    if (state)
                        css.write(componentStates_1.STATE_MAP[state]);
                    if (pseudo)
                        css.write(`::${pseudo}`);
                    i++;
                }
            }
            css.writeSpaceOptional();
            css.writeLineStartBlock("{");
            for (const property of mixin.content)
                css.emitProperty(compiler, property);
            css.writeLineEndBlock("}");
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Context: Macros
        function compileMacros(statement, contextConsumer, end) {
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
                    const result = compileStatements(fn.content, assignments, contextConsumer, end);
                    return result;
                }
                case "each": {
                    const list = getVariable(statement.iterable.value, statement.iterable.position);
                    if (!Array.isArray(list))
                        throw error(statement.iterable.position, "Variable is not iterable");
                    const result = [];
                    for (const value of list) {
                        result.push(...compileStatements(statement.content, Scope.variables({ [statement.variable.name.value]: { type: statement.variable.valueType, value } }), contextConsumer, end));
                    }
                    return result;
                }
                case "for": {
                    scopes.push({});
                    setVariable(statement.variable.name.value, (0, resolveExpression_1.default)(compiler, statement.variable.expression), statement.variable.valueType, true);
                    const result = [];
                    while ((0, resolveExpression_1.default)(compiler, statement.condition)) {
                        const statements = statement.content.slice();
                        if (statement.update)
                            statements.push(statement.update);
                        result.push(...compileStatements(statements, undefined, contextConsumer, end));
                    }
                    scopes.pop();
                    return result;
                }
                case "while": {
                    scopes.push({});
                    const result = [];
                    while ((0, resolveExpression_1.default)(compiler, statement.condition)) {
                        const statements = statement.content.slice();
                        result.push(...compileStatements(statements, undefined, contextConsumer, end));
                    }
                    scopes.pop();
                    return result;
                }
                case "elseif":
                    if (ifState)
                        return [];
                // eslint-disable-next-line no-fallthrough
                case "if": {
                    ifState = !!(0, resolveExpression_1.default)(compiler, statement.condition);
                    if (!ifState)
                        return [];
                    return compileStatements(statement.content, undefined, contextConsumer, end);
                }
                case "else": {
                    if (ifState)
                        return [];
                    return compileStatements(statement.content, undefined, contextConsumer, end);
                }
                case "do":
                    return compileStatements(statement.content, undefined, contextConsumer, end);
                case "include": {
                    const statements = getVariable(statement.name.value, statement.name.position) ?? [];
                    const type = getVariableType(statement.name.value, statement.name.position);
                    const bodyType = type.generics[0].name.value;
                    return compileStatements(statements, undefined, getContextConsumer(bodyType));
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
        function compileFunction(statement, end) {
            switch (statement.type) {
                case "return": {
                    end();
                    return { type: "result", value: (0, resolveExpression_1.default)(compiler, statement.expression) };
                }
            }
        }
        //#endregion
        ////////////////////////////////////
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Internals
        function compileStatements(statements, using, contextCompiler, end) {
            scopes.push(using ?? {});
            if (scopes.length === 1) {
                setMixin({
                    type: "mixin",
                    pseudos: ["before"],
                    states: [undefined],
                    content: [blankContent],
                    affects: ["content"],
                    name: { type: "word", value: "before", position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                });
                setMixin({
                    type: "mixin",
                    pseudos: ["after"],
                    states: [undefined],
                    content: [blankContent],
                    affects: ["content"],
                    name: { type: "word", value: "after", position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                });
                setMixin({
                    type: "mixin",
                    pseudos: ["before", "after"],
                    states: [undefined],
                    content: [blankContent],
                    affects: ["content"],
                    name: { type: "word", value: "before-after", position: constants_1.INTERNAL_POSITION },
                    position: constants_1.INTERNAL_POSITION,
                });
            }
            // console.log(inspect(scopes, undefined, 3, true))
            // logLine(undefined, error(statements[0].position, ""))
            let ended = false;
            const upperEnd = end;
            end = () => {
                ended = true;
                upperEnd?.();
            };
            const results = [];
            for (const statement of statements) {
                const macroResult = compileMacros(statement, contextCompiler, end);
                if (macroResult) {
                    if (macroResult === true)
                        continue;
                    if (Array.isArray(macroResult))
                        results.push(...macroResult);
                    else
                        results.push(macroResult);
                    continue;
                }
                if (ended)
                    break;
                const result = contextCompiler(statement, end);
                if (result !== undefined) {
                    if (Array.isArray(result))
                        results.push(...result);
                    else
                        results.push(result);
                }
                if (ended)
                    break;
                if (result === undefined)
                    throw internalError(statement.position, `Failed to compile ${debugStatementString(statement)}`);
            }
            if (scopes.length > 1) // don't remove the root scope once it's set up
                scopes.pop();
            return results;
        }
        function callFunction(call) {
            const fn = getFunction(call.name.value, call.position);
            const result = compileStatements(fn.content, resolveAssignments(call.assignments), compileFunction);
            if (result.length > 1)
                throw internalError(call.position, "Function call returned multiple values");
            if (result.length === 0)
                throw internalError(call.position, "Function call did not return a value");
            return result[0]?.value;
        }
        function getPropertyAffects(property) {
            return getShorthand(property.property.value);
        }
        function debugStatementString(statement) {
            const name = "name" in statement ? ` "${(0, stringifyText_1.default)(compiler, statement.name)}"` : "";
            return statement.type + name;
        }
        function resolveAssignments(assignments) {
            return Scope.variables(Object.fromEntries(Object.entries(assignments)
                .map(([name, expr]) => [name, { type: expr.valueType, value: (0, resolveExpression_1.default)(compiler, expr) }])));
        }
        function resolveWord(word) {
            return typeof word === "object" && word.type === "word" ? word : {
                type: "word",
                value: typeof word === "string" ? word : (0, stringifyText_1.default)(compiler, word).replace(/[^\w-]+/g, "-").toLowerCase(),
                position: typeof word === "string" ? constants_1.INTERNAL_POSITION : word.position,
            };
        }
        function mergeWords(words, separator, newSegment) {
            return !words?.length ? newSegment.map(resolveWord) : words.flatMap(selector => newSegment.map((newSegment) => resolveWord({
                type: "text",
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