import typeDec from "../../type/typeDec"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../ChiriReader"
import makeLiteralDec from "../factory/makeLiteralDec"
import consumeBody from "./consumeBody"
import consumeWordOptional from "./consumeWordOptional"
import type { ChiriExpressionOperand } from "./expression/consumeExpression"
import consumeExpression from "./expression/consumeExpression"
import consumeDecimalOptional from "./numeric/consumeDecimalOptional"
import consumeUnsignedIntegerOptional from "./numeric/consumeUnsignedIntegerOptional"

export interface ChiriKeyframe {
	type: "keyframe"
	at: ChiriExpressionOperand
	content: ChiriStatement[]
	position: ChiriPosition
}

export default async (reader: ChiriReader): Promise<ChiriKeyframe> => {
	const position = reader.getPosition()
	const at = consumeKeyframeAt(reader)

	reader.consume(":")

	return {
		type: "keyframe",
		at,
		...await consumeBody(reader, "keyframe"),
		position,
	}
}

function consumeKeyframeAt (reader: ChiriReader): ChiriExpressionOperand {
	const keyword = consumeWordOptional(reader, "from", "to")
	switch (keyword?.value) {
		case "from": return makeLiteralDec(0)
		case "to": return makeLiteralDec(100)
	}

	const dec = consumeDecimalOptional(reader) ?? consumeUnsignedIntegerOptional(reader)
	if (dec) {
		reader.consume("%")
		return dec
	}

	reader.consume("#{")
	const expr = consumeExpression.inline(reader, typeDec.type)
	reader.consume("}")
	return expr
}
