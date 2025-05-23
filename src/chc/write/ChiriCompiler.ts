import ansi from "../../ansi"
import { INTERNAL_POSITION, PACKAGE_ROOT } from "../../constants"
import type { ChiriAST, ChiriPosition, ChiriStatement } from "../read/ChiriReader"
import type { ChiriCompilerVariable } from "../read/consume/consumeCompilerVariableOptional"
import type { ChiriMacroUse } from "../read/consume/consumeMacroUseOptional"
import type { ChiriProperty } from "../read/consume/consumePropertyOptional"
import type { ChiriBaseText, ChiriValueText } from "../read/consume/consumeValueText"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression"
import type { ChiriFunctionCall } from "../read/consume/expression/consumeFunctionCallOptional"
import type { ChiriMacroBlock } from "../read/consume/macro/MacroConstruct"
import type { ChiriFunction } from "../read/consume/macro/macroFunctionDeclaration"
import type { ChiriMacro } from "../read/consume/macro/macroMacroDeclaration"
import type { PseudoName } from "../read/consume/rule/Rule"
import makeWord from "../read/factory/makeWord"
import { ChiriType } from "../type/ChiriType"
import ChiriTypeManager from "../type/ChiriTypeManager"
import type { BodyVariableContext, BodyVariableContexts } from "../type/typeBody"
import typeString from "../type/typeString"
import _ from "../util/_"
import type { ComponentStateSpecial } from "../util/componentStates"
import getFunctionParameters from "../util/getFunctionParameters"
import relToCwd from "../util/relToCwd"
import type { Value } from "../util/resolveExpression"
import resolveExpression, { Record as ChiriRecord } from "../util/resolveExpression"
import stringifyExpression from "../util/stringifyExpression"
import stringifyText from "../util/stringifyText"
import Strings from "../util/Strings"
import type { ArrayOr } from "../util/Type"
import type { ResolvedAnimation, ResolvedAnimationKeyframe, ResolvedMediaQuery, ResolvedMixin, ResolvedProperty, ResolvedRootSpecial, ResolvedViewTransition } from "./CSSWriter"
import CSSWriter from "./CSSWriter"
import DTSWriter from "./DTSWriter"
import type { ResolvedComponent } from "./ESWriter"
import ESWriter from "./ESWriter"
import type Writer from "./Writer"

const EMPTY: never[] = []

////////////////////////////////////
//#region Scope

interface Scope {
	variables?: Record<string, Variable>
	macros?: Record<string, ChiriMacro>
	functions?: Record<string, ChiriFunction>
	animations?: Record<string, ResolvedAnimation>
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

type Block = (Extract<ChiriStatement, ChiriMacroBlock> | ChiriFunctionCall | ChiriMacroUse) & {
	continuing?: true
	ifState: boolean
}

////////////////////////////////////
//#region Interfaces

interface Variable {
	type: ChiriType
	value: Value
}

interface PreRegisteredMixin extends Omit<ResolvedMixin, "index"> {
	spread?: true
	children?: PreRegisteredMixin[]
	used?: true
}

//#endregion
////////////////////////////////////

//#endregion
////////////////////////////////////

interface ChiriSelector {
	type: "selector"
	class: ChiriWord[]
	state: ChiriWord[]
	pseudo: ChiriWord[]
	specialState?: ChiriWord
	containerQueries: string[]
	mediaQueries: (ResolvedMediaQuery | string)[]
	elementTypes: ChiriWord[]
	spread?: true
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
	const selectorStack: ChiriSelector[] = []
	const usedMixins: Record<string, ResolvedMixin> = {}
	const components: Record<string, ResolvedComponent> = {}
	const viewTransitions: ResolvedViewTransition[] = []
	const rootSpecials: ResolvedRootSpecial[] = []
	const blocks: Block[] = []
	let usedMixinIndex = 0

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

	const blankContent: ResolvedProperty = {
		type: "property",
		property: {
			type: "word",
			value: "content",
			position: INTERNAL_POSITION,
		},
		value: "\"\"",
		position: INTERNAL_POSITION,
	}

	return compiler

