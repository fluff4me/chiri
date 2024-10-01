import path from "path"
import ansi from "../../ansi"
import { PACKAGE_ROOT } from "../../constants"
import type { ChiriAST, ChiriPosition, ChiriStatement } from "../read/ChiriReader"
import type { ChiriCompilerVariable } from "../read/consume/consumeCompilerVariableOptional"
import type { ChiriMixin } from "../read/consume/consumeMixinOptional"
import type { ChiriProperty } from "../read/consume/consumePropertyOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression"
import type { ChiriFunctionCall } from "../read/consume/expression/consumeFunctionCallOptional"
import type { ChiriFunction } from "../read/consume/macro/macroFunctionDeclaration"
import type { ChiriMacro } from "../read/consume/macro/macroMacroDeclaration"
import { ChiriType } from "../type/ChiriType"
import ChiriTypeManager from "../type/ChiriTypeManager"
import type { BodyVariableContext, BodyVariableContexts } from "../type/typeBody"
import typeString from "../type/typeString"
import Arrays from "../util/Arrays"
import { STATE_MAP, type ComponentState } from "../util/componentStates"
import type { Value } from "../util/resolveExpression"
import resolveExpression from "../util/resolveExpression"
import stringifyExpression from "../util/stringifyExpression"
import stringifyText from "../util/stringifyText"
import Strings from "../util/Strings"
import type { ArrayOr } from "../util/Type"
import type { ResolvedProperty } from "./CSSWriter"
import CSSWriter from "./CSSWriter"
import DTSWriter from "./DTSWriter"
import ESWriter from "./ESWriter"
import type Writer from "./Writer"

////////////////////////////////////
//#region Scope

interface Variable {
	type: ChiriType
	value: Value
}

interface Scope {
	variables?: Record<string, Variable>
	macros?: Record<string, ChiriMacro>
	functions?: Record<string, ChiriFunction>
	mixins?: Record<string, PreRegisteredMixin>
	shorthands?: Record<string, string[]>
	aliases?: Record<string, string[]>
}

function Scope (data: Scope): Scope {
	return data
}

namespace Scope {
	export function variables (variables: Scope["variables"]): Scope {
		return { variables }
	}
	export function mixins (mixins: Scope["mixins"]): Scope {
		return { mixins }
	}
}

//#endregion
////////////////////////////////////

interface PreRegisteredMixin extends Omit<ChiriMixin, "content" | "name"> {
	state?: ComponentState
	name: ChiriWord
	content: ResolvedProperty[]
	affects: string[]
}

interface RegisteredMixin extends PreRegisteredMixin {
	index: number
}

interface ErrorPositioned extends Error {
	position?: ChiriPosition
}

interface ChiriCompiler {
	readonly ast: ChiriAST
	readonly types: ChiriTypeManager
	readonly css: CSSWriter
	readonly es: ESWriter
	readonly dts: DTSWriter
	readonly writers: readonly Writer[]

	readonly pipeValueStack: Value[]

	compile (): void
	writeFiles (): Promise<void>
	error (message?: string): ErrorPositioned
	error (position?: ChiriPosition, message?: string): ErrorPositioned
	logLine (position?: ChiriPosition, message?: string | ErrorPositioned): void

	getVariable (name: string, position: ChiriPosition): Value
	setVariable (name: string, value: Value, type: ChiriType): void
	getMixin (name: string, position: ChiriPosition): PreRegisteredMixin
	setMixin (mixin: PreRegisteredMixin): void
	getShorthand (property: string): string[]
	setShorthand (property: string, affects: string[], position: ChiriPosition): void
	getAlias (property: string): string[]
	setAlias (property: string, aliases: string[], position: ChiriPosition): void
	getMacro (name: string, position: ChiriPosition): ChiriMacro
	setMacro (fn: ChiriMacro): void
	getFunction (name: string, position: ChiriPosition): ChiriFunction
	setFunction (fn: ChiriFunction): void

	callFunction (fn: ChiriFunctionCall): Value
}

