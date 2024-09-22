namespace Errors {
	export function stack (skip = 0, truncate = true) {
		const stackLength = process.env.CHIRI_ENV === "dev" && +process.env.CHIRI_STACK_LENGTH! || 0
		if (!stackLength)
			return ""

		skip++
		const error = new Error()
		let stack = error.stack
		if (!stack)
			return ""

		for (let i = 0; i < skip; i++)
			stack = stack.slice(stack.indexOf("\n") + 1)

		if (!truncate || stackLength > stack.length)
			return stack

		let truncateIndex = 0
		for (let i = 0; i < stackLength; i++)
			truncateIndex = Math.max(truncateIndex, stack.indexOf("\n", truncateIndex) + 1)

		return stack.slice(0, truncateIndex)
	}
}

export default Errors
