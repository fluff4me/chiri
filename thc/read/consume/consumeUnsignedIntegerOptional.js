// @ts-check

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {ThetaLiteralNumeric | undefined}
 */
module.exports = reader => {
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
	};
};
