const ChiriReader = require("../ChiriReader");
const consumeBody = require("./consumeBody");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/**
 * @param {ChiriReader} reader 
 * @returns {Promise<ChiriRuleMain | undefined>}
 */
module.exports = async reader => {
	const prefix = reader.consumeOptional(".", "&-");
	if (!prefix)
		return undefined;

	const className = consumeWordInterpolated(reader);
	if (prefix === "&-")
		className.content.unshift(...reader.componentName.content);

	reader.consume(":");

	return {
		type: "rule",
		subType: "main",
		className,
		...await consumeBody(reader, sub => sub.componentName.content.push(...className.content)),
	}
};
