const ChiriReader = require("../ChiriReader");
const consumeBody = require("./consumeBody");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/**
 * @param {ChiriReader} reader 
 * @returns {ChiriRuleMain=}
 */
module.exports = reader => {
	const prefix = reader.consumeOptional(".", "&-");
	if (!prefix)
		return undefined;

	const className = consumeWordInterpolated(reader);
	if (prefix === "&-")
		className.content.unshift(...reader.componentName.content);

	reader.consume(":");

	const body = consumeBody(reader, sub => sub.componentName.content.push(...className.content));

	return {
		type: "rule",
		subType: "main",
		className,
		...body
	}
};
