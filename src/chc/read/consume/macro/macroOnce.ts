import MacroFunction from "./MacroFunction"

export default MacroFunction("once")
	.consume(({ reader }) => {
		reader.setOnce()
		return true
	})
