import consumePathOptional from "../consumePathOptional"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("paths", reader => {
	const path = consumePathOptional(reader)
	if (!path)
		throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
			: "Expected file path")

	return path
})
