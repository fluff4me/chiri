

import ansi from "../../ansi"
import type ChiriReader from "../read/ChiriReader"
import type { Value } from "../util/resolveExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import type { ChiriTypeGeneric } from "./ChiriType"
import { ChiriType } from "./ChiriType"
import typeBody from "./typeBody"
import typeBool from "./typeBool"
import typeDec from "./typeDec"
import type TypeDefinition from "./TypeDefinition"
import typeInt from "./typeInt"
import typeList from "./typeList"
import typeString from "./typeString"
import typeUint from "./typeUint"

const typesList = [
	typeString,
	typeDec,
	typeInt,
	typeUint,
	typeList,
	typeBody,
	typeBool,
]

type TypeRegistry =
	{ [KEY in keyof typeof typesList as (typeof typesList)[KEY] extends TypeDefinition<infer TYPE> ? TYPE : never]: true } extends infer O ?
	{ [KEY in keyof O]: TypeDefinition<KEY & string> }
	: never

const types = Object.fromEntries(typesList.map(typedef => [typedef.type.name.value, typedef])) as TypeRegistry

const numericTypes = ["uint", "int", "dec"] as const
type NumericType = (typeof numericTypes)[number]
const isNumeric = (type: string) => numericTypes.includes(type as NumericType)

type TypeName = keyof typeof types

const binaryNumericOperators = ["**", "+", "-", "*", "/", "%", "==", "!=", "<=", ">=", "<", ">"] as const
const unaryNumericOperators = ["+", "-"] as const
const binaryBitwiseOperators = ["&", "|", "^"] as const
const unaryBitwiseOperators = ["~"] as const
const binaryBooleanOperators = ["||", "&&", "==", "!="] as const
const unaryBooleanOperators = ["!"] as const
const binaryStringOperators = [".", "x", "==", "!="] as const

export type Operator =
	| (typeof binaryNumericOperators)[number]
	| (typeof unaryNumericOperators)[number]
	| (typeof binaryBitwiseOperators)[number]
	| (typeof unaryBitwiseOperators)[number]
	| (typeof binaryBooleanOperators)[number]
	| (typeof unaryBooleanOperators)[number]
	| (typeof binaryStringOperators)[number]

const minNumericPrecision2 = (typeA: string, typeB: string): "uint" | "int" | "dec" => (typeA === "dec" || typeB === "dec") ? "dec"
	: (typeA === "int" || typeB === "int") ? "int"
		: "uint"

const minNumericPrecision = (...types: string[]) => types.reduce(minNumericPrecision2, "uint")

const operatorResults: Record<string, string | ((typeA: string, typeB?: string) => string)> = {
	"+": (a, b = a) => minNumericPrecision(a, b),
	"-": (a, b = a) => minNumericPrecision("int", a, b),
	"*": (a, b = a) => minNumericPrecision(a, b),
	"/": "dec",
	"%": (a, b = a) => minNumericPrecision(a, b),
	"**": "dec",
	"<=": "bool",
	">=": "bool",
	"<": "bool",
	">": "bool",
	"==": "bool",
	"!=": "bool",
	"||": "bool",
	"&&": "bool",
	"!": "bool",
	"~": "int",
	"&": "int",
	"|": "int",
	"^": "int",
	".": "string",
	"x": "string",
}

const operatorOperandCoercion: Record<string, true | [true, false] | [false, true]> = {
	".": true,
}

const operatorOperandBTypes: Record<string, string> = {
	"x": "uint",
}

export default class ChiriTypeManager {

	types: Record<string, TypeDefinition> = { ...types }

	binaryOperators: Record<string, Record<string, Record<string, string>>> = {}
	unaryOperators: Record<string, Record<string, string>> = {}
	binaryOperatorCoercion: Record<string, true | [true, false] | [false, true]> = {}
	unaryOperatorCoercion: Record<string, true> = {}

	registerBinaryOperator (typeA: string, operator: string, typeB: string = typeA, output?: string, reversible: boolean = false, coercion?: true | [true, false] | [false, true]) {
		const operatorsOfTypeA = this.binaryOperators[typeA] ??= {}
		let instancesOfThisOperator = operatorsOfTypeA[operator] ??= {}
		let result = output ?? operatorResults[operator]
		result = typeof result === "function" ? result(typeA, typeB) : result
		if (!result)
			throw new Error(`Unable to determine output type of operation ${typeA}${operator}${typeB}`)

		if (instancesOfThisOperator[typeB] && instancesOfThisOperator[typeB] !== result)
			console.warn(ansi.err + `Operation ${typeA}${operator}${typeB}=${instancesOfThisOperator[typeB]} replaced with ${typeA}${operator}${typeB}=${result}`)

		instancesOfThisOperator[typeB] = result

		coercion ??= operatorOperandCoercion[operator]
		if (coercion)
			this.binaryOperatorCoercion[operator] = coercion ?? operatorOperandCoercion[operator]

		if (!reversible)
			return

		const operatorsOfTypeB = this.binaryOperators[typeB] ??= {}
		instancesOfThisOperator = operatorsOfTypeB[operator] ??= {}
		result = output ?? operatorResults[operator]
		result = typeof result === "function" ? result(typeB, typeA) : result
		if (!result)
			throw new Error(`Unable to determine output type of operation ${typeB}${operator}${typeA}`)

		if (instancesOfThisOperator[typeA] && instancesOfThisOperator[typeA] !== result)
			console.warn(ansi.err + `Operation ${typeB}${operator}${typeA}=${instancesOfThisOperator[typeA]} replaced with ${typeB}${operator}${typeA}=${result}`)

		instancesOfThisOperator[typeA] = result
	}

