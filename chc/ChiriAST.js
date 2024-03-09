/**
 * @typedef ChiriIIFE
 * @property {"iife"} type
 * @property {ChiriStatement[]} statements
 */

/**
 * @typedef ChiriType
 * @property {"type"} type
 * @property {ChiriWord} name
 * @property {ChiriType[]} generics
 */

/**
 * @typedef ChiriBinaryExpression
 * @property {"expression"} type
 * @property {"binary"} subType
 * @property {ChiriExpressionOperand} operandA
 * @property {ChiriExpressionOperand} operandB
 * @property {string} operator
 * @property {string} valueType
 * @property {true=} wrapped
 */

/**
 * @typedef ChiriUnaryExpression
 * @property {"expression"} type
 * @property {"unary"} subType
 * @property {ChiriExpressionOperand} operand
 * @property {string} operator
 * @property {string} valueType
 */

/**
 * @typedef ChiriLiteralString
 * @property {"literal"} type
 * @property {"string"} subType
 * @property {(string | ChiriExpressionOperand)[]} segments
 */

/**
 * @typedef ChiriLiteralNumeric
 * @property {"literal"} type
 * @property {"uint" | "int" | "dec"} subType
 * @property {string} value
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriLiteralBoolean
 * @property {"literal"} type
 * @property {"boolean"} subType
 * @property {boolean} value
 * @property {ChiriPosition} position
 */

/** 
 * @typedef ChiriLiteralUndefined
 * @property {"literal"} type
 * @property {"undefined"} subType
 * @property {ChiriPosition} position
 */

/** 
 * @typedef ChiriLiteralOther
 * @property {"literal"} type
 * @property {"other"} subType
 * @property {string} valueType
 * @property {unknown} value
 */

/**
 * @typedef {ChiriLiteralString | ChiriLiteralNumeric | ChiriLiteralBoolean | ChiriLiteralUndefined | ChiriLiteralOther} ChiriLiteralValue
 */

/**
 * @typedef ChiriGet
 * @property {"get"} type
 * @property {ChiriWord} name
 * @property {string} valueType
 */

/**
 * @typedef {ChiriBinaryExpression | ChiriUnaryExpression | ChiriLiteralValue | ChiriGet} ChiriExpressionOperand
 */

/**
 * @typedef ChiriConstantDeclaration
 * @property {"declaration"} type
 * @property {"constant"} subType
 * @property {string} valueType
 * @property {ChiriWord} name
 * @property {ChiriExpressionOperand} expression
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriPosition
 * @property {number} line
 * @property {number} column
 */

/**
 * @typedef ChiriWord
 * @property {"word"} type
 * @property {string} value
 * @property {ChiriPosition} position
 */

/**
 * @typedef {ChiriConstantDeclaration} ChiriDeclaration
 */

/**
 * @typedef ChiriDocumentation
 * @property {"documentation"} type
 * @property {string} content
 */

/**
 * @typedef {ChiriIIFE | ChiriDeclaration | ChiriDocumentation} ChiriStatement
 */

/**
 * @typedef ChiriAST
 * @property {string} filename
 * @property {string} source
 * @property {ChiriStatement[]} statements
 */
