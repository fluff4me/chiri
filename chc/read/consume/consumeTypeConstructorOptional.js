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

	if ("type" in result && result.type === "literal")
		return /** @type {ChiriLiteralValue} */(result);

	throw reader.error(`Invalid result from ${type.name.value} constructor`);
	// return {
	// 	type: "literal",
	// 	subType: "other",
	// 	valueType: type.name.value,
	// 	value: result,
	// };
};