	registerUnaryOperator (operator: string, type: string, output?: string, coercion?: true) {
		const instancesOfThisOperator = this.unaryOperators[operator] ??= {}
		let result = output ?? operatorResults[operator]
		result = typeof result === "function" ? result(type) : result
		if (!result)
			throw new Error(`Unable to determine output type of operation ${operator}${type}`)

		if (instancesOfThisOperator[type] && instancesOfThisOperator[type] !== result)
			console.warn(ansi.err + `Operation ${operator}${type}=${instancesOfThisOperator[type]} replaced with ${operator}${type}=${result}`)

		instancesOfThisOperator[type] = result

		coercion ??= operatorOperandCoercion[operator] ? true : undefined
		if (coercion)
			this.unaryOperatorCoercion[type] = coercion
	}

	constructor (private readonly host: ChiriReader | ChiriCompiler) {
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

		for (const operator of binaryStringOperators)
			this.registerBinaryOperator("string", operator, operatorOperandBTypes[operator] ?? "string")
	}

	registerGenerics (...generics: ChiriTypeGeneric[]) {
		for (const type of generics) {
			if (this.types[type.name.value]) {
				if (this.types[type.name.value].type === type)
					// reregistering due to sub reader
					continue

				throw this.host.error(`Cannot redefine type "${type.name.value}"`)
			}

			if (type.generics.length === 1 && type.generics[0].name.value === "*")
				type.generics = Object.values(this.types)
					.map(typeDef => typeDef.type)
					.filter(type => type.name.value !== "body")

			const componentTypeDefinitions = type.generics.map(component => {
				const typeDef = this.types[component.name.value]
				if (!typeDef)
					throw this.host.error(`Type "${type.name.value}" depends on undefined type "${component.name.value}"`)

				return typeDef
			})

			this.types[type.name.value] = {
				type,
				stringable: componentTypeDefinitions.every(type => type.stringable) ? true : undefined,
				consumeOptionalConstructor: reader => {
					for (const type of componentTypeDefinitions) {
						const result = type.consumeOptionalConstructor?.(reader)
						if (result)
							return result
					}

					return undefined
				},
			}

			// register common operators for `generic OPERATOR value`
			for (const [typeA, operatorsOfTypeA] of Object.entries(this.binaryOperators)) {
				if (!type.generics.some(generic => typeA === generic.name.value))
					// skip, this isn't one of the component types
					continue

				for (const [operator, instancesOfOperator] of Object.entries(operatorsOfTypeA)) {
					for (const typeB of Object.keys(instancesOfOperator)) {
						const returnTypes = [...new Set(type.generics.map(generic => this.binaryOperators[generic.name.value]?.[operator]?.[typeB]))]
						if (returnTypes.includes(undefined!))
							// not common between all component types
							continue

						if (returnTypes.length > 1 && !returnTypes.every(isNumeric))
							// return types are not common between all component types
							continue

						const returnType = returnTypes.length === 1 ? returnTypes[0] : minNumericPrecision(...returnTypes)

						// this will register duplicates, but that's ok
						this.registerBinaryOperator(type.name.value, operator, typeB, returnType)
					}
				}
			}

			// register common operators for `value OPERATOR generic`
			for (const [typeA, operatorsOfTypeA] of Object.entries(this.binaryOperators)) {
				for (const [operator, instancesOfOperator] of Object.entries(operatorsOfTypeA)) {
					for (const typeB of Object.keys(instancesOfOperator)) {
						if (!type.generics.some(generic => typeB === generic.name.value))
							// skip, this isn't one of the component types
							continue

						const returnTypes = [...new Set(type.generics.map(generic => this.binaryOperators[generic.name.value]?.[operator]?.[typeB]))]
						if (returnTypes.includes(undefined!))
							// not common between all component types
							continue

						if (returnTypes.length > 1 && !returnTypes.every(isNumeric))
							// return types are not common between all component types
							continue

						const returnType = returnTypes.length === 1 ? returnTypes[0] : minNumericPrecision(...returnTypes)

						// this will register duplicates, but that's ok
						this.registerBinaryOperator(typeA, operator, type.name.value, returnType)
					}
				}
			}

			// register common operators for `OPERATOR value`
			for (const [operator, types] of Object.entries(this.unaryOperators)) {
				const returnTypes = [...new Set(type.generics.map(generic => types[generic.name.value]))]
				if (returnTypes.includes(undefined!))
					// not common between all component types
					continue

				if (returnTypes.length > 1 && !returnTypes.every(isNumeric))
					// return types are not common between all component types
					continue

				const returnType = returnTypes.length === 1 ? returnTypes[0] : minNumericPrecision(...returnTypes)

				this.registerUnaryOperator(operator, type.name.value, returnType)
			}
		}
	}