function ChiriCompiler (ast: ChiriAST, dest: string): ChiriCompiler {
	const scopes: Scope[] = []
	const selectorStack: ChiriWordInterpolated[] = []
	const usedMixins: Record<string, RegisteredMixin> = {}
	let usedMixinIndex = 0
	let ifState = true

	const css = new CSSWriter(ast, dest)
	const es = new ESWriter(ast, dest)
	const dts = new DTSWriter(ast, dest)
	const writers = [css, es, dts]

	const compiler: ChiriCompiler = {
		types: undefined!,
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
	}

	const types = new ChiriTypeManager(compiler)
	Object.assign(compiler, { types })

	return compiler

	function compile () {
		typeString.coerce = value => stringifyExpression(compiler, value)

		try {
			for (const writer of writers)
				writer.onCompileStart(compiler)

			compileStatements(ast.statements, undefined, statement => compileRoot(statement))

			for (const mixin of Object.values(usedMixins))
				emitMixin(mixin)

			for (const writer of writers)
				writer.onCompileEnd(compiler)

		} catch (err) {
			logLine(undefined, err as ErrorPositioned)
		}
	}

	async function writeFiles () {
		return Promise.all(writers.map(writer => writer.writeFile())) as Promise<any>
	}

	////////////////////////////////////
	//#region Scope


	////////////////////////////////////
	//#region Variables

	function getVariable (name: string, position: ChiriPosition, optional = false): Value {
		for (let i = scopes.length - 1; i >= 0; i--) {
			const variables = scopes[i].variables
			if (variables && name in variables)
				return variables[name].value
		}

		if (!optional)
			throw error(position, `Variable ${name} is not defined`)
	}

	function setVariable (name: string, value: Value, type: ChiriType, defineNew?: true) {
		if (!defineNew)
			for (let i = scopes.length - 1; i >= 0; i--) {
				const variables = scopes[i].variables
				if (variables && name in variables) {
					value = variables[name].type.name.value === type.name.value ? value : types.coerce(value, variables[name].type)
					variables[name].value = value
					return
				}
			}

		scope().variables ??= {}
		scope().variables![name] = {
			type,
			value,
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Macros

	function getMacro (name: string, position: ChiriPosition): ChiriMacro {
		for (let i = scopes.length - 1; i >= 0; i--) {
			const macros = scopes[i].macros
			if (macros && name in macros)
				return macros[name]
		}

		throw error(position, `Macro ${name} is not defined`)
	}

	function setMacro (fn: ChiriMacro) {
		scope().macros ??= {}
		if (scope().macros![fn.name.value])
			throw error(fn.position, `Macro ${fn.name.value} has already been defined in this scope`)

		scope().macros![fn.name.value] = fn
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Functions

	function getFunction (name: string, position: ChiriPosition): ChiriFunction {
		for (let i = scopes.length - 1; i >= 0; i--) {
			const functions = scopes[i].functions
			if (functions && name in functions)
				return functions[name]
		}

		throw error(position, `Function ${name} is not defined`)
	}

	function setFunction (fn: ChiriFunction) {
		scope().functions ??= {}
		if (scope().functions![fn.name.value])
			throw error(fn.position, `Function ${fn.name.value} has already been defined in this scope`)

		scope().functions![fn.name.value] = fn
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Mixins

	function getMixin (name: string, position: ChiriPosition): PreRegisteredMixin
	function getMixin (name: string, position: ChiriPosition, optional: true): PreRegisteredMixin | undefined
	function getMixin (name: string, position: ChiriPosition, optional = false): PreRegisteredMixin | undefined {
		const mixin = root().mixins?.[name]
		if (mixin)
			return mixin

		if (!optional)
			throw error(position, `Mixin ${name} is not defined`)
	}

	function setMixin (mixin: PreRegisteredMixin): PreRegisteredMixin {
		root().mixins ??= {}

		if (root())
			for (let i = scopes.length - 1; i >= 0; i--) {
				const mixins = scopes[i].mixins
				if (mixins && mixin.name.value in mixins)
					if (mixin.name.value in usedMixins)
						throw error(mixin.position, `%${mixin.name.value} cannot be redefined after being used`)
			}

		return root().mixins![mixin.name.value] = mixin
	}

	function useMixin (preRegisteredMixin: PreRegisteredMixin, after: RegisteredMixin[]): RegisteredMixin {
		const baseMixin: RegisteredMixin | undefined = usedMixins[preRegisteredMixin.name.value]
		if (!baseMixin)
			// never used yet, so guaranteed to be after all the other mixins!
			return usedMixins[preRegisteredMixin.name.value] = { ...preRegisteredMixin, index: ++usedMixinIndex }

		const intersectingMixinIndex = after.findLast(mixin => mixin.affects.some(affect => baseMixin.affects.includes(affect)))?.index ?? -1
		let bump = 1
		let mixin: RegisteredMixin | undefined = baseMixin
		while (intersectingMixinIndex > mixin.index) {
			bump++
			const bumpMixinNameString = `${preRegisteredMixin.name.value}__${bump}`
			mixin = usedMixins[bumpMixinNameString]
			if (mixin)
				continue

			const bumpMixinName: ChiriWord = { type: "word", value: bumpMixinNameString, position: baseMixin.name.position }
			mixin = {
				...baseMixin,
				name: bumpMixinName,
			}
			break
		}

		const registered = mixin
		registered.index = ++usedMixinIndex

		return usedMixins[registered.name.value] = registered
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Shorthands

	function getShorthand (property: string): string[] {
		return root().shorthands?.[property] ?? [property]
	}

	function setShorthand (property: string, affects: string[], position: ChiriPosition) {
		const shorthands = root().shorthands ??= {}

		// allow redefining specific things that are in core lib
		// if (shorthands[property])
		// 	throw error(position, `#shorthand ${property} cannot be redefined`)

		shorthands[property] = affects
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Aliases

	function getAlias (property: string): string[] {
		return root().aliases?.[property] ?? [property]
	}

	function setAlias (property: string, properties: string[], position: ChiriPosition) {
		const aliases = root().aliases ??= {}
		aliases[property] = properties
	}

	//#endregion
	////////////////////////////////////

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Public Utils

	function error (message?: string): ErrorPositioned
	function error (position?: ChiriPosition, message?: string): ErrorPositioned
	function error (position?: ChiriPosition | string, message?: string): ErrorPositioned {
		message = typeof position === "string" ? position : message
		position = typeof position === "string" ? undefined : position
		return Object.assign(new Error(message ?? "Compilation failed for an unknown reason"), { position })
	}

	function logLine (position?: ChiriPosition, message?: string | ErrorPositioned, stack = true, preview = true) {
		const err = message instanceof Error ? message : undefined
		if (message instanceof Error) {
			position ??= message.position
			message = ansi.err + message.message + ansi.reset
		}

		message ??= ""

		const line = !position?.file ? "" : Strings.symbolise(getLine(ast.source[position.file] ?? "", position.line - 1))

		const positionBlock = !position || !preview ? "" : "\n"
			+ ansi.label + "  " + `${position.line}`.padStart(5) + " " + ansi.reset + line + "\n"
			+ (err ? ansi.err : ansi.filepos) + `        ${" ".repeat(position.column - 1)}${"^"}`
			+ ansi.reset

		const filename = !position?.file ? "Unknown location"
			: ansi.path + path.relative(process.cwd(), position.file).replaceAll("\\", "/")
			+ ansi.filepos + `:${position.line}:${position.column}` + ansi.reset

		const stackString = err?.stack ?? new Error().stack ?? ""

		console[err ? "error" : "info"](filename
			+ ansi.label + (message ? " - " : "")
			+ ansi.reset + message
			+ positionBlock
			+ (!stack || (process.env.CHIRI_ENV !== "dev" && !(+process.env.CHIRI_STACK_LENGTH! || 0)) ? ""
				: `\n${stackString
					.slice(stackString.indexOf("\n", !position ? 0 : stackString.indexOf("\n") + 1) + 1)
					.split("\n")
					.slice(0, +process.env.CHIRI_STACK_LENGTH! || 3)
					.map(path => path.replace(PACKAGE_ROOT + "\\", "").replaceAll("\\", "/"))
					.join("\n")}`))
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Contexts


	////////////////////////////////////
	//#region Context: Root

	function compileRoot (statement: ChiriStatement) {
		switch (statement.type) {
			case "documentation":
				for (const writer of writers)
					writer.writeDocumentation(statement)
				return true

			case "mixin": {
				const properties = compileStatements(statement.content, undefined, compileMixinContent)
				setMixin({
					...statement,
					name: resolveWord(statement.name),
					content: properties,
					affects: properties.flatMap(getPropertyAffects),
				})
				return true
			}
			case "shorthand": {
				const property = stringifyText(compiler, statement.property)
				const affects = compileStatements(statement.body, undefined, compileShorthand)
					.filter(affected => !!affected)

				setShorthand(property, affects, statement.position)
				return true
			}
			case "alias": {
				const property = stringifyText(compiler, statement.property)
				const properties = compileStatements(statement.body, undefined, compileShorthand)
					.filter(affected => !!affected)

				setAlias(property, properties, statement.position)
				return true
			}
			case "component": {
				let components = compileComponent(statement)
				if (components === undefined)
					return undefined

				if (!Array.isArray(components))
					components = [components]

				for (const component of components) {
					if (component.type === "state")
						throw error(component.state.position, "Internal Error: Unprocessed state")

					es.write("\"")
					es.writeTextInterpolated(compiler, component.selector)
					es.write("\"")
					es.writeLineStartBlock(": [")
					for (const mixin of component.mixins) {
						es.write("\"")
						es.writeWord(mixin)
						es.writeLine("\",")
					}
					es.writeLineEndBlock("],")

					dts.write("\"")
					dts.writeTextInterpolated(compiler, component.selector)
					dts.write("\"")
					dts.writeLine(": string[],")
				}

				return true
			}

			case "mixin-use": {
				const mixin = getMixin(statement.name.value, statement.name.position)
				for (const property of mixin.content) {
					css.writingTo(property.isCustomProperty ? "root-properties" : "root-styles", () => {
						css.emitProperty(compiler, property)
					})
				}
				return true
			}

			case "property": {
				css.writingTo(statement.isCustomProperty ? "root-properties" : "root-styles", () => {
					css.emitProperty(compiler, {
						...statement,
						property: resolveWord(statement.property),
						value: stringifyText(compiler, statement.value),
					})
				})
				return true
			}

			case "import-css": {
				css.writingTo("imports", () => {
					for (const imp of statement.imports) {
						css.writeLine(`@import ${stringifyText(compiler, imp)};`)
					}
				})
				return true
			}
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Component

	interface Component {
		type: "component"
		selector: ChiriWordInterpolated
		mixins: ChiriWord[]
		properties: ResolvedProperty[]
	}

	interface State extends Omit<Component, "type" | "selector" | "content"> {
		type: "state"
		state: ChiriWord
		content: (ChiriWord | ResolvedProperty)[]
	}

	function compileComponent (statement: ChiriStatement): (Component | State)[] | undefined {
		if (statement.type !== "component")
			return undefined

		const className = statement.className?.content ?? []
		const state = statement.state

		const containingSelector = selectorStack[selectorStack.length - 1]

		const selector: ChiriWordInterpolated = !className.length ? containingSelector : {
			type: "text",
			valueType: ChiriType.of("string"),
			content: !containingSelector ? className : [...containingSelector?.content ?? [], "-", ...className],
			position: (statement.className?.position ?? statement.state?.position)!,
		}
		selectorStack.push(selector)
		const results = compileStatements(statement.content, undefined, compileComponentContent)
		selectorStack.pop()

		const components: (Component | State)[] = results.filter(result => result.type === "component")
		const properties = results.filter(result => result.type === "property")
		const mixins = results.filter(result => result.type === "word")
		const states = results.filter(result => result.type === "state")

		const componentSelectorString = stringifyText(compiler, selector)

		let propertyGroup: ResolvedProperty[] | undefined
		let groupIndex = 1
		for (const result of [...results, { type: "word" as const }]) {
			switch (result.type) {
				case "property": {
					propertyGroup ??= []
					propertyGroup.push(result)
					break
				}
				case "word": {
					// mixin use (end group)
					if (!propertyGroup)
						break

					const position = groupIndex === 1 ? selector.position : properties[0].position
					const stateName = state?.value.startsWith(":") ? `${state.value.slice(1)}-any` : state?.value ?? ""
					const selfMixinName: ChiriWord = { type: "word", value: `${componentSelectorString}${groupIndex === 1 ? "" : `_${groupIndex}`}${!stateName ? "" : `_${stateName}`}`, position }
					setMixin({
						type: "mixin",
						name: selfMixinName,
						state: state?.value as ComponentState | undefined,
						position,
						content: properties,
						affects: properties.flatMap(getPropertyAffects),
					})
					Arrays.insertBefore(mixins, selfMixinName, result)

					propertyGroup = undefined
					groupIndex++
				}
			}
		}

		for (const state of states) {
			for (const name of state.mixins) {
				const mixin = getMixin(name.value, name.position)
				if (mixin.state) {
					mixins.push(name)
					continue
				}

				const stateName = state.state.value.startsWith(":") ? `${state.state.value.slice(1)}-any` : state.state.value
				const stateMixinName: ChiriWord = { type: "word", value: `${name.value}_${stateName}`, position: mixin.name.position }
				if (!getMixin(stateMixinName.value, mixin.name.position, true))
					setMixin({
						...mixin,
						name: stateMixinName,
						state: state.state.value as ComponentState,
						affects: mixin.content.flatMap(getPropertyAffects),
					})

				mixins.push(stateMixinName)
			}
		}

		if (!state) {
			const visited: RegisteredMixin[] = []
			for (let i = 0; i < mixins.length; i++) {
				const mixin = useMixin(getMixin(mixins[i].value, mixins[i].position), visited)
				mixins[i] = mixin.name
				visited.push(mixin)
			}
		}

		const component = {
			type: state ? "state" as const : "component" as const,
			selector,
			state,
			mixins,
		} as Omit<Partial<Component> & Partial<State>, "type"> & { type?: Component["type"] | State["type"] } as Component | State

		components.unshift(component)
		return components
	}

	function compileComponentContent (statement: ChiriStatement): ArrayOr<ChiriWord | ResolvedProperty | Component | State> | undefined {
		const componentResults = compileComponent(statement)
		if (componentResults !== undefined)
			return componentResults

		switch (statement.type) {
			case "mixin-use":
				return statement.name
			case "property":
				return {
					...statement,
					property: resolveWord(statement.property),
					value: stringifyText(compiler, statement.value),
				}
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Mixins

	function compileMixinContent (statement: ChiriStatement): ArrayOr<ResolvedProperty> | undefined {
		switch (statement.type) {
			case "property":
				return compileProperty(statement)
			case "mixin-use": {
				const mixin = getMixin(statement.name.value, statement.name.position)
				return mixin.content
			}
		}
	}

	function compileProperty (property: ChiriProperty): ResolvedProperty {
		return {
			...property,
			property: resolveWord(property.property),
			value: stringifyText(compiler, property.value),
		}
	}

	function emitMixin (mixin: RegisteredMixin) {
		css.write(".")
		css.writeWord(mixin.name)
		if (mixin.state)
			css.write(STATE_MAP[mixin.state])
		css.writeSpaceOptional()
		css.writeLineStartBlock("{")
		for (const property of mixin.content)
			css.emitProperty(compiler, property)
		css.writeLineEndBlock("}")
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Macros

	function compileMacros<T> (statement: ChiriStatement, contextConsumer: (statement: ChiriStatement, end: () => any) => ArrayOr<T> | undefined, end: () => void) {
		switch (statement.type) {
			case "variable": {
				if (!statement.assignment)
					return true

				if (statement.assignment === "??=" && getVariable(statement.name.value, statement.position, true) !== undefined)
					return true

				if (!statement.expression && statement.assignment === "??=") {
					scope().variables ??= {}
					scope().variables![statement.name.value] = { type: statement.valueType, value: undefined }
					return true
				}

				let result = resolveExpression(compiler, statement.expression)
				result = types.coerce(result, statement.valueType, statement.expression?.valueType)
				setVariable(statement.name.value, result, statement.valueType, true)
				return true
			}

			case "assignment": {
				if (statement.assignment === "??=" && getVariable(statement.name.value, statement.position) !== undefined)
					// already assigned
					return true

				const value = resolveExpression(compiler, statement.expression)
				setVariable(statement.name.value, value, statement.expression?.valueType ?? ChiriType.of("undefined"))
				return true
			}

			case "macro":
				setMacro(statement)
				return true

			case "function":
				setFunction(statement)
				return true

			case "macro-use": {
				switch (statement.name.value) {
					case "debug": {
						const lines = compileStatements(statement.content, undefined, compileText)
						logLine(statement.position, ansi.label + "debug" + (lines.length === 1 ? " - " : "") + ansi.reset + (lines.length <= 1 ? "" : "\n") + lines.join("\n"), false, false)
						return true
					}
				}

				const fn = getMacro(statement.name.value, statement.position)
				if (!fn)
					return undefined

				const assignments = resolveAssignments(statement.assignments)

				const bodyParameter = fn.content.find((statement): statement is ChiriCompilerVariable => statement.type === "variable" && statement.valueType.name.value === "body")
				if (bodyParameter) {
					assignments.variables ??= {}
					const bodyType = bodyParameter.valueType.generics[0].name.value as BodyVariableContext
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					assignments.variables[bodyParameter.name.value] = {
						type: bodyParameter.valueType,
						value: Object.assign(compileStatements(statement.content, undefined, getContextConsumer(bodyType)), { isBody: true }) as any[],
					}
				}

				const result = compileStatements(fn.content, assignments, contextConsumer, end)
				return result
			}

			case "each": {
				const list = getVariable(statement.iterable.value, statement.iterable.position)
				if (!Array.isArray(list))
					throw error(statement.iterable.position, "Variable is not iterable")

				const result: T[] = []
				for (const value of list) {
					result.push(...compileStatements(statement.content,
						Scope.variables({ [statement.variable.name.value]: { type: statement.variable.valueType, value } }),
						contextConsumer, end))
				}

				return result
			}

			case "for": {
				scopes.push({})
				setVariable(statement.variable.name.value, resolveExpression(compiler, statement.variable.expression), statement.variable.valueType, true)

				const result: T[] = []
				while (resolveExpression(compiler, statement.condition)) {
					const statements = statement.content.slice()
					if (statement.update)
						statements.push(statement.update)

					result.push(...compileStatements(statements, undefined, contextConsumer, end))
				}

				scopes.pop()
				return result
			}

			case "while": {
				scopes.push({})

				const result: T[] = []
				while (resolveExpression(compiler, statement.condition)) {
					const statements = statement.content.slice()
					result.push(...compileStatements(statements, undefined, contextConsumer, end))
				}

				scopes.pop()
				return result
			}

			case "elseif":
				if (ifState)
					return []

			// eslint-disable-next-line no-fallthrough
			case "if": {
				ifState = !!resolveExpression(compiler, statement.condition)
				if (!ifState)
					return []

				return compileStatements(statement.content, undefined, contextConsumer, end)
			}

			case "else": {
				if (ifState)
					return []

				return compileStatements(statement.content, undefined, contextConsumer, end)
			}

			case "do":
				return compileStatements(statement.content, undefined, contextConsumer, end)

			case "include":
				return getVariable(statement.name.value, statement.name.position) as any as T[] ?? []
		}
	}

	function getContextConsumer (context: (typeof BodyVariableContexts)[number]): (statement: ChiriStatement) => ReturnType<typeof compileText> | ReturnType<typeof compileComponentContent> {
		switch (context) {
			case "text":
			case "property-name":
				return compileText
			case "component":
				return compileComponentContent
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Text

	function compileText (statement: ChiriStatement): ArrayOr<string> | undefined {
		if (statement.type !== "text")
			throw error(statement.position, `Expected text, got ${debugStatementString(statement)}`)

		return stringifyText(compiler, statement)
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Shorthand

	function compileShorthand (statement: ChiriStatement): ArrayOr<string> | undefined {
		if (statement.type !== "text")
			throw error(statement.position, `Expected text, got ${debugStatementString(statement)}`)

		return stringifyText(compiler, statement)
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Function

	function compileFunction (statement: ChiriStatement, end: () => void) {
		switch (statement.type) {
			case "return": {
				end()
				return { type: "result" as const, value: resolveExpression(compiler, statement.expression) }
			}
		}
	}

	//#endregion
	////////////////////////////////////

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Internals

	function compileStatements<T> (statements: ChiriStatement[], using: Partial<Scope> | undefined, contextCompiler: (statement: ChiriStatement, end: () => any) => ArrayOr<T> | undefined, end?: () => void): T[] {
		scopes.push(using ?? {})
		// console.log(inspect(scopes, undefined, 3, true))
		// logLine(undefined, error(statements[0].position, ""))

		let ended = false
		const upperEnd = end
		end = () => {
			ended = true
			upperEnd?.()
		}

		const results: T[] = []
		for (const statement of statements) {
			const macroResult = compileMacros(statement, contextCompiler, end)
			if (macroResult) {
				if (macroResult === true)
					continue

				if (Array.isArray(macroResult))
					results.push(...macroResult)
				else
					results.push(macroResult)

				continue
			}

			if (ended)
				break

			const result = contextCompiler(statement, end)
			if (result !== undefined) {
				if (Array.isArray(result))
					results.push(...result)
				else
					results.push(result)
			}

			if (ended)
				break

			if (result === undefined)
				throw error((statement as { position?: ChiriPosition }).position, `Failed to compile ${debugStatementString(statement)}`)
		}

		if (scopes.length > 1) // don't remove the root scope once it's set up
			scopes.pop()

		return results
	}

	function callFunction (call: ChiriFunctionCall) {
		const fn = getFunction(call.name.value, call.position)
		const result = compileStatements(fn.content, resolveAssignments(call.assignments), compileFunction)
		if (result.length > 1)
			throw error(call.position, "Internal Error: Function call returned multiple values")

		if (result.length === 0)
			throw error(call.position, "Internal Error: Function call did not return a value")

		return result[0]?.value
	}

	function getPropertyAffects (property: ResolvedProperty): string[] {
		return getShorthand(property.property.value)
	}

	function debugStatementString (statement: ChiriStatement) {
		const name = "name" in statement ? ` "${stringifyText(compiler, statement.name)}"` : ""
		return statement.type + name
	}

	function resolveAssignments (assignments: Record<string, ChiriExpressionResult>): Partial<Scope> {
		return Scope.variables(Object.fromEntries(Object.entries(assignments)
			.map(([name, expr]) =>
				[name, { type: expr.valueType, value: resolveExpression(compiler, expr) }])))
	}

	function resolveWord (word: ChiriWordInterpolated): ChiriWord {
		return {
			type: "word",
			value: stringifyText(compiler, word),
			position: word.position,
		}
	}

	function root () {
		return scopes[0]
	}

	function scope () {
		return scopes[scopes.length - 1]
	}

	function getLine (file: string, line: number): string {
		let cursor = 0
		for (let i = 0; i < line; i++) {
			const newlineIndex = file.indexOf("\n", cursor)
			if (newlineIndex === -1)
				return ""

			cursor = newlineIndex + 1
		}

		const lineEnd = file.indexOf("\n", cursor)
		return file.slice(cursor, lineEnd === -1 ? undefined : lineEnd)
	}

	//#endregion
	////////////////////////////////////
}

export default ChiriCompiler
