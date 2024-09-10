export interface ChiriType {
	type: "type"
	name: ChiriWord
	generics: ChiriType[]
}

export interface ChiriBinaryExpression {
	type: "expression"
	subType: "binary"
	operandA: ChiriExpressionOperand
	operandB: ChiriExpressionOperand
	operator: string
	valueType: string
	wrapped?: true
}

export interface ChiriUnaryExpression {
	type: "expression"
	subType: "unary"
	operand: ChiriExpressionOperand
	operator: string
	valueType: string
}

export interface ChiriLiteralString {
	type: "literal"
	subType: "string"
	segments: (string | ChiriExpressionOperand)[]
}

export interface ChiriLiteralNumeric {
	type: "literal"
	subType: "uint" | "int" | "dec"
	value: string
	position: ChiriPosition
}

export interface ChiriLiteralBoolean {
	type: "literal"
	subType: "boolean"
	value: boolean
	position: ChiriPosition
}

export interface ChiriLiteralUndefined {
	type: "literal"
	subType: "undefined"
	position: ChiriPosition
	value?: undefined
}

export interface ChiriLiteralArray {
	type: "literal"
	subType: "array"
	valueType: string
	value: ChiriExpressionOperand[]
}

export type ChiriLiteralValue = ChiriLiteralString | ChiriLiteralNumeric | ChiriLiteralBoolean | ChiriLiteralUndefined | ChiriLiteralArray

export interface ChiriVariableReference {
	type: "get"
	name: ChiriWord
	valueType: string
}

export type ChiriExpressionOperand = ChiriBinaryExpression | ChiriUnaryExpression | ChiriLiteralValue | ChiriVariableReference | ChiriValueText

export interface ChiriCompilerVariable {
	type: "variable"
	valueType: string
	name: ChiriWord
	expression?: ChiriExpressionOperand
	position: ChiriPosition
	assignment?: "=" | "??="
}

export interface ChiriProperty {
	type: "property"
	isCustomProperty?: true
	property: ChiriText
	value: ChiriValueText
	position: ChiriPosition
}

export interface ChiriInterpolationVariable {
	type: "interpolation-variable"
	name: ChiriWord
	position: ChiriPosition
}

export interface ChiriInterpolationProperty {
	type: "interpolation-property"
	name: ChiriText
	position: ChiriPosition
}

export interface ChiriTextRaw {
	type: "text-raw"
	text: string
	position: ChiriPosition
}

export interface ChiriText {
	type: "text"
	valueType: "string"
	content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand | string)[]
	position: ChiriPosition
}

export interface ChiriValueText {
	type: "text"
	valueType: "string"
	content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriInterpolationProperty | ChiriExpressionOperand | string)[]
	position: ChiriPosition
}

export interface ChiriPosition {
	file: string
	line: number
	column: number
}

export interface ChiriWord {
	type: "word"
	value: string
	position: ChiriPosition
}

export interface ChiriDocumentation {
	type: "documentation"
	content: string
}

export interface ChiriRoot {
	type: "root"
	content: ChiriStatement[]
}

export interface ChiriFunctionBase {
	type: string
	name: ChiriWord
	content: ChiriStatement[]
}

export interface ChiriFunction {
	type: "function"
	name: ChiriWord
	content: ChiriStatement[]
}

export interface ChiriFunctionUse {
	type: "function-use"
	name: ChiriWord
	variables: Record<string, ChiriExpressionOperand>
	content: ChiriStatement[]
}

export interface ChiriMixin {
	type: "mixin"
	name: ChiriWord
	content: ChiriStatement[]
	used: boolean
}

export interface ChiriMixinUse {
	type: "mixin-use"
	name: ChiriWord
	variables: Record<string, ChiriExpressionOperand>
}
//  * @property { ChiriStatement[] } content

export interface ChiriRule {
	type: "rule"
	className: ChiriText | undefined
	state: ChiriText | undefined
	content: ChiriStatement[]
}

export type ChiriContext = "mixin" | "rule" | "function"

export interface ChiriPath {
	module?: string
	path: string
	i: number
}

export interface ChiriImport {
	type: "import"
	paths: ChiriPath[]
}

export interface ChiriBody {
	content: ChiriStatement[]
}

export type ChiriStatement = ChiriCompilerVariable | ChiriProperty | ChiriMixin | ChiriFunction | ChiriDocumentation | ChiriRule | ChiriMixinUse | ChiriFunctionUse | ChiriRoot

export interface ChiriAST {
	source: Record<string, string>
	statements: ChiriStatement[]
}


export interface ChiriWriteConfig {
	extension: `.${string}`
}
