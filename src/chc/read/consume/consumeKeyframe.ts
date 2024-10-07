import typeDec from "../../type/typeDec"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../ChiriReader"
import literalDec from "../factory/literalDec"
import consumeBody from "./consumeBody"
import consumeWordOptional from "./consumeWordOptional"
import type { ChiriExpressionOperand } from "./expression/consumeExpression"
import consumeExpression from "./expression/consumeExpression"
import consumeDecimalOptional from "./numeric/consumeDecimalOptional"

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
		case "from": return literalDec(0)
		case "to": return literalDec(100)
	}

	const dec = consumeDecimalOptional(reader)
	if (dec) {
		reader.consume("%")
		return dec
	}

	reader.consume("#{")
	const expr = consumeExpression.inline(reader, typeDec.type)
	reader.consume("}")
	return expr
}
