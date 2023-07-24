// @ts-check
const fs = require("fs");
const ansi = require("./ansi");

module.exports = (/** @type {string} */ input) => {

	let i = 0;
	let indent = 0;

	/**
	 * @callback Consumer
	 * @returns {string | undefined}
	 * 
	 * @typedef TypeDefinition
	 * @property {Consumer} consumeOptionalConstructor
	 * @property {Consumer=} consumeType
	 * @property {number | true=} hasGenerics
	 * @property {true=} stringable
	 */
	/**
	 * @satisfies {Record<string, TypeDefinition>}
	 */
	const types = {
		dec: {
			stringable: true,
			consumeOptionalConstructor () {
				return consumeOptionalDecimal();
			},
		},
		int: {
			stringable: true,
			consumeOptionalConstructor () {
				return consumeOptionalInteger();
			},
		},
		bool: {
			stringable: true,
			consumeOptionalConstructor () {
				return consumeOptional("true") ?? consumeOptional("false");
			},
		},
		string: {
			stringable: true,
			consumeOptionalConstructor () {
				const s = i;
				if (!consumeOptional('"'))
					return undefined;

				assertNotWhiteSpaceAndNewLine();

				const block = consumeOptionalBlockStart();

				let string = "";
				String: for (; i < input.length; i++) {
					if (block)
						string += "\\n".repeat(consumeOptionalNewBlockLine(true));

					const char = input[i];
					switch (char) {
						case "\\":
							i++;
							if (consumeOptionalNewBlockLine(true)) {
								consumeOptionalIndent();
								i--;
								break;
							}

							const escapeChar = input[i];
							switch (escapeChar) {
								case "r":
								case "n":
								case "t":
								case "\\":
								case "$":
									string += char + escapeChar;
									break;
								case '"':
									string += escapeChar;
									break;
								default:
									throw compileError("Unexpected escape character");
							}
							break;
						case "$":
						case "`":
							string += `\\${char}`;
							break;
						case "*":
							const e = i;
							i++;
							const word = consumeOptionalWord();
							if (!word) {
								i--;
								string += "*";
								break;
							}

							i--;
							const type = vars[word].type;
							if (!getType(type).stringable)
								throw compileError(e, `Type '${type}' is not stringable`);

							string += `\${_${word}}`
							break;
						case "\r":
							break;
						case "\n":
							break String;
						case "\t":
							string += "\\t";
							break;
						default:
							string += char;
					}
				}


				if (block)
					consumeBlockEnd();

				return "`" + string + "`";
			}
		},
		"[]": {
			hasGenerics: 1,
			consumeOptionalConstructor () {
				throw compileError("Array implementation incomplete");
			},
		},
		"{}": {
			hasGenerics: true,
			consumeOptionalConstructor () {
				throw compileError("Record implementation incomplete");
			},
		},
		"!": {
			consumeOptionalConstructor () {
				const input = consumeType();

				throw compileError("Function implementation incomplete");
			},
		},
		"*": {
			consumeOptionalConstructor () {
				throw compileError("Can't construct value for any type");
			},
		}
	};

	for (const [typeName, typeDef] of Object.entries(types)) {
		typeDef[Symbol.toStringTag] = `types.${typeName}`;
	}

	/**
	 * @param {TypeName} type 
	 * @returns {TypeDefinition}
	 */
	const getType = (type) => types[type];

	const numericTypes = /** @type {const} */ (["int", "dec"]);

	/**
	 * @typedef {keyof typeof types} TypeName
	 */

	const binaryNumericOperators = /** @type {const} */ (["+", "-", "*", "/", "%", "**", "==", "!="]);
	const unaryNumericOperators = /** @type {const} */ (["+", "-"]);
	const binaryBitwiseOperators = /** @type {const} */ (["&", "|", "^"]);
	const unaryBitwiseOperators = /** @type {const} */ (["~"]);
	const binaryBooleanOperators = /** @type {const} */ (["||", "&&", "==", "!="]);
	const unaryBooleanOperators = /** @type {const} */ (["!"]);

	/**
	 * @typedef {typeof binaryNumericOperators[number] | typeof unaryNumericOperators[number] | typeof binaryBitwiseOperators[number] | typeof unaryBitwiseOperators[number] | typeof binaryBooleanOperators[number] | typeof unaryBooleanOperators[number]} Operator
	 */

	/**
	 * @param {TypeName} typeA
	 * @param {TypeName} typeB
	 * @returns {"int" | "dec"}
	 */
	const minNumericPrecision = (typeA, typeB) => typeA === "dec" || typeB === "dec" ? "dec" : "int";

	/** @type {Record<Operator, TypeName | ((typeA: TypeName, typeB?: TypeName) => TypeName)>} */
	const operators = {
		"+": (a, b = a) => minNumericPrecision(a, b),
		"-": (a, b = a) => minNumericPrecision(a, b),
		"*": (a, b = a) => minNumericPrecision(a, b),
		"/": "dec",
		"%": (a, b = a) => minNumericPrecision(a, b),
		"**": "dec",
		"==": "bool",
		"!=": "bool",
		"||": "bool",
		"&&": "bool",
		"!": "bool",
		"~": "int",
		"&": "int",
		"|": "int",
		"^": "int",
	}

	/**
	 * @typedef {`${TypeName}${Operator}${TypeName}`} BinaryOperatorHash
	 * @typedef {`${Operator}${TypeName}`} UnaryOperatorHash
	 */
	/** @type {Partial<Record<BinaryOperatorHash, true>>} */
	const binaryOperatorHashes = {};
	/** @type {Operator[]} */
	const binaryOperators = [];
	/** @type {Partial<Record<UnaryOperatorHash, true>>} */
	const unaryOperatorHashes = {};
	/** @type {Operator[]} */
	const unaryOperators = [];

	/**
	 * @param {TypeName} type 
	 * @param {Operator} operator 
	 * @param {TypeName=} type2 
	 */
	const registerBinaryOperator = (type, operator, type2 = type) => {
		binaryOperatorHashes[`${type}${operator}${type2}`] = true;
		binaryOperators.push(operator);
	}

	for (const operator of binaryNumericOperators)
		for (const typeA of numericTypes)
			for (const typeB of numericTypes)
				registerBinaryOperator(typeA, operator, typeB);

	for (const operator of binaryBooleanOperators)
		registerBinaryOperator("bool", operator);

	/**
	 * @param {TypeName} type 
	 * @param {Operator} operator 
	 * @param {TypeName=} type2 
	 */
	const registerUnaryOperator = (type, operator, type2 = type) => {
		unaryOperatorHashes[`${operator}${type2}`] = true;
		unaryOperators.push(operator);
	}

	for (const operator of unaryNumericOperators)
		for (const type of numericTypes)
			registerUnaryOperator(type, operator);

	for (const operator of unaryBooleanOperators)
		registerUnaryOperator("bool", operator);


	/**
	 * @typedef Value
	 * @property {TypeName} type
	 * @property {string} value
	 */

	/**
	 * @type {Record<string, Value>}
	 */
	const vars = {};

	const getLineStart = () => input.lastIndexOf("\n", i - 1) + 1;
	const getLineEnd = () => {
		let index = input.indexOf("\n", i);
		if (index === -1)
			return input.length;

		while (input[--index] === "\r");
		return index + 1;
	};

	const getLineNumber = () => {
		let newlines = 0;
		for (let j = 0; j < i; j++)
			if (input[j] === "\n")
				newlines++;
		return newlines;
	};

	const getColumnNumber = () => {
		return i - getLineStart();
	};

	const getCurrentLine = () => {
		return input.slice(getLineStart(), getLineEnd());
	}

	/** 
	 * @overload
	 * @param {string} message
	 */
	/**
	 * @overload
	 * @param {number} errorPosition
	 * @param {string} message
	 */
	/**
	 * @param {number | string} errorPositionOrMessage
	 * @param {string=} message 
	 */
	const compileError = (errorPositionOrMessage, message) => {
		let ci = i;
		if (typeof errorPositionOrMessage === "number")
			i = errorPositionOrMessage;
		else
			message = errorPositionOrMessage;

		return new ThetaCompileError(getLineNumber(), getColumnNumber(), ci - i || 1, getCurrentLine(), message ?? "");
	};

	const isLetter = (/** @type {number} */ charCode) => false
		|| (charCode >= 65 && charCode <= 90) // A-Z
		|| (charCode >= 97 && charCode <= 122); // a-z

	const isDigit = (/** @type {number} */ charCode) => false
		|| (charCode >= 48 && charCode <= 57); // 0-9

	const isWordChar = (/** @type {number} */ charCode) => false
		|| charCode === 45 // -
		|| isLetter(charCode)
		|| isDigit(charCode);

	/**
	 * Consume indent up to expected #
	 * @param {number=} expected 
	 * @returns Undefined if not enough indentation found, otherwise indentations consumed
	 */
	const consumeOptionalIndent = (/** @type {number=} */ expected) => {
		let indent = 0;
		for (; i < input.length; i++) {
			if (indent === expected)
				break;

			if (input[i] !== "\t")
				break;

			indent++;
		}

		if (expected !== undefined && indent !== expected)
			return undefined;

		return indent;
	};

	const consumeIndent = (/** @type {number=} */ expected) => {
		const result = consumeOptionalIndent(expected);
		if (result === undefined)
			throw compileError("Not enough indentation");
		return result;
	};

	const consumeOptionalWhiteSpace = (errorOnIndentation = true) => {
		let consumed = false;
		for (; i < input.length; i++)
			if (input[i] === " ")
				consumed = true;
			else if (input[i] === "\t" && errorOnIndentation)
				throw compileError("Indentation may only be used at the start of lines");
			else
				break;

		return consumed;
	};

	const consumeOptionalComment = () => {
		const e = i;
		consumeOptionalWhiteSpace(false);
		if (!consumeOptional("; ")) {
			i = e;
			return;
		}

		for (; i < input.length; i++)
			if (input[i] === "\n")
				break;
	}

	const consumeOptionalNewLine = () => {
		const e = i;
		consumeOptionalComment();
		while (consumeOptional("\r"));
		if (consumeOptional("\n"))
			return true;

		i = e;
		return false;
	};

	/**
	 * Loop:
	 * - Consumes newline. If not encountering a newline, return number of consumed newlines
	 * - Consumes indentation to expected #
	 * 	- If encountering more, throw
	 * 	- If encountering less, return number of consumed newlines and return to before consuming most recent newline
	 * 	- If encountering right amount
	 * 		- If the rest of the line is blank, throw
	 * 		- Else continue
	 * @param {boolean} ignoreExtraIndentation `true` to disable throwing on extra indentation
	 * @returns Lines consumed
	 */
	const consumeOptionalNewBlockLine = (ignoreExtraIndentation = false) => {
		let consumed = 0;
		while (true) {
			let iPreConsumeLine = i;
			if (!consumeOptionalNewLine())
				return consumed;

			let iPreConsumeIndent = i;
			const encounteredIndent = consumeOptionalIndent(indent);
			if (encounteredIndent === undefined) {
				i = iPreConsumeLine;
				return consumed;
			}

			if (!ignoreExtraIndentation) {
				const iBeforeExtraIndentation = i;
				if (consumeOptionalIndent())
					throw compileError(iBeforeExtraIndentation, "Too much indentation");
			}

			const e = i;
			if (consumeOptionalNewLine()) {
				i = e;
				throw compileError(iPreConsumeIndent, "Unexpected indentation on empty line");
			}

			consumed++;
		}
	};

	// const consumeNewLine = () => {
	// 	let e = i;
	// 	if (!consumeOptional("\n"))
	// 		throw compileError(e, "Expected newline");
	// };

	/** @returns {true} */
	const consumeWhiteSpace = () => {
		if (!consumeOptionalWhiteSpace())
			throw compileError("Expected whitespace");
		return true;
	};

	const assertNotWhiteSpaceAndNewLine = () => {
		const s = i;
		if (!consumeOptionalWhiteSpace())
			return;

		const e = i;
		if (consumeOptionalNewLine()) {
			i = e;
			throw compileError(s, "Extraneous whitespace before newline");
		}

		i = s;
	}

	const consumeWord = () => {
		if (!isLetter(input.charCodeAt(i)))
			throw compileError("Words must start with a letter");

		let word = input[i++];
		for (; i < input.length; i++)
			if (isWordChar(input.charCodeAt(i)))
				word += input[i];
			else
				break;

		return word;
	};

	const consumeOptionalInteger = () => {
		let intStr = "";
		for (; i < input.length; i++)
			if (isDigit(input.charCodeAt(i)))
				intStr += input[i];
			else
				break;

		if (!intStr.length)
			return undefined;

		return intStr;
	};

	const consumeInteger = () => {
		const int = consumeOptionalInteger();
		if (int === undefined)
			throw compileError("Expected integer");
		return int;
	};

	const consumeOptionalDecimal = () => {
		const int = consumeOptionalInteger();
		if (int === undefined)
			return undefined;

		if (!consumeOptional("."))
			return undefined;

		const dec = consumeOptionalInteger();
		if (!dec)
			return undefined;

		return `${int}.${dec}`;
	};

	const consumeDecimal = () => {
		const e = i;
		const dec = consumeOptionalDecimal();
		if (dec === undefined)
			throw compileError(i = e, "Expected decimal");

		return dec;
	};

	const consumeOptionalWord = () => !isLetter(input.charCodeAt(i)) ? undefined : consumeWord();

	const consume = (/** @type {string} */ string) => {
		for (let j = 0; j < string.length; j++)
			if (input[i + j] !== string[j])
				throw compileError("Expected " + string);

		i += string.length;
		return string;
	};

	const consumeOptional = (/** @type {string} */ string) => {
		for (let j = 0; j < string.length; j++)
			if (input[i + j] !== string[j])
				return undefined;

		i += string.length;
		return string;
	};

	/**
	 * @returns {Type[]}
	 */
	const consumeGenerics = (/** @type {number=} */ quantity) => {
		const generics = [];
		if (quantity)
			for (let g = 0; g < quantity; g++)
				generics.push(consumeType());
		else
			while (true) {
				const type = consumeOptionalType();
				if (type)
					generics.push(type);
				else break;
			}
		return generics;
	};

	/**
	 * @typedef Type
	 * @property {TypeName} type
	 * @property {Type[]} generics
	 */

	/**
	 * @returns {Type | undefined}
	 */
	const consumeOptionalType = () => {
		const type = consumeOptional("*") ?? consumeOptionalTypeName();
		if (!type)
			return undefined;

		if (type === "*")
			return { type, generics: [] };

		const definition = types[type];
		let generics = [];
		if (definition.hasGenerics) {
			consumeOptionalWhiteSpace();
			generics = consumeGenerics(definition.hasGenerics === true ? undefined : definition.hasGenerics);
		};

		return {
			type: /** @type {TypeName} */ (type),
			generics,
		}
	};

	/**
	 * @returns {Type}
	 */
	const consumeType = () => {
		const e = i;
		const type = consumeOptionalType();
		if (!type)
			throw compileError(e, "Expected type");
		return type;
	};

	const consumeOptionalTypeConstructor = (/** @type {Type} */ type) => {
		const typedef = types[type.type];
		if (!typedef)
			throw compileError("There is no type '" + type + "'");

		return typedef.consumeOptionalConstructor();
	};

	const consumeTypeConstructor = (/** @type {Type} */ type) => {
		let e = i;
		const result = consumeOptionalTypeConstructor(type);
		if (result === undefined)
			throw compileError(e, `Expected '${type.type}' constructor`);

		return result;
	};

	const consumeOptionalTypeName = () => {
		const e = i;

		const type = /** @type {TypeName=} */ (consumeOptional("[]") // internal array type
			?? consumeOptional("{}") // internal object type
			?? consumeOptionalWord());

		if (!type)
			return undefined;

		if (!types[type])
			throw compileError(e, "There is no type '" + type + "'");

		return type;
	}

	const consumeTypeName = () => {
		const e = i;

		const type = consumeOptionalTypeName();
		if (!type)
			throw compileError(e, "Expected type name");

		return type;
	}

	/**
	 * @param {Operator[]} operators 
	 * @returns {Operator=}
	 */
	const consumeOptionalOperator = (operators) => {
		let operator;
		for (const o of operators)
			if (consumeOptional(o))
				return o;
		return operator;
	};

	/**
	 * @returns {Value}
	 */
	const consumeExpression = (/** @type {Type=} */ expectedType) => {
		const e = i;
		let operandA = consumeUnaryExpression();

		while (true) {
			consumeOptionalWhiteSpace() || consumeOptionalNewLine();

			const operator = consumeOptionalOperator(binaryOperators);
			if (!operator) {
				if (expectedType && expectedType.type !== "*" && operandA.type !== expectedType.type)
					throw compileError(e, `Expected '${expectedType.type}', got '${operandA.type}'`);
				return operandA;
			}

			consumeWhiteSpace();

			const operandB = consumeUnaryExpression();
			if (!binaryOperatorHashes[`${operandA.type}${operator}${operandB.type}`])
				throw compileError(`Operator '${operator}' cannot be used with types '${operandA.type}' and '${operandB.type}'`);

			const returnType = operators[operator];
			operandA = {
				type: typeof returnType === "function" ? returnType(operandA.type, operandB.type) : returnType,
				value: `${operandA.value} ${operator} ${operandB.value}`,
			};
		}
	}

	/** @returns {Value} */
	const consumeUnaryExpression = () => {
		const e = i;
		const operator = consumeOptionalOperator(unaryOperators);

		const operand = consumeExpressionOperand();
		if (!operator)
			return operand;

		if (!unaryOperatorHashes[`${operator}${operand.type}`])
			throw compileError(e, `Operator '${operator}' cannot be used with '${operand.type}'`);

		const returnType = operators[operator];
		return {
			type: typeof returnType === "function" ? returnType(operand.type) : returnType,
			value: `${operator}${operand.value}`,
		};
	}

	/**
	 * @returns {Value}
	 */
	const consumeExpressionOperand = () => {
		if (consumeOptional("(")) {
			const expr = consumeExpression();
			return {
				type: expr.type,
				value: "(" + expr.value + consume(")"),
			};
		}

		const int = consumeOptionalInteger();
		if (int)
			return { type: "int", value: int };

		const word = consumeOptionalWord();
		if (word && vars[word])
			return {
				type: vars[word].type,
				value: `_${word}`,
			};

		throw compileError("Unknown expression operand type");
	};

	const consumeOptionalBlockStart = () => {
		if (!consumeOptionalNewLine())
			return false;

		indent++;

		const e = i;
		const consumedIndent = consumeIndent();
		if (consumedIndent < indent)
			throw compileError(e, `Not enough indentation. Expected ${indent}, found ${consumedIndent}`);
		else if (consumedIndent > indent)
			throw compileError(e, `Too much indentation. Expected ${indent}, found ${consumedIndent}`);
		return true;
	}

	const consumeBlockEnd = () => {
		indent--;
		while (consumeOptional("\r"));
		consume("\n");

		const e = i;
		const consumedIndent = consumeIndent();
		if (consumedIndent < indent)
			throw compileError(e, "Not enough indentation");
		else if (consumedIndent > indent)
			throw compileError(e, "Too much indentation");

		return true;
	}

	const consumeDeclaration = () => {
		let e = i;
		if (consumeOptionalIndent())
			throw compileError(e, "Unexpected indentation, expected type");

		const type = consumeType();

		consumeWhiteSpace();

		e = i;
		const name = consumeWord();
		if (vars[name])
			throw compileError(e, `Declaration '${name}' already exists ('${vars[name].type}' type)`);

		consumeWhiteSpace();

		consume("=");

		assertNotWhiteSpaceAndNewLine();

		if (type.type === "*") {
			consumeWhiteSpace();

			const typeName = consumeOptionalTypeName();
			if (!typeName)
				throw compileError("Inferred declarations require explicit type names for construction");

			type.type = typeName;

			if (/** @type {TypeDefinition} */ (types[typeName]).hasGenerics)
				throw compileError(`Type '${typeName}' was automatically inferred, but it expects generics`);
		}

		assertNotWhiteSpaceAndNewLine();
		const block = consumeOptionalBlockStart();

		if (!block)
			consumeWhiteSpace();

		/** @type {Value | undefined} */
		let value;
		if (consumeOptional("()")) {
			consumeWhiteSpace();
			value = consumeExpression(type);
		} else {
			value = { type: type.type, value: consumeTypeConstructor(type) };
		}

		if (block)
			consumeBlockEnd();

		vars[name] = value;
		return `const _${name} = ${value.value};`;
	};

	const consumeOptionalBlock = () => {
		if (!consumeOptional("=>"))
			return undefined;

		if (!consumeOptionalBlockStart())
			throw compileError("Expected code block");
	};

	const consumeOptionalDocumentation = () => {
		if (!consumeOptional(";; "))
			return "";

		let documentation = "/**";
		while (true) {
			if (!consumeOptional("  "))
				documentation += "\n" + "\t".repeat(indent) + " *";

			documentation += " ";
			for (; i < input.length; i++) {
				if (input[i] === "\n") {
					documentation += "\n" + "\t".repeat(indent) + " *";
					break;
				} else if (input[i] !== "\r")
					documentation += input[i];
			}

			if (!consumeOptionalNewBlockLine())
				throw compileError("Expected additional documentation or documented declaration");

			if (!consumeOptional(";; "))
				return `${documentation}/\n`;
		}
	};

	const consumeProgram = () => {
		let output = "";

		try {
			while (true) {
				const e = i;
				while (consumeOptionalNewLine());
				if (i >= input.length)
					break;

				if (i && i === e)
					throw compileError("Expected newline");

				output += consumeOptionalDocumentation();

				const block = consumeOptionalBlock();
				if (block)
					output += block + "\n";

				output += consumeDeclaration() + "\n";
			}

		} catch (err) {
			if (err instanceof ThetaCompileError) {
				const line = err.line
					.replace(/\n/g, ansi.whitespace + "\u21A9" + ansi.reset)
					.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
					.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset);

				console.error(ansi.err + err.message + "\n"
					+ ansi.label + "  " + `${err.ln + 1}`.padStart(5) + " " + ansi.reset + line + "\n"
					+ ansi.err + `        ${" ".repeat(err.cn)}${"^".repeat(err.cl)}`
					+ ansi.reset + "\n"
					+ (err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1) + 1) ?? ""));
			} else {
				console.error(ansi.err + (err.stack ?? err.message));
			}
		}

		return output;
	};

	return consumeProgram();
};

class ThetaCompileError extends Error {
	/**
	 * @param {number} ln
	 * @param {number} cn
	 * @param {number} cl
	 * @param {string} line
	 * @param {string} message
	 */
	constructor (ln, cn, cl, line, message) {
		super(message);
		this.ln = ln;
		this.cn = cn;
		this.cl = cl;
		this.line = line;
	}
}

module.exports.ThetaCompileError = ThetaCompileError;
