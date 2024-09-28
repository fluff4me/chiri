import type { ChiriAST } from "../read/ChiriReader"
import type { ChiriProperty } from "../read/consume/consumePropertyOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig, QueuedWrite } from "./Writer"
import Writer from "./Writer"

export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
	property: ChiriWord
	value: string
}

export default class CSSWriter extends Writer {

	private writingToType: "default" | "root" = "default"
	private rootQueue: QueuedWrite[] = [{
		output: "",
	}]

	protected override get queue () {
		return this.writingToType === "root" ? this.rootQueue : super.queue
	}

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".css", ...config })
	}

	writingTo (writingTo: "default" | "root", dowhile: () => any) {
		if (this.writingToType === writingTo)
			return

		const oldWritingTo = this.writingToType
		this.writingToType = writingTo
		dowhile()
		this.writingToType = oldWritingTo
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
		for (const rootWrite of this.rootQueue)
			rootWrite.output = rootWrite.output.replaceAll("\n", "\n\t")

		this.rootQueue.unshift({ output: ":root {\n\t" })
		const lastRootProperty = this.rootQueue.at(-1)!
		lastRootProperty.output = lastRootProperty.output.slice(0, -1)
		this.rootQueue.push({ output: "}\n\n" })

		this.outputQueue.unshift(...this.rootQueue)

		if (this.writingToType === "root")
			this.writingToType = "default"

		this.write(`\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`)
	}
}
