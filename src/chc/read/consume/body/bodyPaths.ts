import consumePathOptional from "../consumePathOptional"
import BodyFunction from "./BodyFunction"

export default BodyFunction(reader => {
	const path = consumePathOptional(reader)
	if (!path)
		throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
			: "Expected file path")

	return path
})
