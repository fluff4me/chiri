import path from "path"
import args from "../../args"
import type { ChiriAST } from "../read/ChiriReader"
import type { ChiriProperty } from "../read/consume/consumePropertyOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer, { QueuedWrite } from "./Writer"

export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
	property: ChiriWord
	value: string
}

export type CSSDocumentSection =
	| "imports"
	| "root-properties"
	| "root-styles"
	| "default"

export default class CSSWriter extends Writer {

	private currentSection: CSSDocumentSection = "default"
	private queues: Record<CSSDocumentSection, QueuedWrite[]> = {
		"imports": QueuedWrite.makeQueue(),
		"root-properties": QueuedWrite.makeQueue(),
		"root-styles": QueuedWrite.makeQueue(),
		"default": this.outputQueue,
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

	emitProperty (compiler: ChiriCompiler, property: ResolvedProperty) {
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

	override onCompileEnd (compiler: ChiriCompiler): void {

		const headerQueue = QueuedWrite.makeQueue()

		headerQueue.push(...this.queues.imports)
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

		this.write(`\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`)
	}
}
