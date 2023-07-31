// @ts-check

const consumeTypeConstructorOptional = require("./consumeTypeConstructorOptional");

/** 
 * @param {import("../ThetaReader")} reader 
 * @param {ThetaType} type
 */
module.exports = (reader, type) => {
	let e = reader.i;
	const result = consumeTypeConstructorOptional(reader, type);
	if (result === undefined)
		throw reader.error(e, `Expected '${type.name.value}' constructor`);

	return result;
};
