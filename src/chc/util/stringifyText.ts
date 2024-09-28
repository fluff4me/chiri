import type { ChiriValueText } from "../read/consume/consumeValueText"
import type { ChiriWord } from "../read/consume/consumeWord"
import type ChiriCompiler from "../write/ChiriCompiler"
import stringifyExpression from "./stringifyExpression"

const stringifyText = (compiler: ChiriCompiler, text: ChiriValueText | ChiriWord): string => {
	if (text.type === "word")
		return text.value

	let result = ""
	for (const value of text.content) {
		if (typeof value === "string") {
			result += value
			continue
		}

		switch (value.type) {
			case "text":
				result += stringifyText(compiler, value)
				continue
			case "text-raw":
				result += value.text
				continue
			case "interpolation-property":
				result += `var(--${stringifyText(compiler, value.name)})`
				continue
			case "interpolation-variable":
				result += stringifyExpression(compiler, compiler.getVariable(value.name.value, value.name.position))
				continue
			default:
				result += stringifyExpression(compiler, value)
		}
	}

	return result
}

export default stringifyText
