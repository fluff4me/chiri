// @ts-check

const ansi = require("../../ansi");
const typeDec = require("./type/typeDec");
const typeInt = require("./type/typeInt");
const typeString = require("./type/typeString");
const typeUint = require("./type/typeUint");

/**
 * @template {object} RESULT
 * @callback Consumer
 * @param {import("./ThetaReader")} reader
 * @returns {RESULT | undefined}
 */

/**
 * @typedef ThetaTypeDefinition
 * @property {Consumer<object>} consumeOptionalConstructor
 * @property {Consumer<string>=} consumeType
 * @property {number | true=} hasGenerics
 * @property {true=} stringable
 */

/** @type {Record<string, ThetaTypeDefinition>} */
const types = {
	string: typeString,
	uint: typeUint,
	int: typeInt,
	dec: typeDec,
};

const numericTypes = /** @type {const} */ (["uint", "int", "dec"]);

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
 * @returns {"uint" | "int" | "dec"}
 */
const minNumericPrecision = (typeA, typeB) => (typeA === "dec" || typeB === "dec") ? "dec"
	: (typeA === "int" || typeB === "int") ? "int"
		: "uint";


/** @type {Record<string, TypeName | ((typeA: TypeName, typeB?: TypeName) => TypeName)>} */
const operatorResults = /** @type {Record<Operator, TypeName | ((typeA: TypeName, typeB?: TypeName) => TypeName)>} */({
	"+": (a, b = a) => minNumericPrecision(a, b),
	"-": (a, b = a) => minNumericPrecision("int", minNumericPrecision(a, b)),
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
});

/** @type {Set<Operator>} */
const minNumericPrecisionOperators = new Set(["+", "-", "*", "%"]);

module.exports = class ThetaTypeManager {
	/** @type {Record<string, ThetaTypeDefinition>} */
	types = {
		...types,
	};

	/** @type {Record<string, Record<string, Record<string, string>>>} */
	binaryOperators = {};

	/** @type {Record<string, Record<string, string>>} */
	unaryOperators = {};

	/**
	 * @param {string} typeA
	 * @param {string} operator
	 * @param {string} typeB
	 * @param {string=} output
	 * @param {boolean} reversible
	 */
	registerBinaryOperator (typeA, operator, typeB = typeA, output, reversible = false) {
		const operatorsOfTypeA = this.binaryOperators[typeA] ??= {};
		let instancesOfThisOperator = operatorsOfTypeA[operator] ??= {};
		if (instancesOfThisOperator[typeB])
			console.warn(ansi.err + `Operation ${typeA}${operator}${typeB}=${instancesOfThisOperator[typeB]} replaced with ${typeA}${operator}${typeB}=${output}`);
		let result = output ?? operatorResults[operator];
		result = typeof result === "function" ? result(typeA, typeB) : result;
		if (!result)
			throw new Error(`Unable to determine output type of operation ${typeA}${operator}${typeB}`);
		instancesOfThisOperator[typeB] = result;

		if (!reversible)
			return;

		const operatorsOfTypeB = this.binaryOperators[typeB] ??= {};
		instancesOfThisOperator = operatorsOfTypeB[operator] ??= {};
		if (instancesOfThisOperator[typeA])
			console.warn(ansi.err + `Operation ${typeB}${operator}${typeA}=${instancesOfThisOperator[typeA]} replaced with ${typeB}${operator}${typeA}=${output}`);
		result = output ?? operatorResults[operator];
		result = typeof result === "function" ? result(typeB, typeA) : result;
		if (!result)
			throw new Error(`Unable to determine output type of operation ${typeB}${operator}${typeA}`);
		instancesOfThisOperator[typeA] = result;
	}

	/**
	 * @param {string} operator
	 * @param {string} type
	 * @param {string=} output
	 */
	registerUnaryOperator (operator, type, output) {
		let instancesOfThisOperator = this.unaryOperators[operator] ??= {};
		if (instancesOfThisOperator[type])
			console.warn(ansi.err + `Operation ${operator}${type}=${instancesOfThisOperator[type]} replaced with ${operator}${type}=${output}`);
		let result = output ?? operatorResults[operator];
		result = typeof result === "function" ? result(type) : result;
		if (!result)
			throw new Error(`Unable to determine output type of operation ${operator}${type}`);
		instancesOfThisOperator[type] = result;
	}

	constructor () {
		for (const operator of binaryNumericOperators)
			for (const typeA of numericTypes)
				for (const typeB of numericTypes) {
					this.registerBinaryOperator(typeA, operator, typeB);
				}

		for (const operator of binaryBooleanOperators)
			this.registerBinaryOperator("bool", operator);

		for (const operator of unaryNumericOperators)
			for (const type of numericTypes)
				this.registerUnaryOperator(operator, type);

		for (const operator of unaryBooleanOperators)
			this.registerUnaryOperator(operator, "bool");
	}
}