	deregisterGenerics (...generics: ChiriTypeGeneric[]) {
		for (const type of generics) {
			delete this.types[type.name.value]
			delete this.binaryOperators[type.name.value]
			for (const unaryOperator of Object.values(this.unaryOperators))
				delete unaryOperator[type.name.value]

			for (const binaryOperators of Object.values(this.binaryOperators))
				for (const binaryOperator of Object.values(binaryOperators))
					delete binaryOperator[type.name.value]
		}
	}

	coerce (value: Value, type: ChiriType, fromType?: ChiriType) {
		const definition = this.types[type.name.value]
		if (!definition?.coerce)
			return value

		return definition.coerce(value, () => {
			throw this.host.error(`Unable to coerce ${fromType ? `"${ChiriType.stringify(fromType)}"` : typeof value} to "${ChiriType.stringify(type)}"`)
		})
	}

	canCoerceOperandB (operator?: string) {
		const coercion = this.binaryOperatorCoercion[operator!]
		return coercion === true || coercion?.[1] === true
	}

	isAssignable (type: ChiriType, ...toTypes: ChiriType[]): boolean {
		if (toTypes.includes(type) || !toTypes.length)
			return true

		toTypes = toTypes.flatMap(type => type.isGeneric ? type.generics : type)
		if (type.isGeneric && type.generics.every(type => toTypes.some(toType => this.isAssignable(type, toType))))
			// handle the case of generic assignability into generics
			return true

		if (toTypes.length > 1)
			return toTypes.some(toType => this.isAssignable(type, toType))

		const [toType] = toTypes
		if (toType.name.value === "*")
			return true

		if (type.name.value === "*")
			// this should never happen
			throw new Error(`* is not a statically known type and therefore cannot be assigned to ${ChiriType.stringify(toType)}`)

		if (isNumeric(type.name.value) && isNumeric(toType.name.value))
			// explicitly allow putting any numbers in contexts that expect specific types
			// they'll be clamped to what's valid(truncation for int, clamp to >= 0 for uint)
			return true // minNumericPrecision(type.name.value, toType.name.value) === toType.name.value

		return type.name.value === toType.name.value
			&& type.generics.every((generic, i) => this.isAssignable(generic, toType.generics[i]))
	}

	dedupe (...types: ChiriType[]) {
		const result: ChiriType[] = []
		for (const type of types)
			if (!result.some(test => test.name.value === type.name.value && test.generics.every((test, i) => test.name.value === type.generics[i].name.value)))
				result.push(type)

		return result
	}

	intersection (...types: ChiriType[]) {
		types = this.dedupe(...types)
		if (types.length === 1)
			return types[0]

		const generics = types
			.filter(type => type.isGeneric)
			.sort((a, b) => b.generics.length - a.generics.length)

		const primaryType = generics[0]
		if (!primaryType) {
			if (types.every(type => isNumeric(type.name.value)))
				return ChiriType.of(minNumericPrecision(...types.map(type => type.name.value)))

			throw this.host.error("Cannot form an intersection")
		}

		if (generics.length > 1)
			for (let i = 1; i < generics.length; i++)
				if (generics[i].generics.some(generic => !primaryType.generics.some(primaryTypeGeneric => primaryTypeGeneric.name.value === generic.name.value)))
					throw this.host.error(`Cannot form an intersection between types "${ChiriType.stringify(primaryType)}" and "${ChiriType.stringify(generics[i])}"`)

		const unableToIntersect = types.find(type => !type.isGeneric && !primaryType.generics.some(generic => generic.name.value === type.name.value))
		if (unableToIntersect)
			throw this.host.error(`Cannot form an intersection between types "${ChiriType.stringify(primaryType)}" and "${ChiriType.stringify(unableToIntersect)}"`)

		return primaryType
	}

	with (...generics: ChiriTypeGeneric[]) {
		return {
			do: <T> (handler: () => T): T => {
				this.registerGenerics(...generics)
				const result = handler()
				this.deregisterGenerics(...generics)
				return result
			},
		}
	}

	clone (reader: ChiriReader) {
		const man = new ChiriTypeManager(reader)
		man.types = { ...this.types }
		man.unaryOperators = Object.fromEntries(Object.entries(this.unaryOperators)
			.map(([key, record]) => [key, { ...record }]))
		man.binaryOperators = Object.fromEntries(Object.entries(this.binaryOperators)
			.map(([key, record]) => [key, Object.fromEntries(Object.entries(record)
				.map(([key, record]) => [key, { ...record }]))]))
		return man
	}
}
