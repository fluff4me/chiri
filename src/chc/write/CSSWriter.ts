import path from "path"
import args from "../../args"
import type { ChiriAST, ChiriPosition } from "../read/ChiriReader"
import type { ChiriKeyframe } from "../read/consume/consumeKeyframe"
import type { ChiriMixin } from "../read/consume/consumeMixinOptional"
import type { ChiriProperty } from "../read/consume/consumePropertyOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriAnimation } from "../read/consume/macro/macroAnimation"
import type { PseudoName } from "../read/consume/rule/Rule"
import makeWord from "../read/factory/makeWord"
import type { ComponentStateSpecial } from "../util/componentStates"
import { STATE_MAP_SPECIAL } from "../util/componentStates"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer, { QueuedWrite } from "./Writer"

export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
	property: ChiriWord
	value: string
	merge?: true
}

export interface ResolvedMixin extends Omit<ChiriMixin, "content" | "name"> {
	states: (string | undefined)[]
	specialState?: ComponentStateSpecial
	pseudos: (PseudoName | undefined)[]
	containerQueries?: string[]
	mediaQueries?: (ResolvedMediaQuery | string)[]
	elementTypes: (string | undefined)[]
	name: ChiriWord
	content: ResolvedProperty[]
	affects: string[]
	index: number
	skip?: true
}

export interface ResolvedMediaQuery {
	scheme?: "dark" | "light"
}

export interface ResolvedRootSpecial extends Omit<ResolvedMixin, "name" | "index" | "containerQueries" | "affects"> {
	name?: undefined
	index?: undefined
	containerQueries?: undefined
	affects?: undefined
}

export interface ResolvedAnimation extends Omit<ChiriAnimation, "content" | "name"> {
	name: ChiriWord
	content: ResolvedAnimationKeyframe[]
}

export interface ResolvedAnimationKeyframe extends Omit<ChiriKeyframe, "at" | "content"> {
	at: number
	content: ResolvedProperty[]
}

export interface ResolvedViewTransition {
	type: "view-transition" | "view-transition-class"
	subTypes: ("old" | "new" | "group" | "image-pair")[]
	name: ChiriWord
	content: ResolvedProperty[]
	position: ChiriPosition
}

export interface ResolvedFontFace {
	family: ChiriWord
	content: ResolvedProperty[]
}

export interface ResolvedSelect {
	type: "select"
	selector: string
	content: ResolvedProperty[]
	position: ChiriPosition
}

export type CSSDocumentSection =
	| "imports"
	| "property-definitions"
	| "font-faces"
	| "root-properties"
	| "root-styles"
	| "default"
	| "selects"
	| "view-transitions"
	| "animations"

export default class CSSWriter extends Writer {

	private currentSection: CSSDocumentSection = "default"
	private queues: Record<CSSDocumentSection, QueuedWrite[]> = {
		"imports": QueuedWrite.makeQueue(),
		"property-definitions": QueuedWrite.makeQueue(),
		"font-faces": QueuedWrite.makeQueue(),
		"root-properties": QueuedWrite.makeQueue(),
		"root-styles": QueuedWrite.makeQueue(),
		"default": this.outputQueue,
		"selects": QueuedWrite.makeQueue(),
		"view-transitions": QueuedWrite.makeQueue(),
		"animations": QueuedWrite.makeQueue(),
	}

