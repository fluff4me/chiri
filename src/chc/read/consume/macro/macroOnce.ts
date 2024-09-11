import MacroFunction from "./MacroFunctionInternal"

export default MacroFunction("once")
	.consume(({ reader }) => {
		reader.setOnce()
		return true
	})
