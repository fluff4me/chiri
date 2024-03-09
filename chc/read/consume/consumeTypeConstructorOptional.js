// @ts-check

/** 
 * @param {import("../ChiriReader")} reader 
 * @param {ChiriType} type
 * @returns {ChiriLiteralValue | undefined}
 */
module.exports = (reader, type) => {
	const result = reader.getType(type.name.value)
		.consumeOptionalConstructor?.(reader);
	if (!result)
		return undefined;

	if (result.type === "literal")
		return result;

	return {
		type: "literal",
		subType: "other",
		valueType: type.name.value,
		value: result,
	};
};