	protected override get queue () {
		return this.queues[this.currentSection]
	}

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".css", ...config })
	}

	override createDestPath (outFile: string): string {
		return typeof args["out-css"] === "string" ? path.resolve(args["out-css"], outFile) : super.createDestPath(outFile)
	}

	writingTo (section: CSSDocumentSection, dowhile: () => any) {
		if (this.currentSection === section)
			return

		const oldSection = this.currentSection
		this.currentSection = section
		dowhile()
		this.currentSection = oldSection
	}

	writeProperty (compiler: ChiriCompiler, property: ResolvedProperty) {
		if (property.isCustomProperty) this.write("--")
		const aliases = property.isCustomProperty ? [property.property.value] : compiler.getAlias(property.property.value)
		for (const alias of aliases) {
			this.writeWord({ type: "word", value: alias, position: property.property.position })
			this.write(":")
			this.writeSpaceOptional()
			this.write(property.value)
			this.writeLine(";")
		}
	}

	writeMixin (compiler: ChiriCompiler, mixin: ResolvedMixin | ResolvedRootSpecial) {
		if (mixin.skip || !mixin.content.length)
			return

		////////////////////////////////////
		//#region Rule Start

		for (const query of mixin.containerQueries ?? []) {
			this.write(`@container ${query}`)
			this.writeSpaceOptional()
			this.writeLineStartBlock("{")
		}

		for (const query of mixin.mediaQueries ?? []) {
			if (typeof query === "string") {
				this.write(`@media ${query}`)
				this.writeSpaceOptional()
				this.writeLineStartBlock("{")
			}
			else if (query.scheme) {
				this.write(`@media (prefers-color-scheme: ${query.scheme})`)
				this.writeSpaceOptional()
				this.writeLineStartBlock("{")
			}
		}

		if (mixin.specialState) {
			this.write(STATE_MAP_SPECIAL[mixin.specialState])
			this.writeSpaceOptional()
			this.writeLineStartBlock("{")
		}

		let i = 0
		if (!mixin.states.length)
			mixin.states.push(undefined)
		if (!mixin.pseudos.length)
			mixin.pseudos.push(undefined)
		if (!mixin.elementTypes.length)
			mixin.elementTypes.push(undefined)

		for (const elementType of mixin.elementTypes) {
			for (const state of mixin.states) {
				for (const pseudo of mixin.pseudos) {
					if (i) {
						this.write(",")
						this.writeSpaceOptional()
					}

					if (mixin.name) {
						this.write(".")
						this.writeWord(mixin.name)
					}

					if (elementType)
						this.write(` ${elementType}`)
					if (state)
						this.write(`:where(${state})`)
					if (pseudo)
						this.write(`::${pseudo}`)


					if (mixin.name || elementType || state || pseudo)
						i++
				}
			}
		}

		if (!i)
			this.write(":root")

		//#endregion
		////////////////////////////////////

		this.writeSpaceOptional()
		this.writeLineStartBlock("{")
		for (const property of mergeProperties(mixin.content))
			this.writeProperty(compiler, property)
		this.writeLineEndBlock("}")

		////////////////////////////////////
		//#region Rule End

		if (mixin.specialState)
			this.writeLineEndBlock("}")

		for (const query of mixin.containerQueries ?? [])
			this.writeLineEndBlock("}")

		for (const query of mixin.mediaQueries ?? [])
			this.writeLineEndBlock("}")

		//#endregion
		////////////////////////////////////
	}

	writeSelect (compiler: ChiriCompiler, select: ResolvedSelect) {
		this.writingTo("selects", () => {
			this.writeWord(makeWord(select.selector, select.position))
			this.writeSpaceOptional()
			this.writeLineStartBlock("{")
			for (const property of mergeProperties(select.content))
				this.writeProperty(compiler, property)
			this.writeLineEndBlock("}")
		})
	}

	writeAnimation (compiler: ChiriCompiler, animation: ResolvedAnimation) {
		this.writingTo("animations", () => {
			this.write("@keyframes ")
			this.writeWord(animation.name)
			this.writeSpaceOptional()
			this.writeBlock(() => {
				for (const keyframe of animation.content) {
					this.write(`${keyframe.at}%`)
					this.writeSpaceOptional()
					this.writeBlock(() => {
						for (const property of keyframe.content)
							this.writeProperty(compiler, property)
					})
				}
			})
		})
	}

	writeViewTransition (compiler: ChiriCompiler, viewTransition: ResolvedViewTransition) {
		this.writingTo("view-transitions", () => {
			const selector = viewTransition.type === "view-transition" ? viewTransition.name.value
				: `*.${viewTransition.name.value}`
			this.writeWord(makeWord(`::view-transition-${viewTransition.subTypes[0]}(${selector})`, viewTransition.position))
			if (viewTransition.subTypes[1]) {
				this.write(",")
				this.writeSpaceOptional()
				this.writeWord(makeWord(`::view-transition-${viewTransition.subTypes[1]}(${selector})`, viewTransition.position))
			}

			this.writeSpaceOptional()
			this.writeBlock(() => {
				for (const property of viewTransition.content)
					this.writeProperty(compiler, property)
			})
		})
	}

	writeFontFace (compiler: ChiriCompiler, fontFace: ResolvedFontFace) {
		this.writingTo("font-faces", () => {
			this.write("@font-face")
			this.writeSpaceOptional()
			this.writeBlock(() => {
				this.writeProperty(compiler, {
					type: "property",
					property: makeWord("font-family", fontFace.family.position),
					value: `"${fontFace.family.value}"`,
					position: fontFace.family.position,
				})

				for (const property of fontFace.content)
					this.writeProperty(compiler, property)
			})
		})
	}

	override onCompileEnd (compiler: ChiriCompiler): void {

		const headerQueue = QueuedWrite.makeQueue()

		headerQueue.push(...this.queues.imports)
		headerQueue.push({ output: "\n" })

		headerQueue.push(...this.queues["property-definitions"])
		headerQueue.push({ output: "\n" })

		headerQueue.push(...this.queues["font-faces"])
		headerQueue.push({ output: "\n" })

		headerQueue.push({ output: ":root {\n\t" })
		headerQueue.push(...this.queues["root-properties"]
			.map(wr => ({ ...wr, output: wr.output.replaceAll("\n", "\n\t") })))

		headerQueue.at(-1)!.output = headerQueue.at(-1)!.output.slice(0, -1)
		headerQueue.push({ output: "\n\t" })

		headerQueue.push(...this.queues["root-styles"]
			.map(wr => ({ ...wr, output: wr.output.replaceAll("\n", "\n\t") })))
		headerQueue.at(-1)!.output = headerQueue.at(-1)!.output.slice(0, -1)

		headerQueue.push({ output: "}\n\n" })

		this.outputQueue.unshift(...headerQueue)

		if (this.currentSection !== "default")
			this.currentSection = "default"

		this.outputQueue.push({ output: "\n" })
		this.outputQueue.push(...this.queues["selects"])

		this.outputQueue.push({ output: "\n" })
		this.outputQueue.push(...this.queues["view-transitions"])

		this.outputQueue.push({ output: "\n" })
		this.outputQueue.push(...this.queues.animations)

		this.write(`\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`)
	}
}

