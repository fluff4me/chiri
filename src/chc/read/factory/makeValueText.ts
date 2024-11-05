import { INTERNAL_POSITION } from "../../../constants"
import typeString from "../../type/typeString"
import type { ChiriValueText } from "../consume/consumeValueText"

export default (content: ChiriValueText["content"], position = INTERNAL_POSITION): ChiriValueText => ({
	type: "text",
	subType: "text",
	valueType: typeString.type,
	content,
	position,
})
