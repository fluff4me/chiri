const ChiriReader = require("../ChiriReader");
const consumeBlockStartOptional = require("./consumeBlockStartOptional");
const consumeCompilerVariable = require("./consumeCompilerVariableOptional");
const consumeNewBlockLineOptional = require("./consumeNewBlockLineOptional");
const consumeValue = require("./consumeValue");
const consumeWordOptional = require("./consumeWordOptional");
const macroDebug = require("./macro/macroDebug");
const macroImport = require("./macro/macroImport");
const macroOnce = require("./macro/macroOnce");

// /**
//  * @param {ChiriReader} reader
//  * @param {ChiriFunctionBodyType} type
//  */
// module.exports = (reader, type) => {
// 	if (!reader.consumeOptional(":"))
// 		return undefined;

// 	let toDebug = [];
// 	const multiline = consumeBlockStartOptional(reader);
// 	if (!multiline)
// 		toDebug.push(consumeValue(reader, false));
// 	else
// 		while (consumeNewBlockLineOptional(reader))
// 			toDebug.push(consumeValue(reader, false));

// 	return result;
// };