const alreadyEmitted: string[] = []
function mergeProperties (properties: ResolvedProperty[]): ResolvedProperty[] {
	let mergeProperties: Record<string, ResolvedProperty> | undefined
	let newProperties: ResolvedProperty[] | undefined
	for (let i = 0; i < properties.length; i++) {
		const property = properties[i]
		if (!property.merge) {
			delete mergeProperties?.[property.property.value]
			newProperties?.push(property)
			continue
		}

		newProperties ??= properties.slice(0, i)
		mergeProperties ??= {}

		const mergeProperty = mergeProperties[property.property.value]
		if (!mergeProperty) {
			mergeProperties[property.property.value] = property
			newProperties.push(property)
			continue
		}

		mergeProperty.value = `${mergeProperty.value}, ${property.value}`
	}

	properties = newProperties ?? properties

	newProperties = undefined
	alreadyEmitted.length = 0
	for (let i = properties.length - 1; i >= 0; i--) {
		const property = properties[i]
		const propertyId = `${property.isCustomProperty ? "$" : ""}${property.property.value}`
		if (alreadyEmitted.includes(propertyId)) {
			newProperties ??= properties.slice(i + 1)
			continue
		}

		newProperties?.unshift(property)
		alreadyEmitted.push(propertyId)
	}

	return newProperties ?? properties
}
