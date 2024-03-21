// @ts-check

/** 
 * @param {import("../ChiriReader")} reader 
 * @returns {ChiriLiteralNumeric | undefined}
 */
module.exports = reader => {
	const i = reader.i;
	let intStr = "";
	for (; reader.i < reader.input.length; reader.i++)
		if (reader.isDigit())
			intStr += reader.input[reader.i];
		else
			break;

	if (!intStr.length)
		return undefined;

	return {
		type: "literal",
		subType: "uint",
		value: intStr,
		position: reader.getPosition(i),
	};
};
