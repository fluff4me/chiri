/**
 * @typedef ThetaIIFE
 * @property {"iife"} type
 * @property {ThetaStatement[]} statements
 */

/**
 * @typedef ThetaType
 * @property {"type"} type
 * @property {ThetaWord} name
 * @property {ThetaType[]} generics
 */

/**
 * @typedef ThetaBinaryExpression
 * @property {"expression"} type
 * @property {"binary"} subType
 * @property {ThetaExpressionOperand} operandA
 * @property {ThetaExpressionOperand} operandB
 * @property {string} operator
 * @property {string} valueType
 * @property {true=} wrapped
 */

/**
 * @typedef ThetaUnaryExpression
 * @property {"expression"} type
 * @property {"unary"} subType
 * @property {ThetaExpressionOperand} operand
 * @property {string} operator
 * @property {string} valueType
 */

/**
 * @typedef ThetaLiteralString
 * @property {"literal"} type
 * @property {"string"} subType
 * @property {(string | ThetaExpressionOperand)[]} segments
 */

/**
 * @typedef ThetaLiteralNumeric
 * @property {"literal"} type
 * @property {"uint" | "int" | "dec"} subType
 * @property {string} value
 * @property {ThetaPosition} position
 */

/**
 * @typedef ThetaLiteralBoolean
 * @property {"literal"} type
 * @property {"boolean"} subType
 * @property {boolean} value
 * @property {ThetaPosition} position
 */

/** 
 * @typedef ThetaLiteralUndefined
 * @property {"literal"} type
 * @property {"undefined"} subType
 * @property {ThetaPosition} position
 */

/** 
 * @typedef ThetaLiteralOther
 * @property {"literal"} type
 * @property {"other"} subType
 * @property {string} valueType
 * @property {unknown} value
 */

/**
 * @typedef {ThetaLiteralString | ThetaLiteralNumeric | ThetaLiteralBoolean | ThetaLiteralUndefined | ThetaLiteralOther} ThetaLiteralValue
 */

/**
 * @typedef ThetaGet
 * @property {"get"} type
 * @property {ThetaWord} name
 * @property {string} valueType
 */

/**
 * @typedef {ThetaBinaryExpression | ThetaUnaryExpression | ThetaLiteralValue | ThetaGet} ThetaExpressionOperand
 */

/**
 * @typedef ThetaConstantDeclaration
 * @property {"declaration"} type
 * @property {"constant"} subType
 * @property {string} valueType
 * @property {ThetaWord} name
 * @property {ThetaExpressionOperand} expression
 * @property {ThetaPosition} position
 */

/**
 * @typedef ThetaPosition
 * @property {number} line
 * @property {number} column
 */

/**
 * @typedef ThetaWord
 * @property {"word"} type
 * @property {string} value
 * @property {ThetaPosition} position
 */

/**
 * @typedef {ThetaConstantDeclaration} ThetaDeclaration
 */

/**
 * @typedef ThetaDocumentation
 * @property {"documentation"} type
 * @property {string} content
 */

/**
 * @typedef {ThetaIIFE | ThetaDeclaration | ThetaDocumentation} ThetaStatement
 */

/**
 * @typedef ThetaAST
 * @property {string} filename
 * @property {string} source
 * @property {ThetaStatement[]} statements
 */
