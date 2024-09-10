

import { ChiriCompilerVariable, ChiriExpressionOperand, ChiriType } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeExpression from "./consumeExpression";
import { consumeTypeOptional } from "./consumeType";
import consumeWhiteSpace from "./consumeWhiteSpace";
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional";
import consumeWord from "./consumeWord";
import consumeWordOptional from "./consumeWordOptional";

export default (reader: ChiriReader): ChiriCompilerVariable | undefined => {
	const save = reader.savePosition();
	const position = reader.getPosition();
	let e = reader.i;
	reader.consume("#");

	const varWord = consumeWordOptional(reader, "var");
	const type: ChiriType | undefined = !varWord ? consumeTypeOptional(reader)
		: {
			type: "type",
			name: { ...varWord, value: "*" },
			generics: [],
		};

	if (!type) {
		reader.restorePosition(save);
		return undefined;
	}

	consumeWhiteSpace(reader);

	const name = consumeWord(reader);

	const postType = reader.i;

	if (type)
		consumeWhiteSpaceOptional(reader);

	const assignment = reader.consumeOptional("??=", "=") as "??=" | "=" | undefined;

	let expression: ChiriExpressionOperand | undefined;
	if (assignment) {
		consumeWhiteSpaceOptional(reader);
		expression = consumeExpression(reader, type.name.value);
	} else {
		reader.i = postType;
	}

	return {
		type: "variable",
		valueType: type?.name.value ?? "*",
		name,
		expression,
		position,
		assignment,
	}
};
