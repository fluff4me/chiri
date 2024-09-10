import ChiriReader from "../ChiriReader";
import consumeIndent from "./consumeIndent";
import consumeNewLineOptional from "./consumeNewLineOptional";

export default (reader: ChiriReader) => {
	const e1 = reader.i;
	if (!consumeNewLineOptional(reader))
		return false;

	while (consumeNewLineOptional(reader));

	reader.indent++;

	const e2 = reader.i;
	const consumedIndent = consumeIndent(reader);
	if (consumedIndent < reader.indent) {
		reader.indent--;
		reader.i = e1;
		return false;
	} else if (consumedIndent > reader.indent)
		throw reader.error(e2, `Too much indentation. Expected ${reader.indent}, found ${consumedIndent}`);
	return true;
};
