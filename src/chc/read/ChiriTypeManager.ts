

import ansi from "../../ansi"
import type ChiriReader from "./ChiriReader"
import { ChiriType } from "./ChiriType"
import typeBody from "./type/typeBody"
import typeDec from "./type/typeDec"
import typeInt from "./type/typeInt"
import typeList from "./type/typeList"
import typeString from "./type/typeString"
import typeUint from "./type/typeUint"

type Consumer<RESULT> = (reader: ChiriReader) => RESULT | undefined

export interface ChiriTypeDefinition {
	consumeOptionalConstructor: Consumer<object>
	consumeType?: Consumer<string>
	generics?: number | true | string[][]
	stringable?: true
}

const types: Record<string, ChiriTypeDefinition> = {
	string: typeString,
	uint: typeUint,
	int: typeInt,
	dec: typeDec,
	list: typeList,
	body: typeBody,
}

const numericTypes = ["uint", "int", "dec"] as const
type NumericType = (typeof numericTypes)[number]
const isNumeric = (type: string) => numericTypes.includes(type as NumericType)

type TypeName = keyof typeof types

const binaryNumericOperators = ["+", "-", "*", "/", "%", "**", "==", "!="] as const
const unaryNumericOperators = ["+", "-"] as const
const binaryBitwiseOperators = ["&", "|", "^"] as const
const unaryBitwiseOperators = ["~"] as const
const binaryBooleanOperators = ["||", "&&", "==", "!="] as const
const unaryBooleanOperators = ["!"] as const

export type Operator = (typeof binaryNumericOperators)[number] | (typeof unaryNumericOperators)[number] | (typeof binaryBitwiseOperators)[number] | (typeof unaryBitwiseOperators)[number] | (typeof binaryBooleanOperators)[number] | (typeof unaryBooleanOperators)[number]

const minNumericPrecision = (typeA: TypeName, typeB: TypeName): "uint" | "int" | "dec" => (typeA === "dec" || typeB === "dec") ? "dec"
	: (typeA === "int" || typeB === "int") ? "int"
		: "uint"


const operatorResults: Record<string, TypeName | ((typeA: TypeName, typeB?: TypeName) => TypeName)> = {
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
}

const minNumericPrecisionOperators: Set<Operator> = new Set(["+", "-", "*", "%"])

export default class ChiriTypeManager {

	types: Record<string, ChiriTypeDefinition> = { ...types }

	binaryOperators: Record<string, Record<string, Record<string, string>>> = {}
	unaryOperators: Record<string, Record<string, string>> = {}

	registerBinaryOperator (typeA: string, operator: string, typeB: string = typeA, output?: string, reversible: boolean = false) {
		const operatorsOfTypeA = this.binaryOperators[typeA] ??= {}
		let instancesOfThisOperator = operatorsOfTypeA[operator] ??= {}
		if (instancesOfThisOperator[typeB])
			console.warn(ansi.err + `Operation ${typeA}${operator}${typeB}=${instancesOfThisOperator[typeB]} replaced with ${typeA}${operator}${typeB}=${output}`)
		let result = output ?? operatorResults[operator]
		result = typeof result === "function" ? result(typeA, typeB) : result
		if (!result)
			throw new Error(`Unable to determine output type of operation ${typeA}${operator}${typeB}`)
		instancesOfThisOperator[typeB] = result

		if (!reversible)
			return

		const operatorsOfTypeB = this.binaryOperators[typeB] ??= {}
		instancesOfThisOperator = operatorsOfTypeB[operator] ??= {}
		if (instancesOfThisOperator[typeA])
			console.warn(ansi.err + `Operation ${typeB}${operator}${typeA}=${instancesOfThisOperator[typeA]} replaced with ${typeB}${operator}${typeA}=${output}`)
		result = output ?? operatorResults[operator]
		result = typeof result === "function" ? result(typeB, typeA) : result
		if (!result)
			throw new Error(`Unable to determine output type of operation ${typeB}${operator}${typeA}`)
		instancesOfThisOperator[typeA] = result
	}

	registerUnaryOperator (operator: string, type: string, output?: string) {
		const instancesOfThisOperator = this.unaryOperators[operator] ??= {}
		if (instancesOfThisOperator[type])
			console.warn(ansi.err + `Operation ${operator}${type}=${instancesOfThisOperator[type]} replaced with ${operator}${type}=${output}`)
		let result = output ?? operatorResults[operator]
		result = typeof result === "function" ? result(type) : result
		if (!result)
			throw new Error(`Unable to determine output type of operation ${operator}${type}`)
		instancesOfThisOperator[type] = result
	}

	constructor () {
		for (const operator of binaryNumericOperators)
			for (const typeA of numericTypes)
				for (const typeB of numericTypes) {
					this.registerBinaryOperator(typeA, operator, typeB)
				}

		for (const operator of binaryBooleanOperators)
			this.registerBinaryOperator("bool", operator)

		for (const operator of unaryNumericOperators)
			for (const type of numericTypes)
				this.registerUnaryOperator(operator, type)

		for (const operator of unaryBooleanOperators)
			this.registerUnaryOperator(operator, "bool")
	}

	clone () {
		const man = new ChiriTypeManager()
		man.types = { ...this.types }
		man.unaryOperators = Object.fromEntries(Object.entries(this.unaryOperators)
			.map(([key, record]) => [key, { ...record }]))
		man.binaryOperators = Object.fromEntries(Object.entries(this.binaryOperators)
			.map(([key, record]) => [key, Object.fromEntries(Object.entries(record)
				.map(([key, record]) => [key, { ...record }]))]))
		return man
	}

	isAssignable (type: ChiriType, toType: ChiriType): boolean {
		if (toType.name.value === "*")
			return true

		if (type.name.value === "*")
			// this should never happen
			throw new Error(`* is not a statically known type and therefore cannot be assigned to ${ChiriType.stringify(toType)}`)

		if (isNumeric(type.name.value) && isNumeric(toType.name.value))
			return minNumericPrecision(type.name.value, toType.name.value) === toType.name.value

		return type.name.value === toType.name.value
			&& type.generics.every((generic, i) => this.isAssignable(generic, toType.generics[i]))
	}
}