	function compile () {
		typeString.coerce = value => stringifyExpression(compiler, value)

		try {
			for (const writer of writers)
				writer.onCompileStart(compiler)

			compileStatements(ast.statements, undefined, compileRoot)

			for (const rootSpecial of rootSpecials)
				css.writeMixin(compiler, rootSpecial)

			for (const mixin of Object.values(usedMixins))
				css.writeMixin(compiler, mixin)

			for (const viewTransition of viewTransitions)
				css.writeViewTransition(compiler, viewTransition)

			for (const animation of Object.values(root().animations ?? {}))
				css.writeAnimation(compiler, animation)

			for (const component of Object.values(components))
				es.emitComponent(compiler, component)

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
	//#region Blocks

	function pushBlock<BLOCK extends Omit<Block, "ifState">> (inblock: BLOCK): BLOCK & Block {
		const block = inblock as any as Block
		block.ifState = true
		blocks.push(block)
		return block
	}

	function popBlock (block: Block) {
		const index = blocks.findIndex(b => b === block)
		if (index === -1)
			return

		if (index < blocks.length - 1)
			throw error(block.position, `This #${block.type} is not the most recent block`)

		blocks.pop()
	}

	function blockIfState () {
		return blocks.at(-1)?.ifState ?? true
	}

	function setBlockIfState (ifState: boolean) {
		const block = blocks.at(-1)
		if (!block) return

		block.ifState = ifState
	}

	function blockBroken (block: Block) {
		return !blocks.includes(block)
	}

	function blockContinuing () {
		return blocks.at(-1)?.continuing
	}

	function breakBlock (position: ChiriPosition, name?: string) {
		const blockIndex = findBlock(name)
		if (blockIndex === undefined)
			throw error(position, `Cannot #break ${name ? `:${name}` : ""}`)

		blocks.splice(blockIndex, Infinity)
	}

	function breakFunction (position: ChiriPosition) {
		const blockIndex = blocks.findLastIndex(block => block.type === "function-call")
		if (blockIndex === undefined)
			throw error(position, "Cannot #return outside of a function")

		blocks.splice(blockIndex, Infinity)
	}

	function continueBlock (position: ChiriPosition, name?: string) {
		const blockIndex = findBlock(name)
		if (blockIndex === undefined)
			throw error(position, `Cannot #continue ${name ? `:${name}` : ""}`)

		blocks[blockIndex].continuing = true
		blocks.splice(blockIndex + 1, Infinity)
	}

	function findBlock (name?: string) {
		for (let i = blocks.length - 1; i >= 0; i--) {
			const block = blocks[i]
			switch (block.type) {
				case "if":
				case "else":
				case "elseif":
				case "do":
					if (!name)
						continue

					if (block.label?.value !== name)
						continue

					return i

				case "each":
				case "for":
				case "while":
					if (!name || block.label?.value === name)
						return i

					continue

				case "function-call":
				case "macro-use":
					return i + 1

				default: { const assertNever: never = block }
			}
		}
	}

	//#endregion
	////////////////////////////////////

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

	function getVariableType (name: string, position: ChiriPosition): ChiriType
	function getVariableType (name: string, position: ChiriPosition, optional: true): ChiriType | undefined
	function getVariableType (name: string, position: ChiriPosition, optional = false): ChiriType | undefined {
		for (let i = scopes.length - 1; i >= 0; i--) {
			const variables = scopes[i].variables
			if (variables && name in variables)
				return variables[name].type
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

	function isFunction (fn: unknown): fn is ChiriFunction {
		return (fn as ChiriFunction)?.type === "function"
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
		const mixins = root().mixins ??= {}

		let baseMixin = mixins[mixin.name.value]
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
			}
		}

		if (baseMixin) {
			if (mixin.spread) {
				const baseMixin = mixins[mixin.name.value]
				baseMixin.children ??= []
				baseMixin.children.push(mixin)
				return mixin

			} else if (mixin.name.value in usedMixins)
				throw error(mixin.position, `%${mixin.name.value} cannot be redefined after being used`)
		}

		return mixins[mixin.name.value] = mixin
	}

	function useMixin (preRegisteredMixin: PreRegisteredMixin, after: ResolvedMixin[]): ResolvedMixin {
		// if (preRegisteredMixin.used)
		// 	return usedMixins[preRegisteredMixin.name.value]

		// preRegisteredMixin.used = true

		const baseMixin: ResolvedMixin | undefined = usedMixins[preRegisteredMixin.name.value]
		let mixin: ResolvedMixin | undefined = baseMixin

		if (!baseMixin) {
			// never used yet, so guaranteed to be after all the other mixins!
			mixin = { ...preRegisteredMixin, index: ++usedMixinIndex }

		} else {
			const intersectingMixin = after.sort((a, b) => b.index - a.index).find(mixin => mixin.affects.some(affect => baseMixin.affects.includes(affect)))
			const intersectingMixinIndex = intersectingMixin?.index ?? -1
			let bump = 1
			while (intersectingMixinIndex > mixin.index) {
				bump++
				const bumpMixinNameString = `${preRegisteredMixin.name.value}__${bump}`
				mixin = usedMixins[bumpMixinNameString]
				if (mixin)
					continue

				const bumpMixinName: ChiriWord = { type: "word", value: bumpMixinNameString, position: baseMixin.name.position }
				mixin = {
					...preRegisteredMixin,
					index: ++usedMixinIndex,
					name: bumpMixinName,
				}
				break
			}
		}

		const children = preRegisteredMixin.children
		if (children)
			for (let i = 0; i < children.length; i++)
				usedMixins[children[i].name.value + `:${i}`] = {
					...children[i],
					index: ++usedMixinIndex,
				}

		return usedMixins[mixin.name.value] = mixin
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Shorthands

	function getShorthand (property: string): string[] {
		return (root().shorthands?.[property] ?? [property])
			.flatMap(affect => getAlias(affect))
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

	////////////////////////////////////
	//#region Animations

	function setAnimation (animation: ResolvedAnimation, dedupe = false): ChiriWord {
		const animations = root().animations ??= {}
		let name = animation.name.value
		let i = 1
		while (animations[name]) {
			if (!dedupe)
				throw error(animation.position, `Cannot redefine animation "${name}"`)

			name = `${animation.name.value}_${++i}`
		}

		animation.name.value = name
		animations[name] = animation
		return animation.name
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

	function internalError (message?: string): ErrorPositioned
	function internalError (position?: ChiriPosition, message?: string): ErrorPositioned
	function internalError (position?: ChiriPosition | string, message?: string): ErrorPositioned {
		message = typeof position === "string" ? position : message
		position = typeof position === "string" ? undefined : position
		return error(position, `Internal Error: ${message ?? "Compilation failed for an unknown reason"}`)
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
			: ansi.path + relToCwd(position.file)
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
				const name = resolveWordLowercase(statement.name)

				const properties = compileStatements(statement.content, undefined, compileMixinContent)
				setMixin({
					...statement,
					name,
					states: [undefined],
					pseudos: [undefined],
					elementTypes: [undefined],
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
				let results = compileComponent(statement)
				if (results === undefined)
					return undefined

				if (!Array.isArray(results))
					results = [results]

				for (const component of results) {
					const registeredMixins: ResolvedMixin[] = []
					const visited: ResolvedMixin[] = component.after
						.flatMap(selector => {
							const afterComponent = components[selector.value]
							if (!afterComponent)
								throw error(selector.position, `Component .${selector.value} has not been defined`)

							return afterComponent.mixins
						})
					for (let i = 0; i < component.mixins.length; i++) {
						const mixin = useMixin(getMixin(component.mixins[i].value, component.mixins[i].position), visited)
						component.mixins[i] = mixin.name
						visited.push(mixin)
						registeredMixins.push(mixin)
					}

					for (const selector of component.selector) {
						const registered = components[selector.value] ??= {
							selector,
							mixins: [],
						}
						registered.mixins.push(...registeredMixins)

						dts.write("\"")
						dts.writeWord(selector)
						dts.write("\"")
						dts.writeLine(": string[],")
					}
				}

				return true
			}

			case "mixin-use": {
				const mixin = getMixin(stringifyText(compiler, statement.name), statement.name.position)
				for (const property of mixin.content) {
					css.writingTo(property.isCustomProperty ? "root-properties" : "root-styles", () => {
						css.writeProperty(compiler, property)
					})
				}
				return true
			}

			case "property-definition":
				css.writingTo("property-definitions", () => {
					css.write("@property ")
					const name = resolveWordLowercase(statement.property)
					name.value = `--${name.value}`
					css.writeWord(name)
					css.writeSpaceOptional()
					css.writeBlock(() => {
						css.write("syntax:")
						css.writeSpaceOptional()
						css.write("\"")
						css.writeWord(statement.syntax)
						css.writeLine("\";")

						css.write("inherits:")
						css.writeSpaceOptional()
						css.writeLine("false;")

						const initialValue = compileStatements(statement.value, undefined, compileText).join("").trim()
						if (initialValue) {
							css.write("initial-value:")
							css.writeSpaceOptional()
							css.write(initialValue)
							css.writeLine(";")
						}
					})
				})
				return true

			case "property":
				css.writingTo(statement.isCustomProperty ? "root-properties" : "root-styles", () => {
					css.writeProperty(compiler, {
						...statement,
						property: resolveWordLowercase(statement.property),
						value: compileStatements(statement.value, undefined, compileText).join(""),
					})
				})
				return true

			case "import-css": {
				css.writingTo("imports", () => {
					for (const imp of statement.imports) {
						css.writeLine(`@import ${stringifyText(compiler, imp)};`)
					}
				})
				return true
			}

			case "font-face": {
				css.writeFontFace(compiler, {
					family: makeWord(stringifyExpression(compiler, statement.family), statement.family.position),
					content: compileStatements(statement.content, undefined, compileMixinContent),
				})
				return true
			}

			case "select": {
				css.writeSelect(compiler, {
					type: "select",
					selector: stringifyExpression(compiler, statement.selector),
					content: compileStatements(statement.content, undefined, compileMixinContent),
					position: statement.position,
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
		type: "compiled-component"
		selector: ChiriWord[]
		mixins: ChiriWord[]
		after: ChiriWord[]
	}

	interface ResolvedAfter {
		type: "compiled-after"
		selectors: ChiriWord[]
	}

	interface ResolvedMixinName extends ChiriWord {
		pseudo?: ChiriWord[]
		state?: ChiriWord[]
	}

	function compileComponent (statement: ChiriStatement): Component[] | undefined
	function compileComponent (statement: ChiriStatement, allowMixins: true): (Component | ResolvedMixinName | ResolvedProperty)[] | undefined
	function compileComponent (statement: ChiriStatement, allowMixins = false): (Component | ResolvedMixinName | ResolvedProperty)[] | undefined {
		if (statement.type !== "component")
			return undefined

		const containingSelector = selectorStack.at(-1)

		if (statement.subType === "component" || statement.subType === "custom-state") {
			const selector = createSelector(undefined, {
				class: mergeWords(containingSelector?.class, statement.subType === "component" ? "-" : "--", statement.names),
			})
			const content = compileSelector(selector, statement.content, true)

			const component: Component = {
				type: "compiled-component",
				selector: selector.class,
				mixins: content.filter(item => item.type === "word"),
				after: content.filter(item => item.type === "compiled-after")
					.flatMap(after => after.selectors),
			}

			if ((component.mixins.some(m => m.value === "before") && component.mixins.some(m => m.value === "after")) || component.mixins.some(m => m.value === "before-after")) {
				component.mixins = component.mixins.filter(mixin => mixin.value !== "before-after")
				component.mixins.unshift({ type: "word", value: "before-after", position: INTERNAL_POSITION })
			}

			if (component.mixins.some(m => m.value === "before-after"))
				component.mixins = component.mixins.filter(m => m.value !== "before" && m.value !== "after")

			const results = content.filter(item => item.type === "compiled-component")
			results.unshift(component)
			return results
		}

		if (statement.subType === "view-transition" || statement.subType === "view-transition-class") {
			const viewTransitionName = !containingSelector ? "root" : [
				containingSelector.class.map(word => word.value).join("_"),
				getStatesNameAffix(containingSelector.pseudo),
				getWordsAffix(containingSelector.pseudo),
			].filter(s => s).join("_")

			const selector = createSelector(containingSelector, {
				class: mergeWords(containingSelector?.class, "_", [getWordsAffix(statement.pseudos)]),
			})

			selectorStack.push(selector)
			const content = compileStatements(statement.content, undefined, compileComponentContent)
			selectorStack.pop()

			const properties: ResolvedProperty[] = []
			for (const item of content) {
				switch (item.type) {
					case "compiled-after":
						throw error("#after cannot be used in this context")
					case "compiled-component":
						throw error("Sub-component selectors cannot be used in this context")
					case "property":
						properties.push(item)
						continue
					case "word": {
						const mixin = getMixin(item.value, item.position)
						properties.push(...mixin.content)
						continue
					}
				}
			}

			viewTransitions.push({
				type: statement.subType,
				subTypes: statement.pseudos.map(w => w.value.slice(w.value.lastIndexOf("!") + 1)) as ("old" | "new" | "group" | "image-pair")[],
				name: makeWord(viewTransitionName, statement.position),
				content: properties,
				position: statement.position,
			})
			return [{
				type: "property",
				property: makeWord(statement.subType === "view-transition-class" ? "view-transition-class" : "view-transition-name", statement.position),
				value: viewTransitionName,
				position: statement.position,
			}]
		}

		let selector: ChiriSelector
		switch (statement.subType) {

			case "state":
				selector = createSelector(containingSelector, {
					class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getStatesNameAffix(statement.states)]),
					state: mergeWords(containingSelector?.state, "):where(", statement.states, false),
					spread: statement.spread || undefined,
				})
				break

			case "state-special":
				selector = createSelector(containingSelector, {
					class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getStatesNameAffix([statement.state])]),
					specialState: statement.state,
					spread: statement.spread || undefined,
				})
				break

			case "media": {
				const query = stringifyText(compiler, statement.query)
				selector = createSelector(containingSelector, {
					mediaQueries: [query],
				})
				break
			}

			case "container": {
				const query = stringifyText(compiler, statement.query)
				selector = createSelector(containingSelector, {
					containerQueries: [query],
				})
				break
			}

			case "scheme": {
				selector = createSelector(containingSelector, {
					mediaQueries: [{ scheme: statement.scheme }],
				})
				break
			}

			case "element": {
				const names = statement.names.map(resolveWordLowercase)
				selector = createSelector(containingSelector, {
					class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getWordsAffix(names)]),
					elementTypes: names,
					spread: statement.spread || undefined,
				})
				break
			}

			case "pseudo":
				selector = createSelector(containingSelector, {
					class: statement.spread ? undefined : mergeWords(containingSelector?.class, "_", [getWordsAffix(statement.pseudos)]),
					pseudo: mergeWords(containingSelector?.pseudo, "::", statement.pseudos),
					spread: statement.spread || undefined,
				})
				break
		}

		const result = compileSelector(selector, statement.content)

		if (statement.subType === "pseudo" && allowMixins) {
			const pseudoClassName = statement.pseudos.map(p => p.value).sort((a, b) => b.localeCompare(a)).join("-")
			if (pseudoClassName === "before" || pseudoClassName === "after")
				result.unshift({ type: "word", value: pseudoClassName, position: statement.pseudos[0].position })
		}

		// if (statement.subType === "state-special")
		// 	throw error("stop here!")

		if (!allowMixins) {
			rootSpecials.push({
				type: "mixin",
				content: result.flatMap(name => getMixin(name.value, name.position).content),
				pseudos: selector.pseudo.map(pseudo => pseudo?.value as PseudoName | undefined),
				states: selector.state.map(state => state?.value),
				elementTypes: EMPTY,
				specialState: selector.specialState?.value as ComponentStateSpecial | undefined,
				mediaQueries: selector.mediaQueries,
				position: statement.position,
			})
			return EMPTY
		}

		return result.map((name): ResolvedMixinName => ({
			...name,
			pseudo: selector.pseudo,
			state: selector.state,
		}))
	}

	function getStatesNameAffix (states: ChiriWord[]) {
		return !states.length ? "" : "_" + states
			.map(state => state.value.replace(/[:)]/g, "").replace(/[^\w-]+/g, "-"))
			.join("_")
	}

	function getWordsAffix (words: ChiriWord[]) {
		return !words.length ? "" : "_" + words
			.map(pseudo => pseudo.value)
			.join("-")
	}

	function compileSelector (selector: ChiriSelector, content: ChiriStatement[]): ResolvedMixinName[]
	function compileSelector (selector: ChiriSelector, content: ChiriStatement[], allowComponents: true): (ResolvedMixinName | ResolvedAfter | Component)[]
	function compileSelector (selector: ChiriSelector, content: ChiriStatement[], allowComponents = false) {
		selectorStack.push(selector)
		const compiledContent = compileStatements(content, undefined, compileComponentContent)
		// console.log(compiledContent)

		const results: (ChiriWord | ResolvedAfter | Component)[] = []
		const affects: string[] = []
		let propertyGroup: ResolvedProperty[] | undefined
		let groupIndex = 0
		const className = selector.class.map(cls => cls.value).join("_")

		const getDedupedClassName = () => `${className}${groupIndex <= 1 ? "" : `_${groupIndex}`}`
		for (const item of [...compiledContent, { type: "end" as const }]) {
			switch (item.type) {
				case "compiled-after":
					results.push(item)
					break // irrelevant for this mixin generation

				case "compiled-component":
					if (!allowComponents)
						throw internalError(item.selector[0].position, "Unexpected component in this context")

					results.push(item)
					break

				case "property": {
					// a CSS property assignment rather than a mixin usage — add it to a group that will be made into a dynamic mixin
					propertyGroup ??= []
					propertyGroup.push(item)
					break
				}

				case "end":
				case "word": {
					// mixin use — end the dynamic mixin CSS property group, if it exists
					if (!propertyGroup?.length) {
						if (item.type === "word")
							addWord(item)
						break
					}

					const position = propertyGroup[0].position
					let nameString: string
					do {
						if (!selector.spread)
							groupIndex++
						nameString = getDedupedClassName()
					} while (!selector.spread && getMixin(nameString, position, true))
					const name: ChiriWord = { type: "word", value: nameString, position }

					setMixin({
						type: "mixin",
						name,
						states: selector.state.map(state => state?.value),
						pseudos: selector.pseudo.map(pseudo => pseudo?.value as PseudoName | undefined),
						containerQueries: selector.containerQueries,
						mediaQueries: selector.mediaQueries,
						elementTypes: selector.elementTypes.map(t => t.value),
						specialState: selector.specialState?.value as ComponentStateSpecial | undefined,
						position,
						content: propertyGroup,
						affects: propertyGroup.flatMap(getPropertyAffects),
						spread: selector.spread,
					})
					results.push(name)

					propertyGroup = undefined
					if (!selector.spread)
						groupIndex++

					if (item.type === "word")
						addWord(item)
				}
			}
		}

		if (affects.length) {
			const mixin = getMixin(className, selector.class[0].position, true)
			const mixinAffects = [...new Set([...mixin?.affects ?? [], ...affects])]
			if (mixin) {
				mixin.affects = mixinAffects
			} else {
				const name = makeWord(className, selector.class[0].position)
				setMixin({
					type: "mixin",
					name,
					affects: mixinAffects,
					content: [],
					position: selector.class[0].position,
					states: [],
					pseudos: [],
					containerQueries: [],
					mediaQueries: [],
					elementTypes: [],
					skip: true,
				})
				results.push(name)
			}
		}

		selectorStack.pop()
		return results

		function addWord (item: ResolvedMixinName) {
			results.push(item)

			if (item.pseudo?.length || item.state?.length) {
				const affix = false
					|| (item.pseudo && getWordsAffix(item.pseudo))
					|| (item.state && getStatesNameAffix(item.state))

				const mixin = getMixin(item.value, item.position)
				affects.push(...mixin.affects.map(property => `${affix}:${property}`))
			}
		}
	}

	function compileComponentContent (statement: ChiriStatement): ArrayOr<ResolvedMixinName | ResolvedAfter | ResolvedProperty | Component> | undefined {
		const componentResults = compileComponent(statement, true)
		if (componentResults !== undefined)
			return componentResults

		switch (statement.type) {
			case "after":
				return {
					type: "compiled-after",
					selectors: compileStatements(statement.content, undefined, statement => {
						if (statement.type === "text" && statement.subType === "word-interpolated")
							return resolveWordLowercase(statement)
					}),
				}

			case "property":
				return {
					...statement,
					property: resolveWordLowercase(statement.property),
					value: compileStatements(statement.value, undefined, compileText).join(" "),
				}

			case "mixin-use": {
				let name = resolveWordLowercase(statement.name)
				const baseName = name.value

				const selector = selectorStack.at(-1)
				if (!selector)
					throw error(name.position, "Unable to use mixin here, no selector")

				if (selector.containerQueries.length || selector.mediaQueries.length || selector.elementTypes.length || statement.spread || selector.spread) {
					const mixin = getMixin(name.value, name.position)
					return mixin.content
				}

				if (!selector.state.length && !selector.pseudo.length && !selector.specialState)
					return name

				if (selector.state.length)
					name = {
						type: "word",
						value: `${name.value}_${getStatesNameAffix(selector.state)}`,
						position: name.position,
					}

				if (selector.specialState)
					name = {
						type: "word",
						value: `${name.value}_${getStatesNameAffix([selector.specialState])}`,
						position: name.position,
					}

				if (selector.pseudo.length)
					name = {
						type: "word",
						value: `${name.value}_${getWordsAffix(selector.pseudo)}`,
						position: name.position,
					}

				const existingMixin = getMixin(name.value, name.position, true)
				if (!existingMixin)
					setMixin({
						...getMixin(baseName, statement.name.position),
						name,
						states: selector.state.map(state => state?.value),
						pseudos: selector.pseudo.map(pseudo => pseudo?.value as PseudoName | undefined),
						specialState: selector.specialState?.value as ComponentStateSpecial | undefined,
						used: undefined,
						spread: selector.spread,
					})

				return name
			}

			case "animate": {
				const selector = selectorStack.at(-1)
				if (!selector)
					throw error(statement.position, "#animate cannot be used in this context")

				const baseAnimationName = [
					selector.class.map(word => word.value).join("_"),
					getStatesNameAffix(selector.pseudo),
					getWordsAffix(selector.pseudo),
				].filter(s => s).join("_")

				const keyframes = compileStatements(statement.content, undefined, compileKeyframes)
				const dedupedName = setAnimation({
					type: "animation",
					name: makeWord(baseAnimationName, statement.position),
					content: keyframes,
					position: statement.position,
				}, true)

				return {
					type: "property",
					property: makeWord("animation", statement.position),
					value: `${stringifyText(compiler, statement.shorthand)} ${dedupedName.value}`,
					position: statement.position,
					merge: true,
				} satisfies ResolvedProperty
			}
		}
	}

	function createSelector (selector: ChiriSelector | undefined, assignFrom: Partial<ChiriSelector>): ChiriSelector {
		if (assignFrom.mediaQueries?.length && !selector)
			selector = { type: "selector", class: [], state: [], pseudo: [], specialState: undefined, containerQueries: [], mediaQueries: [], elementTypes: [] }

		if (!selector && !assignFrom.class?.length)
			throw internalError("Unable to construct a selector with no class name")

		return {
			type: "selector",
			class: (assignFrom.class ?? selector?.class)!,
			state: assignFrom.state ?? selector?.state ?? [],
			pseudo: assignFrom.pseudo ?? selector?.pseudo ?? [],
			specialState: assignFrom.specialState ?? selector?.specialState,
			containerQueries: assignFrom.containerQueries ?? selector?.containerQueries ?? [],
			mediaQueries: assignFrom.mediaQueries ?? selector?.mediaQueries ?? [],
			elementTypes: assignFrom.elementTypes ?? selector?.elementTypes ?? [],
			spread: assignFrom.spread ?? selector?.spread,
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
				const mixin = getMixin(stringifyText(compiler, statement.name), statement.name.position)
				return mixin.content
			}
		}
	}

	function compileProperty (property: ChiriProperty): ResolvedProperty {
		return {
			...property,
			property: resolveWordLowercase(property.property),
			value: compileStatements(property.value, undefined, compileText).join(" "),
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Macros

	function compileMacros<T> (statement: ChiriStatement, contextConsumer: (statement: ChiriStatement) => ArrayOr<T> | undefined) {
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
					case "error": {
						const lines = compileStatements(statement.content, undefined, compileText)
						const position = _
							?? (!resolveExpression(compiler, statement.assignments.function) ? undefined : blocks.findLast(block => block.type === "function-call")?.position)
							?? (!resolveExpression(compiler, statement.assignments.macro) ? undefined : blocks.findLast(block => block.type === "macro-use")?.position)
							?? statement.position
						throw error(position, (lines.length <= 1 ? "" : "\n") + lines.join("\n"))
					}
				}

				const fn = getMacro(statement.name.value, statement.position)
				if (!fn)
					return undefined

				const assignments = resolveAssignments(statement.assignments)

				const bodyParameter = fn.content.find((statement): statement is ChiriCompilerVariable => statement.type === "variable" && statement.valueType.name.value === "body")
				if (bodyParameter) {
					assignments.variables ??= {}
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					assignments.variables[bodyParameter.name.value] = {
						type: bodyParameter.valueType,
						value: Object.assign([...statement.content], { isBody: true }) as any[],
					}
				}

				const block = pushBlock(statement)
				const result = compileStatements(fn.content, assignments, contextConsumer)
				popBlock(block)
				return result
			}

			case "each": {
				let list = resolveExpression(compiler, statement.iterable)

				if (typeof list !== "string" && !Array.isArray(list) && (!ChiriRecord.is(list) || !statement.keyVariable))
					throw error(statement.iterable.position, "Variable is not iterable")

				list = !statement.keyVariable ? list as Value[]
					: typeof list !== "string" && !Array.isArray(list) ? Object.entries(list)
						: Object.values(list).map((v, i) => [i, v] as const)

				const block = pushBlock(statement)
				const result: T[] = []
				for (const entry of list as any[]) {
					block.continuing = undefined
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					const key: string | number = statement.keyVariable ? entry[0] : undefined
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					const value: Value = statement.keyVariable ? entry[1] : entry
					result.push(...compileStatements(statement.content,
						Scope.variables({
							...statement.variable && {
								[statement.variable.name.value]: { type: statement.variable.valueType, value },
							},
							...statement.keyVariable && {
								[statement.keyVariable.name.value]: { type: statement.keyVariable.valueType, value: key },
							},
						}),
						contextConsumer))
					if (blockBroken(block))
						break
				}

				popBlock(block)
				return result
			}

			case "for": {
				scopes.push({})
				setVariable(statement.variable.name.value, resolveExpression(compiler, statement.variable.expression), statement.variable.valueType, true)

				const block = pushBlock(statement)
				const result: T[] = []
				while (resolveExpression(compiler, statement.condition)) {
					block.continuing = undefined
					const statements = statement.content.slice()
					if (statement.update)
						statements.push(statement.update)

					result.push(...compileStatements(statements, undefined, contextConsumer))
					if (blockBroken(block))
						break
				}

				popBlock(block)
				scopes.pop()
				return result
			}

			case "while": {
				scopes.push({})

				const block = pushBlock(statement)
				const result: T[] = []
				while (resolveExpression(compiler, statement.condition)) {
					block.continuing = undefined
					const statements = statement.content.slice()
					result.push(...compileStatements(statements, undefined, contextConsumer))
					if (blockBroken(block))
						break
				}

				popBlock(block)
				scopes.pop()
				return result
			}

			case "elseif":
				if (blockIfState())
					return EMPTY

			// eslint-disable-next-line no-fallthrough
			case "if": {
				setBlockIfState(!!resolveExpression(compiler, statement.condition))
				if (!blockIfState())
					return EMPTY

				const block = pushBlock(statement)
				const result: T[] = []
				do {
					block.continuing = undefined
					result.push(...compileStatements(statement.content, undefined, contextConsumer))
				} while (block.continuing)
				popBlock(block)
				return result
			}

			case "else": {
				if (blockIfState())
					return EMPTY

				const block = pushBlock(statement)
				const result: T[] = []
				do {
					block.continuing = undefined
					result.push(...compileStatements(statement.content, undefined, contextConsumer))
				} while (block.continuing)
				popBlock(block)
				return result
			}

			case "do": {
				const block = pushBlock(statement)
				const result: T[] = []
				do {
					block.continuing = undefined
					result.push(...compileStatements(statement.content, undefined, contextConsumer))
				} while (block.continuing)
				popBlock(block)
				return result
			}

			case "break": {
				breakBlock(statement.position, statement.label?.value)
				return EMPTY
			}

			case "continue": {
				continueBlock(statement.position, statement.label?.value)
				return EMPTY
			}

			case "include": {
				const statements = getVariable(statement.name.value, statement.name.position) as any as ChiriStatement[] ?? []
				const type = getVariableType(statement.name.value, statement.name.position)
				const bodyType = type.generics[0].name.value as BodyVariableContext
				return compileStatements(statements, undefined, getContextConsumer(bodyType)) as T[]
			}

			case "animation": {
				const name = resolveWordLowercase(statement.name)
				const keyframes = compileStatements(statement.content, undefined, compileKeyframes)
				setAnimation({
					...statement,
					name,
					content: keyframes,
				})
				return EMPTY
			}
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

	function compileFunction (statement: ChiriStatement) {
		switch (statement.type) {
			case "return": {
				breakFunction(statement.position)
				return { type: "result" as const, value: resolveExpression(compiler, statement.expression) }
			}
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Animation

	function compileKeyframes (statement: ChiriStatement): ResolvedAnimationKeyframe | undefined {
		switch (statement.type) {
			case "keyframe":
				return {
					...statement,
					at: +resolveExpression(compiler, statement.at)! || 0,
					content: compileStatements(statement.content, undefined, compileMixinContent),
				}
		}
	}

	//#endregion
	////////////////////////////////////


	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Internals

	function compileStatements<T> (statements: ChiriStatement[], using: Partial<Scope> | undefined, contextCompiler: (statement: ChiriStatement) => ArrayOr<T> | undefined): T[] {
		scopes.push(using ?? {})

		if (scopes.length === 1) {
			setMixin({
				type: "mixin",
				pseudos: ["before"],
				states: [undefined],
				elementTypes: [undefined],
				content: [blankContent],
				affects: ["content"],
				name: { type: "word", value: "before", position: INTERNAL_POSITION },
				position: INTERNAL_POSITION,
			})
			setMixin({
				type: "mixin",
				pseudos: ["after"],
				states: [undefined],
				elementTypes: [undefined],
				content: [blankContent],
				affects: ["content"],
				name: { type: "word", value: "after", position: INTERNAL_POSITION },
				position: INTERNAL_POSITION,
			})
			setMixin({
				type: "mixin",
				pseudos: ["before", "after"],
				states: [undefined],
				elementTypes: [undefined],
				content: [blankContent],
				affects: ["content"],
				name: { type: "word", value: "before-after", position: INTERNAL_POSITION },
				position: INTERNAL_POSITION,
			})
		}
		// console.log(inspect(scopes, undefined, 3, true))
		// logLine(undefined, error(statements[0].position, ""))

		const block = blocks.at(-1)
		const blockIndex = blocks.length - 1

		const results: T[] = []
		for (const statement of statements) {
			if (blocks.length - 1 > blockIndex)
				throw failedToExitBlocksError(blockIndex)

			if (block && blockBroken(block) || blockContinuing())
				break

			const macroResult = compileMacros(statement, contextCompiler)
			if (macroResult) {
				if (macroResult === true)
					continue

				if (Array.isArray(macroResult))
					results.push(...macroResult)
				else
					results.push(macroResult)

				continue
			}

			if (blocks.length - 1 > blockIndex)
				throw failedToExitBlocksError(blockIndex)

			if (block && blockBroken(block) || blockContinuing())
				break

			const result = contextCompiler(statement)
			if (result !== undefined) {
				if (Array.isArray(result))
					results.push(...result)
				else
					results.push(result)
			}

			if (result === undefined)
				throw internalError((statement as { position?: ChiriPosition }).position, `Failed to compile ${debugStatementString(statement)} in context "${contextCompiler.name || "unknown"}"`)
		}

		if (scopes.length > 1) // don't remove the root scope once it's set up
			scopes.pop()

		return results
	}

	function failedToExitBlocksError (blockId: number) {
		return error(`Failed to exit block(s): ${blocks
			.slice(blockId)
			.map(b => `${b.type}${(b as ChiriMacroBlock).label ? `:${(b as ChiriMacroBlock).label?.value}` : ""}`)
			.join(", ")}`)
	}

	function callFunction (call: ChiriFunctionCall) {
		const fnVar = getVariable(call.name.value, call.position, true)
		const fn = isFunction(fnVar) ? fnVar : getFunction(call.name.value, call.position)
		const assignments = resolveAssignments(call.assignments, call.indexedAssignments ? getFunctionParameters(fn).map(p => p.name.value) : undefined)
		const block = pushBlock(call)
		const result = compileStatements(fn.content, assignments, compileFunction)
		popBlock(block)
		if (result.length > 1)
			throw internalError(call.position, "Function call returned multiple values")

		if (result.length === 0)
			throw internalError(call.position, "Function call did not return a value")

		return result[0]?.value
	}

	function getPropertyAffects (property: ResolvedProperty): string[] {
		return property.isCustomProperty ? [`--${property.property.value}`] : getShorthand(property.property.value)
	}

	function debugStatementString (statement: ChiriStatement) {
		const name = "name" in statement ? ` "${stringifyText(compiler, statement.name)}"` : ""
		return statement.type + name
	}

	function resolveAssignments (assignments: Record<string, ChiriExpressionResult>, indicesIntoParams?: string[]): Partial<Scope> {
		return Scope.variables(Object.fromEntries(Object.entries(assignments)
			.map(([name, expr]) =>
				[indicesIntoParams?.[+name] ?? name, { type: expr.valueType, value: resolveExpression(compiler, expr) }])))
	}

	function resolveWordLowercase (word: ChiriWordInterpolated | ChiriWord | string): ChiriWord {
		return typeof word === "object" && word.type === "word" ? word : {
			type: "word",
			value: typeof word === "string" ? word : stringifyText(compiler, word).replace(/[^\w-]+/g, "-").toLowerCase(),
			position: typeof word === "string" ? INTERNAL_POSITION : word.position,
		}
	}

	function resolveWordPreserve (word: ChiriWordInterpolated | ChiriWord | string, restrictCharacters = true): ChiriWord {
		if (typeof word === "object" && word.type === "word")
			return word

		let value = typeof word === "string" ? word : stringifyText(compiler, word)
		if (restrictCharacters)
			value = value.replace(/[^\w-]+/g, "-")

		return {
			type: "word",
			value,
			position: typeof word === "string" ? INTERNAL_POSITION : word.position,
		}
	}

	function mergeWords (words: ChiriWord[] | undefined, separator: string, newSegment: (ChiriWordInterpolated | ChiriWord | string)[], restrictCharacters = true): ChiriWord[] {
		return !words?.length ? newSegment.map(segment => resolveWordPreserve(segment, restrictCharacters)) : words.flatMap(selector => newSegment.map((newSegment): ChiriWord => resolveWordPreserve({
			type: "text",
			subType: "word-interpolated",
			valueType: ChiriType.of("string"),
			content: [
				selector.value,
				...!separator ? [] : [separator],
				...typeof newSegment === "string" ? [newSegment] : newSegment.type === "word" ? [newSegment.value] : newSegment.content,
			],
			position: typeof newSegment === "string" ? INTERNAL_POSITION : newSegment.position,
		}, restrictCharacters)))
	}

	function mergeText (position: ChiriPosition, ...texts: ChiriBaseText[]): ChiriValueText {
		return {
			type: "text",
			subType: "text",
			valueType: ChiriType.of("string"),
			content: texts.flatMap(text => text.content),
			position,
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
