import { ChiriBody, ChiriContext } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine";
import consumeBlockStartOptional from "./consumeBlockStartOptional";
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional";

export default async (reader: ChiriReader, context: ChiriContext, initialiser?: (sub: ChiriReader) => any): Promise<ChiriBody> => {
	assertNotWhiteSpaceAndNewLine(reader);

	const multiline = consumeBlockStartOptional(reader);
	const whitespace = multiline || consumeWhiteSpaceOptional(reader);
	if (!whitespace)
		return {
			content: [],
		};

	if (reader.peek("\r\n", "\n"))
		throw reader.error(reader.i - reader.getColumnNumber(), "Unexpected indentation on empty line");

	const sub = reader.sub(multiline, context);
	initialiser?.(sub);
	const ast = await sub.read();
	const content = ast.statements;
	reader.update(sub);
	return {
		content,
	};
};
