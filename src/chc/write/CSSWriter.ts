import path from "path"
import args from "../../args"
import type { ChiriAST, ChiriPosition } from "../read/ChiriReader"
import type { ChiriKeyframe } from "../read/consume/consumeKeyframe"
import type { ChiriMixin } from "../read/consume/consumeMixinOptional"
import type { ChiriProperty } from "../read/consume/consumePropertyOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriAnimation } from "../read/consume/macro/macroAnimation"
import makeWord from "../read/factory/makeWord"
import type { ComponentState } from "../util/componentStates"
import { STATE_MAP } from "../util/componentStates"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer, { QueuedWrite } from "./Writer"

export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
	property: ChiriWord
	value: string
	merge?: true
}

export interface ResolvedMixin extends Omit<ChiriMixin, "content" | "name"> {
	states: (ComponentState | undefined)[]
	pseudos: ("before" | "after" | undefined)[]
	name: ChiriWord
	content: ResolvedProperty[]
	affects: string[]
	index: number
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
	type: "view-transition"
	subTypes: ("old" | "new")[]
	name: ChiriWord
	content: ResolvedProperty[]
	position: ChiriPosition
}

export interface ResolvedFontFace {
	family: ChiriWord
	content: ResolvedProperty[]
}

export type CSSDocumentSection =
	| "imports"
	| "property-definitions"
	| "font-faces"
	| "root-properties"
	| "root-styles"
	| "default"
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

	writeMixin (compiler: ChiriCompiler, mixin: ResolvedMixin) {
		let i = 0
		if (!mixin.states.length)
			mixin.states.push(undefined)
		if (!mixin.pseudos.length)
			mixin.pseudos.push(undefined)

		for (const state of mixin.states) {
			for (const pseudo of mixin.pseudos) {
				if (i) {
					this.write(",")
					this.writeSpaceOptional()
				}

				this.write(".")
				this.writeWord(mixin.name)
				if (state)
					this.write(STATE_MAP[state])
				if (pseudo)
					this.write(`::${pseudo}`)

				i++
			}
		}

		this.writeSpaceOptional()
		this.writeLineStartBlock("{")
		for (const property of mergeProperties(mixin.content))
			this.writeProperty(compiler, property)
		this.writeLineEndBlock("}")
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
			this.writeWord(makeWord(`::view-transition-${viewTransition.subTypes[0]}(${viewTransition.name.value})`, viewTransition.position))
			if (viewTransition.subTypes[1]) {
				this.write(",")
				this.writeSpaceOptional()
				this.writeWord(makeWord(`::view-transition-${viewTransition.subTypes[1]}(${viewTransition.name.value})`, viewTransition.position))
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
		if (alreadyEmitted.includes(property.property.value)) {
			newProperties ??= properties.slice(i + 1)
			continue
		}

		newProperties?.unshift(property)
		alreadyEmitted.push(property.property.value)
	}

	return newProperties ?? properties
}
